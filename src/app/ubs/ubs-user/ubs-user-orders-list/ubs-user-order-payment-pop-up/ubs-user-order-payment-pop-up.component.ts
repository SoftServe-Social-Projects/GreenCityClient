import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderService } from 'src/app/ubs/ubs/services/order.service';
import { ResponceOrderFondyModel } from '../models/ResponceOrderFondyModel';
import { OrderClientDto } from '../models/OrderClientDto';
import { IOrderDetailsUser } from '../models/IOrderDetailsUser.interface';
import { ICertificate, ICertificatePayment, ICertificateResponse } from '../models/ICertificate.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ResponceOrderLiqPayModel } from '../models/ResponceOrderLiqPayModel';
import { Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { IOrderData } from '../models/IOrderData.interface';
import { UBSOrderFormService } from 'src/app/ubs/ubs/services/ubs-order-form.service';
import { MatRadioChange } from '@angular/material/radio';
import { IBonusInfo } from '../models/IBonusInfo.interface';
import { Masks, Patterns } from 'src/assets/patterns/patterns';

@Component({
  selector: 'app-ubs-user-order-payment-pop-up',
  templateUrl: './ubs-user-order-payment-pop-up.component.html',
  styleUrls: ['./ubs-user-order-payment-pop-up.component.scss']
})
export class UbsUserOrderPaymentPopUpComponent implements OnInit {
  private localStorageService: LocalStorageService;
  private ubsOrderFormService: UBSOrderFormService;
  private orderService: OrderService;
  public selectedRadio: string;
  public certificatePattern = Patterns.serteficatePattern;
  public certificateMask = Masks.certificateMask;
  public orderDetailsForm: FormGroup;
  public certificateStatus: boolean[] = [];
  public orderClientDto: OrderClientDto;
  public selectedPayment: string;
  public isUseBonuses: boolean;
  public liqPayButtonForm: SafeHtml;
  public liqPayButton: NodeListOf<HTMLElement>;
  public dataLoadingLiqPay: boolean;
  public isLiqPayLink: boolean;
  public isCertBeenUsed = false;
  public usedCertificates: string[] = [];

  public userOrder: IOrderDetailsUser = {
    id: this.data.orderId,
    sum: this.data.price,
    bonusValue: this.data.bonuses
  };

  public userCertificate: ICertificate = {
    certificateStatusActive: false,
    certificateError: false,
    creationDate: [],
    dateOfUse: [],
    expirationDate: [],
    certificateSum: 0,
    certificates: []
  };

  public bonusInfo: IBonusInfo = {
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

  public createCertificateItem(): FormGroup {
    return this.fb.group({
      certificateCode: [null, [Validators.minLength(8), Validators.pattern(this.certificatePattern)]],
      certificateSum: [0, [Validators.min(0)]],
      certificateStatus: [null]
    });
  }

  public initForm(): void {
    this.orderDetailsForm = this.fb.group({
      bonus: ['no', [Validators.required]],
      paymentSystem: ['Fondy', [Validators.required]],
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

  public certificateSubmit(index: number, certificate: FormControl): void {
    this.isCertBeenUsed = false;
    if (
      !this.usedCertificates ||
      !this.usedCertificates.some((item, ind) => {
        return item === certificate.value.certificateCode && ind !== index;
      })
    ) {
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

  public calculateCertificate(certificate: FormControl): void {
    this.userCertificate.certificateSum = 0;
    this.userCertificate.certificateStatusActive = false;
    this.orderService.processCertificate(certificate.value.certificateCode).subscribe(
      (response: ICertificateResponse) => {
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
      (error) => {
        if (error.status === 404) {
          this.userCertificate.certificateError = true;
        }
        this.userCertificate.creationDate.push(null);
        this.userCertificate.expirationDate.push(null);
        this.userCertificate.dateOfUse.push(null);
      }
    );
  }

  private calculateUserOrderSumWithCertificate(certificateSum: number): void {
    this.userOrder.sum = this.userOrder.sum > certificateSum ? this.userOrder.sum - certificateSum : 0;
  }

  private certificateDateTreat(date: string): string {
    return date?.split('-').reverse().join('-');
  }

  public deleteCertificate(index: number, certificate: FormControl): void {
    const certSum = this.formArrayCertificates.value.reduce(
      (certificatesSum: number, certificateItem: ICertificatePayment) => certificatesSum + certificateItem.certificateSum,
      0
    );
    const priceOverrun = this.data.price < certSum ? certSum - this.data.price : 0;
    this.userOrder.sum =
      certificate.value.certificateSum > priceOverrun
        ? this.userOrder.sum + certificate.value.certificateSum - priceOverrun
        : this.userOrder.sum;
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

  public addNewCertificate(): void {
    this.formArrayCertificates.push(this.createCertificateItem());
    this.userCertificate.certificateStatusActive = false;
    this.certificateStatus.push(true);
  }

  public fillOrderClientDto(): void {
    this.orderClientDto.orderId = this.userOrder.id;
    if (this.userCertificate.certificates.length) {
      this.orderClientDto.certificates = [];
      this.userCertificate.certificates.forEach((certificate) => {
        this.orderClientDto.certificates.push(certificate.certificateCode);
      });
    }
  }

  public formOrderWithoutPaymentSystems(id: number): void {
    this.ubsOrderFormService.transferOrderId(id);
    this.ubsOrderFormService.setOrderResponseErrorStatus(false);
    this.ubsOrderFormService.setOrderStatus(true);
  }

  public redirectionToConfirmPage(): void {
    this.formOrderWithoutPaymentSystems(this.orderClientDto.orderId);
    this.router.navigate(['ubs', 'confirm']);
  }

  private redirectToExternalUrl(url: string): void {
    document.location.href = url;
  }

  public processOrder(): void {
    this.dataLoadingLiqPay = true;
    this.fillOrderClientDto();
    this.localStorageService.clearPaymentInfo();
    this.localStorageService.setUserPagePayment(true);

    if (this.formPaymentSystem.value === 'Fondy') {
      this.orderService.processOrderFondyFromUserOrderList(this.orderClientDto).subscribe(
        (response: ResponceOrderFondyModel) => {
          if (response.link) {
            this.localStorageService.setUbsFondyOrderId(this.orderClientDto.orderId);
            this.redirectToExternalUrl(response.link);
          } else {
            this.redirectionToConfirmPage();
            this.dialogRef.close();
          }
        },
        () => {
          this.dataLoadingLiqPay = false;
        }
      );
    }

    if (this.formPaymentSystem.value === 'LiqPay') {
      this.orderService.processOrderLiqPayFromUserOrderList(this.orderClientDto).subscribe(
        (response: ResponceOrderLiqPayModel) => {
          if (!response.liqPayButton) {
            this.redirectionToConfirmPage();
            this.dialogRef.close();
          } else {
            this.isLiqPayLink = true;
            this.liqPayButtonForm = this.sanitizer.bypassSecurityTrustHtml(response.liqPayButton);
            setTimeout(() => {
              this.liqPayButton = document.getElementsByName('btn_text');
              this.localStorageService.setUbsOrderId(this.orderClientDto.orderId);
              this.liqPayButton[0].click();
            }, 0);
          }
        },
        () => {
          this.dataLoadingLiqPay = false;
        }
      );
    }
  }

  public orderOptionPayment(event: Event): void {
    this.selectedPayment = (event.target as HTMLInputElement).value;
    this.fillOrderClientDto();
  }

  public bonusOption(event: MatRadioChange): void {
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
