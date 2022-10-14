import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangePasswordService } from '@global-service/auth/change-password.service';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UbsProfileChangePasswordPopUpComponent } from './ubs-profile-change-password-pop-up.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UpdatePasswordDto } from '@global-models/updatePasswordDto';
import { of } from 'rxjs';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';

describe('UbsProfileChangePasswordPopUpComponent', () => {
  let component: UbsProfileChangePasswordPopUpComponent;
  let fixture: ComponentFixture<UbsProfileChangePasswordPopUpComponent>;
  const password = 'password';
  const currentPassword = 'currentPassword';
  const confirmPassword = 'confirmPassword';

  const changePasswordServiceFake = jasmine.createSpyObj('ChangePasswordService', ['changePassword']);
  changePasswordServiceFake.changePassword.and.returnValue(of({}));
  const MatSnackBarMock = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UbsProfileChangePasswordPopUpComponent],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ChangePasswordService, useValue: changePasswordServiceFake },
        { provide: MatSnackBarComponent, useValue: MatSnackBarMock },
        FormBuilder
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsProfileChangePasswordPopUpComponent);
    component = fixture.componentInstance;
    component.data.hasPassword = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form invalid when empty', () => {
    expect(component.formConfig.valid).toBeFalsy();
  });
  it('ngOnint calls initForm()', () => {
    const spyInitForm = spyOn(component, 'initForm');
    component.ngOnInit();
    expect(spyInitForm).toHaveBeenCalled();
  });

  it('initForm should create', () => {
    component.hasPassword = true;
    const initFormFake = {
      password: '',
      currentPassword: '',
      confirmPassword: ''
    };

    component.initForm();
    expect(component.formConfig.value).toEqual(initFormFake);
  });

  it('checkPasswordPattern()', () => {
    const formControlMock = { value: 'Welcome@123' } as unknown as FormControl;
    expect(component.checkPasswordPattern(formControlMock)).toEqual(null);
  });

  it('submitting a form', () => {
    expect(component.formConfig.valid).toBeFalsy();
    component.formConfig.controls[password].setValue('Test!2334');
    component.formConfig.controls[currentPassword].setValue('Test!2334dfff');
    component.formConfig.controls[confirmPassword].setValue('Test!2334');
    expect(component.formConfig.valid).toBeTruthy();

    const updatePasswordDto: UpdatePasswordDto = component.formConfig.value;

    component.onSubmit();
    expect(updatePasswordDto.password).toBe('Test!2334');
    expect(updatePasswordDto.currentPassword).toBe('Test!2334dfff');
    expect(updatePasswordDto.confirmPassword).toBe('Test!2334');
  });

  it('currentPassword should be empty if user authorized by a google account ', () => {
    const updatePasswordDto: UpdatePasswordDto = component.formConfig.value;
    component.hasPassword = false;
    component.onSubmit();
    expect(updatePasswordDto.currentPassword).toBeFalsy();
  });
});
