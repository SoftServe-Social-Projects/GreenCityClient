import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { FriendProfilePageComponent } from './friend-profile-page.component';
import { FRIENDS, UserAsFriend } from '@global-user/mocks/friends-mock';
import { HttpClientModule } from '@angular/common/http';

describe('FriendProfilePageComponent', () => {
  let component: FriendProfilePageComponent;
  let fixture: ComponentFixture<FriendProfilePageComponent>;
  const translateServiseMock: TranslateService = jasmine.createSpyObj('TranslateService', ['setDefaultLang']);

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', [
    'getCurrentLanguage',
    'languageSubject',
    'userIdBehaviourSubject'
  ]);
  localStorageServiceMock.languageSubject = new Subject();
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1);

  const userFriendsServiceMock: UserFriendsService = jasmine.createSpyObj('UserFriendsService', [
    'getUserProfileStatistics',
    'getUserInfo',
    'getRequests',
    'declineRequest',
    'acceptRequest',
    'getUserDataAsFriend'
  ]);
  userFriendsServiceMock.getUserProfileStatistics = () => of();
  userFriendsServiceMock.getUserInfo = () => of();
  userFriendsServiceMock.getRequests = () => of(FRIENDS);
  userFriendsServiceMock.getUserDataAsFriend = () => of(UserAsFriend);
  const activatedRouteMock = {
    snapshot: {
      params: {
        userId: 9853,
        id: 2
      }
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FriendProfilePageComponent],
      providers: [
        { provide: UserFriendsService, useValue: userFriendsServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: {} },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: TranslateService, useValue: translateServiseMock }
      ],
      imports: [HttpClientModule, TranslateModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('methd ngOnInit should set default language', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    localStorageServiceMock.getCurrentLanguage.and.returnValue('ua');
    const value = localStorageServiceMock.getCurrentLanguage();
    expect(value).toBe('ua');
    component.ngOnInit();
    translateServiseMock.setDefaultLang(value);
    expect(translateServiseMock.setDefaultLang).toHaveBeenCalledWith(value);
  });
});
