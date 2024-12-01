import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { UpdatePasswordDto } from '@global-models/updatePasswordDto';
import { ChangePasswordService } from '@global-service/auth/change-password.service';
import { iif, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Patterns } from 'src/assets/patterns/patterns';

@Component({
  selector: 'app-ubs-profile-change-password-pop-up',
  templateUrl: './ubs-profile-change-password-pop-up.component.html',
  styleUrls: ['./ubs-profile-change-password-pop-up.component.scss']
})
export class UbsProfileChangePasswordPopUpComponent implements OnInit {
  formConfig: FormGroup;
  private readonly passRegexp = Patterns.regexpPass;
  updatePasswordDto: UpdatePasswordDto;
  hasPassword: boolean;
  hasWrongCurrentPassword = false;

  constructor(
    private changePasswordService: ChangePasswordService,
    @Optional() public dialogRef: MatDialogRef<UbsProfileChangePasswordPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private snackBar: MatSnackBarComponent
  ) {}

  ngOnInit() {
    this.hasPassword = this.data.hasPassword;
    this.initForm();
    this.updatePasswordDto = new UpdatePasswordDto();
  }

  initForm(): void {
    this.formConfig = this.fb.group({
      currentPassword: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(this.passRegexp)]],
      confirmPassword: ['', [Validators.required]]
    });
    if (this.hasPassword) {
      this.formConfig.setValidators([this.checkConfirmPassword, this.checkPasswordMatch]);
    }
  }

  checkConfirmPassword(group: FormGroup): null | { [error: string]: boolean } {
    const password = group.get('password').value?.trim();
    const confirmPassword = group.get('confirmPassword').value?.trim();
    return password === confirmPassword ? null : { confirmPasswordMistmatch: true };
  }

  checkPasswordMatch(group: FormGroup): null | { [error: string]: boolean } {
    const password = group.get('password').value?.trim();
    const currentPassword = group.get('currentPassword').value?.trim();
    return password === currentPassword ? { newPasswordMatchesOld: true } : null;
  }

  onSubmit(): void {
    this.updatePasswordDto.currentPassword = this.formConfig.value.password;
    this.updatePasswordDto.confirmPassword = this.formConfig.value.confirmPassword;
    this.updatePasswordDto.password = this.formConfig.value.password;
    of(true)
      .pipe(
        mergeMap(() =>
          iif(
            () => this.hasPassword,
            this.changePasswordService.changePassword(this.updatePasswordDto),
            this.changePasswordService.setPasswordForGoogleAuth(this.updatePasswordDto)
          )
        )
      )
      .subscribe({
        next: (_) => {
          this.snackBar.openSnackBar('successConfirmPasswordUbs');
          this.dialogRef.close();
        },
        error: (error) => {
          this.initForm();
          this.hasWrongCurrentPassword = true;
        }
      });
  }
}
