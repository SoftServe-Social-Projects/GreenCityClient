import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Bag, FinalOrder, OrderDetails } from '../../models/ubs.interface';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import { UBSOrderFormService } from '../../services/ubs-order-form.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { CertificateStatus } from '../../certificate-status.enum';

@Component({
  selector: 'app-ubs-order-details',
  templateUrl: './ubs-order-details.component.html',
  styleUrls: ['./ubs-order-details.component.scss'],
})
export class UBSOrderDetailsComponent implements OnInit, OnDestroy {

  orders: OrderDetails;
  bags: Bag[];
  orderDetailsForm: FormGroup;
  minOrderValue = 500;
  showTotal = 0;
  pointsUsed = 0;
  certificates = [];
  certificateSum = 0;
  total = 0;
  finalSum = 0;

  points: number;
  displayMes = false;
  displayCert = false;
  displayShop = false;
  addCert = false;
  onSubmit = true;
  order: {};
  certificateMask = '0000-0000';
  certificatePattern = /(?!0000)\d{4}-(?!0000)\d{4}/;

  certSize = false;
  showCertificateUsed = 0;
  certificateLeft = 0;
  certMessage: string;
  userOrder: FinalOrder;
  object: {};
  private destroy: Subject<boolean> = new Subject<boolean>();
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  certMessageFirst = '';
  certMessageFourth = '';
  certMessageFifth = '';

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private shareFormService: UBSOrderFormService,
    private translate: TranslateService,
    private localStorageService: LocalStorageService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.takeOrderData();
    this.localStorageService.languageBehaviourSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.translateWords('order-details.activated-certificate1', this.certMessageFirst);
        this.translateWords('order-details.activated-certificate4', this.certMessageFourth);
        this.translateWords('order-details.activated-certificate5', this.certMessageFifth);
      });
  }

  translateWords(key: string, variable) {
    return this.translate.get(key)
      .pipe(take(1))
      .subscribe(item => variable = item);
  }

  initForm() {
    this.orderDetailsForm = this.fb.group({
      certificate: new FormControl('', [Validators.minLength(8), Validators.pattern(this.certificatePattern)]),
      orderComment: new FormControl(''),
      bonus: new FormControl('no'),
      shop: new FormControl('no'),
      additionalCertificates: this.fb.array([]),
      additionalOrders: this.fb.array(['']),
      orderSum: new FormControl(0, [Validators.required, Validators.min(500)]),
    });
  }

  public takeOrderData() {
    this.orderService.getOrders().pipe(takeUntil(this.destroy)).subscribe((orderData: OrderDetails) => {
      this.orders = this.shareFormService.orderDetails;
      this.bags = this.orders.bags;
      this.points = this.orders.points;
      this.bags.forEach(bag => {
        bag.quantity = 0;
        this.orderDetailsForm.addControl(
          'quantity' + String(bag.id),
          new FormControl(0, [Validators.required, Validators.min(0), Validators.max(999)])
        );
      });
    });
  }

  changeForm() {
    this.orderDetailsForm.patchValue({
      orderSum: this.showTotal,
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

  get shop() {
    return this.orderDetailsForm.get('shop') as FormArray;
  }

  private calculateTotal(): void {
    this.total = 0;
    this.bags.forEach(bag => {
      this.total += bag.price * bag.quantity;
    });
    this.showTotal = this.total;
    this.changeForm();
    if (this.total < this.minOrderValue) {
      this.displayMes = true;
      this.onSubmit = true;
    } else {
      this.displayMes = false;
      this.onSubmit = false;
    }
    this.finalSum = this.total;
    this.changeOrderDetails();
    if (this.certificateSum > 0) {
      if (this.total > this.certificateSum) {
        this.certificateLeft = 0;
        this.finalSum = this.total - this.certificateSum - this.pointsUsed;
        this.showCertificateUsed = this.certificateSum;
      } else {
        this.finalSum = 0;
        this.certificateLeft = this.certificateSum - this.total;
        this.showCertificateUsed = this.total;
        this.points = this.orders.points + this.certificateLeft;
      }
      this.showCertificateUsed = this.certificateSum;
    }
  }

  clearOrderValues(): void {
    this.additionalOrders.controls.forEach(element => {
      element.setValue('');
    });
  }

  calculate(): void {
    this.bags.forEach(bag => {
      const valueName = 'quantity' + String(bag.id);
      bag.quantity = this.orderDetailsForm.controls[valueName].value;
    });
    this.calculateTotal();
  }

  calculatePoints(): void {
    if (this.certificateSum <= 0) {
      this.showTotal = this.total;
      this.points > this.total ? (this.pointsUsed = this.total) : (this.pointsUsed = this.points);
      this.points > this.total ? (this.points = this.points - this.total) : (this.points = 0);
      this.points > this.total ? (this.total = 0) : (this.total = this.total - this.pointsUsed);
      this.finalSum = this.showTotal - this.pointsUsed - this.certificateSum;
    } else {
      this.points > this.total ? (this.pointsUsed = this.total - this.certificateSum) : (this.pointsUsed = this.points);
      this.points > this.total ? (this.total = 0) : (this.total = this.total - this.pointsUsed);
      this.points > this.showTotal ? (this.points = this.points - this.showTotal) : (this.points = 0);
      this.finalSum = this.showTotal - this.pointsUsed - this.certificateSum;
    }
  }

  resetPoints(): void {
    this.showTotal = this.total;
    this.pointsUsed = 0;
    this.finalSum = this.total;
    this.points = this.orders.points;
    this.calculateTotal();
  }

  addOrder(): void {
    const additionalOrder = new FormControl('', [Validators.minLength(10)]);
    this.additionalOrders.push(additionalOrder);
  }

  addCertificate(): void {
    this.additionalCertificates.push(
      this.fb.control('', [Validators.minLength(8), Validators.pattern(/(?!0000)\d{4}-(?!0000)\d{4}/)])
    );
    this.addCert = false;
  }

  deleteCertificate(i): void {
    if (this.displayCert === false) {
      this.certificates.splice(i, 1);
      this.additionalCertificates.removeAt(i);
      this.calculateCertificates(this.certificates);
    } else {
      this.certificates.splice(i + 1, 1);
      this.additionalCertificates.removeAt(i);
      this.calculateCertificates(this.certificates);
    }
  }

  addedCertificateSubmit(i): void {
    if (!this.certificates.includes(this.additionalCertificates.value[i])) {
      this.certificates.push(this.additionalCertificates.value[i]);
      this.calculateCertificates(this.certificates);
    }
  }

  calculateCertificates(arr): void {
    if (arr.length > 0) {
      this.certificateSum = 0;
      for (const certificate of arr) {
        this.orderService.processCertificate(certificate).pipe(takeUntil(this.destroy))
          .subscribe((cert) => {
            this.certificateMatch(cert);
            if (this.total > this.certificateSum) {
              this.addCert = true;
            } else {
              this.addCert = false;
              this.certSize = true;
            }
            this.calculateTotal();
          });
      }
    } else {
      this.certificateSum = 0;
      this.calculateTotal();
    }
  }

  certificateSubmit(): void {
    if (!this.certificates.includes(this.orderDetailsForm.value.certificate)) {
      this.certificates.push(this.orderDetailsForm.value.certificate);
      this.calculateCertificates(this.certificates);
    } else {
      this.orderDetailsForm.patchValue({ certificate: '' });
    }
  }

  certificateReset(): void {
    this.showCertificateUsed = null;
    this.addCert = false;
    this.displayCert = false;
    this.certificates.splice(0, 1);
    this.certMessage = '';
    this.orderDetailsForm.patchValue({ certificate: '' });
    this.calculateCertificates(this.certificates);
  }

  certificateMatch(cert): void {
    if (
      cert.certificateStatus === CertificateStatus.ACTIVE ||
      cert.certificateStatus === CertificateStatus.NEW
    ) {
      this.certificateSum = this.certificateSum + cert.certificatePoints;
      this.certMessage = this.certMessageFirst + ' ' + cert.certificatePoints +
        ' ' + this.certMessageFourth + ' ' + cert.certificateDate;
      this.displayCert = true;
    } else if (cert.certificateStatus === CertificateStatus.USED) {
      this.certificateSum = this.certificateSum;
      this.certMessage = this.certMessageFifth + ' ' + cert.certificateDate;
      this.displayCert = false;
    }
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}
