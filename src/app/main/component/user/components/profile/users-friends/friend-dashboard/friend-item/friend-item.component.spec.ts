import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FriendItemComponent } from './friend-item.component';
import { MaxTextLengthPipe } from 'src/app/shared/max-text-length-pipe/max-text-length.pipe';
import { CorrectUnitPipe } from 'src/app/shared/correct-unit-pipe/correct-unit.pipe';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Language } from 'src/app/main/i18n/Language';
import { of, BehaviorSubject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FriendModel, UserDashboardTab } from '@global-user/models/friend.model';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreModule } from '@ngrx/store';

describe('FriendItemComponent', () => {
  let component: FriendItemComponent;
  let fixture: ComponentFixture<FriendItemComponent>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  const localStorageServiceMock = jasmine.createSpyObj('localStorageService', [
    'languageBehaviourSubject',
    'getCurrentLanguage',
    'getUserId',
    'userIdBehaviourSubject',
    'getAccessToken'
  ]);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');
  localStorageServiceMock.getCurrentLanguage = () => 'en' as Language;
  localStorageServiceMock.languageSubject = of('en');
  localStorageServiceMock.getUserId = () => 1;
  localStorageServiceMock.userIdBehaviourSubject = of(1);
  localStorageServiceMock.getAccessToken = () => {};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FriendItemComponent, MaxTextLengthPipe, CorrectUnitPipe],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        MatDialogModule,
        RouterTestingModule.withRoutes([]),
        MatTooltipModule,
        StoreModule.forRoot({})
      ],
      providers: [{ provide: LocalStorageService, useValue: localStorageServiceMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendItemComponent);
    component = fixture.componentInstance;
    component.friend = {
      id: 1,
      name: 'Name',
      profilePicturePath: '',
      added: true,
      rating: 380,
      email: 'name@mail.com',
      friendStatus: 'FRIEND',
      chatId: 2,
      requesterId: null
    };
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getLangChange method onInit', () => {
    const spy = spyOn(component as any, 'getLangChange');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('it should call friendEvent on click', () => {
    const spy = spyOn(component.friendEventEmit, 'emit');
    component.friendEvent();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('it should call declineEvent on click', () => {
    const spy = spyOn(component.declineEvent, 'emit');
    component.declineFriend();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should call checkButtons when target is a button', () => {
    const mockEvent: Partial<MouseEvent> = {
      target: document.createElement('button')
    };
    const spy = spyOn(component as any, 'checkButtons');

    component.clickHandler(mockEvent as MouseEvent);

    expect(spy).toHaveBeenCalled();
  });

  it('should call toUsersInfo when target class friend-mutual-link and userId is not set', () => {
    const span = document.createElement('span');
    span.className = 'friend-mutual-link';
    const mockEvent: Partial<MouseEvent> = {
      target: span
    };
    component.userId = null;
    const spy = spyOn(component as any, 'toUsersInfo');

    component.clickHandler(mockEvent as MouseEvent);

    expect(spy).toHaveBeenCalledWith(UserDashboardTab.mutualFriends);
  });

  it('should call toUsersInfo when target is div', () => {
    const mockEvent: Partial<MouseEvent> = {
      target: document.createElement('div')
    };
    const spy = spyOn(component as any, 'toUsersInfo');

    component.clickHandler(mockEvent as MouseEvent);

    expect(spy).toHaveBeenCalled();
  });

  it('it should navigate to user profile if user id is set', () => {
    component.userId = 1;
    (component as any).currentUserId = 2;
    component.friend = { name: 'name', id: 3 } as FriendModel;

    spyOn(router, 'navigate');
    (component as any).toUsersInfo();
    expect(router.navigate).toHaveBeenCalledWith(['profile', 2, 'users', 'name', 3], {
      queryParams: { tab: UserDashboardTab.allHabits }
    });
  });

  it('it should navigate to user profile if user id is not set', () => {
    component.userId = null;
    (component as any).currentUserId = 2;
    component.friend = { name: 'name', id: 3 } as FriendModel;

    spyOn(router, 'navigate');
    (component as any).toUsersInfo(UserDashboardTab.mutualFriends);
    expect(router.navigate).toHaveBeenCalledWith(['name', 3], {
      relativeTo: activatedRoute,
      queryParams: { tab: UserDashboardTab.mutualFriends }
    });
  });
});
