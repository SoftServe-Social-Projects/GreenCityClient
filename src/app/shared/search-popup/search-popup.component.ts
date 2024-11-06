import { NewsSearchModel } from '@global-models/search/newsSearch.model';
import { EventsSearchModel } from '@global-models/search/eventsSearch.model';
import { SearchDataModel } from '@global-models/search/search.model';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { searchIcons } from '../../main/image-pathes/search-icons';
import { negate, isNil } from 'lodash';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap, switchMap, filter } from 'rxjs/operators';
import { SearchService } from '@global-service/search/search.service';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchCategory } from './search-consts';

@Component({
  selector: 'app-search-popup',
  templateUrl: './search-popup.component.html',
  styleUrls: ['./search-popup.component.scss']
})
export class SearchPopupComponent implements OnInit, OnDestroy {
  resultsCounters: {
    news: number;
    events: number;
    total: number;
  } = { events: null, news: null, total: null };
  newsElements: NewsSearchModel[] = [];
  eventsElements: EventsSearchModel[] = [];
  isSearchClicked = false;
  searchModalSubscription: Subscription;
  searchInput = new FormControl('');
  isLoading = false;
  isNewsSearchFound: boolean;
  searchValueChanges;
  private currentLanguage: string;
  searchIcons = searchIcons;
  searctabindex: SearchService;

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
            events: this.searchService.getAllResults(query, SearchCategory.EVENTS, this.currentLanguage)
          });
        })
      )
      .subscribe((data: { news: SearchDataModel<NewsSearchModel>; events: SearchDataModel<EventsSearchModel> }) => {
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

  private setData(data: { news: SearchDataModel<NewsSearchModel>; events: SearchDataModel<EventsSearchModel> }): void {
    this.isLoading = false;

    this.newsElements = data.news.page;
    this.eventsElements = data.events.page;
    this.resultsCounters.events = data.events.totalElements;
    this.resultsCounters.news = data.news.totalElements;
    this.resultsCounters.total = data.events.totalElements + data.news.totalElements;
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
    this.resultsCounters = { events: null, news: null, total: null };
  }

  ngOnDestroy() {
    this.searchModalSubscription.unsubscribe();
  }
}
