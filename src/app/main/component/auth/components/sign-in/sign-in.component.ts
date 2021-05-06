import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AuthService, GoogleLoginProvider } from 'angularx-social-login';
import { Subject } from 'rxjs';
import { GoogleSignInService } from '@auth-service/google-sign-in.service';
import { JwtService } from '@global-service/jwt/jwt.service';
import { UserSuccessSignIn } from '@global-models/user-success-sign-in';
import { UserOwnSignInService } from '@auth-service/user-own-sign-in.service';
import { SignInIcons } from 'src/app/main/image-pathes/sign-in-icons';
import { UserOwnSignIn } from '@global-models/user-own-sign-in';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { UserOwnAuthService } from '@global-service/auth/user-own-auth.service';
import { takeUntil, take } from 'rxjs/operators';
import { ProfileService } from '../../../user/components/profile/profile-service/profile.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit, OnDestroy {
  public closeBtn = SignInIcons;
  public mainSignInImage = SignInIcons;
  public googleImage = SignInIcons;
  public hideShowPasswordImage = SignInIcons;
  public userOwnSignIn: UserOwnSignIn;
  public loadingAnim: boolean;
  public emailErrorMessageBackEnd: string;
  public passwordErrorMessageBackEnd: string;
  public backEndError: string;
  public signInForm: FormGroup;
  public emailField: AbstractControl;
  public passwordField: AbstractControl;
  public emailFieldValue: string;
  public passwordFieldValue: string;
  private destroy: Subject<boolean> = new Subject<boolean>();
  @Output() private pageName = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    private matDialogRef: MatDialogRef<SignInComponent>,
    private userOwnSignInService: UserOwnSignInService,
    private jwtService: JwtService,
    private router: Router,
    private authService: AuthService,
    private googleService: GoogleSignInService,
    private localStorageService: LocalStorageService,
    private userOwnAuthService: UserOwnAuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.userOwnSignIn = new UserOwnSignIn();
    this.configDefaultErrorMessage();
    this.checkIfUserId();
    // Initialization of reactive form
    this.signInForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
    });
    // Get form fields to use it in the template
    this.emailField = this.signInForm.get('email');
    this.passwordField = this.signInForm.get('password');
  }

  public configDefaultErrorMessage(): void {
    this.emailErrorMessageBackEnd = null;
    this.passwordErrorMessageBackEnd = null;
    this.backEndError = null;
    if (this.signInForm) {
      this.emailFieldValue = this.emailField.value;
      this.passwordFieldValue = this.passwordField.value;
    }
  }

  public signIn(): void {
    this.loadingAnim = true;

    const { email, password } = this.signInForm.value;

    this.userOwnSignIn.email = email;
    this.userOwnSignIn.password = password;

    this.userOwnSignInService
      .signIn(this.userOwnSignIn)
      .pipe(takeUntil(this.destroy))
      .subscribe(
        (data: UserSuccessSignIn) => {
          this.onSignInSuccess(data);
        },
        (errors: HttpErrorResponse) => {
          this.onSignInFailure(errors);
          this.loadingAnim = false;
        }
      );
  }

  public signInWithGoogle(): void {
    this.authService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((data) => {
        this.googleService
          .signIn(data.idToken)
          .pipe(takeUntil(this.destroy))
          .subscribe((signInData: UserSuccessSignIn) => {
            this.onSignInWithGoogleSuccess(signInData);
          });
      })
      .catch((errors: HttpErrorResponse) => this.onSignInFailure(errors));
  }

  public onOpenModalWindow(windowPath: string): void {
    this.pageName.emit(windowPath);
  }

  public onSignInWithGoogleSuccess(data: UserSuccessSignIn): void {
    this.userOwnSignInService.saveUserToLocalStorage(data);
    this.userOwnAuthService.getDataFromLocalStorage();
    this.jwtService.userRole$.next(this.jwtService.getUserRole());
    this.router
      .navigate(['profile', data.userId])
      .then(() => {
        this.localStorageService.setFirstSignIn();
        this.profileService
          .getUserInfo()
          .pipe(take(1))
          .subscribe((item) => {
            this.localStorageService.setFirstName(item.firstName);
          });
      })
      .catch((fail) => console.log('redirect has failed ' + fail));
  }

  public togglePassword(input: HTMLInputElement, src: HTMLImageElement): void {
    input.type = input.type === 'password' ? 'text' : 'password';
    src.src = input.type === 'password' ? this.hideShowPasswordImage.hidePassword : this.hideShowPasswordImage.showPassword;
    src.alt = input.type === 'password' ? (src.alt = 'show password') : (src.alt = 'hide password');
  }

  private checkIfUserId(): void {
    this.localStorageService.userIdBehaviourSubject.pipe(takeUntil(this.destroy)).subscribe((userId) => {
      if (userId) {
        this.matDialogRef.close(userId);
      }
    });
  }

  private onSignInSuccess(data: UserSuccessSignIn): void {
    this.loadingAnim = false;
    this.userOwnSignInService.saveUserToLocalStorage(data);
    this.localStorageService.setFirstName(data.name);
    this.localStorageService.setFirstSignIn();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.jwtService.userRole$.next(this.jwtService.getUserRole());
    this.router.navigate(['profile', data.userId]);
  }

  private onSignInFailure(errors: HttpErrorResponse): void {
    if (typeof errors === 'string') {
      return;
    } else if (!Array.isArray(errors.error)) {
      this.backEndError = errors.error.message;
      return;
    }

    errors.error.forEach((error) => {
      this.emailErrorMessageBackEnd = error.name === 'email' ? error.message : this.emailErrorMessageBackEnd;
      this.passwordErrorMessageBackEnd = error.name === 'password' ? error.message : this.passwordErrorMessageBackEnd;
    });
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
