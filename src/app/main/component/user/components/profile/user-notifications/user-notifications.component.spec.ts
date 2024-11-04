import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { UserNotificationsComponent } from './user-notifications.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Language } from 'src/app/main/i18n/Language';
import { PipeTransform, Pipe, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { FilterCriteria, NotificationFilter } from '@global-user/models/notification.model';
import { Router } from '@angular/router';
import { UserNotificationService } from '@global-user/services/user-notification.service';

import { UserService } from '@global-service/user/user.service';
import { LocalizedDatePipe } from 'src/app/shared/localized-date-pipe/localized-date.pipe';
import { RelativeDatePipe } from 'src/app/shared/relative-date.pipe';
import { By } from '@angular/platform-browser';

@Pipe({ name: 'translate' })
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('UserNotificationsComponent', () => {
  let component: UserNotificationsComponent;
  let fixture: ComponentFixture<UserNotificationsComponent>;
  let matSnackBarMock: jasmine.SpyObj<MatSnackBarComponent>;

  const notifications = [
    {
      actionUserId: 2,
      actionUserText: 'testUser',
      bodyText: 'test texts',
      message: 'test message',
      notificationId: 5,
      notificationType: 'FRIEND_REQUEST_RECEIVED',
      projectName: 'GreeCity',
      secondMessage: 'secondMessageTest',
      secondMessageId: 6,
      targetId: null,
      time: '',
      titleText: 'test title',
      viewed: false
    },
    {
      actionUserId: 1,
      actionUserText: 'testUser1',
      bodyText: 'test texts1',
      message: 'test message1',
      notificationId: 2,
      notificationType: '',
      projectName: 'GreeCity',
      secondMessage: 'secondMessageTest',
      secondMessageId: 5,
      targetId: 8,
      time: '',
      titleText: 'test title',
      viewed: true
    }
  ];

  const translateMock = {
    use() {
      return of();
    },
    get() {
      return of();
    }
  };
  const localStorageServiceMock = jasmine.createSpyObj('localStorageService', [
    'languageBehaviourSubject',
    'getCurrentLanguage',
    'getUserId'
  ]);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');
  localStorageServiceMock.getCurrentLanguage = () => 'en' as Language;
  localStorageServiceMock.languageSubject = of('en');
  localStorageServiceMock.getUserId = () => 1;

  const routerMock = jasmine.createSpyObj('router', ['navigate']);

  const userNotificationServiceMock = jasmine.createSpyObj('userNotificationService', [
    'getAllNotifications',
    'readNotification',
    'unReadNotification',
    'deleteNotification',
    'getUBSNotification'
  ]);
  userNotificationServiceMock.getAllNotifications = () => of({ page: notifications });
  userNotificationServiceMock.getUBSNotification = jasmine
    .createSpy('getUBSNotification')
    .and.returnValue(of({ page: notifications, currentPage: 1 }));

  userNotificationServiceMock.readNotification = () => of();
  userNotificationServiceMock.unReadNotification = () => of();
  userNotificationServiceMock.deleteNotification = () => of();

  const filterCriteriaOptions = [
    { name: FilterCriteria.ALL, isSelected: true, nameUa: 'Усі', nameEn: 'All' },
    { name: FilterCriteria.TYPE, isSelected: false, nameUa: 'Типом', nameEn: 'Type' },
    { name: FilterCriteria.ORIGIN, isSelected: false, nameUa: 'Джерелом', nameEn: 'Origin' }
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserNotificationsComponent, TranslatePipeMock, LocalizedDatePipe, RelativeDatePipe],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: TranslateService, useValue: translateMock },
        { provide: MatSnackBarComponent, useValue: { openSnackBar: () => {} } },
        { provide: Router, useValue: routerMock },
        { provide: UserNotificationService, useValue: userNotificationServiceMock },
        { provide: UserService, useValue: { userId: 1 } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    matSnackBarMock = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);
    fixture = TestBed.createComponent(UserNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change filter approach', () => {
    const eventKeyboard = new KeyboardEvent('keydown', { key: 'Enter' });
    const eventClick = new MouseEvent('click');
    component.changeFilterApproach(FilterCriteria.TYPE, eventKeyboard);
    expect(component.filterCriteriaOptions.find((el) => el.name === FilterCriteria.TYPE).isSelected).toBeTrue();
    component.changeFilterApproach(FilterCriteria.ORIGIN, eventClick);
    expect(component.filterCriteriaOptions.find((el) => el.name === FilterCriteria.TYPE).isSelected).toBeFalse();
    expect(component.filterCriteriaOptions.find((el) => el.name === FilterCriteria.ORIGIN).isSelected).toBeTrue();
  });

  it('should return checkSelectedFilter', () => {
    component.filterCriteriaOptions = filterCriteriaOptions;
    expect(component.checkSelectedFilter(FilterCriteria.TYPE)).toBeFalsy();
  });

  it('should call declineRequest', fakeAsync(() => {
    component.notifications = notifications;
    const spy = spyOn(component, 'declineRequest');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.decline-request'));
    button.triggerEventHandler('click', null);
    tick();
    expect(spy).toHaveBeenCalled();
  }));

  it('should call  accept request', fakeAsync(() => {
    component.notifications = notifications;
    const spy = spyOn(component, 'acceptRequest');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.accept-request'));
    button.triggerEventHandler('click', null);
    tick();
    expect(spy).toHaveBeenCalled();
  }));

  it('onScroll', () => {
    const spy = spyOn(component, 'getNotification');
    component.isLoading = false;
    component.hasNextPage = true;
    component.currentPage = 2;
    component.onScroll();
    expect(component.isLoading).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(3);
  });

  it('should cancel streams after ngOnDestroy', () => {
    const destroy$ = 'destroy$';
    const nextSpy = spyOn(component[destroy$], 'next');
    const completeSpy = spyOn(component[destroy$], 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should load more notifications on scroll if there is a next page', () => {
    spyOn(component, 'getNotification');
    component.hasNextPage = true;
    component.currentPage = 1;
    component.onScroll();
    expect(component.isLoading).toBeTrue();
    expect(component.getNotification).toHaveBeenCalledWith(component.currentPage + 1);
  });

  it('should not load more notifications on scroll if there is no next page', () => {
    spyOn(component, 'getNotification');
    component.hasNextPage = false;
    component.onScroll();
    expect(component.isLoading).toBeTrue();
    expect(component.getNotification).not.toHaveBeenCalled();
  });

  it('should not change filter approach when event is not a mouse or enter key event', () => {
    const mockEvent = new Event('click');
    component.filterCriteriaOptions = [...filterCriteriaOptions];
    component.changeFilterApproach('ALL', mockEvent);
    expect(component.filterCriteriaOptions).toEqual(filterCriteriaOptions);
  });

  it('should change filter approach correctly when changeFilterApproach is called', () => {
    const mockEvent = new MouseEvent('click');
    spyOn(component, 'getNotification').and.callFake(() => {});
    component.changeFilterApproach(FilterCriteria.ALL, mockEvent);
    expect(component.filterCriteriaOptions.every((el) => (el.name === FilterCriteria.ALL ? el.isSelected : !el.isSelected))).toBeTrue();
    expect(component.notifications).toEqual([]);
  });

  it('should not change filter approach when event is not a mouse or enter key event', () => {
    const mockEvent = new Event('click');
    component.filterCriteriaOptions = [...filterCriteriaOptions];
    component.changeFilterApproach('ALL', mockEvent);
    expect(component.filterCriteriaOptions).toEqual(filterCriteriaOptions);
  });
});
