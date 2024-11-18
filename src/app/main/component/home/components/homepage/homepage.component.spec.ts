import { Language } from 'src/app/main/i18n/Language';
import { LayoutModule } from '../../../layout/layout.module';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StatRowComponent } from '../stat-row/stat-row.component';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserOwnAuthService } from '@global-service/auth/user-own-auth.service';
import { HomepageComponent } from './homepage.component';
import { EcoEventsComponent, StatRowsComponent, SubscribeComponent } from '..';
import { EcoEventsItemComponent } from '../eco-events/eco-events-item/eco-events-item.component';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { VerifyEmailService } from '@auth-service/verify-email/verify-email.service';
import { UserService } from '@global-service/user/user.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from 'src/app/main/component/auth/auth.module';
import { EcoNewsModule } from 'src/app/main/component/eco-news/eco-news.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { APP_BASE_HREF } from '@angular/common';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true)
    };
  }
}

describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;
  const snackBarMock: MatSnackBarComponent = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);
  snackBarMock.openSnackBar = () => true;

  const verifyEmailServiceMock: VerifyEmailService = jasmine.createSpyObj('VerifyEmailService', ['onCheckToken']);
  verifyEmailServiceMock.onCheckToken = () => of(true);

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', ['userIdBehaviorSubject', 'getUserId']);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  localStorageServiceMock.getCurrentLanguage = () => 'ua' as Language;

  const userServiceMock: UserService = jasmine.createSpyObj('UserService', ['countActivatedUsers']);
  userServiceMock.countActivatedUsers = () => of(1111);
  userServiceMock.getTodayStatisticsForAllHabitItems = () => of([]);
  const activatedRouteMock = {
    queryParams: of({
      token: '1',
      user_id: '1'
    })
  };
  const routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        FormsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        BrowserAnimationsModule,
        AuthModule,
        EcoNewsModule,
        InfiniteScrollModule,
        LayoutModule,
        NoopAnimationsModule
      ],
      declarations: [
        StatRowsComponent,
        HomepageComponent,
        EcoEventsComponent,
        SubscribeComponent,
        StatRowComponent,
        EcoEventsItemComponent
      ],
      providers: [
        { provide: MatSnackBarComponent, useValue: snackBarMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: VerifyEmailService, useValue: verifyEmailServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: APP_BASE_HREF, useValue: '/' },
        UserOwnAuthService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    spyOn(component, 'ngOnDestroy').and.callFake(() => {});
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should be called', () => {
    const spyOnInit = spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(spyOnInit).toHaveBeenCalled();
  });

  it('openAuthModalWindow should be called', () => {
    const spyOpenAuthModalWindow = spyOn(MatDialogMock.prototype, 'open');
    MatDialogMock.prototype.open();
    expect(spyOpenAuthModalWindow).toHaveBeenCalled();
  });
});
