import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FriendItemComponent } from './friend-item.component';
import { MaxTextLengthPipe } from 'src/app/shared/max-text-length-pipe/max-text-length.pipe';
import { CorrectUnitPipe } from 'src/app/shared/correct-unit-pipe/correct-unit.pipe';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Language } from 'src/app/main/i18n/Language';
import { of, BehaviorSubject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FriendStatusValues, UserDashboardTab } from '@global-user/models/friend.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserOnlineStatusService } from '@global-user/services/user-online-status.service';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { StoreModule } from '@ngrx/store';
import { By } from '@angular/platform-browser';

describe('FriendItemComponent', () => {
  let component: FriendItemComponent;
  let fixture: ComponentFixture<FriendItemComponent>;
  let router: Router;
  let mockRoute: ActivatedRoute;

  const localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', [
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
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1);
  localStorageServiceMock.getAccessToken = () => {
    123;
  };

  const onlineStatusMock = jasmine.createSpyObj('UserOnlineStatusService', ['checkIsOnline']);
  onlineStatusMock.checkIsOnline = () => true;

  const userFriendsServiceMock = jasmine.createSpyObj('UserFriendsService', ['addFriend']);
  userFriendsServiceMock.addFriend = () => of(true);

  const mockActivatedRoute = {
    snapshot: {
      params: { userId: '1' }
    },
    queryParams: of({})
  };

  const event: MouseEvent = {
    target: {
      tagName: 'DIV',
      classList: {
        contains: () => true
      }
    },
    altKey: false,
    button: 0,
    buttons: 0,
    clientX: 0,
    clientY: 0,
    preventDefault: () => {},
    stopPropagation: () => {}
  } as unknown as MouseEvent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FriendItemComponent, MaxTextLengthPipe, CorrectUnitPipe],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        MatDialogModule,
        RouterTestingModule,
        MatTooltipModule,
        StoreModule.forRoot({})
      ],
      providers: [
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: UserOnlineStatusService, useValue: onlineStatusMock },
        { provide: UserFriendsService, useValue: userFriendsServiceMock },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();

    router = TestBed.inject(Router);
    mockRoute = TestBed.inject(ActivatedRoute);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendItemComponent);
    component = fixture.componentInstance;
    component.friend = {
      id: 2,
      name: 'Name',
      profilePicturePath: '',
      added: true,
      rating: 380,
      email: 'name@mail.com',
      friendStatus: FriendStatusValues.FRIEND,
      chatId: 2,
      requesterId: null
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handle click', () => {
    it('should call clickHandler', () => {
      spyOn(component, 'clickHandler');
      const divElement = fixture.debugElement.query(By.css('.friend-item-wrapper'));
      divElement.triggerEventHandler('click', new Event('click'));
      expect(component.clickHandler).toHaveBeenCalledTimes(1);
    });

    it('should navigate with friend ID and name', () => {
      component.clickHandler(event);
      expect(router.navigate).toHaveBeenCalledWith(
        ['profile', component.currentUserId, 'users', component.friend.name, component.friend.id],
        {
          queryParams: { tab: UserDashboardTab.mutualFriends }
        }
      );
    });

    it('friend doesn`t have id', () => {
      component.userId = null;
      fixture.detectChanges();

      component.clickHandler(event);
      expect(router.navigate).toHaveBeenCalledWith([component.friend.name, component.friend.id], {
        relativeTo: mockRoute,
        queryParams: { tab: UserDashboardTab.mutualFriends }
      });
    });

    it('friend is me', () => {
      component.friend.id = 1;
      fixture.detectChanges();

      component.clickHandler(event);
      expect(router.navigate).toHaveBeenCalledWith(['profile', component.currentUserId], {
        queryParams: { tab: UserDashboardTab.mutualFriends }
      });
    });
  });
});
