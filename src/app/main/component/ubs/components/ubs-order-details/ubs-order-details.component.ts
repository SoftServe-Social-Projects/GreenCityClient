import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FormBaseComponent } from '@shared/components/form-base/form-base.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Bag, FinalOrder, OrderDetails } from '../../models/ubs.interface';
import { OrderService } from '../../services/order.service';
import { UBSOrderFormService } from '../../services/ubs-order-form.service';
import { CertificateStatus } from '../../certificate-status.enum';
import { UbsOrderLocationPopupComponent } from './ubs-order-location-popup/ubs-order-location-popup.component';


@Component({
  selector: 'app-ubs-order-details',
  templateUrl: './ubs-order-details.component.html',
  styleUrls: ['./ubs-order-details.component.scss']
})
export class UBSOrderDetailsComponent extends FormBaseComponent implements OnInit, OnDestroy {
  orders: OrderDetails;
  bags: Bag[];
  orderDetailsForm: FormGroup;
  certStatuses = [];
  minOrderValue = 500;
  showTotal = 0;
  pointsUsed = 0;
  certificates = [];
  certificateSum = 0;
  total = 0;
  finalSum = 0;
  minAmountOfBigBags: number;
  totalOfBigBags: number;
  cancelCertBtn = false;
  points: number;
  displayMinOrderMes = false;
  displayMinBigBagsMes = false;
  certBtnActivate = false;
  displayMes = false;
  displayCert = false;
  displayShop = false;
  addCert = false;
  onSubmit = true;
  order: {};
  certificateMask = '0000-0000';
  ecoStoreMask = '0000000000';
  servicesMask = '000';
  certificatePattern = /(?!0000)\d{4}-(?!0000)\d{4}/;
  commentPattern = /^[i\s]{0,255}(.){0,255}[i\s]{0,255}$/;
  additionalOrdersPattern = /^\d{10}$/;
  displayOrderBtn = false;
  certSize = false;
  showCertificateUsed = 0;
  certificateLeft = 0;
  certDate: string;
  certStatus: string;
  userOrder: FinalOrder;
  object: {};
  private destroy: Subject<boolean> = new Subject<boolean>();
  public currentLanguage: string;
  public certificateError = false;
  bonusesRemaining: boolean;
  isDialogOpen = false;
  popupConfig = {
    hasBackdrop: true,
    closeOnNavigation: true,
    disableClose: true,
    panelClass: 'popup-dialog-container',
    data: {
      popupTitle: 'confirmation.title',
      popupSubtitle: 'confirmation.subTitle',
      popupConfirm: 'confirmation.cancel',
      popupCancel: 'confirmation.dismiss'
    }
  };

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private shareFormService: UBSOrderFormService,
    private localStorageService: LocalStorageService,
    public renderer: Renderer2,
    router: Router,
    dialog: MatDialog
  ) {
    super(router, dialog);
    this.initForm();
  }

  ngOnInit(): void {
    this.openLocationDialog();
    this.orderService.locationSubject.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.takeOrderData();
      this.subscribeToLangChange();
    });
  }

  getFormValues(): boolean {
    return this.showTotal > 0;
  }

  initForm() {
    this.orderDetailsForm = this.fb.group({
      certificate: new FormControl('', [Validators.minLength(8), Validators.pattern(this.certificatePattern)]),
      orderComment: new FormControl(''),
      bonus: new FormControl('no'),
      shop: new FormControl('no'),
      additionalCertificates: this.fb.array([]),
      additionalOrders: this.fb.array(['']),
      orderSum: new FormControl(0, [Validators.required, Validators.min(500)])
    });
  }

  openLocationDialog() {
    this.isDialogOpen = true;
    this.dialog.open(UbsOrderLocationPopupComponent, {
      hasBackdrop: true,
      disableClose: true
    });

    this.dialog.afterAllClosed.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.isDialogOpen = false;
    });
  }

  checkTotalBigBags() {
    this.bags.forEach((bag) => {
      if (bag.capacity === 120) {
        const q1 = this.orderDetailsForm.controls.quantity1;
        const q2 = this.orderDetailsForm.controls.quantity2;
        this.totalOfBigBags = +q1.value + +q2.value;
      }
    });
    setTimeout(() => this.checkForBigBagsMessage());
  }

  checkForBigBagsMessage() {
    if (this.minAmountOfBigBags > this.totalOfBigBags) {
      this.displayMinBigBagsMes = true;
    } else {
      this.displayMinBigBagsMes = false;
    }
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageSubject.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.currentLanguage = this.localStorageService.getCurrentLanguage();
      const inputsQuantity = [];
      this.bags.forEach((a) => {
        inputsQuantity.push(a.quantity === undefined || a.quantity === null ? null : a.quantity);
        a.quantity = null;
      });
      this.bags = this.orders.bags;
      this.filterBags();
      this.bags.forEach((b) => {
        b.quantity = inputsQuantity.shift();
      });
      this.calculateTotal();
    });
  }

  public takeOrderData() {
    this.currentLanguage = this.localStorageService.getCurrentLanguage();
    this.orderService
      .getOrders()
      .pipe(takeUntil(this.destroy))
      .subscribe((orderData: OrderDetails) => {
        this.orders = this.shareFormService.orderDetails;
        this.minAmountOfBigBags = orderData.minAmountOfBigBags;
        this.bags = this.orders.bags;
        this.points = this.orders.points;
        this.certificateLeft = orderData.points;
        this.bags.forEach((bag) => {
          bag.quantity = null;
          this.orderDetailsForm.addControl('quantity' + String(bag.id), new FormControl(0, [Validators.min(0), Validators.max(999)]));
        });
        this.filterBags();
      });
  }

  private filterBags(): void {
    this.bags = this.orders.bags.filter((value) => value.code === this.currentLanguage).sort((a, b) => a.price - b.price);
    this.bags = [this.bags[1], this.bags[2], this.bags[0]];
  }

  changeForm() {
    this.orderDetailsForm.patchValue({
      orderSum: this.showTotal
    });
  }

  changeOrderDetails() {
    this.shareFormService.orderDetails.pointsToUse = this.pointsUsed;
    this.shareFormService.orderDetails.certificates = this.certificates;
    this.shareFormService.orderDetails.additionalOrders = this.additionalOrders.value;
    this.shareFormService.orderDetails.orderComment = this.orderDetailsForm.value.orderComment;
    this.shareFormService.orderDetails.certificatesSum = this.showCertificateUsed;
    this.shareFormService.orderDetails.pointsSum = this.pointsUsed;
    this.shareFormService.orderDetails.total = this.showTotal;
    this.shareFormService.orderDetails.finalSum = this.finalSum;
    this.shareFormService.changeOrderDetails();
  }

  get certificate() {
    return this.orderDetailsForm.get('certificate');
  }

  get additionalCertificates() {
    return this.orderDetailsForm.get('additionalCertificates') as FormArray;
  }

  get additionalOrders() {
    return this.orderDetailsForm.get('additionalOrders') as FormArray;
  }

  get orderComment() {
    return this.orderDetailsForm.get('orderComment') as FormArray;
  }

  get shop() {
    return this.orderDetailsForm.get('shop') as FormArray;
  }

  private calculateTotal(): void {
    this.total = 0;
    this.bags.forEach((bag) => {
      this.total += bag.price * bag.quantity;
    });
    this.showTotal = this.total;
    this.changeForm();

    if (this.total < this.minOrderValue && this.orderDetailsForm.dirty) {
      this.displayMinOrderMes = true;
      this.onSubmit = true;
    } else {
      this.displayMinOrderMes = false;
      this.onSubmit = false;
    }

    this.finalSum = this.total - this.pointsUsed;
    if (this.certificateSum > 0) {
      if (this.total > this.certificateSum) {
        this.certificateLeft = 0;
        this.finalSum = this.total - this.certificateSum - this.pointsUsed;
        this.showCertificateUsed = this.certificateSum;
      } else {
        this.finalSum = 0;
        this.certificateLeft = this.certificateSum - this.total;
        this.showCertificateUsed = this.total;
        this.points = this.orders.points;
      }
      this.bonusesRemaining = this.certificateSum > 0;
    }
    this.changeOrderDetails();
  }

  public ecoStoreValidation() {
    const orderValues = [...new Set(this.additionalOrders.value)];
    const checkDuplicate = orderValues.length === this.additionalOrders.length;
    let counter = 0;
    this.additionalOrders.controls.forEach((controller) => {
      if (controller.valid && controller.dirty && controller.value !== '' && checkDuplicate) {
        counter++;
      }
    });

    if (counter === this.additionalOrders.controls.length) {
      this.displayOrderBtn = true;
    } else {
      this.displayOrderBtn = false;
    }
  }

  public changeShopRadioBtn() {
    this.orderDetailsForm.controls.shop.setValue('yes');
  }

  public selectPointsRadioBtn(event: KeyboardEvent, radioButtonValue: string) {
    if (['Enter', 'Space', 'NumpadEnter'].includes(event.code)) {
      this.orderDetailsForm.controls.bonus.setValue(radioButtonValue);
    }
  }

  public selectShopRadioBtn(event: KeyboardEvent, radioButtonValue: string) {
    if (['Enter', 'Space', 'NumpadEnter'].includes(event.code)) {
      this.orderDetailsForm.controls.shop.setValue(radioButtonValue);
      radioButtonValue === 'yes'
        ? this.renderer.selectRootElement(`#index${this.additionalOrders.controls.length - 1}`).focus()
        : this.clearOrderValues();
    }
  }

  isDisabled(): number {
    return this.orderDetailsForm.controls.shop.value === 'yes' ? 0 : -1;
  }

  clearOrderValues(): void {
    this.additionalOrders.controls[0].setValue('');
    if (this.additionalOrders.controls.length > 1) {
      this.additionalOrders.controls.splice(1);
    }
    this.ecoStoreValidation();
  }

  onQuantityChange(): void {
    this.bags.forEach((bag) => {
      const valueName = 'quantity' + String(bag.id);
      const orderFormBagController = this.orderDetailsForm.controls[valueName];
      const inputValue = `${Number(orderFormBagController.value)}`;
      orderFormBagController.setValue(inputValue);

      if (Number(orderFormBagController.value) > 0) {
        bag.quantity = orderFormBagController.value;
      } else {
        orderFormBagController.setValue('');
        bag.quantity = null;
      }
    });
    this.checkTotalBigBags();
    this.calculateTotal();
  }

  calculatePoints(): void {
    if (this.certificateSum <= 0) {
      this.calculatePointsWithoutCertificate();
    } else {
      this.calculatePointsWithCertificate();
    }

    this.finalSum = this.showTotal - this.pointsUsed - this.certificateSum;
    if (this.finalSum < 0) {
      this.finalSum = 0;
    }
  }

  private calculatePointsWithoutCertificate() {
    this.showTotal = this.total;
    const totalSumIsBiggerThanPoints = this.points > this.finalSum;
    if (totalSumIsBiggerThanPoints) {
      this.pointsUsed += this.finalSum;
      this.points = this.points - this.finalSum;
      this.total = 0;
      return;
    }
    this.pointsUsed = this.points;
    this.points = 0;
    this.total = this.total - this.pointsUsed;
  }

  private calculatePointsWithCertificate() {
    const totalSumIsBiggerThanPoints = this.points > this.finalSum;

    if (totalSumIsBiggerThanPoints) {
      this.pointsUsed = this.total - this.certificateSum;
      this.total = 0;
    } else {
      this.pointsUsed = this.points;
      this.total = this.total - this.pointsUsed;
    }
    this.points >= this.finalSum ? (this.points = this.points - this.finalSum) : (this.points = 0);
  }

  resetPoints(): void {
    this.showTotal = this.total;
    this.certificateSum = 0;
    this.finalSum = this.total;
    this.points = this.orders.points;
    this.certificateReset(true);
    this.calculateTotal();
  }

  addOrder(): void {
    const additionalOrdersArray = this.orderDetailsForm.get('additionalOrders') as FormArray;
    additionalOrdersArray.markAsUntouched();
    const additionalOrder = new FormControl('', [Validators.minLength(10)]);
    this.additionalOrders.push(additionalOrder);
    this.ecoStoreValidation();
    setTimeout(() => {
      this.renderer.selectRootElement(`#index${this.additionalOrders.controls.length - 1}`).focus();
    }, 0);
  }

  deleteOrder(index: number): void {
    const orders = this.additionalOrders;
    orders.length > 1 ? orders.removeAt(index) : orders.reset(['']);
    this.changeOrderDetails();
  }

  removeOrder(event: KeyboardEvent, index: number) {
    if (['Enter', 'Space', 'NumpadEnter'].includes(event.code)) {
      this.deleteOrder(index);
    }
  }

  disableAddCertificate() {
    return this.certificates.length === this.additionalCertificates.length;
  }

  addCertificate(): void {
    this.additionalCertificates.push(this.fb.control('', [Validators.minLength(8), Validators.pattern(/(?!0000)\d{4}-(?!0000)\d{4}/)]));
  }

  private clearAdditionalCertificate(index: number) {
    this.additionalCertificates.removeAt(index);
    this.certStatuses.splice(index, 1);
    this.calculateCertificates(this.certificates);
  }

  deleteCertificate(index: number): void {
    if (this.displayCert === false) {
      this.certificates.splice(index, 1);
      this.clearAdditionalCertificate(index);
    } else {
      this.certificates.splice(index + 1, 1);
      this.clearAdditionalCertificate(index);
    }
  }

  addedCertificateSubmit(index: number): void {
    if (!this.certificates.includes(this.additionalCertificates.value[index])) {
      this.certificates.push(this.additionalCertificates.value[index]);
      this.certStatuses.push(true);
      this.calculateCertificates(this.certificates);
    }
  }

  calculateCertificates(arr): void {
    if (arr.length > 0) {
      this.cancelCertBtn = true;
      arr.forEach((certificate, index) => {
        this.orderService
          .processCertificate(certificate)
          .pipe(takeUntil(this.destroy))
          .subscribe(
            (cert) => {
              this.certificateMatch(cert);
              if (this.total < this.certificateSum) {
                this.certSize = true;
              }
              this.certificateError = false;
              this.calculateTotal();
              this.cancelCertBtn = false;
            },
            (error) => {
              this.certBtnActivate = false;
              this.cancelCertBtn = false;
              if (error.status === 404) {
                arr.splice(index, 1);
                this.certificateError = true;
              }
            }
          );
      });
    } else {
      this.calculateTotal();
    }
    this.certificateSum = 0;
  }

  certificateSubmit(): void {
    if (!this.certificates.includes(this.orderDetailsForm.value.certificate)) {
      this.certBtnActivate = true;
      this.certificates.push(this.orderDetailsForm.value.certificate);
      this.calculateCertificates(this.certificates);
    } else {
      this.orderDetailsForm.patchValue({ certificate: '' });
    }
  }

  certificateReset(resetMessage: boolean): void {
    if (resetMessage) {
      this.certDate = '';
      this.certStatus = '';
      this.addCert = true;
    }

    this.bonusesRemaining = false;
    this.showCertificateUsed = null;
    this.addCert = false;
    this.displayCert = false;
    this.certificates = [];
    this.certSize = false;
    this.certificateLeft = 0;
    this.certificateSum = 0;
    this.orderDetailsForm.patchValue({ certificate: '' });
    this.calculateCertificates(this.certificates);
  }

  certificateMatch(cert): void {
    if (cert.certificateStatus === CertificateStatus.ACTIVE || cert.certificateStatus === CertificateStatus.NEW) {
      this.certificateSum += cert.certificatePoints;
      this.displayCert = true;
      this.addCert = true;
    }
    if (cert.certificateStatus === CertificateStatus.EXPIRED || cert.certificateStatus === CertificateStatus.USED) {
      this.addCert = true;
    }
    this.certDate = this.certificateDateTreat(cert.certificateDate);
    this.certStatus = cert.certificateStatus;
    this.certBtnActivate = false;
  }

  private certificateDateTreat(date: string) {
    return date.split('-').reverse().join('-');
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}
