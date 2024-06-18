import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Addresses, EventFilterCriteriaInterface, EventListResponse, FilterItem } from '../../models/events.interface';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { IEcoEventsState } from 'src/app/store/state/ecoEvents.state';
import { statusFiltersData, timeStatusFiltersData, typeFiltersData } from '../../models/event-consts';
import { LanguageService } from '../../../../i18n/language.service';
import { Router } from '@angular/router';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Patterns } from 'src/assets/patterns/patterns';
import { EventsService } from '../../services/events.service';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit, OnDestroy {
  @ViewChild('timeFilter') eventTimeStatusOptionList: MatSelect;
  @ViewChild('locationFilter') locationOptionList: MatSelect;
  @ViewChild('statusFilter') statusOptionList: MatSelect;
  @ViewChild('typeFilter') typeOptionList: MatSelect;

  eventTimeStatusFilterControl = new FormControl();
  locationFilterControl = new FormControl();
  statusFilterControl = new FormControl();
  typeFilterControl = new FormControl();
  searchEventControl = new FormControl('', [Validators.maxLength(30), Validators.pattern(Patterns.NameInfoPattern)]);

  eventsList: EventListResponse[] = [];

  isLoggedIn: string;
  selectedEventTimeStatusFiltersList: string[] = [];
  selectedLocationFiltersList: string[] = [];
  selectedStatusFiltersList: string[] = [];
  selectedTypeFiltersList: string[] = [];
  hasNextPage = true;
  countOfEvents = 0;
  noEventsMatch = false;
  selectedFilters: FilterItem[] = [];
  searchToggle = false;
  bookmarkSelected = false;
  eventTimeStatusFiltersList: FilterItem[] = timeStatusFiltersData;
  locationFiltersList: FilterItem[] = [];
  statusFiltersList: FilterItem[] = [];
  typeFiltersList: FilterItem[] = typeFiltersData;
  userId: number;
  isLoading = true;
  isGalleryView = true;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  private ecoEvents$: Observable<IEcoEventsState> = this.store.select((state: IAppState): IEcoEventsState => state.ecoEventsState);
  private page = 0;
  private eventsPerPage = 6;
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
        this.eventsList.push(...res.eventsList.slice(this.page * this.eventsPerPage));
        this.page++;
        this.countOfEvents = res.eventState.totalElements;
        this.hasNextPage = res.eventState.hasNext;
      }
    });
    this.getEvents();
    this.eventService.getAddresses().subscribe((addresses) => {
      this.locationFiltersList = this.getUniqueLocations(addresses);
    });
    this.searchEventControl.valueChanges.subscribe((value) => {
      if (this.searchResultSubscription) {
        this.searchResultSubscription.unsubscribe();
      }
      this.cleanEventList();
      value.trim() !== '' ? this.searchEventsByTitle(value.trim()) : this.getEvents();
    });
  }

  getEvents(): void {
    if (this.bookmarkSelected) {
      this.getUserFavoriteEvents();
    } else {
      const searchTitle = this.searchEventControl.value.trim();
      this.searchEventsByTitle(searchTitle);
    }
    this.page++;
  }

  search(): void {
    this.searchToggle = !this.searchToggle;
  }

  cancelSearch(): void {
    this.searchEventControl.value.trim() === '' ? (this.searchToggle = false) : this.searchEventControl.setValue('');
  }

  showSelectedEvents(): void {
    this.bookmarkSelected = !this.bookmarkSelected;
    if (this.bookmarkSelected) {
      this.cleanEventList();
      this.getUserFavoriteEvents();
    } else {
      this.cleanEventList();
      this.getEvents();
    }
  }

  getUniqueLocations(addresses: Array<Addresses>): FilterItem[] {
    const uniqueLocationsName = new Set<string>();
    const uniqueLocations: FilterItem[] = [];
    addresses.forEach((address: Addresses) => {
      if (address.cityEn && address.cityUa) {
        if (!uniqueLocationsName.has(address.cityEn) && !uniqueLocationsName.has(address.cityUa)) {
          uniqueLocationsName.add(address.cityEn);
          uniqueLocationsName.add(address.cityUa);
          uniqueLocations.push({ type: 'location', nameEn: address.cityEn, nameUa: address.cityUa });
        }
      }
    });
    return uniqueLocations;
  }

  updateListOfFilters(filter: FilterItem): void {
    switch (filter.type) {
      case 'eventTimeStatus':
        if (this.selectedEventTimeStatusFiltersList.includes(filter.nameEn)) {
          const indexOfCriteria = this.selectedEventTimeStatusFiltersList.indexOf(filter.nameEn);
          this.selectedEventTimeStatusFiltersList.splice(indexOfCriteria, 1);
          [this.eventTimeStatusOptionList].forEach((optionList) => {
            this.unselectCheckbox(optionList, filter.nameEn);
          });
          this.updateSelectedFiltersList(filter.nameEn);
        } else {
          this.selectedEventTimeStatusFiltersList.push(filter.nameEn);
          this.selectedFilters.push(filter);
        }
        break;
      case 'location':
        if (this.selectedLocationFiltersList.includes(filter.nameEn)) {
          const indexOfCriteria = this.selectedLocationFiltersList.indexOf(filter.nameEn);
          this.selectedLocationFiltersList.splice(indexOfCriteria, 1);
          [this.locationOptionList].forEach((optionList) => {
            this.unselectCheckbox(optionList, filter.nameEn);
          });
          this.updateSelectedFiltersList(filter.nameEn);
        } else {
          this.selectedLocationFiltersList.push(filter.nameEn);
          this.selectedFilters.push(filter);
        }
        break;
      case 'status':
        if (this.selectedStatusFiltersList.includes(filter.nameEn)) {
          const indexOfCriteria = this.selectedStatusFiltersList.indexOf(filter.nameEn);
          this.selectedStatusFiltersList.splice(indexOfCriteria, 1);
          [this.statusOptionList].forEach((optionList) => {
            this.unselectCheckbox(optionList, filter.nameEn);
          });
          this.updateSelectedFiltersList(filter.nameEn);
        } else {
          this.selectedStatusFiltersList.push(filter.nameEn);
          this.selectedFilters.push(filter);
        }
        break;
      case 'type':
        if (this.selectedTypeFiltersList.includes(filter.nameEn)) {
          const indexOfCriteria = this.selectedTypeFiltersList.indexOf(filter.nameEn);
          this.selectedTypeFiltersList.splice(indexOfCriteria, 1);
          [this.typeOptionList].forEach((optionList) => {
            this.unselectCheckbox(optionList, filter.nameEn);
          });
          this.updateSelectedFiltersList(filter.nameEn);
        } else {
          this.selectedTypeFiltersList.push(filter.nameEn);
          this.selectedFilters.push(filter);
        }
        break;
    }
    this.cleanEventList();
    this.getEvents();
  }

  removeItemFromSelectedFiltersList(filter: FilterItem, index?: number): void {
    this.updateSelectedFiltersList(filter.nameEn, index);
    this.updateListOfFilters(filter);
  }

  unselectAllFiltersInType(filterType: string): void {
    switch (filterType) {
      case 'eventTimeStatus':
        this.selectedEventTimeStatusFiltersList.forEach((item) => {
          this.updateSelectedFiltersList(item);
        });
        [this.eventTimeStatusOptionList].forEach((optionList) => {
          this.unselectCheckboxesInList(optionList);
        });
        this.selectedEventTimeStatusFiltersList = [];
        break;
      case 'location':
        this.selectedLocationFiltersList.forEach((item) => {
          this.updateSelectedFiltersList(item);
        });
        [this.locationOptionList].forEach((optionList) => {
          this.unselectCheckboxesInList(optionList);
        });
        this.selectedLocationFiltersList = [];
        break;
      case 'status':
        this.selectedStatusFiltersList.forEach((item) => {
          this.updateSelectedFiltersList(item);
        });
        [this.statusOptionList].forEach((optionList) => {
          this.unselectCheckboxesInList(optionList);
        });
        this.selectedStatusFiltersList = [];
        break;
      case 'type':
        this.selectedTypeFiltersList.forEach((item) => {
          this.updateSelectedFiltersList(item);
        });
        [this.typeOptionList].forEach((optionList) => {
          this.unselectCheckboxesInList(optionList);
        });
        this.selectedTypeFiltersList = [];
        break;
    }
    this.cleanEventList();
    this.getEvents();
  }

  resetAllFilters(): void {
    this.selectedFilters = [];
    this.selectedEventTimeStatusFiltersList = [];
    this.selectedLocationFiltersList = [];
    this.selectedStatusFiltersList = [];
    this.selectedTypeFiltersList = [];
    [this.eventTimeStatusOptionList, this.statusOptionList, this.locationOptionList, this.typeOptionList].forEach((optionList) => {
      this.unselectCheckboxesInList(optionList);
    });
    this.cleanEventList();
    this.getEvents();
  }

  getLangValue(uaValue: string, enValue: string): string {
    return this.languageService.getLangValue(uaValue, enValue) as string;
  }

  isUserLoggedRedirect(): void {
    this.isLoggedIn ? this.router.navigate(['/events', 'create-event']) : this.openAuthModalWindow('sign-in');
    this.eventService.setForm(null);
  }

  openAuthModalWindow(page: string): void {
    this.dialog.open(AuthModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {
        popUpName: page
      }
    });
  }

  changeViewMode(type: string): void {
    this.isGalleryView = type === 'gallery';
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private searchEventsByTitle(searchTitle: string): void {
    const eventListFilterCriterias = this.createEventListFilterCriteriasObject();
    this.searchResultSubscription = this.eventService
      .getEvents(this.page, this.eventsPerPage, eventListFilterCriterias, searchTitle)
      .subscribe((res) => {
        this.isLoading = false;
        if (res.page.length > 0) {
          this.countOfEvents = res.totalElements;
          this.eventsList.push(...res.page);
          this.hasNextPage = res.hasNext;
        } else {
          this.noEventsMatch = true;
        }
      });
  }

  private getUserFavoriteEvents(): void {
    this.eventService.getUserFavoriteEvents(this.page, this.eventsPerPage).subscribe((res) => {
      this.isLoading = false;
      this.eventsList.push(...res.page);
      this.page++;
      this.countOfEvents = res.totalElements;
      this.hasNextPage = res.hasNext;
    });
  }

  private updateSelectedFiltersList(filterName: string, index?: number): void {
    if (index) {
      this.selectedFilters.splice(index, 1);
    } else {
      if (this.selectedFilters.find((item) => item.nameEn === filterName)) {
        const indexOfItem = this.selectedFilters.findIndex((item) => item.nameEn === filterName);
        this.selectedFilters.splice(indexOfItem, 1);
      }
    }
  }

  private unselectCheckbox(checkboxList: MatSelect, optionName: string): void {
    checkboxList.options.find((option: MatOption) => option.value === optionName).deselect();
  }

  private unselectCheckboxesInList(checkboxList: MatSelect): void {
    checkboxList.options?.forEach((option) => {
      if (option.selected) {
        option.deselect();
      }
    });
  }

  private cleanEventList(): void {
    this.isLoading = true;
    this.hasNextPage = true;
    this.page = 0;
    this.eventsList = [];
    this.noEventsMatch = false;
    this.countOfEvents = 0;
  }

  private createEventListFilterCriteriasObject(): EventFilterCriteriaInterface {
    return {
      eventTime: [...this.selectedEventTimeStatusFiltersList],
      cities: [...this.selectedLocationFiltersList],
      statuses: [...this.selectedStatusFiltersList],
      tags: [...this.selectedTypeFiltersList]
    };
  }

  private checkUserSingIn(): void {
    this.userOwnAuthService.credentialDataSubject.subscribe((data) => {
      this.isLoggedIn = data?.userId;
      this.userId = data.userId;
      this.statusFiltersList = this.userId ? statusFiltersData : statusFiltersData.slice(0, 2);
    });
  }
}
