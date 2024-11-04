import { SignInIcons } from './../../../../image-pathes/sign-in-icons';
import { RestoreDto } from './../../../../model/restroreDto';
import { authImages, ubsAuthImages } from './../../../../image-pathes/auth-images';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ChangePasswordService } from '@auth-service/change-password.service';
import { ConfirmPasswordValidator, ValidatorRegExp } from '../sign-up/sign-up.validator';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-restore-password',
  templateUrl: './confirm-restore-password.component.html',
  styleUrls: ['./confirm-restore-password.component.scss']
})
export class ConfirmRestorePasswordComponent implements OnInit {
  confirmRestorePasswordForm: FormGroup;
  passwordField: AbstractControl;
  confirmPasswordField: AbstractControl;
  closeBtn = SignInIcons;
  authImages = authImages;
  emailErrorMessageBackEnd: string;
  passwordErrorMessageBackEnd: string;
  loadingAnim: boolean;
  passwordFieldValue: string;
  passwordConfirmFieldValue: string;
  form: any;
  token: string;
  restoreDto: RestoreDto;
  isUbs: boolean;
  isSignInPage: boolean;

  get password(): FormControl {
    return this.confirmRestorePasswordForm.get('password') as FormControl;
  }

  get confirmPassword(): FormControl {
    return this.confirmRestorePasswordForm.get('confirmPassword') as FormControl;
  }

  constructor(
    private router: Router,
    private changePasswordService: ChangePasswordService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBarComponent
  ) {}

  ngOnInit() {
    this.restoreDto = new RestoreDto();
    this.initFormReactive();
    this.getFormFields();
    this.setPasswordBackendErr();
    this.getToken();
    this.authImages = this.isUbs ? ubsAuthImages : authImages;
  }

  initFormReactive(): void {
    this.confirmRestorePasswordForm = this.formBuilder.group(
      {
        password: new FormControl('', []),
        confirmPassword: new FormControl('', [])
      },
      {
        validator: [ConfirmPasswordValidator('password', 'confirmPassword'), ValidatorRegExp('password')]
      }
    );
  }

  getFormFields(): void {
    this.passwordField = this.confirmRestorePasswordForm.get('password');
    this.confirmPasswordField = this.confirmRestorePasswordForm.get('confirmPassword');
  }

  private getToken(): void {
    this.isUbs = this.router.url.includes('/ubs/');
    this.activatedRoute.queryParams.pipe(take(1)).subscribe((params) => {
      this.token = params[`token`];
    });
  }

  sendPasswords() {
    this.restoreDto.confirmPassword = this.confirmRestorePasswordForm.value.confirmPassword;
    this.restoreDto.password = this.confirmRestorePasswordForm.value.password;
    this.restoreDto.token = this.token;
    this.restoreDto.isUbs = this.isUbs;
    this.changePasswordService.restorePassword(this.restoreDto).subscribe({
      next: (data) => {
        this.form = data;
        this.router.navigate(this.isUbs ? ['ubs'] : ['']);
        this.snackBar.openSnackBar(this.isUbs ? 'successConfirmPasswordUbs' : 'successConfirmPassword');
      },
      error: (error) => {
        this.form = error;
        this.snackBar.openSnackBar('sendNewLetter');
      }
    });
  }

  setPasswordBackendErr(): void {
    this.passwordErrorMessageBackEnd = null;
    if (this.confirmRestorePasswordForm) {
      this.passwordFieldValue = this.passwordField.value;
      this.passwordConfirmFieldValue = this.confirmPasswordField.value;
      this.isSignInPage = true;
    }
  }

  setPasswordVisibility(htmlInput: HTMLInputElement, htmlImage: HTMLImageElement): void {
    htmlInput.type = htmlInput.type === 'password' ? 'text' : 'password';
    htmlImage.src = htmlInput.type === 'password' ? this.authImages.hiddenEye : this.authImages.openEye;
  }

  closeModal(): void {
    this.router.navigate(this.isUbs ? ['ubs'] : ['']);
    this.snackBar.openSnackBar('exitConfirmRestorePassword');
  }
}
