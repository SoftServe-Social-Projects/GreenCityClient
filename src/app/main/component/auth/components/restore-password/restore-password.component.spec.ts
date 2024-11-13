import { UserSuccessSignIn } from 'src/app/main/model/user-success-sign-in';
import { RestorePasswordComponent } from './restore-password.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { RestorePasswordService } from '@auth-service/restore-password.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GoogleSignInService } from '@auth-service/google-sign-in.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarComponent } from 'src/app/main/component/errors/mat-snack-bar/mat-snack-bar.component';
import { UserOwnSignInService } from '@global-service/auth/user-own-sign-in.service';

describe('RestorePasswordComponent', () => {
  let component: RestorePasswordComponent;
  let fixture: ComponentFixture<RestorePasswordComponent>;
  let router: Router;
  let dialog: MatDialog;

  const MatSnackBarMock: MatSnackBarComponent = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);
  MatSnackBarMock.openSnackBar = (type: string) => {};

  const userSuccessSignIn = new UserSuccessSignIn();
  userSuccessSignIn.userId = '13';
  userSuccessSignIn.name = 'Name';
  userSuccessSignIn.accessToken = '13';
  userSuccessSignIn.refreshToken = '13';

  const matDialogMock: MatDialogRef<RestorePasswordComponent> = jasmine.createSpyObj('MatDialogRef', ['close']);
  matDialogMock.close = () => 'Close the window please';

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', ['userIdBehaviourSubject']);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  localStorageServiceMock.setFirstName = () => true;
  localStorageServiceMock.setFirstSignIn = () => true;

  const googleServiceMock: GoogleSignInService = jasmine.createSpyObj('GoogleSignInService', ['signIn']);
  googleServiceMock.signIn = () => of(userSuccessSignIn);

  const userOwnSignInServiceMock = jasmine.createSpyObj('userOwnSignInService', ['saveUserToLocalStorage']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RestorePasswordComponent],
      imports: [
        MatDialogModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        BrowserAnimationsModule,
        MatSnackBarModule
      ],
      providers: [
        MatDialog,
        { provide: MatDialogRef, useValue: matDialogMock },
        { provide: MatSnackBarComponent, useValue: MatSnackBarMock },
        { provide: UserOwnSignInService, useValue: userOwnSignInServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestorePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = fixture.debugElement.injector.get(Router);
    dialog = TestBed.inject(MatDialog);
  });

  describe('Basic tests', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(RestorePasswordComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      spyOn(component.pageName, 'emit');
    });

    it('should create RestorePasswordComponent', () => {
      expect(component).toBeTruthy();
    });

    it('should call onBackToSignIn', () => {
      spyOn(component.dialog, 'open');
      component.onBackToSignIn(1);
      expect(component.dialog).toBeDefined();
    });

    it('Should open sign in modal window', () => {
      spyOn(component, 'onBackToSignIn');

      const nativeElement = fixture.nativeElement;
      const button = nativeElement.querySelector('a');
      button.dispatchEvent(new Event('click'));

      fixture.detectChanges();

      expect(component.onBackToSignIn).toHaveBeenCalledWith('sign-in');
    });

    it('should call onCloseRestoreWindow ', () => {
      const spy = spyOn(matDialogMock, 'close');
      component.onCloseRestoreWindow();
      expect(spy).toHaveBeenCalled();
    });

    it('Should get userId', () => {
      expect(localStorageServiceMock.userIdBehaviourSubject.value).toBe(1111);
    });
  });

  describe('Restore password functionality testing', () => {
    let restorePasswordService: RestorePasswordService;
    let mockFormData;
    beforeEach(() => {
      restorePasswordService = fixture.debugElement.injector.get(RestorePasswordService);
      mockFormData = {
        email: 'test@mail.com'
      };
    });

    it('Test sendEmailForRestore method', () => {
      const spy = (restorePasswordService.sendEmailForRestore = jasmine.createSpy('sendEmail').and.returnValue(of(mockFormData)));
      restorePasswordService.sendEmailForRestore(mockFormData);
      expect(spy).toHaveBeenCalled();
    });

    it('sentEmail should call sendEmailForRestore', () => {
      const spy = (restorePasswordService.sendEmailForRestore = jasmine.createSpy('sendEmail').and.returnValue(of(mockFormData)));
      component.sentEmail();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Testing controls for the restorePasswordForm', () => {
    const validEmails = ['test@mail.com', 'mail@mail.ua', 'hello@post.com', 'write2me@mail.com'];
    const invalidEmails = ['notemail', '12345678987654321', 'wooooooow@', '100%mail'];

    function controlsValidator(itemValue, controlName, status) {
      it(`The formControl: ${controlName} should be marked as ${status} if the value is ${itemValue}.`, () => {
        const control = component.restorePasswordForm.get(controlName);
        control.setValue(itemValue);
        status === 'valid' ? expect(control.valid).toBeTruthy() : expect(control.valid).toBeFalsy();
      });
    }

    validEmails.forEach((el) => controlsValidator(el, 'email', 'valid'));
    invalidEmails.forEach((el) => controlsValidator(el, 'email', 'invalid'));

    it('form should be invalid when empty', () => {
      expect(component.restorePasswordForm.valid).toBeFalsy();
    });
  });

  describe('Error functionality testing', () => {
    it('Should reset error messages', () => {
      component.emailErrorMessageBackEnd = 'I am error message';
      component.passwordErrorMessageBackEnd = 'I am error message';
      component.backEndError = 'I am error message';

      component.configDefaultErrorMessage();

      expect(component.backEndError).toBeNull();
      expect(component.passwordErrorMessageBackEnd).toBeNull();
      expect(component.emailErrorMessageBackEnd).toBeNull();
    });
  });
});
