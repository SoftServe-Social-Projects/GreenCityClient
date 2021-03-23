import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FriendModel } from '@global-user/models/friend.model';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { RecommendedFriendsComponent } from './recommended-friends.component';

describe('RecommendedFriendsComponent', () => {
  let component: RecommendedFriendsComponent;
  let fixture: ComponentFixture<RecommendedFriendsComponent>;
  let localStorageServiceMock: LocalStorageService;
  localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', ['userIdBehaviourSubject']);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  let userFriendsServiceMock: UserFriendsService;

  const response = {
    id: 1,
    name: 'Name',
    profilePicture: '',
    added: false,
  };

  const userFriends = {
    totalElements: 1,
    totalPages: 1,
    currentPage: 1,
    page: [
      {
        id: 1,
        name: 'Name',
        profilePicture: '',
        added: true,
        rating: 380,
        city: 'Lviv',
        mutualFriends: 5,
      },
      {
        id: 2,
        name: 'Name2',
        profilePicture: '',
        added: true,
        rating: 380,
        city: 'Lviv',
        mutualFriends: 5,
      },
    ],
  };
  const userFriendsArray: FriendModel[] = [
    {
      id: 1,
      name: 'Name',
      profilePicture: '',
      added: true,
      rating: 380,
      city: 'Lviv',
      mutualFriends: 5,
    },
    {
      id: 2,
      name: 'Name2',
      profilePicture: '',
      added: true,
      rating: 380,
      city: 'Lviv',
      mutualFriends: 5,
    },
  ];
  userFriendsServiceMock = jasmine.createSpyObj('UserFriendsService', ['getRecommendedFriends', 'deleteFriend', 'addFriend']);
  userFriendsServiceMock.getRecommendedFriends = () => of(userFriends);
  userFriendsServiceMock.deleteFriend = (idUser, idFriend) => of(response);
  userFriendsServiceMock.addFriend = (idUser, idFriend) => of(response);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecommendedFriendsComponent],
      providers: [
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: UserFriendsService, useValue: userFriendsServiceMock },
      ],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, RouterTestingModule.withRoutes([]), MatSnackBarModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommendedFriendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get userId', () => {
    expect(localStorageServiceMock.userIdBehaviourSubject.value).toBe(1111);
  });

  it('should get a user', () => {
    const initUserSpy = spyOn(component as any, 'initUser');
    component.ngOnInit();
    expect(initUserSpy).toHaveBeenCalledTimes(1);
  });

  it("should get a user's friends", () => {
    const getRecommendedFriendsSpy = spyOn(component as any, 'getRecommendedFriends');
    component.ngOnInit();
    expect(getRecommendedFriendsSpy).toHaveBeenCalledTimes(1);
  });

  it('should call method addFriend', () => {
    // @ts-ignore
    const addFriendSpy = spyOn(component.userFriendsService, 'addFriend').and.returnValue(of(true));
    component.addFriend(4);
    expect(addFriendSpy).toHaveBeenCalled();
  });

  it('should call getFriends on scroll', () => {
    // @ts-ignore
    const getRecommendedFriendSpy = spyOn(component.userFriendsService, 'getRecommendedFriends').and.returnValue(of(userFriends));
    component.onScroll();
    expect(getRecommendedFriendSpy).toHaveBeenCalled();
  });
});
