import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { FriendDashboardComponent } from './friend-dashboard.component';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { FRIENDS } from '@global-user/mocks/friends-mock';
import { Store } from '@ngrx/store';
import { GetAllFriends, GetAllFriendsRequests } from 'src/app/store/actions/friends.actions';

@Injectable()
class TranslationServiceStub {
  public onLangChange = new EventEmitter<any>();
  public onTranslationChange = new EventEmitter<any>();
  public onDefaultLangChange = new EventEmitter<any>();
  public addLangs(langs: string[]) {}
  public getLangs() {
    return 'en-us';
  }
  public getBrowserLang() {
    return '';
  }
  public getBrowserCultureLang() {
    return '';
  }
  public use(lang: string) {
    return '';
  }
  public get(key: any): any {
    return of(key);
  }
  public setDefaultLang() {
    return true;
  }
}

describe('FriendDashboardComponent', () => {
  let component: FriendDashboardComponent;
  let fixture: ComponentFixture<FriendDashboardComponent>;
  let searchTerm$: Subject<string>;
  let componentRefMock = {
    findUserByName: jasmine.createSpy('findUserByName'),
    findFriendByName: jasmine.createSpy('findFriendByName')
  };
  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', [
    'getCurrentLanguage',
    'userIdBehaviourSubject',
    'languageSubject'
  ]);
  localStorageServiceMock.languageSubject = new Subject();
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');

  const userFriendsServiceMock: UserFriendsService = jasmine.createSpyObj('UserFriendsService', ['getAllFriends', 'getRequests']);
  userFriendsServiceMock.getAllFriends = () => of(FRIENDS);
  userFriendsServiceMock.getRequests = () => of(FRIENDS);

  const storeMock: Store = jasmine.createSpyObj('Store', ['select', 'dispatch']);
  storeMock.select = () => of();

  componentRefMock = {
    findUserByName: jasmine.createSpy('findUserByName'),
    findFriendByName: jasmine.createSpy('findFriendByName')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FriendDashboardComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: UserFriendsService, useValue: userFriendsServiceMock },
        { provide: TranslateService, useClass: TranslationServiceStub },
        { provide: Store, useValue: storeMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendDashboardComponent);
    component = fixture.componentInstance;
    searchTerm$ = new Subject<string>();
    component.searchTerm$ = searchTerm$;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call all methods OnInit', () => {
    const spyQuery = spyOn(component, 'preventFrequentQuery');
    const spyInptu = spyOn(component, 'hideInputField');
    component.ngOnInit();
    expect(spyQuery).toHaveBeenCalled();
    expect(spyInptu).toHaveBeenCalled();
  });

  it('should get userId', () => {
    expect(localStorageServiceMock.userIdBehaviourSubject.value).toBe(1111);
  });

  it('should emit the input value through searchTerm$', () => {
    const spy = spyOn(component.searchTerm$, 'next');
    const input = {
      value: 'text'
    };
    component.onInput(input);
    expect(spy).toHaveBeenCalledWith('text');
  });
});
