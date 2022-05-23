import { Component, OnInit, OnDestroy, AfterContentChecked, ChangeDetectorRef, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UbsAdminCancelModalComponent } from '../ubs-admin-cancel-modal/ubs-admin-cancel-modal.component';
import { UbsAdminGoBackModalComponent } from '../ubs-admin-go-back-modal/ubs-admin-go-back-modal.component';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { take, takeUntil } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subject } from 'rxjs';
import {
  IAddressExportDetails,
  IEmployee,
  IExportDetails,
  IGeneralOrderInfo,
  IOrderDetails,
  IOrderInfo,
  IOrderStatusInfo,
  IPaymentInfo,
  IResponsiblePersons,
  IUpdateResponsibleEmployee,
  IUserInfo,
  ResponsibleEmployee
} from '../../models/ubs-admin.interface';
import { formatDate } from '@angular/common';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { IAppState } from 'src/app/store/state/app.state';
import { Store } from '@ngrx/store';
import { ChangingOrderData } from 'src/app/store/actions/bigOrderTable.actions';

@Component({
  selector: 'app-ubs-admin-order',
  templateUrl: './ubs-admin-order.component.html',
  styleUrls: ['./ubs-admin-order.component.scss']
})
export class UbsAdminOrderComponent implements OnInit, OnDestroy, AfterContentChecked {
  currentLanguage: string;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  orderForm: FormGroup;
  isDataLoaded = false;
  orderId: number;
  orderInfo: IOrderInfo;
  generalInfo: IGeneralOrderInfo;
  userInfo: IUserInfo;
  addressInfo: IAddressExportDetails;
  paymentInfo: IPaymentInfo;
  totalPaid: number;
  exportInfo: IExportDetails;
  responsiblePersonInfo: IResponsiblePersons;
  orderDetails: IOrderDetails;
  orderStatusInfo: IOrderStatusInfo;
  currentOrderPrice: number;
  currentOrderStatus: string;
  overpayment: number;
  isMinOrder = true;
  isSubmitted = false;

  additionalPayment: string;

  private matSnackBar: MatSnackBarComponent;
  private orderService: OrderService;
  constructor(
    private translate: TranslateService,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private injector: Injector,
    private store: Store<IAppState>
  ) {
    this.matSnackBar = injector.get<MatSnackBarComponent>(MatSnackBarComponent);
    this.orderService = injector.get<OrderService>(OrderService);
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((lang) => {
      this.currentLanguage = lang;
      this.translate.setDefaultLang(lang);
    });
    this.route.params.subscribe((params: Params) => {
      this.orderId = +params.id;
    });
    this.getOrderInfo(this.orderId);
  }

  public getOrderInfo(orderId): void {
    this.orderService
      .getOrderInfo(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: IOrderInfo) => {
        this.orderInfo = data;
        this.generalInfo = data.generalOrderInfo;
        this.currentOrderStatus = this.generalInfo.orderStatus;
        this.userInfo = data.userInfoDto;
        this.addressInfo = data.addressExportDetailsDto;
        this.paymentInfo = data.paymentTableInfoDto;
        this.exportInfo = data.exportDetailsDto;
        this.responsiblePersonInfo = data.employeePositionDtoRequest;
        this.totalPaid = this.orderInfo.orderCertificateTotalDiscount + this.orderInfo.orderBonusDiscount;
        this.totalPaid += data.paymentTableInfoDto.paidAmount;
        this.overpayment = data.paymentTableInfoDto.overpayment;
        this.currentOrderPrice = data.orderFullPrice;
        this.setOrderDetails();
        this.initForm();
      });
  }

  private setOrderDetails() {
    this.setPreviousBagsIfEmpty(this.currentOrderStatus);
    const bagsObj = this.orderInfo.bags.map((bag) => {
      bag.planned = this.orderInfo.amountOfBagsOrdered[bag.id] || 0;
      bag.confirmed = this.orderInfo.amountOfBagsConfirmed[bag.id] || 0;
      bag.actual = this.orderInfo.amountOfBagsExported[bag.id] || 0;
      return bag;
    });
    this.orderDetails = {
      bags: bagsObj,
      courierInfo: Object.assign({}, this.orderInfo.courierInfo),
      bonuses: this.orderInfo.orderBonusDiscount,
      certificateDiscount: this.orderInfo.orderCertificateTotalDiscount,
      paidAmount: this.orderInfo.paymentTableInfoDto.paidAmount,
      courierPricePerPackage: this.orderInfo.courierPricePerPackage
    };
    this.orderStatusInfo = this.getOrderStatusInfo(this.currentOrderStatus);
  }

  private setPreviousBagsIfEmpty(status) {
    const actualStage = this.getOrderStatusInfo(status).ableActualChange;
    if (actualStage) {
      if (!Object.keys(this.orderInfo.amountOfBagsExported).length) {
        this.orderInfo.amountOfBagsExported = Object.assign({}, this.orderInfo.amountOfBagsConfirmed);
      }
    } else {
      if (!Object.keys(this.orderInfo.amountOfBagsConfirmed).length) {
        this.orderInfo.amountOfBagsConfirmed = Object.assign({}, this.orderInfo.amountOfBagsOrdered);
      }
    }
  }

  private getOrderStatusInfo(statusName: string) {
    return this.generalInfo.orderStatusesDtos.find((status) => status.key === statusName);
  }

  initForm() {
    const currentEmployees = this.responsiblePersonInfo.currentPositionEmployees;
    this.orderForm = this.fb.group({
      generalOrderInfo: this.fb.group({
        orderStatus: this.generalInfo.orderStatus,
        paymentStatus: this.generalInfo.orderPaymentStatus,
        adminComment: this.generalInfo.adminComment,
        cancellationComment: '', // TODO add this fields to controller
        cancellationReason: '' // TODO
      }),
      userInfoDto: this.fb.group({
        recipientName: [this.userInfo.recipientName, [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
        recipientSurName: [this.userInfo.recipientSurName, [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
        recipientPhoneNumber: [this.userInfo.recipientPhoneNumber, [Validators.required, Validators.pattern('^\\+?3?8?(0\\d{9})$')]],
        recipientEmail: [this.userInfo.recipientEmail, [Validators.required, Validators.email]]
      }),
      addressExportDetailsDto: this.fb.group({
        addressRegion: this.addressInfo.addressRegion,
        addressCity: this.addressInfo.addressCity,
        addressStreet: this.addressInfo.addressStreet,
        addressHouseNumber: this.addressInfo.addressHouseNumber,
        addressHouseCorpus: this.addressInfo.addressHouseCorpus,
        addressEntranceNumber: this.addressInfo.addressEntranceNumber,
        addressDistrict: this.addressInfo.addressDistrict
      }),
      exportDetailsDto: this.fb.group({
        dateExport: [this.exportInfo.dateExport ? formatDate(this.exportInfo.dateExport, 'yyyy-MM-dd', this.currentLanguage) : ''],
        timeDeliveryFrom: [this.parseTimeToStr(this.exportInfo.timeDeliveryFrom)],
        timeDeliveryTo: [this.parseTimeToStr(this.exportInfo.timeDeliveryTo)],
        receivingStationId: [this.getReceivingStationById(this.exportInfo.receivingStationId)]
      }),
      responsiblePersonsForm: this.fb.group({
        responsibleCaller: [this.getEmployeeById(currentEmployees, ResponsibleEmployee.CallManager)],
        responsibleLogicMan: [this.getEmployeeById(currentEmployees, ResponsibleEmployee.Logistician)],
        responsibleNavigator: [this.getEmployeeById(currentEmployees, ResponsibleEmployee.Navigator)],
        responsibleDriver: [this.getEmployeeById(currentEmployees, ResponsibleEmployee.Driver)]
      }),
      orderDetailsForm: this.fb.group({
        storeOrderNumbers: this.fb.array([]),
        certificates: (this.orderInfo.certificates || []).join(', '),
        customerComment: this.orderInfo.comment,
        orderFullPrice: this.orderInfo.orderFullPrice
      })
    });
    const storeOrderNumbersArr = this.getFormGroup('orderDetailsForm').controls.storeOrderNumbers as FormArray;
    this.orderInfo.numbersFromShop.forEach((elem) => {
      storeOrderNumbersArr.push(new FormControl(elem, [Validators.required, Validators.pattern('^\\d{10}$')]));
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
    this.statusCanceledOrDone();
  }

  getEmployeeById(allCurrentEmployees: Map<string, string>, id: number) {
    if (!allCurrentEmployees) {
      return '';
    }
    const key = Object.keys(allCurrentEmployees).find((el) => el.includes(`id=${id},`));
    return key ? allCurrentEmployees[key] : '';
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

  goBack(): void {
    if (this.orderForm.dirty && !this.isSubmitted) {
      this.dialog.open(UbsAdminGoBackModalComponent, {
        hasBackdrop: true
      });
    } else {
      this.router.navigate(['ubs-admin', 'orders']);
    }

  onChangedOrderStatus(status: string) {
    this.currentOrderStatus = status;
    this.orderStatusInfo = this.getOrderStatusInfo(this.currentOrderStatus);
    this.notRequiredFieldsStatuses();
  }

  public onUpdatePaymentStatus(newPaymentStatus: string): void {
    this.additionalPayment = newPaymentStatus;
    this.orderForm.markAsDirty();
  }

  public changeOverpayment(sum: number): void {
    this.overpayment = sum;
  }

  public onChangeCurrentPrice(sum: number) {
    this.currentOrderPrice = sum;
  }

  public setMinOrder(flag) {
    this.isMinOrder = flag;
  }

  parseTimeToStr(dateStr: string) {
    return dateStr ? formatDate(dateStr, 'HH:mm', this.currentLanguage) : '';
  }

  resetForm() {
    this.orderForm.reset();
    this.initForm();
    this.currentOrderStatus = this.generalInfo.orderStatus;
    this.orderStatusInfo = this.getOrderStatusInfo(this.currentOrderStatus);
  }

  public addIdForUserAndAdress(order: FormGroup): void {
    const addressId = 'addressId';
    const recipientId = 'recipientId';
    const keyUserInfo = 'userInfoDto';
    const keyAddressExportDetails = 'addressExportDetailsDto';

    if (order.hasOwnProperty(keyUserInfo)) {
      order[keyUserInfo][recipientId] = this.userInfo.recipientId;
    }

    if (order.hasOwnProperty(keyAddressExportDetails)) {
      order[keyAddressExportDetails][addressId] = this.addressInfo.addressId;
    }
  }

  public getFilledEmployeeData(responsibleEmployee: string, positionId: number): IUpdateResponsibleEmployee {
    const currentEmployee: IUpdateResponsibleEmployee = {
      employeeId: 0,
      positionId: 0
    };
    const employeeObjects = this.responsiblePersonInfo.allPositionsEmployees;
    currentEmployee.positionId = positionId;

    for (const [key, value] of Object.entries(employeeObjects)) {
      if (key.includes(`id=${positionId},`)) {
        const selectedEmployee = value.find((emp: IEmployee) => emp.name === responsibleEmployee);
        currentEmployee.employeeId = selectedEmployee.id;
      }
    }
    return currentEmployee;
  }

  public onSubmit(): void {
    this.isSubmitted = true;
    const changedValues: any = {};
    this.getUpdates(this.orderForm, changedValues);

    if (changedValues.exportDetailsDto) {
      this.formatExporteValue(changedValues.exportDetailsDto);
    }

    if (changedValues.orderDetailsForm) {
      changedValues.orderDetailDto = this.formatBagsValue(changedValues.orderDetailsForm);
      if (changedValues.orderDetailsForm.storeOrderNumbers) {
        const keyEcoNumberFromShop = 'ecoNumberFromShop';
        changedValues[keyEcoNumberFromShop] = {
          ecoNumber: changedValues.orderDetailsForm.storeOrderNumbers
        };
      }
    }

    if (changedValues.responsiblePersonsForm) {
      const arrEmployees: IUpdateResponsibleEmployee[] = [];
      const responsibleProps = Object.keys(changedValues.responsiblePersonsForm);
      responsibleProps.forEach((e) =>
        arrEmployees.push(this.getFilledEmployeeData(changedValues.responsiblePersonsForm[e], this.orderService.matchProps(e)))
      );
      const keyUpdateResponsibleEmployeeDto = 'updateResponsibleEmployeeDto';
      changedValues[keyUpdateResponsibleEmployeeDto] = arrEmployees;
      delete changedValues.responsiblePersonsForm;
    }

    this.addIdForUserAndAdress(changedValues);

    this.orderService
      .updateOrderInfo(this.orderId, this.currentLanguage, changedValues)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        response.ok ? this.matSnackBar.snackType.changesSaved() : this.matSnackBar.snackType.error();
        if (response.ok) {
          this.getOrderInfo(this.orderId);
          Object.keys(changedValues.generalOrderInfo).forEach((key: string) => {
            if (changedValues.generalOrderInfo[key]) {
              this.postDataItem([this.orderId], key, changedValues.generalOrderInfo[key]);
            }
          });
        }
      });
  }

  private postDataItem(orderId: number[], columnName: string, newValue: string): void {
    this.store.dispatch(ChangingOrderData({ orderId, columnName, newValue }));
  }

  private getUpdates(formItem: FormGroup | FormArray | FormControl, changedValues: IOrderInfo, name?: string) {
    if (formItem instanceof FormControl) {
      if (name && formItem.dirty) {
        changedValues[name] = formItem.value;
      }
    } else {
      for (const formControlName in formItem.controls) {
        if (formItem.controls.hasOwnProperty(formControlName)) {
          const formControl = formItem.controls[formControlName];

          if (formControl instanceof FormControl) {
            this.getUpdates(formControl, changedValues, formControlName);
          } else if (formControl instanceof FormArray && formControl.dirty && formControl.controls.length > 0) {
            changedValues[formControlName] = [];
            this.getUpdates(formControl, changedValues[formControlName]);
          } else if (formControl instanceof FormGroup && formControl.dirty) {
            changedValues[formControlName] = {};
            this.getUpdates(formControl, changedValues[formControlName]);
          }
        }
      }
    }
  }

  parseStrToTime(dateStr: string, date: Date) {
    const hours = dateStr.split(':')[0];
    const minutes = dateStr.split(':')[1];
    date.setHours(+hours + 2);
    date.setMinutes(+minutes);
    return date ? date.toISOString().split('Z').join('') : '';
  }

  public formatExporteValue(exportDetailsDto: IExportDetails): void {
    const exportDate = new Date(exportDetailsDto.dateExport);

    if (exportDetailsDto.dateExport) {
      exportDetailsDto.dateExport = exportDate.toISOString();
    }

    if (exportDetailsDto.timeDeliveryFrom) {
      exportDetailsDto.timeDeliveryFrom = this.parseStrToTime(exportDetailsDto.timeDeliveryFrom, exportDate);
    }

    if (exportDetailsDto.timeDeliveryTo) {
      exportDetailsDto.timeDeliveryTo = this.parseStrToTime(exportDetailsDto.timeDeliveryTo, exportDate);
    }
    if (exportDetailsDto.receivingStationId) {
      exportDetailsDto.receivingStationId = this.getReceivingStationIdByName(exportDetailsDto.receivingStationId.toString());
    }
  }
  public getReceivingStationIdByName(receivingStationName: string): number {
    return this.exportInfo.allReceivingStations.find((element) => receivingStationName === element.name).id;
  }
  public getReceivingStationById(receivingStationId: number): string | null {
    const receivingStationName = this.exportInfo.allReceivingStations.find((element) => receivingStationId === element.id)?.name;
    return receivingStationName || null;
  }
  public formatBagsValue(orderDetailsForm) {
    const confirmed = {};
    const exported = {};

    for (const key of Object.keys(orderDetailsForm)) {
      if (key.startsWith('confirmedQuantity')) {
        const id = key.replace('confirmedQuantity', '');
        confirmed[id] = orderDetailsForm[key];
        continue;
      }
      if (key.startsWith('actualQuantity')) {
        const id = key.replace('actualQuantity', '');
        exported[id] = orderDetailsForm[key];
      }
    }
    if (!Object.keys(confirmed).length && !Object.keys(exported).length) {
      return;
    }

    const result: any = {};
    if (Object.keys(confirmed).length) {
      result.amountOfBagsConfirmed = confirmed;
    }
    if (Object.keys(exported).length) {
      result.amountOfBagsExported = exported;
    }

    return result;
  }
  statusCanceledOrDone(): void {
    if (this.currentOrderStatus === 'CANCELED' || this.currentOrderStatus === 'DONE') {
      this.orderForm.get('exportDetailsDto').disable();
      this.orderForm.get('responsiblePersonsForm').disable();
    } else {
      this.orderForm.get('exportDetailsDto').enable();
      this.orderForm.get('responsiblePersonsForm').enable();
    }
  }
  notRequiredFieldsStatuses(): void {
    const exportDetails = this.orderForm.get('exportDetailsDto');
    const responsiblePersons = this.orderForm.get('responsiblePersonsForm');
    const exportDetaisFields = Object.keys(this.orderForm.get('exportDetailsDto').value);
    const responsiblePersonNames = Object.keys(this.orderForm.get('responsiblePersonsForm').value);
    const statuses = ['BROUGHT_IT_HIMSELF', 'CANCELED', 'FORMED'];

    if (statuses.includes(this.currentOrderStatus)) {
      exportDetaisFields.forEach((el) => exportDetails.get(el).clearValidators());
      responsiblePersonNames.forEach((el) => responsiblePersons.get(el).clearValidators());
      exportDetails.reset();
      responsiblePersons.reset();
    } else {
      exportDetaisFields.forEach((el) => exportDetails.get(el).setValidators([Validators.required]));
      responsiblePersonNames.forEach((el) => responsiblePersons.get(el).setValidators([Validators.required]));
    }
    this.statusCanceledOrDone();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
