import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-mat-snack-bar',
  templateUrl: './mat-snack-bar.component.html',
  styleUrls: ['./mat-snack-bar.component.scss'],
  providers: [TranslateService]
})
export class MatSnackBarComponent {
  public message: string;
  public className: string;
  public snackType = {
    error: () => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage('snack-bar.error.default');
    },
    attention: () => {
      this.className = 'attention-snackbar';
      this.getSnackBarMessage('snack-bar.attention.default');
    },
    success: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.default');
    },
    exitConfirmRestorePassword: () => {
      this.className = 'attention-snackbar';
      this.getSnackBarMessage('snack-bar.attention.exit-confirm-restore-password');
    },
    successRestorePassword: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.restore-password');
    },
    successConfirmPassword: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.confirm-restore-password');
    },
    signUp: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.sign-up');
    },
    successConfirmEmail: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.confirm-email');
    },
    cafeNotificationsExists: () => {
      this.getSnackBarMessage('update-cafe.notifications.exists');
      this.className = 'error-snackbar';
    },
    cafeNotificationsCloseTime: () => {
      this.getSnackBarMessage('update-cafe.notifications.closeTime');
      this.className = 'error-snackbar';
    },
    cafeNotificationsBreakTime: () => {
      this.getSnackBarMessage('update-cafe.notifications.breakTime');
      this.className = 'error-snackbar';
    },
    cafeNotificationsPhotoUpload: () => {
      this.getSnackBarMessage('update-cafe.notifications.photoUpload');
      this.className = 'error-snackbar';
    },
    habitAdded: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('user.habit.all-habits.new-habit-added');
    },
    errorMessage: (error) => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage(error);
    }
  };

  constructor(public snackBar: MatSnackBar,
              private translate: TranslateService) { }

  public openSnackBar(type: string): void {
    this.snackType[type] ? this.snackType[type]() : type.includes('400') ? this.snackType.error() : this.snackType.errorMessage(type);
  }

  public getSnackBarMessage(key: string): void {
    this.translate.get(key).subscribe(translation => {
      this.message = translation;
      this.snackBar.open(this.message, 'X', {
        duration: 15000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: [this.className]
      });
    });
  }
}
