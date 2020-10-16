import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html'
})
export class ErrorComponent {
  @Input() public controlName: string;
  @Input() public formElement: FormControl;
  public errorMessage = '';

  public getErrorMessage(): string {
    Object.keys(this.formElement.errors).map(error =>{
      switch (error) {
        case 'required':
          this.errorMessage = 'user.auth.sign-in.field-is-required';
          break;
        case 'email':
          this.errorMessage = 'user.auth.sign-in.this-is-not-email';
          break;
        case 'passwordMismatch':
          this.errorMessage = 'user.auth.sign-up.password-match';
          break;
        case 'minlength':
          this.errorMessage = 'user.auth.sign-in.password-must-be-at-least-8-characters-long';
          break;
        case 'symbolInvalid':
          this.errorMessage = this.controlName === 'password' 
          ? 'user.auth.sign-up.password-symbols-error'
          : 'user.auth.sign-up.user-name-size';
          break;
      }
    });
    return this.errorMessage;
  }
}
