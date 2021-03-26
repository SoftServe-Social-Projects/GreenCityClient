import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import { ShareFormService } from '../../services/share-form.service';
import { IOrder } from './order.interface';
import { IUserOrder } from './shared/userOrder.interface';
import { UserOrder } from './shared/userOrder.model';

@Component({
  selector: 'app-order-details-form',
  templateUrl: './order-details-form.component.html',
  styleUrls: ['./order-details-form.component.scss']
})

export class OrderDetailsFormComponent implements OnInit {
  orderDetailsForm: FormGroup;
  showTotal = 0;
  total = 0;
  finalSum = 0;
  points: number;
  pointsUsed = 0;
  displayMes = false;
  displayCert = false;
  displayShop = false;
  addCert = false;
  onSubmit = true;
  order: {};
  orders: IOrder;
  certificateMask = '0000-0000';
  certificatePattern = /(?!0000)\d{4}-(?!0000)\d{4}/;
  certificates = [];
  certificateSum = 0;
  certSize = false;
  showCertificateUsed = 0;
  certificateLeft = 0;
  certMessage: string;
  userOrder: IUserOrder;
  object: {};
  private destroy: Subject<boolean> = new Subject<boolean>();

  constructor(private fb: FormBuilder,
    private orderService: OrderService,
    private shareFormService: ShareFormService) { }

  get bagNumUbs() {
    return this.orderDetailsForm.get('bagNumUbs');
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

  ngOnInit(): void {
    this.shareFormService.objectSource
      .pipe(
        takeUntil(this.destroy)
      )
      .subscribe(object => {
        this.object = object;
      });

    this.orderService.getOrders()
      .pipe(
        takeUntil(this.destroy)
      )
      .subscribe(data => {
        this.orders = data;
        this.initForm();
      });

    this.orderDetailsForm = this.fb.group({
      bagServiceUbs: [{ value: '', disabled: true }],
      bagNumUbs: [0],
      bagSizeUbs: [{ value: '', disabled: true }],
      bagPriceUbs: [{ value: '', disabled: true }],
      bagSumUbs: [{ value: '0 грн', disabled: true }],
      bagServiceClothesXL: [{ value: '', disabled: true }],
      bagNumClothesXL: [0, Validators.required],
      bagSizeClothesXL: [{ value: '', disabled: true }],
      bagPriceClothesXL: [{ value: '', disabled: true }],
      bagSumClothesXL: [{ value: '0 грн', disabled: true }],
      bagServiceClothesM: [{ value: '', disabled: true }],
      bagNumClothesM: [0],
      bagSizeClothesM: [{ value: '', disabled: true }],
      bagPriceClothesM: [{ value: '', disabled: true }],
      bagSumClothesM: [{ value: '0 грн', disabled: true }],
      certificate: ['', [Validators.minLength(8), Validators.pattern(this.certificatePattern)]],
      orderComment: [''],
      bonus: ['no'],
      shop: ['no'],
      additionalCertificates: this.fb.array([]),
      additionalOrders: this.fb.array([''])
    });
  }

  initForm(): void {
    this.orderDetailsForm.patchValue({
      bagServiceUbs: this.orders.allBags[0].name,
      bagSizeUbs: `${this.orders.allBags[0].capacity} л`,
      bagPriceUbs: `${this.orders.allBags[0].price} грн`,
      bagServiceClothesXL: this.orders.allBags[1].name,
      bagSizeClothesXL: `${this.orders.allBags[1].capacity} л`,
      bagPriceClothesXL: `${this.orders.allBags[1].price} грн`,
      bagServiceClothesM: this.orders.allBags[2].name,
      bagSizeClothesM: `${this.orders.allBags[2].capacity} л`,
      bagPriceClothesM: `${this.orders.allBags[2].price} грн`
    });
    this.points = this.orders.points;
  }

  calculateTotal(): void {
    this.total = this.orderDetailsForm.value.bagNumUbs * this.orders.allBags[0].price +
      this.orderDetailsForm.value.bagNumClothesXL * this.orders.allBags[1].price +
      this.orderDetailsForm.value.bagNumClothesM * this.orders.allBags[2].price;
    this.showTotal = this.total;
    if (this.total < 500) {
      this.displayMes = true;
      this.onSubmit = true;
    } else {
      this.displayMes = false;
      this.onSubmit = false;
    }
    this.finalSum = this.total;
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

  calculate(): void {
    this.orderDetailsForm.patchValue({
      bagSumUbs: `${this.orderDetailsForm.value.bagNumUbs * this.orders.allBags[0].price} грн`,
      bagSumClothesXL: `${this.orderDetailsForm.value.bagNumClothesXL * this.orders.allBags[1].price} грн`,
      bagSumClothesM: `${this.orderDetailsForm.value.bagNumClothesM * this.orders.allBags[2].price} грн`,
    });
    this.calculateTotal();
  }

  calculatePoints(): void {
    if (this.certificateSum <= 0) {
      this.showTotal = this.total;
      this.points > this.total ? this.pointsUsed = this.total : this.pointsUsed = this.points;
      this.points > this.total ? this.points = this.points - this.total : this.points = 0;
      this.points > this.total ? this.total = 0 : this.total = this.total - this.pointsUsed;
      this.finalSum = this.showTotal - this.pointsUsed - this.certificateSum;
    } else {
      this.points > this.total ? this.pointsUsed = this.total - this.certificateSum : this.pointsUsed = this.points;
      this.points > this.total ? this.total = 0 : this.total = this.total - this.pointsUsed;
      this.points > this.showTotal ? this.points = this.points - this.showTotal : this.points = 0;
      this.finalSum = this.showTotal - this.pointsUsed - this.certificateSum;
    }
  }

  resetPoints(): void {
    this.total = this.orderDetailsForm.value.bagNumUbs * this.orders.allBags[0].price +
      this.orderDetailsForm.value.bagNumClothesXL * this.orders.allBags[1].price +
      this.orderDetailsForm.value.bagNumClothesM * this.orders.allBags[2].price;
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
    this.additionalCertificates.push(this.fb.control('', [Validators.minLength(8), Validators.pattern(/(?!0000)\d{4}-(?!0000)\d{4}/)]));
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
        this.orderService.processCertificate(certificate)
          .pipe(
            takeUntil(this.destroy)
          )
          .subscribe(cert => {
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
    if (cert.certificateStatus === 'ACTIVE' || cert.certificateStatus === 'NEW') {
      this.certificateSum = this.certificateSum + cert.certificatePoints;
      this.certMessage = `Сертифiкат на cуму ${cert.certificatePoints} грн активовано. Строк дії сертифікату - до ${cert.certificateDate}`;
      this.displayCert = true;
    } else if (cert.certificateStatus === 'USED') {
      this.certificateSum = this.certificateSum;
      this.certMessage = `Сертифiкат вже використано. Строк дії сертифікату - до ${cert.certificateDate}`;
      this.displayCert = false;
    }
  }

  submit(): void {
    const ubs = Object.assign({ id: 1, amount: this.orderDetailsForm.value.bagNumUbs });
    const clothesXL = Object.assign({ id: 2, amount: this.orderDetailsForm.value.bagNumClothesXL });
    const clothesM = Object.assign({ id: 3, amount: this.orderDetailsForm.value.bagNumClothesM });
    const newOrder: IUserOrder = new UserOrder(
      [ubs, clothesXL, clothesM],
      this.pointsUsed,
      this.certificates,
      this.additionalOrders.value,
      this.orderDetailsForm.value.orderComment);
    const paymentBill = {
      amountUbs: ubs.amount,
      amountClothesXL: clothesXL.amount,
      amountClothesM: clothesM.amount,
      sumUbs: this.orderDetailsForm.get('bagSumUbs').value,
      sumClothesXL: this.orderDetailsForm.get('bagSumClothesXL').value,
      sumClothesM: this.orderDetailsForm.get('bagSumClothesM').value,
      certificatesSum: this.showCertificateUsed,
      pointsSum: this.pointsUsed,
      total: this.showTotal,
      finalSum: this.finalSum,
    }
    this.shareFormService.changeObject(newOrder);
    this.shareFormService.finalBillObject(paymentBill);
  }
}
