import { UbsUserMessagesComponent } from './ubs-user-messages.component';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { of, throwError } from 'rxjs';
import { NotificationBody, Notifications } from '../../ubs-admin/models/ubs-user.model';
import { UserMessagesService } from '../services/user-messages.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule, PaginatePipe } from 'ngx-pagination';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('UbsUserMessagesComponent', () => {
  let component: UbsUserMessagesComponent;
  let fixture: ComponentFixture<UbsUserMessagesComponent>;
  const fakeNotificationBody: NotificationBody = {
    id: 1,
    images: ['https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg'],
    body: 'fakeBody',
    notificationTime: '04.06.2020',
    orderId: 1,
    title: 'Недотримання правил УБС',
    read: false,
    isOpen: false
  };

  const fakeNotification: Notifications = {
    page: [fakeNotificationBody],
    totalElements: 1,
    currentPage: 1,
    totalPages: 1
  };

  let route: ActivatedRoute;
  const localStorageServiceFake = jasmine.createSpyObj('LocalStorageService', ['']);
  localStorageServiceFake.languageBehaviourSubject = () => of('en');

  const userMessageServiceMock = jasmine.createSpyObj('UserMessagesService', [
    'getNotification',
    'setReadNotification',
    'deleteNotification',
    'fetchNotification'
  ]);
  userMessageServiceMock.getNotification.and.returnValue(of(fakeNotification));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UbsUserMessagesComponent, PaginatePipe],
      imports: [MatDialogModule, TranslateModule.forRoot(), RouterTestingModule, NgxPaginationModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: UserMessagesService, useValue: userMessageServiceMock },
        { provide: MatSnackBarComponent, useValue: { openSnackBar: () => {} } }
      ]
    }).compileComponents();

    route = TestBed.inject(ActivatedRoute);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsUserMessagesComponent);
    component = fixture.componentInstance;
    component.notifications = fakeNotification.page;
    fixture.detectChanges();
  });

  afterEach(() => {
    userMessageServiceMock.setReadNotification.calls.reset();
    userMessageServiceMock.deleteNotification.calls.reset();
    userMessageServiceMock.countOfNoReadMessages = 1;
    component.notifications = [{ ...fakeNotificationBody, read: false }];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should initialize without images and with count of page equals 0`, () => {
    component.ngOnInit();

    expect(component.images.length).toEqual(0);
    expect(component.page).toEqual(0);
  });

  it(`should initialize the notification body`, () => {
    component.fetchNotification();

    expect(component.notifications).toEqual([fakeNotificationBody]);
  });

  it('should open popUp', fakeAsync(() => {
    const spy = spyOn(component, 'openImg');
    fixture.debugElement.query(By.css('.notification-images')).nativeElement.click();
    tick();
    expect(spy).toHaveBeenCalled();
  }));

  describe('setRead', () => {
    beforeEach(() => {
      userMessageServiceMock.countOfNoReadMessages = 1;
    });

    it('should set notification as read and decrease unread message count', () => {
      const notification = component.notifications[0];
      userMessageServiceMock.setReadNotification.and.returnValue(of(undefined));

      component.setRead(notification);

      expect(userMessageServiceMock.setReadNotification).toHaveBeenCalledWith(notification.id);
      expect(notification.read).toBeTrue();
      expect(userMessageServiceMock.countOfNoReadMessages).toBe(0);
    });

    it('should not call setReadNotification if notification is already read', () => {
      const notification = component.notifications[1];

      component.setRead(notification);

      expect(userMessageServiceMock.setReadNotification).not.toHaveBeenCalled();
    });
  });
  describe('deleteNotification', () => {
    it('should delete a notification and update notifications list', () => {
      component.notifications = [
        {
          id: 1,
          images: ['https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg'],
          body: 'fakeBody',
          notificationTime: '04.06.2020',
          orderId: 1,
          title: 'Недотримання правил УБС',
          read: false,
          isOpen: false
        },
        {
          id: 2,
          images: ['https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg'],
          body: 'fakeBody',
          notificationTime: '04.06.2020',
          orderId: 1,
          title: 'Недотримання правил УБС',
          read: false,
          isOpen: false
        }
      ];

      const notificationToDelete = component.notifications[1];
      const mockEvent = new MouseEvent('click');
      userMessageServiceMock.deleteNotification.and.returnValue(of(null));

      component.deleteNotification(mockEvent, notificationToDelete);

      expect(userMessageServiceMock.deleteNotification).toHaveBeenCalledWith(notificationToDelete.id);
      expect(component.notifications).toEqual([component.notifications[0]]);
    });

    it('should fetch more notifications if there are less than pageSize and hasNextPage', () => {
      const mockEvent = new MouseEvent('click');

      userMessageServiceMock.deleteNotification.and.returnValue(of(null));
      spyOn(component, 'fetchNotification');
      component.deleteNotification(mockEvent, fakeNotificationBody);
      expect(component.fetchNotification).toHaveBeenCalled();
    });

    it('should decrease the page and fetch notifications if the list is empty', () => {
      const mockEvent = new MouseEvent('click');

      userMessageServiceMock.deleteNotification.and.returnValue(of(null));
      spyOn(component, 'fetchNotification');
      component.deleteNotification(mockEvent, fakeNotificationBody);
      expect(component.page).toBe(0);
      expect(component.fetchNotification).toHaveBeenCalled();
    });

    it('should open error snackbar on service error', () => {
      const mockEvent = new MouseEvent('click');
      userMessageServiceMock.deleteNotification.and.returnValue(
        throwError(() => {
          'error';
        })
      );
      component.deleteNotification(mockEvent, fakeNotificationBody);
    });

    it('should not proceed if event is neither MouseEvent nor Enter key', () => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      component.deleteNotification(mockEvent, fakeNotificationBody);

      expect(userMessageServiceMock.deleteNotification).not.toHaveBeenCalled();
    });
  });
});
