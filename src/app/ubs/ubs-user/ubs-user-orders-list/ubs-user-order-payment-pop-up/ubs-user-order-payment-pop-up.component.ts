import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderService } from 'src/app/ubs/ubs/services/order.service';
import { ResponceOrderFondyModel } from '../models/ResponceOrderFondyModel';
import { OrderClientDto } from '../models/OrderClientDto';
import { IOrderDetailsUser } from '../models/IOrderDetailsUser.interface';
import { ICertificate, ICertificatePayment, ICertificateResponse } from '../models/ICertificate.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { IOrderData } from '../models/IOrderData.interface';
import { UBSOrderFormService } from 'src/app/ubs/ubs/services/ubs-order-form.service';
import { MatRadioChange } from '@angular/material/radio';
import { IBonusInfo } from '../models/IBonusInfo.interface';
import { Masks, Patterns } from 'src/assets/patterns/patterns';
import { IProcessOrderResponse } from 'src/app/ubs/ubs/models/ubs.interface';

@Component({
  selector: 'app-ubs-user-order-payment-pop-up',
  templateUrl: './ubs-user-order-payment-pop-up.component.html',
  styleUrls: ['./ubs-user-order-payment-pop-up.component.scss']
})
export class UbsUserOrderPaymentPopUpComponent implements OnInit {
  private localStorageService: LocalStorageService;
  private ubsOrderFormService: UBSOrderFormService;
  private orderService: OrderService;
  selectedRadio: string;
  certificatePattern = Patterns.serteficatePattern;
  certificateMask = Masks.certificateMask;
  orderDetailsForm: FormGroup;
  certificateStatus: boolean[] = [];
  orderClientDto: OrderClientDto;
  selectedPayment: string;
  isUseBonuses: boolean;
  liqPayButtonForm: SafeHtml;
  liqPayButton: NodeListOf<HTMLElement>;
  dataLoadingLiqPay: boolean;
  isLiqPayLink: boolean;
  isCertBeenUsed = false;
  usedCertificates: string[] = [];
  overpayment: number;

  userOrder: IOrderDetailsUser = {
    id: this.data.orderId,
    sum: this.data.price,
    bonusValue: this.data.bonuses
  };

  userCertificate: ICertificate = {
    certificateStatusActive: false,
    certificateError: false,
    creationDate: [],
    dateOfUse: [],
    expirationDate: [],
    certificateSum: 0,
    certificates: []
  };

  bonusInfo: IBonusInfo = {
    left: 0,
    used: 0
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IOrderData,
    public dialogRef: MatDialogRef<UbsUserOrderPaymentPopUpComponent>,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    public router: Router,
    private injector: Injector
  ) {
    this.localStorageService = injector.get(LocalStorageService);
    this.ubsOrderFormService = injector.get(UBSOrderFormService);
    this.orderService = injector.get(OrderService);
  }

  ngOnInit(): void {
    this.initForm();
    this.isLiqPayLink = false;
    this.isUseBonuses = false;
    this.dataLoadingLiqPay = false;
    this.certificateStatus.push(true);
    this.orderClientDto = new OrderClientDto();
  }

  createCertificateItem(): FormGroup {
    return this.fb.group({
      certificateCode: [null, [Validators.minLength(8), Validators.pattern(this.certificatePattern)]],
      certificateSum: [0, [Validators.min(0)]],
      certificateStatus: [null]
    });
  }

  initForm(): void {
    this.orderDetailsForm = this.fb.group({
      bonus: ['no', [Validators.required]],
      paymentSystem: ['Liqpay', [Validators.required]],
      formArrayCertificates: this.fb.array([this.createCertificateItem()])
    });
  }

  get formBonus(): FormControl {
    return this.orderDetailsForm.get('bonus') as FormControl;
  }

  get formArrayCertificates(): FormArray {
    return this.orderDetailsForm.get('formArrayCertificates') as FormArray;
  }

  get formPaymentSystem(): FormControl {
    return this.orderDetailsForm.get('paymentSystem') as FormControl;
  }

  certificateSubmit(index: number, certificate: FormControl | AbstractControl): void {
    this.isCertBeenUsed = false;
    if (!this.usedCertificates || !this.usedCertificates.some((item, ind) => item === certificate.value.certificateCode && ind !== index)) {
      this.userCertificate.certificates.push(certificate.value);

      this.calculateCertificate(certificate);
      this.certificateStatus[index] = false;
      this.usedCertificates.push(certificate.value.certificateCode);
    } else {
      this.isCertBeenUsed = true;
    }
  }

  checkIfCertBeenUsed(): boolean {
    return this.isCertBeenUsed;
  }

  calculateCertificate(certificate: FormControl | AbstractControl): void {
    this.userCertificate.certificateSum = 0;
    this.userCertificate.certificateStatusActive = false;
    this.orderService.processCertificate(certificate.value.certificateCode).subscribe({
      next: (response: ICertificateResponse) => {
        if (response.certificateStatus === 'ACTIVE') {
          this.userCertificate.certificateSum = response.points;
          certificate.value.certificateSum = response.points;

          if (this.formBonus.value === 'yes') {
            this.resetBonuses();
            this.calculateUserOrderSumWithCertificate(response.points);
            this.calculateBonuses();
          } else {
            this.calculateUserOrderSumWithCertificate(response.points);
          }

          this.userCertificate.certificateStatusActive = true;
        } else {
          this.userCertificate.certificateError = true;
        }
        this.userCertificate.creationDate.push(this.certificateDateTreat(response.creationDate));
        this.userCertificate.expirationDate.push(this.certificateDateTreat(response.expirationDate));
        this.userCertificate.dateOfUse.push(this.certificateDateTreat(response.dateOfUse));
        certificate.value.certificateStatus = response.certificateStatus;
      },
      error: (error) => {
        if (error.status === 404) {
          this.userCertificate.certificateError = true;
        }
        this.userCertificate.creationDate.push(null);
        this.userCertificate.expirationDate.push(null);
        this.userCertificate.dateOfUse.push(null);
      }
    });
  }

  private calculateUserOrderSumWithCertificate(certificateSum: number): void {
    if (this.userOrder.sum > certificateSum) {
      this.overpayment = 0;
      this.userOrder.sum = this.userOrder.sum - certificateSum;
    } else {
      this.overpayment = certificateSum - this.userOrder.sum;
      this.userOrder.sum = 0;
    }
  }

  private certificateDateTreat(date: string): string {
    return date?.split('-').reverse().join('.');
  }

  deleteCertificate(index: number, certificate: FormControl | AbstractControl): void {
    const certSum = this.formArrayCertificates.value.reduce(
      (certificatesSum: number, certificateItem: ICertificatePayment) => certificatesSum + certificateItem.certificateSum,
      0
    );
    const priceOverrun = this.data.price < certSum ? certSum - this.data.price : 0;

    if (certificate.value.certificateSum > priceOverrun) {
      this.userOrder.sum = this.userOrder.sum + certificate.value.certificateSum - priceOverrun;
      this.overpayment = 0;
    } else {
      this.overpayment = priceOverrun - certificate.value.certificateSum;
    }

    this.usedCertificates = this.usedCertificates.filter(
      (usedCertificateCode) => usedCertificateCode !== certificate.value.certificateCode
    );

    if (this.formBonus.value === 'yes' && this.userOrder.sum >= this.bonusInfo.left) {
      this.userOrder.sum -= this.bonusInfo.left;
      this.bonusInfo.used += this.bonusInfo.left;
      this.bonusInfo.left = 0;
    } else if (this.formBonus.value === 'yes') {
      this.bonusInfo.used += this.userOrder.sum;
      this.bonusInfo.left = this.bonusInfo.left - this.userOrder.sum;
      this.userOrder.sum = 0;
    }
    this.orderClientDto.pointsToUse = this.bonusInfo.used;

    if (this.formArrayCertificates.controls.length > 1) {
      this.certificateStatus.splice(index, 1);
      this.formArrayCertificates.removeAt(index);
    } else {
      this.certificateStatus[index] = true;
      this.formArrayCertificates.controls[index].reset();
    }

    this.userCertificate.certificates.splice(index, 1);
    this.userCertificate.creationDate.splice(index, 1);
    this.userCertificate.expirationDate.splice(index, 1);
    this.userCertificate.dateOfUse.splice(index, 1);
    this.userCertificate.certificateStatusActive = !!this.userCertificate.certificates.length;
    this.userCertificate.certificateError = this.formArrayCertificates.value.some(
      (certificateItem: ICertificatePayment) => certificateItem.certificateStatus !== 'ACTIVE' && certificateItem.certificateStatus !== null
    );
  }

  addNewCertificate(): void {
    this.formArrayCertificates.push(this.createCertificateItem());
    this.userCertificate.certificateStatusActive = false;
    this.certificateStatus.push(true);
  }

  fillOrderClientDto(): void {
    this.orderClientDto.orderId = this.userOrder.id;
    if (this.userCertificate.certificates.length) {
      this.orderClientDto.certificates = [];
      this.userCertificate.certificates.forEach((certificate) => {
        this.orderClientDto.certificates.push(certificate.certificateCode);
      });
    }
  }

  formOrderWithoutPaymentSystems(id: number): void {
    this.ubsOrderFormService.transferOrderId(id);
    this.ubsOrderFormService.setOrderResponseErrorStatus(false);
    this.ubsOrderFormService.setOrderStatus(true);
  }

  redirectionToConfirmPage(): void {
    this.formOrderWithoutPaymentSystems(this.orderClientDto.orderId);
    this.router.navigate(['ubs', 'confirm']);
  }

  private redirectToExternalUrl(url: string): void {
    document.location.href = url;
  }

  processOrder(): void {
    this.dataLoadingLiqPay = true;
    this.fillOrderClientDto();
    this.localStorageService.clearPaymentInfo();
    this.localStorageService.setUserPagePayment(true);

    if (this.formPaymentSystem.value === 'Liqpay') {
      this.orderService.processOrderFondyFromUserOrderList(this.orderClientDto).subscribe({
        next: (response: ResponceOrderFondyModel) => {
          if (response.link) {
            this.processWayForPay(response);
          } else {
            this.redirectionToConfirmPage();
            this.dialogRef.close();
          }
        },
        error: () => {
          this.dataLoadingLiqPay = false;
        }
      });
    }
  }

  processWayForPay(response: IProcessOrderResponse): void {
    this.localStorageService.setUbsPaymentOrderId(response.orderId);
    if (response.link) {
      this.redirectToExternalUrl(response.link);
    }
  }

  orderOptionPayment(event: Event): void {
    this.selectedPayment = (event.target as HTMLInputElement).value;
    this.fillOrderClientDto();
  }

  bonusOption(event: MatRadioChange): void {
    if (event.value === 'yes') {
      this.isUseBonuses = true;
      this.calculateBonuses();
    } else {
      this.resetBonuses();
      this.isUseBonuses = false;
    }
  }

  private calculateBonuses(): void {
    if (this.userOrder.sum > this.userOrder.bonusValue) {
      this.userOrder.sum -= this.userOrder.bonusValue;
      this.bonusInfo.used = this.userOrder.bonusValue;
      this.bonusInfo.left = 0;
    } else {
      this.bonusInfo.used = this.userOrder.sum;
      this.bonusInfo.left = this.userOrder.bonusValue - this.userOrder.sum;
      this.userOrder.sum = 0;
    }
    this.orderClientDto.pointsToUse = this.bonusInfo.used;
  }

  private resetBonuses(): void {
    this.userOrder.sum += this.bonusInfo.used;
    this.bonusInfo.left = 0;
    this.bonusInfo.used = 0;
  }
}
