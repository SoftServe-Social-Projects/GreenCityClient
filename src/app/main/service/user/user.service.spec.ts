import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { habitStatisticLink, userLink } from '../../links';
import { LISTOFUSERS, USERCHANGESTATUS, USERCHANGEROLE, GETUSERPAGEBLE, GETUPDATEUSER, HABITITEMS } from '../../mocks/user-service-mock';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const languageServiceMock = jasmine.createSpyObj('LanguageService', ['getCurrentLanguage']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, { provide: LanguageService, useValue: languageServiceMock }],
      imports: [HttpClientTestingModule]
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all users', () => {
    service.getAllUsers('USER').subscribe((data) => {
      expect(data).toEqual(LISTOFUSERS);
    });
    const req = httpMock.expectOne(`${userLink}/all` + 'USER');
    expect(req.request.method).toBe('GET');
    req.flush(LISTOFUSERS);
  });

  it('should update user status', () => {
    service.updateUserStatus(1, 'ACTIVE').subscribe((user) => {
      expect(user).not.toBe(null);
      expect(user).toEqual(USERCHANGESTATUS);
    });
    const req = httpMock.expectOne(`${userLink}/status`, 'TEST');
    expect(req.request.method).toBe('PATCH');
    req.flush(USERCHANGESTATUS);
  });

  it('should update user role', () => {
    service.updateUserRole(1, 'USER').subscribe((user) => {
      expect(user).not.toBe(null);
      expect(user).toEqual(USERCHANGEROLE);
    });
    const req = httpMock.expectOne(`${userLink}/role`, 'USER');
    expect(req.request.method).toBe('PATCH');
    req.flush(USERCHANGEROLE);
  });

  it('should get roles', () => {
    service.getRoles().subscribe((data) => {
      expect(data).not.toBe(null);
      expect(data).toEqual({ roles: [] });
    });
    const req = httpMock.expectOne(`${userLink}/roles`);
    expect(req.request.method).toBe('GET');
    req.flush({ roles: [] });
  });

  it('should get users by filter', () => {
    service.getByFilter('1', 'test').subscribe((users) => {
      expect(users).toEqual(GETUSERPAGEBLE);
    });
    const req = httpMock.expectOne(`${userLink}/filter` + 'test', 'USER');
    expect(req.request.method).toBe('POST');
    req.flush(GETUSERPAGEBLE);
  });

  it('should get user', () => {
    service.getUser().subscribe((user) => {
      expect(user).not.toBe(null);
      expect(user).toEqual(GETUPDATEUSER);
    });
    const req = httpMock.expectOne(`${userLink}`);
    expect(req.request.method).toBe('GET');
    req.flush(GETUPDATEUSER);
  });

  it('should get updated user', () => {
    const body = JSON.stringify(GETUPDATEUSER);
    service.updateUser(GETUPDATEUSER).subscribe((user) => {
      expect(user).not.toBe(null);
      expect(user).toEqual(GETUPDATEUSER);
    });
    const req = httpMock.expectOne(`${userLink}`, body);
    expect(req.request.method).toBe('PUT');
    req.flush(GETUPDATEUSER);
  });

  it('should return email notification statuses', () => {
    service.getEmailNotificationsStatuses().subscribe((data) => {
      expect(data).not.toBe(null);
      expect(data).toEqual(['test']);
    });
    const req = httpMock.expectOne(`${userLink}/emailNotifications`);
    expect(req.request.method).toBe('GET');
    req.flush(['test']);
  });

  it('should update last activity', () => {
    const date = '2021-06-28T20:20:20.170268';
    service.updateLastTimeActivity().subscribe((data) => {
      expect(data).not.toBeNull();
      expect(data).toEqual(date);
    });
    const req = httpMock.expectOne(`${userLink}/updateUserLastActivityTime/`, date);
    expect(req.request.method).toBe('PUT');
    req.flush(date);
  });

  it('should count activated users', () => {
    service.countActivatedUsers().subscribe((data) => {
      expect(data).toBe(5);
    });
    const req = httpMock.expectOne(`${userLink}/activatedUsersAmount`);
    expect(req.request.method).toBe('GET');
    req.flush(5);
  });

  it('should get current statistics for all habit items', () => {
    service.getTodayStatisticsForAllHabitItems(languageServiceMock).subscribe((data) => {
      expect(languageServiceMock).not.toBeUndefined();
      expect(data).not.toBeNull();
      expect(data).toEqual(HABITITEMS);
    });
    const req = httpMock.expectOne(`${habitStatisticLink}todayStatisticsForAllHabitItems?language=${languageServiceMock}`);
    expect(req.request.method).toBe('GET');
    req.flush(HABITITEMS);
  });

  // it('should be PUT http method to update language', () => {
  //   const url = service.updateUserLanguage(1).subscribe();
  //   const req = httpMock.expectOne({ method: 'PUT' });
  //   req.flush('Put');
  // });

  afterEach(() => {
    httpMock.verify();
  });
});
