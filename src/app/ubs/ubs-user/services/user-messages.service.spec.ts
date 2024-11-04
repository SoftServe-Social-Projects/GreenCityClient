import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { BehaviorSubject } from 'rxjs';
import { mainUbsLink } from 'src/app/main/links';

import { UserMessagesService } from './user-messages.service';

describe('UserMessagesService', () => {
  let httpMock: HttpTestingController;
  let service: UserMessagesService;
  let langMock = null;

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', ['languageBehaviourSubject']);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('en');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: LocalStorageService, useValue: localStorageServiceMock }]
    });
    service = TestBed.inject(UserMessagesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get language', () => {
    localStorageServiceMock.languageBehaviourSubject.subscribe((lang) => {
      langMock = lang;
    });
    expect(langMock).toBe('en');
  });

  it('should return 10 notifications', () => {
    service.getNotification(0, 10, 'en').subscribe((data) => {
      expect(data).toBeDefined();
      expect(data.page.length).toBe(10);
    });
    const req = httpMock.expectOne(`${mainUbsLink}/notifications?lang=en&page=0&size=10`);
    expect(req.request.method).toBe('GET');
  });

  it('should return count of unread notifications', () => {
    service.getCountUnreadNotification().subscribe((data) => {
      expect(data).toBeGreaterThanOrEqual(0);
    });
    const req = httpMock.expectOne(`${mainUbsLink}/notifications/quantityUnreadenNotifications`);
    expect(req.request.method).toBe('GET');
  });

  it('should call the correct URL and method for setReadNotification', () => {
    const notificationId = 1;

    service.markNotificationAsRead(notificationId).subscribe();
    const req = httpMock.expectOne(`${service.url}/notifications/${notificationId}/viewNotification`);
    expect(req.request.method).toBe('PATCH');
  });

  it('should call the correct URL and method for deleteNotification', () => {
    const notificationId = 1;

    service.deleteNotification(notificationId).subscribe();
    const req = httpMock.expectOne(`${service.url}/notifications/${notificationId}`);
    expect(req.request.method).toBe('DELETE');
  });
});
