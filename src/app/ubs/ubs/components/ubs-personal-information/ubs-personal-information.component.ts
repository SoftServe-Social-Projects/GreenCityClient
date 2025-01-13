import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBaseComponent } from '@shared/components/form-base/form-base.component';
import { debounceTime, distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';
import { Subject, combineLatest } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { PersonalData } from '../../models/ubs.interface';
import { MatDialog } from '@angular/material/dialog';
import { PhoneNumberValidator } from 'src/app/shared/phone-validator/phone.validator';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Masks, Patterns } from 'src/assets/patterns/patterns';
import { Store, select } from '@ngrx/store';
import { GetPersonalData, SetPersonalData, GetExistingOrderInfo, SetSecondFormStatus } from 'src/app/store/actions/order.actions';
import { addressIdSelector, existingOrderInfoSelector, personalDataSelector } from 'src/app/store/selectors/order.selectors';
import { IUserOrderInfo } from 'src/app/ubs/ubs-user/ubs-user-orders-list/models/UserOrder.interface';
import { WarningPopUpComponent } from '@shared/components';

@Component({
  selector: 'app-ubs-personal-information',
  templateUrl: './ubs-personal-information.component.html',
  styleUrls: ['./ubs-personal-information.component.scss']
})
export class UBSPersonalInformationComponent extends FormBaseComponent implements OnInit, OnDestroy {
  personalData: PersonalData;
  personalDataForm: FormGroup;
  existingOrderId: number;
  existingOrderInfo: IUserOrderInfo;
  $address = this.store.pipe(select(addressIdSelector));

  namePattern = Patterns.NamePattern;
  emailPattern = Patterns.ubsMailPattern;
  phoneMask = Masks.phoneMask;
  private $destroy: Subject<void> = new Subject<void>();
  private nameValidators = [Validators.required, Validators.pattern(this.namePattern), Validators.maxLength(30)];
  popupConfig = {
    hasBackdrop: true,
    closeOnNavigation: true,
    disableClose: true,
    panelClass: 'custom-ubs-style',
    data: {
      popupTitle: 'confirmation.title',
      popupSubtitle: 'confirmation.subTitle',
      popupConfirm: 'confirmation.cancel',
      popupCancel: 'confirmation.dismiss',
      isUBS: true
    }
  };

  get firstName() {
    return this.personalDataForm.controls.firstName;
  }

  get lastName() {
    return this.personalDataForm.controls.lastName;
  }

  get phoneNumber() {
    return this.personalDataForm.controls.phoneNumber;
  }

  get email() {
    return this.personalDataForm.controls.email;
  }

  get senderFirstName() {
    return this.personalDataForm.controls.senderFirstName;
  }

  get senderLastName() {
    return this.personalDataForm.controls.senderLastName;
  }

  get senderPhoneNumber() {
    return this.personalDataForm.controls.senderPhoneNumber;
  }

  get senderEmail() {
    return this.personalDataForm.controls.senderEmail;
  }

  get isAnotherClient() {
    return this.personalDataForm.controls.isAnotherClient;
  }

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public orderService: OrderService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private localService: LocalStorageService,
    private store: Store
  ) {
    super(router, dialog, orderService, localService);
  }

  ngOnInit(): void {
    this.store.dispatch(GetPersonalData());
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      this.existingOrderId = params.existingOrderId;
      if (this.existingOrderId >= 0) {
        this.store.dispatch(GetExistingOrderInfo({ orderId: this.existingOrderId }));
        this.initListenersForExistingOrder();
      } else {
        this.initListenersForNewOrder();
      }
    });
  }

  initListenersForNewOrder(): void {
    this.store.pipe(select(personalDataSelector), filter(Boolean), take(1)).subscribe((personalData: PersonalData) => {
      this.personalData = personalData;
      this.initForm();
    });
  }

  initListenersForExistingOrder(): void {
    combineLatest([
      this.store.pipe(select(existingOrderInfoSelector), filter(Boolean), take(1)),
      this.store.pipe(select(personalDataSelector), filter(Boolean), take(1))
    ]).subscribe(([orderInfo, personalData]: [IUserOrderInfo, PersonalData]) => {
      this.personalData = personalData;
      this.existingOrderInfo = orderInfo;
      this.initForm();
      this.initPersonalDataForExistingOrder();
    });
  }

  initPersonalDataForExistingOrder(): void {
    const sender = this.existingOrderInfo.sender;
    const isSameSender =
      this.personalData.firstName === sender.senderName &&
      this.personalData.lastName === sender.senderSurname &&
      this.personalData.phoneNumber === sender.senderPhone &&
      this.personalData.email === sender.senderEmail;

    if (isSameSender) {
      return;
    }
    this.isAnotherClient.setValue(true);
    this.senderFirstName.setValue(sender.senderName);
    this.senderLastName.setValue(sender.senderSurname);
    this.senderEmail.setValue(sender.senderEmail);
    this.senderPhoneNumber.setValue(sender.senderPhone);
  }

  initForm(): void {
    this.personalDataForm = this.fb.group({
      firstName: [this.personalData.firstName ?? '', this.nameValidators],
      lastName: [this.personalData.lastName ?? '', this.nameValidators],
      email: [this.personalData.email ?? '', [Validators.required, Validators.maxLength(40), Validators.pattern(this.emailPattern)]],
      phoneNumber: [this.personalData.phoneNumber ?? '', [Validators.required, Validators.minLength(12), PhoneNumberValidator('UA')]],
      senderFirstName: [this.personalData.firstName ?? '', this.nameValidators],
      senderLastName: [this.personalData.lastName ?? '', this.nameValidators],
      senderEmail: [this.personalData.email ?? '', [Validators.maxLength(40), Validators.pattern(this.emailPattern)]],
      senderPhoneNumber: [this.personalData.phoneNumber ?? '', [Validators.required, Validators.minLength(12), PhoneNumberValidator('UA')]],
      isAnotherClient: [this.personalData.isAnotherClient ?? false]
    });

    this.isAnotherClient.valueChanges.pipe(distinctUntilChanged(), filter(Boolean), takeUntil(this.$destroy)).subscribe(() => {
      this.senderFirstName.setValue('');
      this.senderLastName.setValue('');
      this.senderPhoneNumber.setValue('');
      this.senderEmail.setValue('');
    });

    this.personalDataForm.valueChanges.pipe(debounceTime(400), takeUntil(this.$destroy)).subscribe(() => {
      if (!this.isAnotherClient.value) {
        this.senderFirstName.setValue(this.firstName.value, { emitEvent: false });
        this.senderLastName.setValue(this.lastName.value, { emitEvent: false });
        this.senderPhoneNumber.setValue(this.phoneNumber.value, { emitEvent: false });
        this.senderEmail.setValue(this.email.value, { emitEvent: false });
      }
      this.dispatchPersonalData();
    });

    this.personalDataForm.statusChanges.pipe(debounceTime(500), takeUntil(this.$destroy)).subscribe(() => {
      this.store.dispatch(SetSecondFormStatus({ isValid: this.personalDataForm.valid }));
    });
    this.store.dispatch(SetSecondFormStatus({ isValid: this.personalDataForm.valid }));
  }

  dispatchPersonalData(): void {
    const personalData: PersonalData = {
      ...this.personalData,
      ...this.personalDataForm.value
    };

    this.store.dispatch(SetPersonalData({ personalData }));
  }

  getFormValues(): boolean {
    return true;
  }

  onCancel(): void {
    const matDialogRef = this.dialog.open(WarningPopUpComponent, this.popupConfig);

    matDialogRef
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.router.navigate(['ubs']);
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
