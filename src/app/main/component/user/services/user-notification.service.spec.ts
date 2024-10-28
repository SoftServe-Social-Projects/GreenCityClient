import { TestBed } from '@angular/core/testing';

import { UserNotificationService } from './user-notification.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';

xdescribe('UserNotificationService', () => {
  let service: UserNotificationService;
  let httpMock: HttpTestingController;

  const notifications = [
    {
      actionUserId: 1,
      actionUserText: 'testUser1',
      bodyText: 'test texts1',
      message: 'test message1',
      notificationId: 2,
      notificationType: 'ECONEWS_COMMENT_REPLY',
      projectName: 'GREENCITY',
      secondMessage: 'secondMessageTest',
      secondMessageId: 5,
      targetId: 8,
      time: '',
      titleText: 'test title',
      viewed: true
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserNotificationService]
    });
    service = TestBed.inject(UserNotificationService);
    httpMock = TestBed.inject(HttpTestingController);

    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAllNotification', () => {
    const filters = { projectName: ['GREENCITY'], notificationType: ['ECONEWS_COMMENT_REPLY'] };
    const params = new HttpParams()
      .set('projectName', filters.projectName[0])
      .set('notificationType', filters.notificationType[0])
      .set('page', '0')
      .set('size', '5');

    service.getAllNotifications(params).subscribe((res) => {
      expect(res.page.length).toBe(1);
    });
    const req = httpMock.expectOne(
      `${service.url}notification/all?projectName=GREENCITY&notificationType=ECONEWS_COMMENT_REPLY&page=0&size=5`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ page: notifications });
  });

  it('should return getThreeNewNotification', () => {
    service.getThreeNewNotification().subscribe((res) => {
      expect(res.page.length).toBe(1);
    });
    const req = httpMock.expectOne(`${service.url}notification/new`);
    expect(req.request.method).toBe('GET');
    req.flush(notifications);
  });

  it('should readNotification', () => {
    service.readNotification(1, false).subscribe();
    const req = httpMock.expectOne(`${service.url}notification/view/1`);
    expect(req.request.method).toBe('PATCH');
  });

  it('should readNotification', () => {
    service.unReadNotification(2, false).subscribe();
    const req = httpMock.expectOne(`${service.url}notification/unread/2`);
    expect(req.request.method).toBe('PATCH');
  });

  it('should deleteNotification', () => {
    service.deleteNotification(2, false).subscribe();
    const req = httpMock.expectOne(`${service.url}notification/2`);
    expect(req.request.method).toBe('DELETE');
  });
});
