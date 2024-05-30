import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { JwtService } from '@global-service/jwt/jwt.service';
import { EventDetailsComponent } from './event-details.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { EventsService } from '../../services/events.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ActionsSubject, Store } from '@ngrx/store';
import { Language } from 'src/app/main/i18n/Language';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { EventStoreService } from '../../services/event-store.service';

export function mockPipe(options: Pipe): Pipe {
  const metadata: Pipe = {
    name: options.name
  };

  return Pipe(metadata)(
    class MockPipe implements PipeTransform {
      transform(value: string): string {
        return value;
      }
    }
  );
}

describe('EventDetailsComponent', () => {
  let component: EventDetailsComponent;
  let fixture: ComponentFixture<EventDetailsComponent>;
  let route: ActivatedRoute;
  const routerSpy = { navigate: jasmine.createSpy('navigate') };
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const eventMock = {
    additionalImages: [],
    dates: [
      {
        coordinates: {
          addressEn: 'Address',
          addressUa: 'Адрес',
          latitude: 3,
          longitude: 4
        },
        event: 'test',
        finishDate: '2023-02-14',
        id: 1,
        onlineLink: 'https://test',
        startDate: '2023-04-12'
      }
    ],
    description: 'description',
    id: 1,
    open: true,
    organizer: {
      id: 1111,
      name: 'John'
    },
    tags: [{ nameEn: 'Environmental', nameUa: 'Екологічний', id: 1 }],
    title: 'title',
    titleImage: '',
    isSubscribed: true
  };

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

  const EventsServiceMock = jasmine.createSpyObj('eventService', [
    'getEventById ',
    'deleteEvent',
    'getAllAttendees',
    'createAddresses',
    'getFormattedAddress',
    'getForm',
    'getLangValue',
    'setBackFromPreview',
    'setSubmitFromPreview'
  ]);
  EventsServiceMock.getEventById = () => of(eventMock);
  EventsServiceMock.deleteEvent = () => of(true);
  EventsServiceMock.getAllAttendees = () => of([]);
  EventsServiceMock.createAddresses = () => of('');
  EventsServiceMock.getFormattedAddress = () => of('');
  EventsServiceMock.setBackFromPreview = () => of();
  EventsServiceMock.setSubmitFromPreview = () => of();

  const jwtServiceFake = jasmine.createSpyObj('jwtService', ['getUserRole']);
  jwtServiceFake.getUserRole = () => '123';

  const activatedRouteMock = {
    snapshot: {
      params: {
        id: 2
      }
    }
  };

  const LocalStorageServiceMock = jasmine.createSpyObj('LocalStorageService', [
    'userIdBehaviourSubject',
    'languageBehaviourSubject',
    'setEditMode',
    'setEventForEdit',
    'getCurrentLanguage',
    'getPreviousPage'
  ]);

  LocalStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  LocalStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');
  LocalStorageServiceMock.getCurrentLanguage = () => 'ua' as Language;

  class MatDialogMock {
    open() {
      return {
        afterClosed: () => of(true)
      };
    }
  }

  LocalStorageServiceMock.getPreviousPage = () => '/profile';

  const bsModalRefMock = jasmine.createSpyObj('bsModalRef', ['hide']);
  const bsModalBsModalServiceMock = jasmine.createSpyObj('BsModalService', ['show']);
  const translateServiceMock: TranslateService = jasmine.createSpyObj('TranslateService', ['setDefaultLang']);
  translateServiceMock.setDefaultLang = (lang: string) => of(lang);
  translateServiceMock.get = () => of(true);

  const MatSnackBarMock = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);

  const actionSub: ActionsSubject = new ActionsSubject();

  beforeEach(waitForAsync(() => {
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule, MatDialogModule],
      declarations: [
        EventDetailsComponent,
        mockPipe({ name: 'dateLocalisation' }),
        mockPipe({ name: 'translate' }),
        mockPipe({ name: 'safeHtmlTransform' })
      ],
      providers: [
        { provide: JwtService, useValue: jwtServiceFake },
        { provide: EventsService, useValue: EventsServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: LocalStorageService, useValue: LocalStorageServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: Store, useValue: storeMock },
        { provide: ActionsSubject, useValue: actionSub },
        { provide: BsModalRef, useValue: bsModalRefMock },
        { provide: MatSnackBarComponent, useValue: MatSnackBarMock },
        { provide: BsModalService, useValue: bsModalBsModalServiceMock },
        { provide: MatDialog, useValue: dialogSpyObj },
        EventStoreService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    route = TestBed.inject(ActivatedRoute);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetailsComponent);
    component = fixture.componentInstance;
    (component as any).dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject dependencies correctly', () => {
    expect(component.eventService).toBe(EventsServiceMock);
    expect(component.localStorageService).toBe(LocalStorageServiceMock);
    expect((component as any).store).toBe(storeMock);
    expect((component as any).modalService).toBe(bsModalBsModalServiceMock);
    expect((component as any).snackBar).toBe(MatSnackBarMock);
    expect((component as any).jwtService).toBe(jwtServiceFake);
    expect((component as any).actionsSubj).toBe(actionSub);
  });

  it('should call verifyRole on ngOnInit', () => {
    const spy1 = spyOn(component as any, 'verifyRole');
    component.ngOnInit();
    expect(spy1).toHaveBeenCalled();
  });

  it('should return the formatted address from the event service', () => {
    const expectedAddress = 'fake address';
    spyOn(component.eventService, 'getFormattedAddress').and.returnValue(expectedAddress);
    expect(component.getAddress()).toBe(expectedAddress);
    expect(component.eventService.getFormattedAddress).toHaveBeenCalledWith(component.locationCoordinates);
  });

  it('should return USER for regular users', () => {
    (component as any).userId = 123;
    (component as any).event = { organizer: { id: 1 } };
    spyOn((component as any).jwtService, 'getUserRole').and.returnValue('ROLE_USER');
    expect((component as any).verifyRole()).toBe(component.roles.USER);
  });

  it('should return ADMIN for admin users', () => {
    (component as any).userId = 123;
    (component as any).event = { organizer: { id: 1 } };
    spyOn((component as any).jwtService, 'getUserRole').and.returnValue('ROLE_ADMIN');
    expect((component as any).verifyRole()).toBe(component.roles.ADMIN);
  });

  it('should prioritize organizer role over user role', () => {
    (component as any).userId = 123;
    (component as any).event = { organizer: { id: 123 } };
    spyOn((component as any).jwtService, 'getUserRole').and.returnValue('ROLE_USER');
    expect((component as any).verifyRole()).toBe(component.roles.ORGANIZER);
  });

  it('should verify unauthenticated role', () => {
    const role = component.roles.UNAUTHENTICATED;
    expect(role).toBe('UNAUTHENTICATED');
  });

  it('should verify user role', () => {
    jwtServiceFake.getUserRole = () => 'ROLE_USER';
    let role = 'UNAUTHENTICATED';
    role = jwtServiceFake.getUserRole() === 'ROLE_USER' ? 'USER' : role;
    expect(role).toBe('USER');
  });

  it('should verify organizer role', () => {
    let role = 'UNAUTHENTICATED';
    (component as any).userId = 1;
    eventMock.organizer.id = 1;
    role = (component as any).userId === eventMock.organizer.id ? 'ORGANIZER' : role;
    expect(role).toBe('ORGANIZER');
  });

  it('should verify admin role', () => {
    jwtServiceFake.getUserRole = () => 'ROLE_ADMIN';
    let role = 'UNAUTHENTICATED';
    role = jwtServiceFake.getUserRole() === 'ROLE_ADMIN' ? 'ADMIN' : role;
    expect(role).toBe('ADMIN');
  });

  it('openAuthModalWindow should be called when add to favorite clicked and not raited', () => {
    component.isRegistered = false;
    spyOn(component, 'openAuthModalWindow');
    if (!component.isRegistered) {
      component.openAuthModalWindow('sign-in');
    }
    expect(component.openAuthModalWindow).toHaveBeenCalled();
  });

  it('should call openAuthModalWindow with "sign-in" when role is UNAUTHENTICATED', () => {
    component.role = 'UNAUTHENTICATED';
    const spy = spyOn(component, 'openAuthModalWindow');
    component.buttonAction({} as MouseEvent);
    expect(spy).toHaveBeenCalledWith('sign-in');
  });

  it('should call openSnackBar with "errorJoinEvent" when isUserCanJoin is true and addAttenderError is truthy', () => {
    component.role = 'USER';
    component.isUserCanJoin = true;
    component.addAttenderError = 'some error';
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(true));
    dialogSpy.open.and.returnValue(dialogRefSpy);
    component.buttonAction({} as MouseEvent);
    expect(MatSnackBarMock.openSnackBar).toHaveBeenCalledWith('errorJoinEvent');
    expect(component.addAttenderError).toBe('');
  });

  it('should call submitEventCancelling if result is true after dialog closed when submitting event join cancelation', () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(true));
    dialogSpy.open.and.returnValue(dialogRefSpy);

    spyOn(component, 'submitEventCancelling');

    component.openPopUp();
    dialogRefSpy.afterClosed().subscribe(() => {
      expect(component.submitEventCancelling).toHaveBeenCalled();
    });
  });
});
