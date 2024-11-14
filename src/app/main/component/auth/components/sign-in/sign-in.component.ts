import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { GoogleSignInService } from '@auth-service/google-sign-in.service';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { environment } from '@environment/environment';
import { accounts } from 'google-one-tap';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Patterns } from 'src/assets/patterns/patterns';
import { SignInIcons } from 'src/app/main/image-pathes/sign-in-icons';

import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SignInAction, SignInSuccessAction, SignInWithGoogleAction } from 'src/app/store/actions/auth.actions';
import { errorSelector, isLoadingSelector } from 'src/app/store/selectors/auth.selectors';
import { googleProvider } from './GoogleOAuthProvider/GoogleOAuthProvider';
import { UserOwnSignInService } from '@global-service/auth/user-own-sign-in.service';
import { TurnstileCaptchaComponent } from '@global-auth/turnstile-captcha/turnstile-captcha.component';

declare let google: any;
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, OnDestroy {
  @Output() private readonly pageName = new EventEmitter();
  @Input() isUbs: boolean;
  @ViewChild(TurnstileCaptchaComponent) captchaComponent!: TurnstileCaptchaComponent;

  private readonly store: Store = inject(Store);
  private readonly actions: Actions = inject(Actions);
  private readonly userOwnSignInService = inject(UserOwnSignInService);
  private readonly destroy$: Subject<void> = new Subject();

  isLoading$: Observable<boolean> = this.store.select(isLoadingSelector);
  error$: Observable<string> = this.store.select(errorSelector);
  closeBtn = SignInIcons;
  mainSignInImage = SignInIcons;
  googleImage = SignInIcons;
  hideShowPasswordImage = SignInIcons;
  signInForm: FormGroup;

  get email(): FormControl {
    return this.signInForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.signInForm.get('password') as FormControl;
  }

  constructor(
    private readonly matDialogRef: MatDialogRef<SignInComponent>,
    private readonly googleService: GoogleSignInService,
    private readonly userOwnAuthService: UserOwnAuthService
  ) {}

  ngOnInit(): void {
    this.signInForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(Patterns.ubsMailPattern)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
      captchaToken: new FormControl<null | string>(null, [Validators.required])
    });

    this.initGooglePopup();

    this.actions.pipe(ofType(SignInSuccessAction), take(1)).subscribe(() => this.matDialogRef.close());
  }

  onCaptchaError(): void {
    console.error('Captcha validation failed.');
  }

  clearCaptchaToken() {
    this.captchaComponent.clearToken();
  }

  signIn(): void {
    if (this.signInForm.valid) {
      this.store.dispatch(SignInAction({ data: this.signInForm.value, isUBS: this.isUbs }));
      this.clearCaptchaToken();
    } else {
      console.error('Form is invalid, unable to submit.');
    }
  }

  signInWithGoogle(): void {
    const login = googleProvider.useGoogleLogin({
      flow: 'implicit',
      onSuccess: (res) => this.store.dispatch(SignInWithGoogleAction({ token: res.access_token, isUBS: this.isUbs })),
      onError: (err) => console.error('Failed to login with google redirect', err)
    });
    login();
  }

  onOpenModalWindow(windowPath: string): void {
    this.pageName.emit(windowPath);
  }

  togglePassword(input: HTMLInputElement, src: HTMLImageElement): void {
    input.type = input.type === 'password' ? 'text' : 'password';
    src.src = input.type === 'password' ? this.hideShowPasswordImage.hidePassword : this.hideShowPasswordImage.showPassword;
    src.alt = input.type === 'password' ? 'show password' : 'hide password';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initGooglePopup(): void {
    const gAccounts: accounts = google.accounts;
    gAccounts.id.initialize({
      client_id: environment.googleClientId,
      ux_mode: 'popup',
      cancel_on_tap_outside: true,
      callback: (res) => this.store.dispatch(SignInWithGoogleAction({ token: res.credential, isUBS: this.isUbs }))
    });
    gAccounts.id.prompt();
  }
}
