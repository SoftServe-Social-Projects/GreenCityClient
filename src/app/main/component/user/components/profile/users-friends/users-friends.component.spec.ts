import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UsersFriendsComponent } from './users-friends.component';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, Renderer2, Type } from '@angular/core';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { FRIENDS } from '@global-user/mocks/friends-mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { CorrectUnitPipe } from 'src/app/shared/correct-unit-pipe/correct-unit.pipe';
import { FirstStringWordPipe } from '@pipe/first-string-word/first-string-word.pipe';
import { MaxTextLengthPipe } from 'src/app/shared/max-text-length-pipe/max-text-length.pipe';
import { Language } from 'src/app/main/i18n/Language';
import { FriendModel } from '@user-models/friend.model';
import { Router } from '@angular/router';
import { FriendStatusValues } from '@user-models/friend.model';
import { UserOnlineStatusService } from '@global-user/services/user-online-status.service';

describe('UsersFriendsComponent', () => {
  let renderer: Renderer2;
  let component: UsersFriendsComponent;
  let fixture: ComponentFixture<UsersFriendsComponent>;
  const localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', [
    'userIdBehaviorSubject',
    'getCurrentLanguage',
    'languageBehaviourSubject'
  ]);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');
  localStorageServiceMock.getCurrentLanguage = () => 'en' as Language;
  localStorageServiceMock.languageSubject = of('en');

  const userData: FriendModel[] = [
    { id: 1, name: 'John', email: 'john@example.com', rating: 5, friendStatus: FriendStatusValues.FRIEND, requesterId: 2 },
    { id: 2, name: 'Jane', email: 'jane@example.com', rating: 4, friendStatus: FriendStatusValues.FRIEND, requesterId: 1 },
    { id: 3, name: 'Doe', email: 'doe@example.com', rating: 3, friendStatus: FriendStatusValues.FRIEND, requesterId: 2 },
    { id: 4, name: 'Jack', email: 'Jack@example.com', rating: 3, friendStatus: FriendStatusValues.FRIEND, requesterId: 2 }
  ];

  const userFriendsServiceMock: UserFriendsService = jasmine.createSpyObj('UserFriendsService', ['getAllFriends']);
  userFriendsServiceMock.getAllFriends = () => of(FRIENDS);
  const userOnlineStatusServiceMock = {
    addUsersId: jasmine.createSpy('addUsersId'),
    checkIsOnline: jasmine.createSpy('checkIsOnline').and.returnValue(true),
    usersOnlineStatus$: new BehaviorSubject([])
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [UsersFriendsComponent, CorrectUnitPipe, FirstStringWordPipe, MaxTextLengthPipe],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        Renderer2,
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: UserFriendsService, useValue: userFriendsServiceMock },
        { provide: UserOnlineStatusService, useValue: userOnlineStatusServiceMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersFriendsComponent);
    component = fixture.componentInstance;
    renderer = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
    component.nextArrow = { nativeElement: document.createElement('div') };
    component.previousArrow = { nativeElement: document.createElement('div') };
    fixture.detectChanges();
  });

  it('should create UsersFriendsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should get userId', () => {
    expect(localStorageServiceMock.userIdBehaviourSubject.value).toBe(1111);
  });

  it('should set message to error message', () => {
    const error = new Error('Error message');
    spyOn(userFriendsServiceMock, 'getAllFriends').and.returnValue(throwError(() => error.message));
    component.showUsersFriends();
    expect(component.noFriends).toBe('Error message');
  });

  it('should change friends to next', () => {
    component.usersFriends = userData;
    component.amountOfFriends = userData.length;
    component.friendsToShow = 3;
    component.totalPages = 2;
    component.changeFriends(true);
    expect(component.slideIndex).toBe(1);
  });

  it('should change friends to previous', () => {
    component.usersFriends = userData;
    component.slideIndex = 1;
    component.changeFriends(false);
    expect(component.slideIndex).toBe(0);
  });

  it('should calculate 3 friends to show', () => {
    component.usersFriends = userData;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    component.calculateFriendsToShow();
    expect(component.friendsToShow).toBe(3);
  });

  it('should get 6 friends to show', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    const friendsToShow = component.getFriendsToShow();
    expect(friendsToShow).toBe(6);
  });

  it('should get 5 friends to show', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 600 });
    const friendsToShow = component.getFriendsToShow();
    expect(friendsToShow).toBe(5);
  });

  it('should calculate friends to show and not change friends', () => {
    const newFriendsToShow = 3;
    component.friendsToShow = 2;
    spyOn(component, 'getFriendsToShow').and.returnValue(newFriendsToShow);
    spyOn(component, 'changeFriends');
    spyOn(component, 'showUsersFriends');

    component.calculateFriendsToShow();

    expect(component.friendsToShow).toEqual(newFriendsToShow);
    expect(component.changeFriends).toHaveBeenCalled();
    expect(component.showUsersFriends).toHaveBeenCalled();
  });

  xit('should calculate friends to show and change friends', () => {
    const newFriendsToShow = 5;
    component.amountOfFriends = 3;
    spyOn(component, 'getFriendsToShow').and.returnValue(newFriendsToShow);
    spyOn(component, 'changeFriends');
    spyOn(component, 'showUsersFriends');

    component.calculateFriendsToShow();

    expect(component.friendsToShow).toEqual(newFriendsToShow);
    expect(component.showUsersFriends).toHaveBeenCalled();
  });

  it('should navigate to friend profile when showFriendsInfo is called', () => {
    const friend = userData[0];
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.showFriendsInfo(friend);
    expect(navigateSpy).toHaveBeenCalledWith([`profile/${component.userId}/friends`, friend.name, friend.id]);
  });

  it('should recalculate friends to show on window resize', () => {
    const calculateFriendsToShowSpy = spyOn(component, 'calculateFriendsToShow');
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(calculateFriendsToShowSpy).toHaveBeenCalled();
  });

  it('should return online status for a friend', () => {
    userOnlineStatusServiceMock.usersOnlineStatus$.next([
      { id: 1, onlineStatus: true },
      { id: 2, onlineStatus: false }
    ]);
    const result = component.isFriendOnline(1);
    expect(result).toBeTrue();
  });
});
