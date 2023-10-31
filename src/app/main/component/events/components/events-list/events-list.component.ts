import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Addresses, EventFilterCriteriaIntarface, EventPageResponceDto } from '../../models/events.interface';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { ReplaySubject } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { IEcoEventsState } from 'src/app/store/state/ecoEvents.state';
import { GetEcoEventsByPageAction, GetEcoEventsByIdAction } from 'src/app/store/actions/ecoEvents.actions';
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
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { FriendModel } from '@global-user/models/friend.model';
import { takeUntil } from 'rxjs/operators';
import { Patterns } from 'src/assets/patterns/patterns';
import { EventsService } from '../../services/events.service';
import { debounceTime, distinctUntilChanged, tap, switchMap, filter } from 'rxjs/operators';
import { SearchService } from '@global-service/search/search.service';
import { SearchModel } from '@global-models/search/search.model';

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
  public searchInput = new FormControl('', [Validators.maxLength(30), Validators.pattern(Patterns.NameInfoPattern)]);

  public eventsList: EventPageResponceDto[] = [];
  public bufferArray: EventPageResponceDto[] = [];
  public wordsToSearch: string[];
  public showEventItem = true;

  public isLoggedIn: string;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  ecoEvents$ = this.store.select((state: IAppState): IEcoEventsState => state.ecoEventsState);
  private eventFilterCriteria: EventFilterCriteriaIntarface = EventFilterCriteria;
  private allSelectedFilter = allSelectedFilter;
  public page = 0;
  public hasNext = true;
  public remaining = 0;
  private eventsPerPage = 6;
  public elementsArePresent = true;
  public noEventsMatch = false;
  public selectedFilters = [];
  public searchToggle = false;
  public bookmarkSelected = false;
  public allSelectedFlags: AllSelectedFlags = allSelectedFlags;
  public eventTimeList: OptionItem[] = eventTimeList;
  public typeList: OptionItem[] = TagsArray;
  public statusList: OptionItem[];
  public eventLocationList: OptionItem[] = [];
  public scroll: boolean;
  public userId: number;
  private dialog: MatDialog;
  userFriends: FriendModel[];
  public searchValueChanges;
  public isLoading = false;
  private currentLanguage: string;

  constructor(
    private store: Store,
    private userOwnAuthService: UserOwnAuthService,
    private languageService: LanguageService,
    private localStorageService: LocalStorageService,
    private router: Router,
    public injector: Injector,
    private userFriendsService: UserFriendsService,
    private eventService: EventsService,
    public searchService: SearchService
  ) {
    this.dialog = injector.get(MatDialog);
  }

  ngOnInit(): void {
    this.eventService.getAddreses().subscribe((addresses) => {
      this.eventLocationList = this.getUniqueCities(addresses);
    });
    this.localStorageService.setEditMode('canUserEdit', false);
    this.checkUserSingIn();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.scroll = false;
    this.dispatchStore(true);
    this.localStorageService.setCurentPage('previousPage', '/events');
    this.searchValueChanges = this.searchInput.valueChanges;
    this.searchValueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.resetData();
          this.isLoading = true;
        }),
        switchMap((val: string) => {
          this.currentLanguage = this.localStorageService.getCurrentLanguage();
          return this.searchService.getAllResults(val, this.currentLanguage);
        })
      )
      .subscribe((data: SearchModel) => {
        console.log(data);
        this.setData(data);
      });

    this.eventsSubsription();
    this.getUserFriendsList();
    this.searchWords();
  }

  private eventsSubsription(): void {
    this.ecoEvents$.subscribe((res: IEcoEventsState) => {
      console.log(res);
      this.page = res.pageNumber;
      if (res.eventState) {
        console.log(res);
        if (res.eventsList.length > 3) {
          this.eventsList = [...res.eventsList];
          this.bufferArray = [...res.eventsList];
          const data = res.eventState;
          this.hasNext = data.hasNext;
          this.remaining = data.totalElements;
          this.elementsArePresent = this.eventsList.length < data.totalElements;
        } else {
          this.eventsList.push(res.eventsList[res.eventsList.length - 1]);
        }
      }
    });
  }

  getUserFriendsList(): void {
    if (this.userId) {
      this.userFriendsService
        .getAllFriendsByUserId(this.userId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res: any) => {
          this.userFriends = res.page;
        });
    } else {
      this.userFriends = [];
    }
  }

  searchWords(): void {
    // this.searchFilterWords.valueChanges.subscribe((value) => {
    //   this.wordsToSearch = value.split(' ');
    //   this.sortByWord(this.bufferArray, this.wordsToSearch);
    // });
  }

  private setData({ events }: SearchModel): void {
    console.log(events);
    this.isLoading = false;
    this.scroll = true;
    console.log('here');
    events.map(({ id }, i) => this.dispatchStoreSearch(id, i === 0));

    // this.newsElements = ecoNews;
    // this.eventsElements = events;
    // this.itemsFound = countOfResults;
  }

  private resetData(): void {
    this.eventsList = [];

    // this.itemsFound = null;
  }

  sortByWord(list: EventPageResponceDto[], words: string[]): void {
    this.eventsList = list.filter((element) => {
      for (const word of words) {
        if (element.title.includes(word)) {
          return true;
        }
      }
      return false;
    });
    this.noEventsMatch = !this.eventsList.length;
  }

  public closeSearch(): void {
    this.searchInput.setValue('');
    this.dispatchStore(true);
    // this.searchService.closeSearchSignal();
    // this.isSearchClicked = false;
    // this.resetData();
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
    this.hasNext = true;
    this.page = 0;
    this.dispatchStore(true);
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

  public dispatchStoreSearch(eventId: number, res: boolean): void {
    console.log(eventId, res);
    this.store.dispatch(GetEcoEventsByIdAction({ eventId, reset: res }));
  }

  public dispatchStore(res: boolean): void {
    if (this.hasNext && this.page !== undefined) {
      this.store.dispatch(
        GetEcoEventsByPageAction({
          currentPage: this.page,
          numberOfEvents: this.eventsPerPage,
          reset: res,
          filter: this.eventFilterCriteria
        })
      );
    }
  }

  getUniqueCities(addresses: Array<Addresses>): OptionItem[] {
    const uniqueCities = new Set();

    addresses.forEach((address: Addresses) => {
      if (address) {
        const { cityEn, cityUa } = address;
        if (cityEn !== null) {
          uniqueCities.add(`${cityEn}-${cityUa}`);
        }
      }
    });
    const cities = Array.from(uniqueCities).map((city: string) => {
      const [nameEn, nameUa] = city.split('-');
      return { nameEn, nameUa };
    });
    return cities;
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

  public onScroll(): void {
    const isRemovedEvents = this.page * this.eventsPerPage !== this.eventsList.length;
    this.scroll = true;
    if (this.eventsList.length) {
      this.dispatchStore(isRemovedEvents);
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
