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
    successRestorePasswordUbs: () => {
      this.className = 'success-snackbar-ubs';
      this.getSnackBarMessage('snack-bar.success.restore-password');
    },
    successConfirmPassword: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.confirm-restore-password');
    },
    successConfirmPasswordUbs: () => {
      this.className = 'success-snackbar-ubs';
      this.getSnackBarMessage('snack-bar.success.confirm-restore-password');
    },
    signUp: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.sign-up');
    },
    signUpUbs: () => {
      this.className = 'success-snackbar-ubs';
      this.getSnackBarMessage('snack-bar.success.sign-up');
    },
    successConfirmEmail: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.confirm-email');
    },
    successConfirmSaveOrder: (additionalValue: string) => {
      this.className = 'success-snackbar-ubs';
      this.getSnackBarMessage('snack-bar.saved-order', additionalValue);
    },
    successConfirmUpdateOrder: (additionalValue: string) => {
      this.className = 'success-snackbar-ubs';
      this.getSnackBarMessage('snack-bar.update-order');
    },
    successUpdateUbsData: () => {
      this.className = 'success-snackbar-ubs';
      this.getSnackBarMessage('snack-bar.save-employee-permissons');
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
    habitDeleted: () => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage('user.habit.all-habits.habit-was-deleted');
    },
    habitAdded: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('user.habit.all-habits.new-habit-added');
    },
    habitDidNotGiveUp: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('user.habit.all-habits.habit-did-not-give-up');
    },
    habitUpdated: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('user.habit.all-habits.new-habit-updated');
    },
    habitAcquired: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('user.habit.all-habits.habit-acquired');
    },
    errorMessage: (error) => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage(error);
    },
    sendNewLetter: () => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage('snack-bar.error.restore-password-again');
    },
    changesSaved: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('user.edit-profile.profile-changes-saved');
    },
    existAddress: () => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage('snack-bar.error.exist-address');
    },
    addedAddress: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.added-address');
    },
    userUnauthorised: () => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage('snack-bar.error.unauthorised-user');
    },
    lessPoints: () => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage('snack-bar.error.not-enough-points');
    },
    CartValidation: () => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage('snack-bar.error.cartificate-not-valid');
    },
    addedEvent: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('create-event.created-event');
    },
    updatedEvent: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('create-event.updated-event');
    },
    savedChangesToUserProfile: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.saved-changes');
    },
    updatedNotification: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.update-notification');
    },
    joinedEvent: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.joined-event');
    },
    errorJoinEvent: () => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage('snack-bar.success.error-joined-event');
    },
    tooLongInput: () => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage('user.habit.too-long-input');
    },
    ratedEvent: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.success.rating-send');
    },
    successUpdateLink: () => {
      this.className = 'success-snackbar';
      this.getSnackBarMessage('snack-bar.update-chat-link');
    },
    failUpdateLink: () => {
      this.className = 'error-snackbar';
      this.getSnackBarMessage('snack-bar.update-chat-link');
    }
  };

  constructor(public snackBar: MatSnackBar, private readonly translate: TranslateService) {}

  public openSnackBar(type: string, additionalValue?: string) {
    const isInclude = type.includes('400') ? this.snackType.error() : this.snackType.errorMessage(type);
    if (additionalValue) {
      return this.snackType[type] ? this.snackType[type](additionalValue) : isInclude;
    }
    return this.snackType[type] ? this.snackType[type]() : isInclude;
  }

  public getSnackBarMessage(key: string, additionalValue?: string): void {
    const addValue = additionalValue ? { orderId: additionalValue } : {};
    this.translate.get(key, addValue).subscribe((translation) => {
      this.message = translation;
      this.snackBar.open(this.message, 'close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: [this.className]
      });
    });
  }
}
