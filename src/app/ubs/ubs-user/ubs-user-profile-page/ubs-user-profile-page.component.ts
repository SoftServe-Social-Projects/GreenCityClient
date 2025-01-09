import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { UserOwnAuthService } from '@global-service/auth/user-own-auth.service';
import { JwtService } from '@global-service/jwt/jwt.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { SignInIcons } from 'src/app/main/image-pathes/sign-in-icons';
import { PhoneNumberValidator } from 'src/app/shared/phone-validator/phone.validator';
import { UBSAddAddressPopUpComponent } from 'src/app/shared/ubs-add-address-pop-up/ubs-add-address-pop-up.component';
import { ResetEmployeePermissions } from 'src/app/store/actions/employee.actions';
import { ResetFriends } from 'src/app/store/actions/friends.actions';
import { GetAddresses } from 'src/app/store/actions/order.actions';
import { addressesSelector } from 'src/app/store/selectors/order.selectors';
import { DeletingProfileReasonPopUpComponent } from 'src/app/ubs/ubs-admin/components/shared/components/deleting-profile-reason-pop-up/deleting-profile-reason-pop-up.component';
import { Address, UserProfile } from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';
import { ClientProfileService } from 'src/app/ubs/ubs-user/services/client-profile.service';
import { OrderService } from 'src/app/ubs/ubs/services/order.service';
import { Masks, Patterns } from 'src/assets/patterns/patterns';
import { ConfirmationDialogComponent } from '../../ubs-admin/components/shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationPlatform } from '../../ubs/notification-platform.enum';
import { UbsProfileChangePasswordPopUpComponent } from './ubs-profile-change-password-pop-up/ubs-profile-change-password-pop-up.component';

@Component({
  selector: 'app-ubs-user-profile-page',
  templateUrl: './ubs-user-profile-page.component.html',
  styleUrls: ['./ubs-user-profile-page.component.scss']
})
export class UbsUserProfilePageComponent implements OnInit, OnDestroy {
  private jwtService: JwtService = inject(JwtService);
  private router: Router = inject(Router);
  private userOwnAuthService: UserOwnAuthService = inject(UserOwnAuthService);
  private localeStorageService: LocalStorageService = inject(LocalStorageService);

  userForm: FormGroup;
  userProfile: UserProfile;
  userEmail: string;
  telegramBotURL: string;
  viberBotURL: string;
  errorMessages = [];
  maxAddressLength = 4;
  isEditing = false;
  isFetching = false;
  alternativeEmailDisplay = false;
  googleIcon = SignInIcons.picGoogle;
  phoneMask = Masks.phoneMask;
  resetFieldImg = './assets/img/ubs-tariff/bigClose.svg';

  private destroy: Subject<boolean> = new Subject<boolean>();

  dataDeleteAddress = {
    title: 'ubs-client-profile.delete-address',
    confirm: 'ubs-client-profile.payment.yes',
    cancel: 'ubs-client-profile.payment.no'
  };
  dataDeleteProfile = {
    title: 'ubs-client-profile.delete-title',
    text: 'ubs-client-profile.delete-message',
    confirm: 'ubs-client-profile.btn.delete-profile-save',
    cancel: 'ubs-client-profile.btn.delete-profile-cancel'
  };

  @ViewChild('#regionInput', { static: true }) regionInputRef: ElementRef<HTMLInputElement>;

  get recipientName() {
    return this.userForm.get('recipientName');
  }

  get recipientSurname() {
    return this.userForm.get('recipientSurname');
  }

  get alternateEmail() {
    return this.userForm.get('alternateEmail');
  }

  get recipientPhone() {
    return this.userForm.get('recipientPhone');
  }

  constructor(
    private dialog: MatDialog,
    private clientProfileService: ClientProfileService,
    private snackBar: MatSnackBarComponent,
    private orderService: OrderService,
    private languageService: LanguageService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.userEmail = this.jwtService.getEmailFromAccessToken();
    this.getUserData();

    this.store.dispatch(GetAddresses());

    this.store.pipe(select(addressesSelector)).subscribe((addresses) => {
      this.getUserData();
    });
  }

  getUserData(): void {
    this.isFetching = true;
    this.clientProfileService
      .getDataClientProfile()
      .pipe(take(1))
      .subscribe({
        next: (res: UserProfile) => {
          this.userProfile = res;
          this.userInit();
          this.setUrlToBot();
          this.isFetching = false;
        },
        error: () => {
          this.isFetching = false;
          this.snackBar.openSnackBar('error');
        }
      });
  }

  setUrlToBot(): void {
    this.telegramBotURL = this.userProfile.botList[0]?.link;
    this.viberBotURL = this.userProfile.botList[1]?.link;
  }

  userInit(): void {
    const addressArray = new FormArray([]);

    this.userProfile.addressDto.forEach((addressDTO) => {
      addressArray.push(new FormControl(addressDTO, []));
    });

    this.userForm = new FormGroup({
      address: addressArray,
      recipientName: new FormControl(this.userProfile?.recipientName, [
        Validators.required,
        Validators.pattern(Patterns.NamePattern),
        Validators.maxLength(30)
      ]),
      recipientSurname: new FormControl(this.userProfile?.recipientSurname, [
        Validators.required,
        Validators.pattern(Patterns.NamePattern),
        Validators.maxLength(30)
      ]),
      recipientEmail: new FormControl(this.userProfile?.recipientEmail, [Validators.required, Validators.pattern(Patterns.ubsMailPattern)]),
      alternativeEmail: new FormControl(this.userProfile?.alternateEmail, [Validators.pattern(Patterns.ubsMailPattern)]),
      recipientPhone: new FormControl(`${this.userProfile?.recipientPhone}`, [
        Validators.required,
        Validators.minLength(12),
        PhoneNumberValidator('UA')
      ]),
      telegramIsNotify: new FormControl(this.userProfile.telegramIsNotify),
      viberIsNotify: new FormControl(this.userProfile.viberIsNotify)
    });

    this.isFetching = false;
  }

  deleteAddress(address) {
    this.orderService
      .deleteAddress(address)
      .pipe(take(1))
      .subscribe((list: { addressList: Address[] }) => {
        this.userProfile.addressDto = list.addressList;
        this.getUserData();
      });
  }

  resetValue(): void {
    this.userForm.get('alternateEmail').setValue(null);
  }

  isSubmitBtnDisabled() {
    return this.userForm.invalid || this.userForm.pristine;
  }

  onEdit(): void {
    this.isEditing = true;
    this.isFetching = false;
    setTimeout(() => this.focusOnFirst());
  }

  setActualAddress(addressId): void {
    this.orderService.setActualAddress(addressId).pipe(take(1)).subscribe();
  }

  focusOnFirst(): void {
    document.getElementById('recipientName').focus();
  }

  onCancel(): void {
    this.userInit();
    this.isEditing = false;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isFetching = true;
      this.isEditing = false;
      const submitData = {
        addressDto: [],
        recipientEmail: this.userForm.value.recipientEmail,
        alternateEmail: this.userForm.value.alternateEmail,
        recipientName: this.userForm.value.recipientName,
        recipientPhone: this.userForm.value.recipientPhone,
        recipientSurname: this.userForm.value.recipientSurname,
        telegramIsNotify: this.userProfile.telegramIsNotify,
        viberIsNotify: this.userProfile.viberIsNotify,
        hasPassword: this.userProfile.hasPassword
      };

      if (!submitData.alternateEmail?.length) {
        delete submitData.alternateEmail;
      }

      this.userProfile.addressDto.forEach((address, i) => {
        const formAddress = this.userForm.value.address[i];
        const originalAddress = this.userProfile.addressDto[i];

        const isUpdated = Object.keys(formAddress).some((key) => formAddress[key] !== originalAddress[key]);

        if (isUpdated) {
          const updatedAddress = {
            ...formAddress,
            id: originalAddress.id,
            actual: originalAddress.actual
          };

          if (!updatedAddress.houseCorpus) {
            delete updatedAddress.houseCorpus;
          }
          if (!updatedAddress.entranceNumber) {
            delete updatedAddress.entranceNumber;
          }
          delete updatedAddress.searchAddress;
          delete updatedAddress.isHouseSelected;

          submitData.addressDto.push(updatedAddress);
        }
      });

      this.clientProfileService
        .postDataClientProfile(submitData)
        .pipe(take(1))
        .subscribe({
          next: (res: UserProfile) => {
            this.isFetching = false;
            this.userProfile = res;
            this.userProfile.recipientEmail = this.userForm.value.recipientEmail;
            this.userProfile.alternateEmail = this.userForm.value.alternateEmail;
          },
          error: (err: Error) => {
            this.isFetching = false;
            this.snackBar.openSnackBar('error');
          }
        });
      this.alternativeEmailDisplay = false;
    } else {
      this.isEditing = true;
    }
    this.snackBar.openSnackBar('savedChangesToUserProfile');
  }

  goToTelegramUrl() {
    (window as any).open(this.telegramBotURL, '_blank');
  }

  goToViberUrl() {
    (window as any).open(this.viberBotURL, '_blank');
  }

  openDeleteProfileDialog(): void {
    const matDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dataDeleteProfile,
      hasBackdrop: true
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => this.openDeleteProfileReasonPopUp());
  }

  openDeleteProfileReasonPopUp(): void {
    const matDialogRef = this.dialog.open(DeletingProfileReasonPopUpComponent, {
      hasBackdrop: true
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((res) => {
        this.clientProfileService
          .deactivateProfile(this.userEmail, res.reason)
          .pipe(take(1))
          .subscribe(() => {
            this.signOut();
          });
      });
  }

  signOut(): void {
    this.jwtService.userRole$.next('');

    this.router.navigateByUrl('/').then((isRedirected: boolean) => {
      this.userOwnAuthService.isLoginUserSubject.next(false);
      this.localeStorageService.clear();
    });
    this.store.dispatch(ResetEmployeePermissions());
    this.store.dispatch(ResetFriends());
  }

  openDeleteAddressDialog(address): void {
    const matDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dataDeleteAddress,
      hasBackdrop: true
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res) {
          this.deleteAddress(address);
        }
      });
  }

  openChangePasswordDialog(): void {
    this.dialog.open(UbsProfileChangePasswordPopUpComponent, {
      hasBackdrop: true,
      data: {
        hasPassword: this.userProfile.hasPassword
      }
    });
  }

  openAddAdressDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'address-matDialog-styles';
    dialogConfig.data = {
      edit: false,
      addFromProfile: true,
      address: {}
    };

    this.dialog.open(UBSAddAddressPopUpComponent, dialogConfig);
  }

  formatedPhoneNumber(num: string): string | void {
    const match = RegExp(/^(\d{2})(\d{3})(\d{2})(\d{2})$/).exec(num);
    if (match) {
      return ` +380 (${match[1]}) ${match[2]} ${match[3]} ${match[4]}`;
    }
  }

  toggleAlternativeEmail() {
    const control = new FormControl(this.userProfile?.alternateEmail, [
      Validators.pattern(Patterns.ubsMailPattern),
      Validators.minLength(3),
      Validators.maxLength(66),
      Validators.email
    ]);
    this.alternativeEmailDisplay = !this.alternativeEmailDisplay;

    this.alternativeEmailDisplay ? this.userForm.addControl('alternateEmail', control) : this.userForm.removeControl('alternateEmail');
  }

  onSwitchChanged(id: string): void {
    switch (id) {
      case NotificationPlatform.telegramNotification:
        this.userProfile.telegramIsNotify = !this.userProfile.telegramIsNotify;
        if (this.userProfile.telegramIsNotify) {
          this.goToTelegramUrl();
        }
        break;

      case NotificationPlatform.viberNotification:
        this.userProfile.viberIsNotify = !this.userProfile.viberIsNotify;
        if (this.userProfile.viberIsNotify) {
          this.goToViberUrl();
        }
        break;
    }
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
