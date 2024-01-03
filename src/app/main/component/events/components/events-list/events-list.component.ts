import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Addresses, EventFilterCriteriaInterface, EventPageResponseDto } from '../../models/events.interface';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { IEcoEventsState } from 'src/app/store/state/ecoEvents.state';
import { GetEcoEventsByPageAction } from 'src/app/store/actions/ecoEvents.actions';
import {
  TagsArray,
  eventTimeList,
  eventStatusList,
  OptionItem,
  allSelectedFlags,
  AllSelectedFlags,
  EventFilterCriteria,
  allSelectedFilter
} from '../../models/event-consts';
import { LanguageService } from '../../../../i18n/language.service';
import { Router } from '@angular/router';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { Patterns } from 'src/assets/patterns/patterns';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit, OnDestroy {
  @ViewChild('timeFilter') timeList: MatSelect;
  @ViewChild('locationFilter') locationList: MatSelect;
  @ViewChild('statusFilter') statusesList: MatSelect;
  @ViewChild('typeFilter') typesList: MatSelect;

  public timeFilterControl = new FormControl();
  public locationFilterControl = new FormControl();
  public statusFilterControl = new FormControl();
  public typeFilterControl = new FormControl();
  public searchEventControl = new FormControl('', [Validators.maxLength(30), Validators.pattern(Patterns.NameInfoPattern)]);

  public eventsList: EventPageResponseDto[] = [];

  public isLoggedIn: string;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  private ecoEvents$: Observable<IEcoEventsState> = this.store.select((state: IAppState): IEcoEventsState => state.ecoEventsState);
  private eventFilterCriteria: EventFilterCriteriaInterface = EventFilterCriteria;
  private allSelectedFilter = allSelectedFilter;
  public page = 0;
  public hasNextPage = true;
  public countOfEvents = 0;
  private eventsPerPage = 6;
  public noEventsMatch = false;
  public selectedFilters = [];
  public searchToggle = false;
  public bookmarkSelected = false;
  public allSelectedFlags: AllSelectedFlags = allSelectedFlags;
  public eventTimeList: OptionItem[] = eventTimeList;
  public typeList: OptionItem[] = TagsArray;
  public statusList: OptionItem[];
  public eventLocationsList: OptionItem[] = [];
  public userId: number;
  public isLoading = true;
  private searchResultSubscription: Subscription;
  private dialog: MatDialog;

  constructor(
    private store: Store,
    private userOwnAuthService: UserOwnAuthService,
    private languageService: LanguageService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private injector: Injector,
    private eventService: EventsService
  ) {
    this.dialog = injector.get(MatDialog);
  }

  ngOnInit(): void {
    this.localStorageService.setEditMode('canUserEdit', false);
    this.checkUserSingIn();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.localStorageService.setCurentPage('previousPage', '/events');
    this.ecoEvents$.subscribe((res: IEcoEventsState) => {
      if (res.eventState) {
        this.isLoading = false;
        this.eventsList.push(...res.eventsList);
        this.page++;
        this.countOfEvents = res.eventState.totalElements;
        this.hasNextPage = res.eventState.hasNext;
      }
    });
    this.getEvents();
    this.eventService.getAddresses().subscribe((addresses) => {
      this.eventLocationsList = this.getUniqueLocations(addresses);
    });
    this.searchEventControl.valueChanges.subscribe((value) => {
      if (this.searchResultSubscription) {
        this.searchResultSubscription.unsubscribe();
      }
      this.isLoading = true;
      this.hasNextPage = true;
      this.page = 0;
      this.eventsList = [];
      this.noEventsMatch = false;
      this.countOfEvents = 0;
      value.trim() !== '' ? this.searchEventsByTitle(value.trim()) : this.getEvents();
    });
  }

  private searchEventsByTitle(searchTitle: string): void {
    this.searchResultSubscription = this.eventService
      .getEvents(this.page, this.eventsPerPage, this.eventFilterCriteria, searchTitle)
      .subscribe((res) => {
        this.countOfEvents = res.totalElements;
        this.isLoading = false;
        if (res.page.length > 0) {
          this.eventsList.push(...res.page);
          this.hasNextPage = res.hasNext;
        } else {
          this.noEventsMatch = true;
        }
      });
  }

  public cancelSearch(): void {
    this.searchEventControl.value.trim() === '' ? (this.searchToggle = false) : this.searchEventControl.setValue('');
  }

  public updateSelectedFilters(
    value: OptionItem,
    event: MatOptionSelectionChange,
    optionsList: MatSelect,
    dropdownName: string,
    filterList: Array<OptionItem>
  ): void {
    const existingFilterIndex = this.selectedFilters.indexOf(value);
    const isUserInput = event.isUserInput && existingFilterIndex !== -1;
    if (isUserInput && !event.source.selected) {
      this.selectedFilters.splice(existingFilterIndex, 1);
      this.deleteFromEventFilterCriteria(value, dropdownName);
      this.checkAllSelectedFilters(value, optionsList, dropdownName, filterList);
    }

    if (event.isUserInput && !event.source.selected) {
      this.checkAllSelectedFilters(value, optionsList, dropdownName, filterList);
    }

    if (!event.source.selected) {
      this.deleteFromEventFilterCriteria(value, dropdownName);
    }

    if (!isUserInput && event.source.selected) {
      this.selectedFilters.push(value);
      this.addToEventFilterCriteria(value, dropdownName);
      this.checkAllSelectedFilters(value, optionsList, dropdownName, filterList);
    }
    this.hasNextPage = true;
    this.page = 0;
    this.getEvents();
  }

  private checkAllSelectedFilters(value: OptionItem, optionsList: MatSelect, dropdownName: string, filterList: Array<OptionItem>) {
    if (this.allSelectedFlags[dropdownName]) {
      optionsList.options.first.deselect();
      filterList.forEach((item) => {
        if (item.nameEn !== value.nameEn) {
          this.addToEventFilterCriteria(item, dropdownName);
        }
      });
      this.selectedFilters = this.selectedFilters.filter((item) => this.allSelectedFilter[dropdownName].nameEn !== item.nameEn);
      this.selectedFilters = [...this.selectedFilters, ...filterList.filter((item) => item.nameEn !== value.nameEn)];
    }

    this.allSelectedFlags[dropdownName] = this.eventFilterCriteria[dropdownName].length >= filterList.length;

    if (this.allSelectedFlags[dropdownName]) {
      optionsList.options.first.select();
      this.selectedFilters = this.selectedFilters.filter((item1) => !filterList.some((item2) => item2.nameEn === item1.nameEn));
      this.selectedFilters.push(this.allSelectedFilter[dropdownName]);
      this.eventFilterCriteria[dropdownName] = [];
    }
  }

  private deleteFromEventFilterCriteria(value: OptionItem, dropdownName: string) {
    this.eventFilterCriteria = {
      ...this.eventFilterCriteria,
      [dropdownName]: this.eventFilterCriteria[dropdownName].filter((item) => item !== value.nameEn)
    };
  }

  private addToEventFilterCriteria(value: OptionItem, dropdownName: string) {
    this.eventFilterCriteria = {
      ...this.eventFilterCriteria,
      [dropdownName]: [...this.eventFilterCriteria[dropdownName], value.nameEn]
    };
  }

  public getEvents(): void {
    if (this.hasNextPage) {
      const searchTitle = this.searchEventControl.value.trim();
      if (searchTitle.length === 0) {
        this.store.dispatch(
          GetEcoEventsByPageAction({
            currentPage: this.page,
            numberOfEvents: this.eventsPerPage,
            reset: true,
            filter: this.eventFilterCriteria
          })
        );
      } else {
        this.searchEventsByTitle(searchTitle);
      }
    }
  }

  public getUniqueLocations(addresses: Array<Addresses>): OptionItem[] {
    const uniqueLocationsName = new Set<string>();
    const uniqueLocations: OptionItem[] = [];
    addresses.forEach((address: Addresses) => {
      if (address.cityEn && address.cityUa) {
        if (!uniqueLocationsName.has(address.cityEn) && !uniqueLocationsName.has(address.cityUa)) {
          uniqueLocationsName.add(address.cityEn);
          uniqueLocationsName.add(address.cityUa);
          uniqueLocations.push({ nameEn: address.cityEn, nameUa: address.cityUa });
        }
      }
    });
    return uniqueLocations;
  }

  private getStatusesForFilter(): OptionItem[] {
    return this.userId ? eventStatusList : eventStatusList.slice(0, 2);
  }

  public toggleAllSelection(optionsList: MatSelect, dropdownName: string): void {
    this.allSelectedFlags[dropdownName] = !this.allSelectedFlags[dropdownName];
    if (this.allSelectedFlags[dropdownName]) {
      optionsList.options.forEach((item: MatOption) => {
        if (item.value === 0) {
          this.selectedFilters.push(allSelectedFilter[dropdownName]);
        }
        if (!this.eventFilterCriteria[dropdownName]) {
          this.eventFilterCriteria[dropdownName] = [];
        }
        this.selectedFilters = this.selectedFilters.filter((value) => value !== item.value);
        item.select();
      });
    } else {
      optionsList.options.forEach((item: MatOption) => {
        item.deselect();
        this.selectedFilters = this.selectedFilters.filter((value) => value !== item.value && value !== allSelectedFilter[dropdownName]);
      });
    }
  }

  public search(): void {
    this.searchToggle = !this.searchToggle;
  }

  public deleteOneFilter(filter: OptionItem, index: number): void {
    let deleted = true;
    const keyMapping = {
      eventTime: 0,
      statuses: 1,
      cities: 2,
      tags: 3
    };
    [this.timeList, this.statusesList, this.locationList, this.typesList].forEach((list, arrayIndex) => {
      Object.keys(this.allSelectedFilter).forEach((dropdownName) => {
        if (this.allSelectedFilter[dropdownName].nameEn === filter.nameEn) {
          list.options.forEach((item) => {
            if (arrayIndex === keyMapping[dropdownName]) {
              item.deselect();
              this.allSelectedFlags[dropdownName] = false;
            }
          });
          if (deleted) {
            this.selectedFilters.splice(index, 1);
            deleted = false;
          }
        }
      });
      const item2 = list.options.find((option: MatOption) => filter.nameEn === option.value.nameEn);
      if (item2) {
        this.selectedFilters.splice(index, 1);
        item2.deselect();
      }
    });
  }

  public resetAll(): void {
    [this.timeList, this.statusesList, this.locationList, this.typesList].forEach((list) => {
      list.options.forEach((item: MatOption) => {
        item.deselect();
      });
    });
    this.selectedFilters.splice(0, this.selectedFilters.length);
    Object.keys(this.eventFilterCriteria).forEach((dropdownName) => {
      if (this.eventFilterCriteria[dropdownName].length) {
        this.eventFilterCriteria[dropdownName] = [];
      }
    });
    Object.keys(this.allSelectedFlags).forEach((dropdownName) => {
      if (this.allSelectedFlags[dropdownName].length) {
        this.allSelectedFlags[dropdownName] = false;
      }
    });
  }

  private checkUserSingIn(): void {
    this.userOwnAuthService.credentialDataSubject.subscribe((data) => {
      this.isLoggedIn = data && data.userId;
      this.userId = data.userId;
      this.statusList = this.getStatusesForFilter();
    });
  }

  public getLangValue(uaValue: string, enValue: string): string {
    return this.languageService.getLangValue(uaValue, enValue) as string;
  }

  public isUserLoggedRedirect(): void {
    this.isLoggedIn ? this.router.navigate(['/events', 'create-event']) : this.openAuthModalWindow('sign-in');
    this.eventService.setBackFromPreview(false);
    this.eventService.setForm(null);
  }

  public openAuthModalWindow(page: string): void {
    this.dialog.open(AuthModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {
        popUpName: page
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
