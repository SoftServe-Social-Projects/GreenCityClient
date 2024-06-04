import { Language } from '../../../../i18n/Language';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Injectable, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';
import { EventsListItemComponent } from './events-list-item.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of } from 'rxjs/internal/observable/of';
import { EventsService } from '../../../events/services/events.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { RatingModule } from 'ngx-bootstrap/rating';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { EventResponse, TagObj } from '../../../events/models/events.interface';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { AddAttenderEcoEventsByIdAction, EventsActions } from 'src/app/store/actions/ecoEvents.actions';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { MaxTextLengthPipe } from 'src/app/shared/max-text-length-pipe/max-text-length.pipe';
import { JwtService } from '@global-service/jwt/jwt.service';
import { EventStoreService } from '../../../events/services/event-store.service';

@Injectable()
class TranslationServiceStub {
  public onLangChange = new EventEmitter<any>();
  public onTranslationChange = new EventEmitter<any>();
  public onDefaultLangChange = new EventEmitter<any>();

  public get(key: any): any {
    return of(key);
  }

  public setDefaultLang() {
    return true;
  }
}

@Pipe({ name: 'dateLocalisation' })
class DatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('EventsListItemComponent', () => {
  let component: EventsListItemComponent;
  let fixture: ComponentFixture<EventsListItemComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let translate: TranslateService;
  const jwtServiceMock = jasmine.createSpyObj('jwtService', ['getUserRole']);
  jwtServiceMock.getUserRole = () => 'true';
  jwtServiceMock.userRole$ = new BehaviorSubject('ROLE_UBS_EMPLOYEE');

  const MatSnackBarMock = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);
  const styleBtnMock = {
    secondary: 'secondary-global-button',
    primary: 'primary-global-button',
    hiden: 'event-button-hiden'
  };

  const btnNameMock = {
    edit: 'event.btn-edit',
    delete: 'event.btn-delete',
    rate: 'event.btn-rate',
    cancel: 'event.btn-cancel',
    join: 'event.btn-join'
  };

  const eventMock: EventResponse = {
    description: 'tralalalal',
    additionalImages: [],
    creationDate: '2022-05-31',
    tags: [
      { id: 1, nameUa: 'Соціальний', nameEn: 'Social' },
      { id: 13, nameUa: 'Екологічний', nameEn: 'Environmental' },
      { id: 14, nameUa: 'Економічний', nameEn: 'Economic' }
    ],
    dates: [
      {
        coordinates: {
          latitude: 0,
          longitude: 0,
          cityEn: 'Lviv',
          cityUa: 'Львів',
          countryEn: 'Ukraine',
          countryUa: 'Україна',
          houseNumber: '55',
          regionEn: 'Lvivska oblast',
          regionUa: 'Львівська область',
          streetEn: 'Svobody Ave',
          streetUa: 'Свободи',
          formattedAddressEn: 'Свободи, 55, Львів, Львівська область, Україна',
          formattedAddressUa: 'Svobody Ave, 55, Lviv, Lvivska oblast, Ukraine'
        },
        id: null,
        event: null,
        startDate: '2022-05-31T00:00:00+03:00',
        finishDate: '2022-05-31T23:59:00+03:00',
        onlineLink: null
      }
    ],
    id: 307,
    organizer: { organizerRating: 0, id: 5, name: 'Mykola Kovalushun' },
    title: 'dddddddd',
    titleImage: 'https://-fc27f19b10e0apl',
    isSubscribed: true,
    isFavorite: false,
    isRelevant: true,
    open: true,
    likes: 5,
    countComments: 7,
    isOrganizedByFriend: false,
    eventRate: 0
  };

  const fakeItemTags: TagObj[] = [
    {
      nameEn: 'Environmental',
      nameUa: 'Екологічний',
      isActive: true
    },
    {
      nameEn: 'Social',
      nameUa: 'Соціальний',
      isActive: true
    },
    {
      nameEn: 'eco',
      nameUa: 'Соціальний',
      isActive: false
    }
  ];

  const fakeActiveTags: TagObj[] = [
    {
      nameEn: 'Environmental',
      nameUa: 'Екологічний',
      isActive: true
    },
    {
      nameEn: 'Social',
      nameUa: 'Соціальний',
      isActive: true
    }
  ];

  const routerSpy = { navigate: jasmine.createSpy('navigate') };
  const mockLang = 'ua';
  const bsModalRefMock = jasmine.createSpyObj('bsModalRef', ['hide']);
  const EventsServiceMock = jasmine.createSpyObj('EventsService', [
    'getEventById ',
    'deleteEvent',
    'getAllAttendees',
    'getFormattedAddressEventsList',
    'setBackFromPreview',
    'setForm'
  ]);
  EventsServiceMock.getEventById = () => of(eventMock);
  EventsServiceMock.getAllAttendees = () => of([]);
  EventsServiceMock.deleteEvent = () => of(true);
  EventsServiceMock.getFormattedAddressEventsList = () => of('');
  EventsServiceMock.setBackFromPreview = () => of(false);
  EventsServiceMock.setForm = () => of();

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', [
    'getCurrentLanguage',
    'setEditMode',
    'setEventForEdit',
    'userIdBehaviourSubject',
    'languageSubject',
    'setForm'
  ]);
  localStorageServiceMock.languageSubject = new Subject();
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(5);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue']);
  languageServiceMock.getLangValue = (valUa: string, valEn: string) => valUa;

  const MockData = {
    eventState: {},
    eventsList: [],
    visitedPages: [],
    totalPages: 0,
    pageNumber: 0,

    error: null
  };

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  storeMock.select = () => of(MockData);

  const translateServiceMock: TranslateService = jasmine.createSpyObj('TranslateService', ['setDefaultLang']);
  translateServiceMock.setDefaultLang = (lang: string) => of();
  translateServiceMock.get = () => of(true);
  localStorageServiceMock.getCurrentLanguage = () => mockLang as Language;

  const userOwnAuthServiceMock: UserOwnAuthService = jasmine.createSpyObj('UserOwnAuthService', ['getDataFromLocalStorage']);
  userOwnAuthServiceMock.getDataFromLocalStorage = () => true;
  userOwnAuthServiceMock.credentialDataSubject = new Subject();
  userOwnAuthServiceMock.isLoginUserSubject = new BehaviorSubject(true);

  const eventStoreServiceMock: EventStoreService = jasmine.createSpyObj('EventStoreService', ['setEventListResponse']);

  const actionsSubj: ActionsSubject = new ActionsSubject();

  beforeEach(waitForAsync(() => {
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [EventsListItemComponent, DatePipeMock, MaxTextLengthPipe],
      providers: [
        { provide: BsModalRef, useValue: bsModalRefMock },
        { provide: Store, useValue: storeMock },
        { provide: Router, useValue: routerSpy },
        { provide: EventsService, useValue: EventsServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: LanguageService, useValue: languageServiceMock },
        { provide: TranslateService, useClass: TranslationServiceStub },
        { provide: UserOwnAuthService, useValue: userOwnAuthServiceMock },
        { provide: MatSnackBarComponent, useValue: MatSnackBarMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ActionsSubject, useValue: actionsSubj },
        { provide: MatDialog, useValue: dialogSpyObj },
        { provide: EventStoreService, useValue: eventStoreServiceMock }
      ],
      imports: [
        RouterTestingModule,
        MatDialogModule,
        TranslateModule.forRoot(),
        RatingModule.forRoot(),
        ModalModule.forRoot(),
        BrowserAnimationsModule,
        NoopAnimationsModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  }));

  beforeEach(() => {
    translate = TestBed.inject(TranslateService);
    fixture = TestBed.createComponent(EventsListItemComponent);
    component = fixture.componentInstance;
    component.event = eventMock as any;
    component.btnStyle = '';
    component.nameBtn = '';
    component.isRegistered = false;
    component.isReadonly = false;
    component.isPosting = false;
    component.max = 3;
    component.userId = 5;
    component.author = 'tester';
    component.isEventFavorite = component.event.isFavorite;
    component.currentLang = 'en';

    component.deleteDialogData = {
      popupTitle: 'homepage.events.delete-title',
      popupConfirm: 'homepage.events.delete-yes',
      popupCancel: 'homepage.events.delete-no',
      style: 'red'
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return ua value by getLangValue', () => {
    const value = component.getLangValue('value', 'enValue');
    expect(value).toBe('value');
  });

  xit('should update button name after success attention for event', () => {
    const action = { id: 307, type: EventsActions.AddAttenderEcoEventsByIdSuccess };
    actionsSubj.next(action);
    expect(component.nameBtn).toEqual(btnNameMock.cancel);
  });

  describe('ngOnInit', () => {
    it('ngOnInit should be called', () => {
      const spyOnInit = spyOn(component, 'ngOnInit');
      component.ngOnInit();
      expect(spyOnInit).toHaveBeenCalled();
    });

    it('tags.length should be 3 in ngOnInit', () => {
      component.itemTags = [];
      component.ngOnInit();
      expect(component.itemTags.length).toBe(3);
    });

    it(`filterTags should be called in ngOnInit`, () => {
      spyOn(component, 'filterTags');
      component.ngOnInit();
      expect(component.filterTags).toHaveBeenCalled();
    });

    it(`should check whether getAllAttendees returns correct value`, () => {
      component.ngOnInit();
      EventsServiceMock.getAllAttendees();
      expect(component.attendees).toEqual([]);
    });

    it(`getAllAttendees should be called in ngOnInit`, () => {
      spyOn(component, 'getAllAttendees');
      component.ngOnInit();
      expect(component.getAllAttendees).toHaveBeenCalled();
    });

    it(`filterTags should be called in ngOnInit`, () => {
      spyOn(component, 'filterTags');
      component.ngOnInit();
      expect(component.filterTags).toHaveBeenCalled();
    });

    it(`should check whether active tags are filtered properly`, () => {
      component.itemTags = fakeItemTags;
      component.filterTags(component.event.tags);
      expect(component.activeTags).toEqual(fakeActiveTags);
    });

    it(`subscribeToLangChange should be called in ngOnInit`, () => {
      spyOn(component, 'subscribeToLangChange');
      component.ngOnInit();
      expect(component.subscribeToLangChange).toHaveBeenCalled();
    });

    it(`bindLang should be called in ngOnInit`, () => {
      spyOn(component, 'bindLang');
      component.ngOnInit();
      expect(component.bindLang).toHaveBeenCalled();
    });
  });

  describe('CheckButtonStatus', () => {
    it('should set btnStyle and nameBtn correctly when user is owner and event is active', () => {
      component.event = eventMock;
      component.userId = eventMock.organizer.id;
      component.event.isSubscribed = false;
      component.event.isRelevant = true;
      component.checkButtonStatus();
      expect(component.btnStyle).toEqual(component.styleBtn.secondary);
      expect(component.nameBtn).toEqual(component.btnName.edit);
    });

    it('should set btnStyle and nameBtn correctly when user is owner and event is unactive', () => {
      component.event = eventMock;
      spyOn(jwtServiceMock, 'getUserRole').and.returnValue('ROLE_UBS_EMPLOYEE');
      component.event.isRelevant = false;
      component.checkButtonStatus();
      expect(component.btnStyle).toEqual(component.styleBtn.secondary);
      expect(component.nameBtn).toEqual(component.btnName.delete);
    });

    it('should set btnStyle and nameBtn correctly when user is subscribe and event is active', () => {
      component.event = eventMock;
      component.event.isSubscribed = true;
      component.event.organizer.id = 56;
      component.event.isRelevant = true;
      component.checkButtonStatus();
      expect(component.btnStyle).toEqual(component.styleBtn.secondary);
      expect(component.nameBtn).toEqual(component.btnName.cancel);
    });

    it('should set btnStyle and nameBtn correctly when user is unsubscribed and event is active', () => {
      eventMock.isSubscribed = false;
      component.event = eventMock;
      component.event.organizer.id = 56;
      component.event.isRelevant = true;
      component.checkButtonStatus();
      expect(component.btnStyle).toEqual(component.styleBtn.primary);
      expect(component.nameBtn).toEqual(component.btnName.join);
    });

    it('should set btnStyle  correctly when user can"t joint close event', () => {
      eventMock.isSubscribed = false;
      component.event = eventMock;
      component.event.organizer.id = 56;
      component.event.isRelevant = false;
      component.checkButtonStatus();
      expect(component.btnStyle).toEqual(component.styleBtn.hiden);
    });

    it('should set btnStyle and nameBtn correctly when user is subscribed and event is unactive', () => {
      component.event = eventMock;
      eventMock.isSubscribed = true;
      component.event.organizer.id = 56;
      component.event.isRelevant = false;
      component.checkButtonStatus();
      expect(component.btnStyle).toEqual(component.styleBtn.primary);
      expect(component.nameBtn).toEqual(component.btnName.rate);
    });

    it('should set btnStyle and nameBtn correctly when user is unsubscribed,event is relevant', () => {
      eventMock.isSubscribed = false;
      component.event = eventMock;
      component.event.organizer.id = 56;
      component.event.isRelevant = true;
      jwtServiceMock.userRole$ = new BehaviorSubject('user');
      component.checkButtonStatus();
      expect(component.btnStyle).toEqual(component.styleBtn.primary);
      expect(component.nameBtn).toEqual(component.btnName.join);
    });

    it('should set btnStyle and nameBtn correctly when user is unsubscribed and event is unactive', () => {
      eventMock.isSubscribed = false;
      component.event = eventMock;
      component.event.organizer.id = 56;
      component.event.isRelevant = false;
      component.checkButtonStatus();
      expect(component.btnStyle).toEqual(component.styleBtn.hiden);
    });
  });

  describe('ButtonAction', () => {
    it('should call buttonAction if button is clicked', () => {
      const spy = spyOn(component, 'buttonAction');
      fixture.nativeElement.querySelector('.event-button').dispatchEvent(new Event('click'));
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    });

    it('should call EventsServiceMock setForm method', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      dialogSpy.open.and.returnValue(dialogRefSpy);

      const spy = spyOn(EventsServiceMock, 'setForm');
      component.buttonAction(component.btnName.cancel);
      expect(spy).toHaveBeenCalledWith(null);
    });

    it('should open a popup when cancel button is clicked', () => {
      spyOn(component, 'openPopUp');
      component.buttonAction(component.btnName.cancel);
      expect(component.openPopUp).toHaveBeenCalled();
    });

    it('should call submitEventCancelling if result is true after dialog closed', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      dialogSpy.open.and.returnValue(dialogRefSpy);

      spyOn(component, 'submitEventCancelling');

      component.openPopUp();
      dialogRefSpy.afterClosed().subscribe(() => {
        expect(component.submitEventCancelling).toHaveBeenCalled();
      });
    });

    it('should dispatch AddAttenderEcoEventsByIdAction when join button is clicked', () => {
      component.buttonAction(component.btnName.join);
      expect(storeMock.dispatch).toHaveBeenCalledWith(AddAttenderEcoEventsByIdAction({ id: component.event.id }));
    });

    it('should call openModal method when rate button is clicked', () => {
      spyOn(component, 'openModal');
      component.buttonAction(component.btnName.rate);
      expect(component.openModal).toHaveBeenCalled();
    });

    it('should call deleteEvent method when delete button is clicked', () => {
      spyOn(component, 'deleteEvent');
      component.buttonAction(component.btnName.delete);
      expect(component.deleteEvent).toHaveBeenCalled();
    });

    it('should set edit mode and navigate to create event page when edit button is clicked', () => {
      component.event.id = 1;
      component.buttonAction(component.btnName.edit);
      expect(localStorageServiceMock.setEditMode).toHaveBeenCalledWith('canUserEdit', true);
      expect(eventStoreServiceMock.setEventListResponse).toHaveBeenCalledWith(component.event);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/events', 'update-event', 1]);
    });

    it('should call openAuthModalWindow', () => {
      component.isRegistered = false;
      (component as any).dialogRef = { afterClosed: () => of(true) };
      spyOn(component, 'openAuthModalWindow');
      component.buttonAction(component.btnName.join);
      expect(component.openAuthModalWindow).toHaveBeenCalledWith('sign-in');
    });
  });

  describe('Routing', () => {
    it(`should be clicked and called routeToEvent method`, fakeAsync(() => {
      spyOn(component, 'routeToEvent');
      const button = fixture.debugElement.nativeElement.querySelector('button:nth-child(1)');
      button.click();
      tick();
      expect(component.routeToEvent).toHaveBeenCalled();
    }));

    it(`should navigate to events`, () => {
      component.isOwner = false;
      component.isActive = false;
      component.routeToEvent();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/events', component.event.id]);
    });
  });

  it('should subscribe to language changes and update properties', () => {
    spyOn(component, 'bindLang');
    const langSubject = new Subject<string>();
    const languageBehaviourSubject = new BehaviorSubject<string>('en');
    component.subscribeToLangChange();
    expect(component.langChangeSub).toBeDefined();
    expect(component.langChangeSub.closed).toBeFalsy();
    languageBehaviourSubject.next('ua');
    expect(component.currentLang).toEqual('ua');
    expect(component.datePipe).toBeDefined();
    expect(component.newDate).toBeDefined();
  });

  describe('Filtering tags', () => {
    it('filterTags tags[1] should be active', () => {
      (component as any).filterTags([{ nameEn: 'Social', nameUa: 'Соціальний', id: 1 }]);
      expect(component.itemTags[1].isActive).toBeTruthy();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe all subscriptions during ngOnDestroy', () => {
      component.ngOnDestroy();
      const subscriptionProperties = ['langChangeSub', 'subsOnAttendEvent', 'subsOnUnAttendEvent'];
      for (const property of subscriptionProperties) {
        if (component[property] instanceof Subscription) {
          expect(component[property].closed).toBe(true);
        }
      }
    });
  });

  it('openAuthModalWindow should be called when add to favorite clicked and not raited', () => {
    component.isRegistered = false;
    spyOn(component, 'openAuthModalWindow');
    if (!component.isRegistered) {
      component.openAuthModalWindow('sign-in');
    }
    expect(component.openAuthModalWindow).toHaveBeenCalled();
  });

  describe('changeFavouriteStatus()', () => {
    it(`should be clicked and called changeFavouriteStatus method`, fakeAsync(() => {
      spyOn(component, 'changeFavouriteStatus');
      component.event.isRelevant = true;
      fixture.detectChanges();
      const button = fixture.debugElement.nativeElement.querySelector('.favourite-button');
      button.click();
      tick();
      expect(component.changeFavouriteStatus).toHaveBeenCalled();
    }));
  });
});
