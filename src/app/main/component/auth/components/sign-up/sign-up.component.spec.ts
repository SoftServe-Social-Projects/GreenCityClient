import { Language } from 'src/app/main/i18n/Language';
import { UserOwnSignUp } from '@global-models/user-own-sign-up';
import { UserSuccessSignIn } from '@global-models/user-success-sign-in';
import { ComponentFixture, TestBed, fakeAsync, flush, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { UserOwnSignUpService } from '@auth-service/user-own-sign-up.service';
import { SubmitEmailComponent } from '@global-auth/submit-email/submit-email.component';
import { SignUpComponent } from './sign-up.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';

class UserOwnSignUpServiceMock {
  mockFormData = {
    email: 'test@gmail.com',
    firstName: 'JohnSmith',
    password: '123456qW@'
  };

  signUp() {
    return of(this.mockFormData);
  }
}

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let router: Router;
  const localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', ['getCurrentLanguage']);
  localStorageServiceMock.getCurrentLanguage = () => 'ua' as Language;
  localStorageServiceMock.setFirstName = () => true;
  localStorageServiceMock.setFirstSignIn = () => true;
  localStorageServiceMock.getUserId = () => 1;
  localStorageServiceMock.setAccessToken = () => true;
  localStorageServiceMock.setRefreshToken = () => true;
  localStorageServiceMock.setUserId = () => true;

  class MatDialogRefMock {
    close() {}
  }

  const mockFormData = {
    email: 'test@gmail.com',
    firstName: 'JohnSmith',
    password: '123456qW@'
  };

  const MatSnackBarMock: MatSnackBarComponent = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);
  MatSnackBarMock.openSnackBar = (type: string) => {};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SignUpComponent, SubmitEmailComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MatSnackBarComponent, useValue: MatSnackBarMock },
        { provide: UserOwnSignUpService, useClass: UserOwnSignUpServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = fixture.debugElement.injector.get(Router);
    spyOn(router.url, 'includes').and.returnValue(false);
    spyOn(router, 'navigate');
  });

  describe('Basic tests', () => {
    it('should create SignUpComponent', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Password hiding testing:', () => {
    let debug: DebugElement;
    let hiddenEyeImg: HTMLImageElement;
    let hiddenEyeInput: HTMLInputElement;
    let hiddenEyeDeImg;
    let hiddenEyeDeInput;

    beforeEach(() => {
      debug = fixture.debugElement;
      hiddenEyeDeImg = debug.query(By.css('.show-password-img'));
      hiddenEyeDeInput = debug.query(By.css('.password-input'));
      hiddenEyeImg = hiddenEyeDeImg.nativeElement;
      hiddenEyeInput = hiddenEyeDeInput.nativeElement;
    });

    it('should display hiddenEye img', () => {
      fixture.detectChanges();
      expect(hiddenEyeImg.src).toContain(component.signUpImages.hiddenEye);
    });

    it('should call setPasswordVisibility method', () => {
      spyOn(component, 'setPasswordVisibility');
      hiddenEyeImg.click();
      expect(component.setPasswordVisibility).toHaveBeenCalled();
    });

    it('should change img after calling setPasswordVisibility method', () => {
      hiddenEyeImg.click();
      expect(hiddenEyeImg.src).toContain(component.signUpImages.openEye);

      hiddenEyeImg.click();
      expect(hiddenEyeImg.src).toContain(component.signUpImages.hiddenEye);
    });

    it('should change type of input after calling setPasswordVisibility method', () => {
      hiddenEyeImg.click();
      expect(hiddenEyeInput.type).toEqual('text');

      hiddenEyeImg.click();
      expect(hiddenEyeInput.type).toEqual('password');
    });
  });

  describe('Testing controls for the signUpForm:', () => {
    const controlsName = ['email', 'firstName', 'password', 'repeatPassword'];
    const invalidName = ['.John', 'Nick&', 'Mi$ke', '@Andrian'];
    const validName = ['JohnSmith', 'Nick12', 'Angela', 'Andrian'];
    const invalidPassword = ['12345aS', '12345aaS', '123456S@', '123456a@'];
    const validPassword = ['12345aS@', 'Aqwert1%', 'Pi$98765', '!1234567kT'];

    function testWrapper(itemValue) {
      it(`should create form with formControl: ${itemValue};`, () => {
        expect(component.signUpForm.contains(itemValue)).toBeTruthy();
      });
    }

    controlsName.forEach((el) => testWrapper(el));

    it('form should be invalid when empty', () => {
      expect(component.signUpForm.valid).toBeFalsy();
    });

    function controlsValidator(itemValue, controlName, status) {
      it(`The formControl: ${controlName} should be marked as ${status} if the value is ${itemValue}.`, () => {
        const control = component.signUpForm.get(controlName);
        control.setValue(itemValue);
        status === 'valid' ? expect(control.valid).toBeTruthy() : expect(control.valid).toBeFalsy();
      });
    }

    invalidName.forEach((el) => controlsValidator(el, 'firstName', 'invalid'));

    validName.forEach((el) => controlsValidator(el, 'firstName', 'valid'));

    invalidPassword.forEach((el) => controlsValidator(el, 'password', 'invalid'));

    validPassword.forEach((el) => controlsValidator(el, 'password', 'valid'));

    it('should trim value', () => {
      const emailControl = component.signUpForm.get('email');
      emailControl.setValue('    1qQ@');
      component.trimValue(emailControl);
      expect(emailControl.value).toBe('1qQ@');
    });

    it('form should be invalid passwords not matching', () => {
      const passwordControl = component.signUpForm.get('password');
      passwordControl.setValue('123456qQ@');
      const repeatPasswordControl = component.signUpForm.get('repeatPassword');
      repeatPasswordControl.setValue('23456qQ@1');
      expect(component.signUpForm.valid).toBeFalsy();
    });
  });

  describe('Check ErrorMessageBackEnd', () => {
    it('should reset emailErrorMessageBackEnd', () => {
      component.setEmailBackendErr();
      expect(component.emailErrorMessageBackEnd).toBeNull();
    });
  });
});
