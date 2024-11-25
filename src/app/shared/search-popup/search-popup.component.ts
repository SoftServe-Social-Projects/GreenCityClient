import { NewsSearchModel } from '@global-models/search/newsSearch.model';
import { EventsSearchModel } from '@global-models/search/eventsSearch.model';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { PlacesSearchModel } from '@global-models/search/placesSearch.model';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { SearchService } from '@global-service/search/search.service';
import { isNil, negate } from 'lodash';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { searchIcons } from '../../main/image-pathes/search-icons';
import { SearchCategory } from './search-consts';
import { PopupSearchResults } from './search-popup.model';

@Component({
  selector: 'app-search-popup',
  templateUrl: './search-popup.component.html',
  styleUrls: ['./search-popup.component.scss']
})
export class SearchPopupComponent implements OnInit, OnDestroy {
  resultsCounters: {
    news: number;
    events: number;
    places: number;
    total: number;
  } = { events: null, news: null, places: null, total: null };

  newsElements: NewsSearchModel[] = [];
  eventsElements: EventsSearchModel[] = [];
  placesElements: PlacesSearchModel[] = [];
  isSearchClicked = false;
  searchModalSubscription: Subscription;
  searchInput = new FormControl('');
  isLoading = false;
  searchValueChanges: Observable<string>;
  private currentLanguage: string;
  searchIcons = searchIcons;

  constructor(
    public searchService: SearchService,
    public dialog: MatDialog,
    private snackBar: MatSnackBarComponent,
    private localStorageService: LocalStorageService,
    public announcer: LiveAnnouncer
  ) {}

  ngOnInit() {
    this.announce();
    this.setupInitialValue();
    this.searchValueChanges = this.searchInput.valueChanges;
    this.searchValueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.resetData();
          this.isLoading = true;
        }),
        switchMap((query: string) => {
          this.currentLanguage = this.localStorageService.getCurrentLanguage();
          return forkJoin({
            news: this.searchService.getAllResults(query, SearchCategory.NEWS, this.currentLanguage),
            events: this.searchService.getAllResults(query, SearchCategory.EVENTS, this.currentLanguage),
            places: this.searchService.getAllResults(query, SearchCategory.PLACES, this.currentLanguage)
          });
        })
      )
      .subscribe((data: PopupSearchResults) => {
        this.setData(data);
      });

    this.searchValueChanges.pipe(filter(negate(isNil))).subscribe(() => this.resetData());
  }

  announce() {
    this.announcer.announce('Welcome to the search window', 'assertive');
  }

  setupInitialValue(): void {
    this.searchModalSubscription = this.searchService.searchSubject.subscribe((signal) => this.subscribeToSignal(signal));
  }

  openErrorPopup(): void {
    this.snackBar.openSnackBar('error');
  }

  private setData(data: PopupSearchResults): void {
    this.isLoading = false;

    this.newsElements = data.news.page;
    this.eventsElements = data.events.page;
    this.placesElements = data.places.page;

    this.resultsCounters.events = data.events.totalElements;
    this.resultsCounters.news = data.news.totalElements;
    this.resultsCounters.places = data.places.totalElements;
    this.resultsCounters.total = data.events.totalElements + data.news.totalElements + data.places.totalElements;
  }

  private subscribeToSignal(signal: boolean): void {
    if (!signal) {
      this.searchInput.reset('', { emitEvent: false });
    }
    this.isSearchClicked = signal;
  }

  closeSearch(): void {
    this.searchService.closeSearchSignal();
    this.isSearchClicked = false;
    this.resetData();
  }

  private resetData(): void {
    this.newsElements = [];
    this.eventsElements = [];
    this.resultsCounters = { events: null, news: null, places: null, total: null };
  }

  ngOnDestroy() {
    this.searchModalSubscription.unsubscribe();
  }
}
