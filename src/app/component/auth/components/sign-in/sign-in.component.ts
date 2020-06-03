import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, GoogleLoginProvider } from 'angularx-social-login';
import { GoogleSignInService } from '../../../../service/auth/google-sign-in.service';
import { UserSuccessSignIn } from '../../../../model/user-success-sign-in';
import { HttpErrorResponse } from '@angular/common/http';
import { UserOwnSignInService } from '../../../../service/auth/user-own-sign-in.service';
import { Router } from '@angular/router';
import { SignInIcons } from 'src/assets/img/icon/sign-in/sign-in-icons';
import { MatDialog, MatDialogRef } from '@angular/material';
import { UserOwnSignIn } from '../../../../model/user-own-sign-in';
import { LocalStorageService } from '../../../../service/localstorage/local-storage.service';
import { Subscription } from 'rxjs';
import { RestorePasswordComponent } from '../restore-password/restore-password.component';
import { UserOwnAuthService } from '../../../../service/auth/user-own-auth.service';
import { SignUpComponent } from '../sign-up/sign-up.component';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, OnDestroy {
  private closeBtn = SignInIcons;
  private mainSignInImage = SignInIcons;
  private googleImage = SignInIcons;
  private hideShowPasswordImage = SignInIcons;
  public userOwnSignIn: UserOwnSignIn;
  public userIdSubscription: Subscription;
  public loadingAnim: boolean;
  public emailErrorMessageBackEnd: string;
  public passwordErrorMessageBackEnd: string;
  public backEndError: string;

  constructor(
    public dialog: MatDialog,
    private matDialogRef: MatDialogRef<SignInComponent>,
    private userOwnSignInService: UserOwnSignInService,
    private router: Router,
    private authService: AuthService,
    private googleService: GoogleSignInService,
    private localStorageService: LocalStorageService,
    private userOwnAuthService: UserOwnAuthService,
  ) { }

  ngOnInit() {
    this.userOwnSignIn = new UserOwnSignIn();
    this.configDefaultErrorMessage();
    this.checkIfUserId();
  }

  private checkIfUserId(): void {
    this.userIdSubscription = this.localStorageService.userIdBehaviourSubject
      .subscribe(userId => {
        if (userId) {
          this.matDialogRef.close(userId);
        }
      });
  }

  public configDefaultErrorMessage(): void {
    this.emailErrorMessageBackEnd = null;
    this.passwordErrorMessageBackEnd = null;
    this.backEndError = null;
  }

  private signIn(userOwnSignIn: UserOwnSignIn): void {
    this.loadingAnim = true;
    this.userOwnSignInService.signIn(userOwnSignIn).subscribe(
      (data: UserSuccessSignIn) => {
        this.onSignInSuccess(data);
      },
      (errors: HttpErrorResponse) => {
        this.onSignInFailure(errors);
        this.loadingAnim = false;
      });
  }

  private signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(data => {
      this.googleService.signIn(data.idToken).subscribe(
        (signInData: UserSuccessSignIn) => {
          this.onSignInWithGoogleSuccess(signInData);
        },
        (errors: HttpErrorResponse) => {
          this.onSignInFailure(errors);
        });
    });
  }

  private onSignInSuccess(data: UserSuccessSignIn): void {
    this.loadingAnim = false;
    this.userOwnSignInService.saveUserToLocalStorage(data);
    this.localStorageService.setFirstName(data.name);
    this.localStorageService.setFirstSignIn();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.router.navigate(['profile', data.userId])
      .then(success => console.log('redirect has succeeded ' + success))
      .catch(fail => console.log('redirect has failed ' + fail));
  }

  private onOpenForgotWindow(): void {
    this.dialog.open(RestorePasswordComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: 'custom-dialog-container',
    });
    this.matDialogRef.close();
  }

  private onSignInFailure(errors: HttpErrorResponse): void {
    try {
      errors.error.forEach(error => {
        if (error.name === 'email') {
          this.emailErrorMessageBackEnd = error.message;
        } else if (error.name === 'password') {
          this.passwordErrorMessageBackEnd = error.message;
        }
      });
    } catch (e) {
      this.backEndError = errors.error.message;
    }
  }

  private onSignInWithGoogleSuccess(data: UserSuccessSignIn): void {
    this.userOwnSignInService.saveUserToLocalStorage(data);
    this.userOwnAuthService.getDataFromLocalStorage();
    this.router.navigate(['profile', data.userId])
      .then(success => {
        this.localStorageService.setFirstSignIn();
        console.log('redirect has succeeded ' + success);
      })
      .catch(fail => console.log('redirect has failed ' + fail));
  }

  private togglePassword(input: HTMLInputElement, src: HTMLImageElement): void {
    input.type = input.type === 'password' ? 'text' : 'password';
    src.src = input.type === 'password' ?
      this.hideShowPasswordImage.hidePassword : this.hideShowPasswordImage.showPassword;
  }

  private closeSignInWindow(): void {
    this.matDialogRef.close();
  }

  private signUpOpenWindow(): void {
    this.matDialogRef.close();
    this.dialog.open(SignUpComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: 'custom-dialog-container',
    });
  }

  ngOnDestroy() {
    this.userIdSubscription.unsubscribe();
  }
}

