import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { InputcolorDirective } from '../../directives/inputcolor.directive';
import { SharedMainModule } from '@shared/shared-main.module';
import { RestoreComponent, RestorePasswordComponent, SignInComponent, SignUpComponent, SubmitEmailComponent } from './components';
import { ErrorComponent } from './components/error/error.component';
import { ConfirmRestorePasswordComponent } from './components/confirm-restore-password/confirm-restore-password.component';
import { GoogleBtnComponent } from './components/google-btn/google-btn.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SharedModule } from 'src/app/shared/shared.module';
import { TurnstileCaptchaComponent } from './components/turnstile-captcha/turnstile-captcha.component';
import { UnblockAccountComponent } from './components/unblock-account/unblock-account.component';

@NgModule({
  declarations: [
    AuthModalComponent,
    ConfirmRestorePasswordComponent,
    ErrorComponent,
    GoogleBtnComponent,
    InputcolorDirective,
    RestoreComponent,
    RestorePasswordComponent,
    SignInComponent,
    SignUpComponent,
    SubmitEmailComponent,
    TurnstileCaptchaComponent,
    UnblockAccountComponent
  ],
  imports: [CoreModule, SharedMainModule, SharedModule, ReactiveFormsModule],
  exports: [InputcolorDirective],
  providers: [MatSnackBarModule]
})
export class AuthModule {}
