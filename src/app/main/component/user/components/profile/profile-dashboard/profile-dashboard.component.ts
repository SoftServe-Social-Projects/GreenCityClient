import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { IEcoNewsState } from 'src/app/store/state/ecoNews.state';
import { GetEcoNewsAction } from 'src/app/store/actions/ecoNews.actions';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { EventResponse, EventResponseDto } from 'src/app/main/component/events/models/events.interface';
import { EventsService } from 'src/app/main/component/events/services/events.service';
import { ActivatedRoute } from '@angular/router';
import { HabitAssignInterface } from '@global-user/components/habit/models/interfaces/habit-assign.interface';
import { EventType } from 'src/app/ubs/ubs/services/event-type.enum';
import { singleNewsImages } from 'src/app/main/image-pathes/single-news-images';
import { HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { FilterModel } from '@shared/components/tag-filter/tag-filter.model';
import { tagsListEcoNewsData } from '@eco-news-models/eco-news-consts';
import { EcoNewsService } from '@eco-news-service/eco-news.service';

@Component({
  selector: 'app-profile-dashboard',
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileDashboardComponent implements OnInit, OnDestroy {
  loading = false;
  numberOfHabitsOnView = 3;
  habitsAcquired: Array<HabitAssignInterface> = [];
  habitsAcquiredToView: Array<HabitAssignInterface> = [];
  selectedIndex = 0;
  tabs = {
    habits: true,
    news: false,
    articles: false
  };
  isActiveNewsScroll = false;
  isActiveEventsScroll = false;
  userId: number;
  news: EcoNewsModel[] = [];
  isOnlineChecked = false;
  isOfflineChecked = false;
  eventsList: EventResponse[] = [];
  eventsPerPage = 6;
  eventsPage = 1;
  totalEvents = 0;
  totalNews = 0;
  tagsList: Array<string> = [];
  tagList: FilterModel[] = tagsListEcoNewsData;
  loadingEvents = false;
  eventType = '';
  isFavoriteBtnClicked = false;
  isNewsFavoriteBtnClicked = false;
  userLatitude = 0;
  userLongitude = 0;
  images = singleNewsImages;
  econews$ = this.store.select((state: IAppState): IEcoNewsState => state.ecoNewsState);
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  private hasNext = true;
  private hasNextPageOfEvents = true;
  private page: number;
  private newsCount = 5;

  constructor(
    private localStorageService: LocalStorageService,
    public habitAssignService: HabitAssignService,
    private store: Store,
    private eventService: EventsService,
    private route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly translate: TranslateService,
    private readonly ecoNewsService: EcoNewsService
  ) {}

  ngOnInit() {
    this.bindLang(this.localStorageService.getCurrentLanguage());
    this.subscribeToLangChange();
    this.getUserId();

    this.econews$.subscribe((val: IEcoNewsState) => {
      this.page = val.pageNumber;
      if (val.ecoNews) {
        this.totalNews = val.ecoNews.totalElements;
        this.hasNext = val.ecoNews.hasNext;
        this.news = [...val.pages];
      }
    });

    this.initGetUserEvents();
    this.dispatchNews(true);
    this.getUserLocation();
    this.localStorageService.setCurentPage('previousPage', '/profile');
    this.route.params.subscribe((params) => {
      const tabId = +params?.tabId;
      if (!isNaN(tabId)) {
        this.selectedIndex = tabId;
      }
    });
  }

  getUserLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      if (position) {
        this.userLatitude = position.coords.latitude;
        this.userLongitude = position.coords.longitude;
      }
    });
  }

  onCheckboxChange() {
    if (this.isOfflineChecked && this.isOnlineChecked) {
      this.eventType = EventType.ONLINE_OFFLINE;
    } else if (this.isOnlineChecked) {
      this.eventType = EventType.ONLINE;
    } else if (this.isOfflineChecked) {
      this.eventType = EventType.OFFLINE;
    } else {
      this.eventType = '';
    }

    this.eventsList = [];
    this.eventsPage = 0;
    this.hasNextPageOfEvents = true;
    this.getUserEvents();
  }

  cleanState() {
    this.isOfflineChecked = false;
    this.isOnlineChecked = false;

    this.eventType = '';
    this.eventsPage = 0;

    this.eventsList = [];
    this.hasNextPageOfEvents = true;
  }

  escapeFromFavorites(): void {
    this.isFavoriteBtnClicked = !this.isFavoriteBtnClicked;

    this.cleanState();
    this.getUserEvents();
  }

  goToFavorites(): void {
    this.isFavoriteBtnClicked = true;

    this.cleanState();
    this.getUserEvents();
  }

  initGetUserEvents(): void {
    this.eventService
      .getEvents(this.getHttpParams(0))
      .pipe(take(1))
      .subscribe((res: EventResponseDto) => {
        this.eventsList = res.page;
        this.totalEvents = res.totalElements;
        this.hasNextPageOfEvents = res.hasNext;
        this.isActiveEventsScroll = res.hasNext;
        this.cdr.detectChanges();
      });
  }

  private getHttpParams(page: number): HttpParams {
    let params = new HttpParams()
      .append('page', page.toString())
      .append('size', this.eventsPerPage.toString())
      .append('statuses', this.isFavoriteBtnClicked ? 'SAVED' : 'CREATED,JOINED')
      .append('user-id', this.localStorageService.getUserId());
    if (this.eventType) {
      params = params.append('type', this.eventType);
    }
    return params;
  }

  removeUnFavouriteEvent(id: number): void {
    this.eventsList = this.eventsList.filter((event) => event.id !== id);
  }

  getUserEvents(): void {
    if (this.hasNextPageOfEvents && !this.loadingEvents) {
      this.loadingEvents = true;
      this.eventService
        .getEvents(this.getHttpParams(this.eventsPage))
        .pipe(take(1))
        .subscribe({
          next: (res: EventResponseDto) => {
            this.eventsList.push(...res.page);
            this.eventsPage++;
            this.hasNextPageOfEvents = res.hasNext;
            this.isActiveEventsScroll = res.hasNext;
          },
          complete: () => {
            this.loadingEvents = false;
          }
        });
    }
  }

  toggleNewsFavorites() {
    this.isNewsFavoriteBtnClicked = !this.isNewsFavoriteBtnClicked;
    this.dispatchNews(true);
  }

  getFilterData(value: Array<string>): void {
    if (this.tagsList !== value) {
      this.tagsList = value;
    }
    this.dispatchNews(true);
  }

  dispatchNews(res: boolean): void {
    if (res) {
      this.hasNext = true;
      this.page = 0;
      this.news = [];
      this.totalNews = 0;
    }

    if (!this.hasNext || this.loading) {
      return;
    }

    this.loading = true;
    const params = this.ecoNewsService.getNewsHttpParams({
      page: this.page,
      size: this.newsCount,
      authorId: this.userId,
      favorite: this.isNewsFavoriteBtnClicked,
      userId: this.userId,
      tags: this.tagsList
    });

    const action = GetEcoNewsAction({ params, reset: res });
    this.store.dispatch(action);

    this.page++;
    this.loading = false;
  }

  changeStatus(habit: HabitAssignInterface) {
    this.habitAssignService.habitsInProgress = this.habitAssignService.habitsInProgress.filter((el) => el.id !== habit.id);
    this.habitsAcquired = [...this.habitsAcquired, habit];
  }

  executeRequests() {
    this.loading = true;
    this.habitAssignService
      .getAssignedHabits()
      .pipe(take(1))
      .subscribe((response: Array<HabitAssignInterface>) => {
        const sortedHabits = this.sortHabitsData(response);
        this.habitAssignService.habitsInProgress = sortedHabits.filter((habit) => habit.status === HabitStatus.INPROGRESS);
        this.habitsAcquired = sortedHabits.filter((habit) => habit.status === HabitStatus.ACQUIRED);
        this.setHabitsForView();
        this.loading = false;
      });
  }

  setHabitsForView(): void {
    this.habitAssignService.habitsInProgressToView = [...this.habitAssignService.habitsInProgress.slice(0, this.numberOfHabitsOnView)];
    this.habitsAcquiredToView = [...this.habitsAcquired.slice(0, this.numberOfHabitsOnView)];
  }

  getMoreHabitsInProgressForView(): void {
    this.habitAssignService.habitsInProgressToView = this.getMoreHabits(
      this.habitAssignService.habitsInProgressToView,
      this.habitAssignService.habitsInProgress
    );
  }

  getMoreHabitsAcquiredForView(): void {
    this.habitsAcquiredToView = this.getMoreHabits(this.habitsAcquiredToView, this.habitsAcquired);
  }

  getMoreHabits(habitsOnView: Array<HabitAssignInterface>, allHabits: Array<HabitAssignInterface>): Array<HabitAssignInterface> {
    const currentNumberOfHabitsOnView = habitsOnView.length;
    return [...habitsOnView, ...allHabits.slice(currentNumberOfHabitsOnView, currentNumberOfHabitsOnView + this.numberOfHabitsOnView)];
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.isActiveNewsScroll = tabChangeEvent.index === 1;
    this.isActiveEventsScroll = tabChangeEvent.index === 2;
  }

  onScroll(): void {
    if (!this.news.length) {
      return;
    }
    this.dispatchNews(false);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private getUserId() {
    this.userId = this.localStorageService.getUserId();
  }

  private bindLang(lang: string): void {
    if (lang && this.translate.currentLang !== lang) {
      this.translate.setDefaultLang(lang);
      this.translate.use(lang);
    }
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe((lang: string) => {
      this.bindLang(lang);
      this.executeRequests();
    });
  }

  private sortHabitsData(habitsArray: HabitAssignInterface[]): Array<HabitAssignInterface> {
    return habitsArray.sort((firstHabit, secondHabit) => (firstHabit.createDateTime > secondHabit.createDateTime ? -1 : 1));
  }
}
