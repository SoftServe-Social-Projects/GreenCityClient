import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarClassName } from '@global-errors/error-constants';

@Component({
  selector: 'app-mat-snack-bar',
  templateUrl: './mat-snack-bar.component.html',
  styleUrls: ['./mat-snack-bar.component.scss'],
  providers: [TranslateService]
})
export class MatSnackBarComponent {
  message: string;
  snackType = {
    error: { classname: SnackbarClassName.error, key: 'snack-bar.error.default' },
    createEvent: { classname: SnackbarClassName.success, key: 'snack-bar.success.create-news' },
    attention: { classname: SnackbarClassName.attention, key: 'snack-bar.attention.default' },
    success: { classname: SnackbarClassName.success, key: 'snack-bar.success.default' },
    exitConfirmRestorePassword: {
      classname: SnackbarClassName.attention,
      key: 'snack-bar.attention.exit-confirm-restore-password'
    },

    successRestorePassword: { classname: SnackbarClassName.success, key: 'snack-bar.success.restore-password' },
    successRestorePasswordUbs: { classname: SnackbarClassName.successUbs, key: 'snack-bar.success.restore-password' },
    exitConfirmUnblockAccount: {
      classname: SnackbarClassName.attention,
      key: 'snack-bar.attention.exit-confirm-unblock-account'
    },
    successUnblockAccount: { classname: SnackbarClassName.success, key: 'snack-bar.success.confirm-unblock-account' },
    successConfirmPassword: { classname: SnackbarClassName.success, key: 'snack-bar.success.confirm-restore-password' },
    successConfirmPasswordUbs: {
      classname: SnackbarClassName.successUbs,
      key: 'snack-bar.success.confirm-restore-password'
    },
    signUp: { classname: SnackbarClassName.success, key: 'snack-bar.success.sign-up' },
    signUpUbs: { classname: SnackbarClassName.successUbs, key: 'snack-bar.success.sign-up' },
    successConfirmEmail: { classname: SnackbarClassName.success, key: 'snack-bar.success.confirm-email' },
    successConfirmSaveOrder: { classname: SnackbarClassName.successUbs, key: 'snack-bar.saved-order' },
    successConfirmUpdateOrder: { classname: SnackbarClassName.successUbs, key: 'snack-bar.update-order' },
    successUpdateUbsData: { classname: SnackbarClassName.successUbs, key: 'snack-bar.save-employee-permissons' },
    cafeNotificationsExists: { classname: SnackbarClassName.error, key: 'update-cafe.notifications.exists' },
    cafeNotificationsCloseTime: { classname: SnackbarClassName.error, key: 'update-cafe.notifications.closeTime' },
    cafeNotificationsBreakTime: { classname: SnackbarClassName.error, key: 'update-cafe.notifications.breakTime' },
    cafeNotificationsPhotoUpload: { classname: SnackbarClassName.error, key: 'update-cafe.notifications.photoUpload' },
    habitDeleted: { classname: SnackbarClassName.error, key: 'user.habit.all-habits.habit-was-deleted' },
    habitLimitReached: { classname: SnackbarClassName.error, key: 'user.habit.all-habits.habit-limit-reached' },
    customHabitDeleted: { classname: SnackbarClassName.error, key: 'user.habit.all-habits.custom-habit-was-deleted' },
    habitAdded: { classname: SnackbarClassName.success, key: 'user.habit.all-habits.new-habit-added' },
    habitDidNotGiveUp: { classname: SnackbarClassName.success, key: 'user.habit.all-habits.habit-did-not-give-up' },
    habitUpdated: { classname: SnackbarClassName.success, key: 'user.habit.all-habits.new-habit-updated' },
    habitAcquired: { classname: SnackbarClassName.success, key: 'user.habit.all-habits.habit-acquired' },
    errorMessage: { classname: SnackbarClassName.error },
    sendNewLetter: { classname: SnackbarClassName.error, key: 'snack-bar.error.restore-password-again' },
    sendNewUnblockLetter: { classname: SnackbarClassName.error, key: 'snack-bar.error.unblock-account-again' },
    changesSaved: { classname: SnackbarClassName.success, key: 'user.edit-profile.profile-changes-saved' },
    existAddress: { classname: SnackbarClassName.error, key: 'snack-bar.error.exist-address' },
    addedAddress: { classname: SnackbarClassName.success, key: 'snack-bar.success.added-address' },
    updatedAddress: { classname: SnackbarClassName.success, key: 'snack-bar.success.updated-address' },
    deletedAddress: { classname: SnackbarClassName.success, key: 'snack-bar.success.deleted-address' },
    errorCreateAddress: { classname: SnackbarClassName.error, key: 'snack-bar.error.error-create-address' },
    errorEditAddress: { classname: SnackbarClassName.error, key: 'snack-bar.error.error-edit-address' },
    userUnauthorised: { classname: SnackbarClassName.error, key: 'snack-bar.error.unauthorised-user' },
    lessPoints: { classname: SnackbarClassName.error, key: 'snack-bar.error.not-enough-points' },
    CartValidation: { classname: SnackbarClassName.error, key: 'snack-bar.error.cartificate-not-valid' },
    addedEvent: { classname: SnackbarClassName.success, key: 'create-event.created-event' },
    updatedEvent: { classname: SnackbarClassName.success, key: 'create-event.updated-event' },
    savedChangesToUserProfile: { classname: SnackbarClassName.success, key: 'snack-bar.success.saved-changes' },
    updatedNotification: { classname: SnackbarClassName.success, key: 'snack-bar.success.update-notification' },
    deletedNotification: { classname: SnackbarClassName.success, key: 'snack-bar.success.delete-notification' },
    joinedEvent: { classname: SnackbarClassName.success, key: 'snack-bar.success.joined-event' },
    successInviteFriend: { classname: SnackbarClassName.success, key: 'snack-bar.success.habit-invite-success' },
    errorJoinEvent: { classname: SnackbarClassName.error, key: 'snack-bar.success.error-joined-event' },
    tooLongInput: { classname: SnackbarClassName.error, key: 'user.habit.to-do.too-long-input' },
    ratedEvent: { classname: SnackbarClassName.success, key: 'snack-bar.success.rating-send' },
    addFriend: { classname: SnackbarClassName.success, key: 'snack-bar.success.add-friend' },
    friendValidation: { classname: SnackbarClassName.error, key: 'snack-bar.error.friend-request' },
    friendInValidRequest: { classname: SnackbarClassName.error, key: 'snack-bar.error.friend-already-added' },
    friendRequestAccepted: { classname: SnackbarClassName.success, key: 'snack-bar.success.friend-added-success' },
    friendRequestDeclined: { classname: SnackbarClassName.success, key: 'snack-bar.success.friend-declined-success' },
    habitAcceptRequest: { classname: SnackbarClassName.success, key: 'snack-bar.success.habit-added-success' },
    habitDeclineRequest: { classname: SnackbarClassName.success, key: 'snack-bar.success.habit-decline-success' },
    habitAcceptInValidRequest: { classname: SnackbarClassName.error, key: 'snack-bar.error.habit-not-added' },
    habitDeclineInValidRequest: { classname: SnackbarClassName.error, key: 'snack-bar.error.habit-already-added' },
    cancelRequest: { classname: SnackbarClassName.success, key: 'snack-bar.success.cancel-request' },
    jointEventRequest: { classname: SnackbarClassName.success, key: 'snack-bar.success.joint-event-request' },
    errorImageTypeSize: { classname: SnackbarClassName.error, key: 'user.photo-upload.error-img-type-and-size' },
    errorImageType: { classname: SnackbarClassName.error, key: 'user.photo-upload.error-img-type' },
    errorImageSize: { classname: SnackbarClassName.error, key: 'user.photo-upload.error-img-size' },
    errorMaxPhotos: { classname: SnackbarClassName.error, key: 'user.photo-upload.you-can-upload-max-photos-event' },
    errorMinPhoto: { classname: SnackbarClassName.error, key: 'create-event.min-photo-error' },
    errorUpdateProfile: { classname: SnackbarClassName.error, key: 'user.user-setting.profile-update-error-name' },
    errorLiked: { classname: SnackbarClassName.error, key: 'homepage.eco-news.likes' },
    errorNotFound: { classname: SnackbarClassName.error, key: 'homepage.eco-news.not-found' },
    subscribedToNewsletter: { classname: SnackbarClassName.success, key: 'homepage.subscription.subscription-success' },
    errorAlreadySubscribed: { classname: SnackbarClassName.error, key: 'homepage.subscription.already-subscribed' }
  };

  constructor(
    public snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  openSnackBar(type: string, additionalValue?: string, duration: number = 3000, customPositioning?: string) {
    const isInclude = type.includes('400') ? this.getSnackBarMessage('error') : this.getSnackBarMessage('errorMessage', type);
    return this.snackType[type] ? this.getSnackBarMessage(type, additionalValue, duration, customPositioning) : isInclude;
  }

  getSnackBarMessage(type: string, additionalValue?: string, duration: number = 3000, customPositioning?: string): void {
    const className = this.snackType[type].classname;
    const key = this.snackType[type].key || type;
    const addValue = additionalValue ? { orderId: additionalValue } : {};
    this.translate.get(key, addValue).subscribe((translation) => {
      this.message = translation;
      this.snackBar.open(this.message, 'close', {
        duration,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: [className, customPositioning]
      });
    });
  }
}
