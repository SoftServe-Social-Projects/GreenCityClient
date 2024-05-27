import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { IEcoNewsState } from 'src/app/store/state/ecoNews.state';
import { GetEcoNewsByAuthorAction } from 'src/app/store/actions/ecoNews.actions';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { EventResponse, EventResponseDto } from 'src/app/main/component/events/models/events.interface';
import { EventsService } from 'src/app/main/component/events/services/events.service';
import { ActivatedRoute } from '@angular/router';
import { HabitAssignInterface } from '@global-user/components/habit/models/interfaces/habit-assign.interface';
import { EventType } from 'src/app/ubs/ubs/services/event-type.enum';
import { singleNewsImages } from 'src/app/main/image-pathes/single-news-images';

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
  public selectedIndex = 0;
  public tabs = {
    habits: true,
    news: false,
    articles: false
  };
  isActiveInfinityScroll = false;
  userId: number;
  news: EcoNewsModel[];
  public isOnlineChecked = false;
  public isOfflineChecked = false;
  public eventsList: EventResponse[] = [];
  public favouriteEvents: EventResponse[] = [];
  public eventsPerPage = 6;
  public eventsPage = 1;
  public totalEvents = 0;
  public totalNews = 0;
  public eventType = '';
  public isFavoriteBtnClicked = false;
  public userLatitude = 0;
  public userLongitude = 0;
  public images = singleNewsImages;
  authorNews$ = this.store.select((state: IAppState): IEcoNewsState => state.ecoNewsState);
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  private hasNext = true;
  private currentPage: number;
  private newsCount = 3;

  constructor(
    private localStorageService: LocalStorageService,
    public habitAssignService: HabitAssignService,
    private store: Store,
    private eventService: EventsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subscribeToLangChange();
    this.getUserId();

    this.authorNews$.subscribe((val: IEcoNewsState) => {
      this.currentPage = val.authorNewsPage;
      if (val.ecoNewsByAuthor) {
        this.totalNews = val.ecoNewsByAuthor.totalElements;
        this.hasNext = val.ecoNewsByAuthor.hasNext;
        this.news = val.autorNews;
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

  onCheckboxChange(EventTypeChecked?: string) {
    if (EventTypeChecked === EventType.ONLINE) {
      this.isOfflineChecked = false; // Uncheck checkbox2 when checkbox1 is checked
    } else {
      this.isOnlineChecked = false; // Uncheck checkbox1 when checkbox2 is checked
    }

    if (this.isOnlineChecked) {
      this.eventType = EventType.ONLINE;
    } else if (this.isOfflineChecked) {
      this.eventType = EventType.OFFLINE;
    } else {
      this.eventType = '';
    }

    this.initGetUserEvents(this.eventType);
  }

  public escapeFromFavorites(): void {
    this.isFavoriteBtnClicked = !this.isFavoriteBtnClicked;
  }

  public goToFavorites(): void {
    this.isFavoriteBtnClicked = true;
    this.getUserFavouriteEvents();
  }

  initGetUserEvents(eventType?: string): void {
    this.eventService
      .getAllUserEvents(0, this.eventsPerPage, this.userLatitude, this.userLongitude, eventType)
      .pipe(take(1))
      .subscribe((res: EventResponseDto) => {
        this.eventsList = res.page;
        this.totalEvents = res.totalElements;
      });
  }

  getUserFavouriteEvents(): void {
    this.eventService
      .getUserFavoriteEvents(0, this.eventsPerPage)
      .pipe(take(1))
      .subscribe((res: EventResponseDto) => {
        this.favouriteEvents = res.page;
      });
  }

  removeUnFavouriteEvent(id: number): void {
    this.favouriteEvents = this.favouriteEvents.filter((event) => event.id !== id);
  }

  onEventsPageChange(page: number, eventType?: string): void {
    this.eventsPage = page;
    this.eventService
      .getAllUserEvents(this.eventsPage - 1, 6, this.userLatitude, this.userLongitude, eventType)
      .pipe(take(1))
      .subscribe((res) => {
        this.eventsList = res.page;
      });
  }

  public dispatchNews(res: boolean) {
    if (this.currentPage !== undefined && this.hasNext) {
      this.store.dispatch(
        GetEcoNewsByAuthorAction({
          currentPage: this.currentPage,
          numberOfNews: this.newsCount,
          reset: res
        })
      );
    }
  }

  public changeStatus(habit: HabitAssignInterface) {
    this.habitAssignService.habitsInProgress = this.habitAssignService.habitsInProgress.filter((el) => el.id !== habit.id);
    this.habitsAcquired = [...this.habitsAcquired, habit];
  }

  public executeRequests() {
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
    this.isActiveInfinityScroll = tabChangeEvent.index === 1;
  }

  onScroll(): void {
    this.dispatchNews(false);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private getUserId() {
    this.userId = this.localStorageService.getUserId();
  }

  private subscribeToLangChange() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe(() => this.executeRequests());
  }

  private sortHabitsData(habitsArray: HabitAssignInterface[]): Array<HabitAssignInterface> {
    return habitsArray.sort((firstHabit, secondHabit) => (firstHabit.createDateTime > secondHabit.createDateTime ? -1 : 1));
  }
}
