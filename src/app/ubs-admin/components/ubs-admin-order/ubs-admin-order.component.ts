import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UbsAdminCancelModalComponent } from '../ubs-admin-cancel-modal/ubs-admin-cancel-modal.component';
import { UbsAdminGoBackModalComponent } from '../ubs-admin-go-back-modal/ubs-admin-go-back-modal.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { take, takeUntil } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subject } from 'rxjs';
import { UbsAdminOrderDetailsFormComponent } from '../ubs-admin-order-details-form/ubs-admin-order-details-form.component';

@Component({
  selector: 'app-ubs-admin-order',
  templateUrl: './ubs-admin-order.component.html',
  styleUrls: ['./ubs-admin-order.component.scss']
})
export class UbsAdminOrderComponent implements OnInit, OnDestroy {
  currentLanguage: string;
  currentOrderStatus;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  isDataLoaded = false;
  order;
  orderDetails;
  orderForm: FormGroup;
  orderInfo;
  orderStatusInfo;
  @ViewChild(UbsAdminOrderDetailsFormComponent, { static: false })
  private orderDetailsComponent: UbsAdminOrderDetailsFormComponent;

  constructor(
    private orderService: OrderService,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((lang) => {
      this.currentLanguage = lang;
    });
    this.order = this.orderService.getSelectedOrder();
    this.getOrderInfo(this.order.id, this.currentLanguage);
  }

  public getOrderInfo(orderId, lang): void {
    this.orderService
      .getOrderInfo(orderId, lang)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.orderInfo = data;
        this.currentOrderStatus = this.orderInfo.orderStatus;
        this.setOrderDetails();
        this.initForm();
      });
  }

  private setOrderDetails() {
    const bagsObj = this.orderInfo.bags.map((bag) => {
      bag.planned = this.orderInfo.amountOfBagsOrdered[bag.id] || 0;
      bag.confirmed = (this.orderInfo.amountOfBagsConfirmed && this.orderInfo.amountOfBagsConfirmed[bag.id]) || 0;
      bag.actual = (this.orderInfo.amountOfBagsExported && this.orderInfo.amountOfBagsExported[bag.id]) || 0;
      return bag;
    });
    this.orderDetails = {
      bags: bagsObj
    };
    this.orderDetails.bonuses = this.orderInfo.orderBonusDiscount;
    this.orderDetails.certificateDiscount = this.orderInfo.orderCertificateTotalDiscount;
    this.orderStatusInfo = this.getOrderStatusInfo(this.currentOrderStatus);
  }

  private getOrderStatusInfo(statusName: string) {
    return this.orderInfo.orderStatusesDto.filter((status) => status.name === statusName)[0];
  }

  initForm() {
    const address = this.order.address.split(', ');
    const personalInfo = this.order.senderName.split(' ', 2);
    this.orderForm = this.fb.group({
      orderStatusForm: this.fb.group({
        orderStatus: this.order.orderStatus,
        commentForOrder: ''
      }),
      clientInfoForm: this.fb.group({
        senderName: [personalInfo[0], [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
        senderSurname: [personalInfo[1], [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
        senderPhone: [this.order.senderPhone, [Validators.required, Validators.pattern('^\\+?3?8?(0\\d{9})$')]],
        senderEmail: [this.order.senderEmail, [Validators.required, Validators.email]]
      }),
      addressDetailsForm: this.fb.group({
        region: 'Київська',
        settlement: 'Київ',
        street: address[0] || '',
        building: address[1] || '',
        corpus: address[2] || '',
        entrance: address[3] || '',
        district: this.order.district
      }),
      exportDetailsForm: this.fb.group({
        exportedDate: this.order.dateOfExport,
        exportedTime: this.order.timeOfExport,
        receivingStation: this.order.receivingStation
      }),
      responsiblePersonsForm: this.fb.group({
        serviceManager: this.order.responsibleManager,
        callManager: this.order.responsibleCaller,
        logistician: this.order.responsibleLogicMan,
        navigator: this.order.responsibleNavigator,
        driver: this.order.responsibleDriver
      }),
      orderDetailsForm: this.fb.group({
        // TODO: set data after receiving from backend
        storeOrderNumber: '',
        certificate: '2222-2222',
        customerComment: this.orderInfo.comment
      })
    });
    this.orderDetails.bags.forEach((bag) => {
      this.getFormGroup('orderDetailsForm').addControl(
        'plannedQuantity' + String(bag.id),
        new FormControl(bag.planned, [Validators.min(0), Validators.max(999)])
      );
      this.getFormGroup('orderDetailsForm').addControl(
        'confirmedQuantity' + String(bag.id),
        new FormControl(bag.confirmed, [Validators.min(0), Validators.max(999)])
      );
      this.getFormGroup('orderDetailsForm').addControl(
        'actualQuantity' + String(bag.id),
        new FormControl(bag.actual, [Validators.min(0), Validators.max(999)])
      );
    });
  }

  getFormGroup(name: string): FormGroup {
    return this.orderForm.get(name) as FormGroup;
  }

  openCancelModal() {
    this.dialog
      .open(UbsAdminCancelModalComponent, {
        hasBackdrop: true
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((discarded) => {
        if (discarded) {
          this.resetForm();
        }
      });
  }

  openGoBackModal() {
    this.dialog.open(UbsAdminGoBackModalComponent, {
      hasBackdrop: true
    });
  }

  onChangedOrderStatus(status: string) {
    this.currentOrderStatus = status;
    this.orderStatusInfo = this.getOrderStatusInfo(this.currentOrderStatus);
  }

  resetForm() {
    this.orderForm.reset();
    this.initForm();
    this.orderStatusInfo = this.getOrderStatusInfo(this.orderInfo.orderStatus);
    this.orderDetailsComponent.ngOnInit();
  }

  onSubmit() {
    console.log(this.orderForm);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
