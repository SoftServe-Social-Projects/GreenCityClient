import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileDashboardComponent } from '@global-user/components';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { EventsService } from 'src/app/main/component/events/services/events.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EventType } from 'src/app/ubs/ubs/services/event-type.enum';
import { mockEvent, mockFavouriteEvents } from '@assets/mocks/events/mock-events';
import { mockHabits } from '@assets/mocks/habit/mock-habit-calendar';
import { newsMock } from '@assets/mocks/eco-news/mock-news-item';

describe('ProfileDashboardComponent', () => {
  let component: ProfileDashboardComponent;
  let fixture: ComponentFixture<ProfileDashboardComponent>;

  const HabitAssignServiceMock = jasmine.createSpyObj('habitAssignService', ['getAssignedHabits']);
  HabitAssignServiceMock.getAssignedHabits = () => of([{ id: 1 }]);

  const LocalStorageServiceMock = jasmine.createSpyObj('localStorageService', [
    'getUserId',
    'languageBehaviourSubject',
    'setCurentPage',
    'getCurrentLanguage'
  ]);
  LocalStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');
  LocalStorageServiceMock.setCurrentPage = () => of('previousPage', '/profile');
  LocalStorageServiceMock.getCurrentLanguage = () => of('ua');

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  storeMock.select = () => of({ ecoNews: {}, pages: [], pageNumber: 1, error: 'error' });

  const eventsServiceMock = jasmine.createSpyObj('EventsService', ['getEvents', 'getUserFavoriteEvents']);
  eventsServiceMock.getEvents = () => of(mockEvent);

  beforeEach(waitForAsync(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    httpClientSpy.get.and.returnValue(of(mockFavouriteEvents));

    TestBed.configureTestingModule({
      declarations: [ProfileDashboardComponent],
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        InfiniteScrollModule,
        NgxPaginationModule,
        BrowserAnimationsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: HabitAssignService, useValue: HabitAssignServiceMock },
        { provide: Store, useValue: storeMock },
        { provide: LocalStorageService, useValue: LocalStorageServiceMock },
        { provide: EventsService, useValue: eventsServiceMock },
        { provide: HttpClient, useValue: HttpClient }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onInit should call four method', () => {
    const spy1 = spyOn(component, 'dispatchNews');
    const spy2 = spyOn(component, 'initGetUserEvents');

    component.ngOnInit();

    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });

  it('onInit news should have expected result', waitForAsync(() => {
    component.ngOnInit();
    component.econews$.subscribe((item: any) => {
      expect(component.news).toEqual([]);
    });
  }));

  it('should update eventType and call getUserEvents when online event is checked', () => {
    const eventType = EventType.ONLINE;
    component.isOnlineChecked = true;
    const spy = spyOn(component, 'getUserEvents');
    component.onCheckboxChange();
    expect(component.isOnlineChecked).toBe(true);
    expect(component.isOfflineChecked).toBe(false);
    expect(component.eventType).toBe(eventType);
    expect(spy).toHaveBeenCalled();
  });

  it('should update eventType and call getUserEvents when offline event is checked', () => {
    const eventType = EventType.OFFLINE;
    component.isOfflineChecked = true;
    const spy = spyOn(component, 'getUserEvents');
    component.onCheckboxChange();
    expect(component.isOnlineChecked).toBe(false);
    expect(component.isOfflineChecked).toBe(true);
    expect(component.eventType).toBe(eventType);
    expect(spy).toHaveBeenCalled();
  });

  it('should update eventType and call getUserEvents when both checkboxes are unchecked', () => {
    const spy = spyOn(component, 'getUserEvents');
    component.onCheckboxChange();
    expect(component.isOnlineChecked).toBe(false);
    expect(component.isOfflineChecked).toBe(false);
    expect(component.eventType).toBe('');
    expect(spy).toHaveBeenCalled();
  });

  it('should update eventType and call getUserEvents when offline and online event is checked', () => {
    const eventType = EventType.ONLINE_OFFLINE;
    component.isOfflineChecked = true;
    component.isOnlineChecked = true;
    const spy = spyOn(component, 'getUserEvents');
    component.onCheckboxChange();
    expect(component.isOnlineChecked).toBe(true);
    expect(component.isOfflineChecked).toBe(true);
    expect(component.eventType).toBe(eventType);
    expect(spy).toHaveBeenCalled();
  });

  it('should call getHttpParams method and getEvents method', waitForAsync(() => {
    const getHttpParamsSpy = spyOn<any>(component, 'getHttpParams').and.callThrough();
    const getEventsSpy = spyOn(eventsServiceMock, 'getEvents').and.returnValue(of(mockEvent));
    component.initGetUserEvents();
    expect(getHttpParamsSpy).toHaveBeenCalled();
    expect(getEventsSpy).toHaveBeenCalled();
    expect(component.eventsList).toEqual(mockEvent.page);
    expect(component.totalEvents).toEqual(mockEvent.totalElements);
  }));

  it('changeStatus should return right Id', () => {
    HabitAssignServiceMock.habitsInProgress = [{ id: 4 }, { id: 2 }];
    component.changeStatus({ id: 4 } as any);
    expect(HabitAssignServiceMock.habitsInProgress).toEqual([{ id: 2 }] as any);
  });

  it('executeRequests habitsInProgress.duration to be 20', waitForAsync(() => {
    mockHabits.status = 'INPROGRESS';
    HabitAssignServiceMock.getAssignedHabits = () => of([mockHabits]);
    component.executeRequests();
    expect(HabitAssignServiceMock.habitsInProgress[0].duration).toBe(20);
  }));

  it('executeRequests habitsAcquired to be 2', waitForAsync(() => {
    const spy = spyOn(component, 'setHabitsForView');
    mockHabits.status = 'ACQUIRED';
    HabitAssignServiceMock.getAssignedHabits = () => of([mockHabits]);
    component.executeRequests();
    expect(component.habitsAcquired[0].workingDays).toBe(2);
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('setHabitsForView should return array length', () => {
    component.numberOfHabitsOnView = 2;
    HabitAssignServiceMock.habitsInProgress = [1, 2, 3];
    component.habitsAcquired = [1, 2, 3, 4] as any;
    component.setHabitsForView();
    expect(HabitAssignServiceMock.habitsInProgressToView.length).toBe(2);
    expect(component.habitsAcquiredToView.length).toBe(2);
  });

  it('getMoreHabitsInProgressForView expect habitsInProgressToView get new value', () => {
    spyOn(component, 'getMoreHabits').and.returnValue(['array'] as any);
    component.getMoreHabitsInProgressForView();
    expect(HabitAssignServiceMock.habitsInProgressToView).toEqual(['array']);
  });

  it('getMoreHabitsAcquiredForView habitsAcquiredToView should change lenght', () => {
    spyOn(component, 'getMoreHabits').and.returnValue(['array', 'tho'] as any);
    component.getMoreHabitsAcquiredForView();
    expect(component.habitsAcquiredToView.length).toBe(2);
  });

  it('getMoreHabits should return HABIT', () => {
    component.numberOfHabitsOnView = 3;
    const res = component.getMoreHabits(['H', 'A'] as any, [1, 2, 'B', 'I', 'T'] as any);
    expect(res.join('')).toEqual('HABIT');
  });

  it('tabChanged', () => {
    component.isActiveNewsScroll = false;
    component.tabChanged({ index: 1, tab: {} as any });
    expect(component.isActiveNewsScroll).toBe(true);
  });

  it('getUserEvents should call service', waitForAsync(() => {
    const spy = spyOn(eventsServiceMock, 'getEvents').and.returnValue(of(mockEvent));
    component.eventsPage = 0;
    component.getUserEvents();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(component.eventsPage).toBe(1);
    expect(component.eventsList).toEqual(mockEvent.page);
  }));

  it('onScroll', () => {
    const spy = spyOn(component, 'dispatchNews');
    component.news = [newsMock, { ...newsMock, id: 2 }];
    component.onScroll();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should remove unfavourite event from array', () => {
    component.eventsList = mockFavouriteEvents;
    component.removeUnFavouriteEvent(14);
    expect(component.eventsList.length).toEqual(1);
  });

  it('should toggle isFavoriteBtnClicked property on escapeFromFavorites method', () => {
    expect(component.isFavoriteBtnClicked).toBeFalse();
    component.escapeFromFavorites();
    expect(component.isFavoriteBtnClicked).toBeTrue();
    component.escapeFromFavorites();
    expect(component.isFavoriteBtnClicked).toBeFalse();
  });

  it('should set isFavoriteBtnClicked to true and call getUserEvents when goToFavorites is called', () => {
    spyOn(component, 'getUserEvents');
    component.goToFavorites();
    expect(component.isFavoriteBtnClicked).toBeTrue();
    expect(component.getUserEvents).toHaveBeenCalled();
  });

  it('should call getUserFavoriteEvents and set favouriteEvents when getUserFavouriteEvents is called', waitForAsync(() => {
    const spy = spyOn(eventsServiceMock, 'getEvents').and.returnValue(of(mockEvent));
    component.getUserEvents();
    expect(spy).toHaveBeenCalled();
    expect(component.eventsList).toEqual(mockEvent.page);
  }));
});
