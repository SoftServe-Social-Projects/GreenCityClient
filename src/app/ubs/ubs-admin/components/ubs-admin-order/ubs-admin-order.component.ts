import { Component, OnInit, OnDestroy, AfterContentChecked, ChangeDetectorRef, Injector, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { UbsAdminCancelModalComponent } from '../ubs-admin-cancel-modal/ubs-admin-cancel-modal.component';
import { UbsAdminGoBackModalComponent } from '../ubs-admin-go-back-modal/ubs-admin-go-back-modal.component';
import { OrderService } from '../../services/order.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
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
  ResponsibleEmployee,
  abilityEditAuthorities,
  NotTakenOutReasonImages
} from '../../models/ubs-admin.interface';
import { IAppState } from 'src/app/store/state/app.state';
import { ChangingOrderData } from 'src/app/store/actions/bigOrderTable.actions';
import { UbsAdminOrderPaymentComponent } from '../ubs-admin-order-payment/ubs-admin-order-payment.component';
import { Patterns } from 'src/assets/patterns/patterns';
import { GoogleScript } from 'src/assets/google-script/google-script';
import { PhoneNumberValidator } from 'src/app/shared/phone-validator/phone.validator';
import { OrderStatus, PaymentEnrollment } from 'src/app/ubs/ubs/order-status.enum';
import { UbsAdminEmployeeService } from '../../services/ubs-admin-employee.service';
import { TableKeys } from '../../services/table-keys.enum';

@Component({
  selector: 'app-ubs-admin-order',
  templateUrl: './ubs-admin-order.component.html',
  styleUrls: ['./ubs-admin-order.component.scss']
})
export class UbsAdminOrderComponent implements OnInit, OnDestroy, AfterContentChecked {
  deleteNumberOrderFromEcoShop = false;
  currentLanguage: string;
  private destroy$: Subject<void> = new Subject<void>();
  orderForm: FormGroup;
  isDataLoaded = false;
  orderId: number;
  orderInfo: IOrderInfo;
  generalInfo: IGeneralOrderInfo;
  userInfo: IUserInfo;
  addressInfo: IAddressExportDetails;
  paymentInfo: IPaymentInfo;
  totalPaid: number;
  updateBonusAccount: number;
  unPaidAmount: number;
  exportInfo: IExportDetails;
  responsiblePersonInfo: IResponsiblePersons;
  orderDetails: IOrderDetails;
  orderStatusInfo: IOrderStatusInfo;
  currentOrderPrice: number;
  currentOrderStatus: string;
  overpayment: number;
  cancelComment: string;
  cancelReason: string;
  isMinOrder = true;
  isSubmitted = false;
  isStatus = false;
  private isFormResetted = false;
  writeOffStationSum: number;
  ubsCourierPrice: number;
  additionalPayment: string;
  isOrderStatusChanged: boolean;
  private matSnackBar: MatSnackBarComponent;
  private orderService: OrderService;
  private statuses = [OrderStatus.BROUGHT_IT_HIMSELF, OrderStatus.CANCELED, OrderStatus.FORMED];
  public arrowIcon = 'assets/img/icon/arrows/arrow-left.svg';
  private employeeAuthorities: string[];
  public isEmployeeCanEditOrder = false;
  private timeDeliveryFrom: string;
  private timeDeliveryTo: string;
  private dateExport: string;
  private receivingStationId: number;
  notTakenOutReasonDescription: string;
  notTakenOutReasonImages: NotTakenOutReasonImages[];

  public permissions$ = this.store.select((state): Array<string> => state.employees?.employeesPermissions);
  constructor(
    private translate: TranslateService,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private injector: Injector,
    private store: Store<IAppState>,
    private googleScript: GoogleScript,
    public ubsAdminEmployeeService: UbsAdminEmployeeService
  ) {
    this.matSnackBar = injector.get<MatSnackBarComponent>(MatSnackBarComponent);
    this.orderService = injector.get<OrderService>(OrderService);
  }

  @ViewChild(UbsAdminOrderPaymentComponent) orderPaymentComponent: UbsAdminOrderPaymentComponent;

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((lang) => {
      this.currentLanguage = lang;
      this.translate.setDefaultLang(lang);
      this.googleScript.load(lang);
    });
    this.route.params.subscribe((params: Params) => {
      this.orderId = +params.id;
    });
    this.getOrderInfo(this.orderId, false);
    this.authoritiesSubscription();
  }

  private authoritiesSubscription() {
    this.permissions$.subscribe((authorities) => {
      if (authorities?.length) {
        this.definedIsEmployeeCanEditOrder(authorities);
      }
    });
  }

  private definedIsEmployeeCanEditOrder(authorities: string[]) {
    this.employeeAuthorities = authorities;
    if (this.employeeAuthorities) {
      this.isEmployeeCanEditOrder = !!this.employeeAuthorities.filter(
        (authoritiesItem) => authoritiesItem === abilityEditAuthorities.orders
      ).length;
    }
  }

  public onCancelOrder(): void {
    this.isOrderStatusChanged = true;
    this.setOrderDetails();
  }

  onNotTakenOutReason(value: { description: string; images: NotTakenOutReasonImages[] }): void {
    this.notTakenOutReasonDescription = value.description;
    this.notTakenOutReasonImages = value.images;
  }

  public getOrderInfo(orderId: number, submitMode: boolean): void {
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
        this.totalPaid = data.paymentTableInfoDto.paidAmount;
        this.unPaidAmount = data.paymentTableInfoDto.unPaidAmount;
        this.overpayment = data.paymentTableInfoDto.overpayment;
        this.currentOrderPrice = data.orderFullPrice;
        this.setOrderDetails();
        this.initForm();
        if (submitMode && this.overpayment && this.generalInfo.orderStatus === OrderStatus.DONE) {
          this.orderPaymentComponent.enrollToBonusAccount(this.overpayment);
        }
        if (submitMode && this.currentOrderStatus === OrderStatus.CANCELED) {
          this.orderPaymentComponent.setCancelOrderOverpayment(this.totalPaid);
        }
      });
  }

  private setOrderDetails() {
    this.setPreviousBagsIfEmpty(this.currentOrderStatus);
    const bagsObj = this.orderInfo.bags.map((bag) => {
      bag.planned = this.orderInfo.amountOfBagsOrdered[bag.id] || 0;
      bag.confirmed = this.orderInfo.amountOfBagsConfirmed[bag.id] ?? bag.planned;

      const setAmountOfBagsExported = this.currentOrderStatus === OrderStatus.DONE ? bag.confirmed : 0;
      bag.actual = this.isOrderStatusChanged ? 0 : this.orderInfo.amountOfBagsExported[bag.id] ?? setAmountOfBagsExported;

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
    this.isStatus = this.generalInfo.orderStatus === OrderStatus.CANCELED;
    const paymentBonusAccount = this.paymentInfo.paymentInfoDtos.filter(
      (paymentItem) => paymentItem.receiptLink === PaymentEnrollment.receiptLink
    );
    if (paymentBonusAccount.length) {
      this.updateBonusAccount = paymentBonusAccount.reduce(
        (accumulator, currentPaymentBonusValue) => accumulator + Math.abs(currentPaymentBonusValue.amount),
        0
      );
    }
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
        orderStatus: [
          {
            value: this.generalInfo.orderStatus,
            disabled:
              this.generalInfo.orderStatus === OrderStatus.CANCELED ||
              this.generalInfo.orderStatus === OrderStatus.DONE ||
              this.generalInfo.orderStatus === OrderStatus.BROUGHT_IT_HIMSELF
          }
        ],
        paymentStatus: this.generalInfo.orderPaymentStatus,
        adminComment: [this.generalInfo.adminComment, Validators.maxLength(255)],
        cancellationComment: '', // TODO add this fields to controller
        cancellationReason: '' // TODO
      }),
      userInfoDto: this.fb.group({
        recipientName: [
          this.userInfo.recipientName,
          [Validators.required, Validators.maxLength(30), Validators.pattern(Patterns.NamePattern)]
        ],
        recipientSurName: [
          this.userInfo.recipientSurName,
          [Validators.required, Validators.maxLength(30), Validators.pattern(Patterns.NamePattern)]
        ],
        recipientPhoneNumber: [
          this.userInfo.recipientPhoneNumber,
          [Validators.required, Validators.pattern(Patterns.adminPhone), PhoneNumberValidator('UA')]
        ],
        recipientEmail: [this.userInfo.recipientEmail, [Validators.pattern(Patterns.ubsMailPattern)]]
      }),
      addressExportDetailsDto: this.fb.group({
        addressRegion: [{ value: this.addressInfo.addressRegion, disabled: this.isStatus }, Validators.required],
        addressRegionEng: [{ value: this.addressInfo.addressRegionEng, disabled: this.isStatus }, Validators.required],
        addressCity: [
          this.addressInfo.addressCity,
          [Validators.required, Validators.minLength(1), Validators.maxLength(30), Validators.pattern(Patterns.ubsWithDigitPattern)]
        ],
        addressCityEng: [
          this.addressInfo.addressCityEng,
          [Validators.required, Validators.minLength(1), Validators.maxLength(30), Validators.pattern(Patterns.ubsWithDigitPattern)]
        ],
        addressStreet: [
          this.addressInfo.addressStreet,
          [Validators.required, Validators.minLength(1), Validators.maxLength(120), Validators.pattern(Patterns.ubsWithDigitPattern)]
        ],
        addressStreetEng: [
          this.addressInfo.addressStreetEng,
          [Validators.required, Validators.minLength(1), Validators.maxLength(120), Validators.pattern(Patterns.ubsWithDigitPattern)]
        ],
        addressHouseNumber: [
          this.addressInfo.addressHouseNumber,
          [Validators.required, Validators.maxLength(10), Validators.pattern(Patterns.ubsHousePattern)]
        ],
        addressHouseCorpus: [this.addressInfo.addressHouseCorpus, [Validators.maxLength(4), Validators.pattern(Patterns.ubsCorpusPattern)]],
        addressEntranceNumber: [
          this.addressInfo.addressEntranceNumber,
          [Validators.maxLength(2), Validators.pattern(Patterns.ubsEntrNumPattern)]
        ],
        addressDistrict: [{ value: this.addressInfo.addressDistrict, disabled: this.isStatus }],
        addressDistrictEng: [{ value: this.addressInfo.addressDistrictEng, disabled: this.isStatus }],
        addressRegionDistrictList: [this.addressInfo.addressRegionDistrictList]
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
      storeOrderNumbersArr.push(new FormControl(elem, [Validators.pattern(Patterns.orderEcoStorePattern)]));
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
    this.orderForm.dirty && !this.isSubmitted
      ? this.dialog.open(UbsAdminGoBackModalComponent, { hasBackdrop: true })
      : this.router.navigate(['ubs-admin', 'orders']);
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

  public onPaymentUpdate(sum: number): void {
    this.totalPaid = sum;
  }

  public onPaymentToBonusAccount(sum: number): void {
    this.updateBonusAccount = sum;
  }

  public changeOverpayment(sum: number): void {
    this.overpayment = sum;
  }
  public onChangeCurrentPrice(sum: number) {
    this.currentOrderPrice = sum;
  }

  public onChangeWriteOffStation(sum: number) {
    this.writeOffStationSum = sum;
  }

  public onChangeCourierPrice(sum: number) {
    this.ubsCourierPrice = sum;
  }

  public onCancelReason(message) {
    this.cancelReason = message.reason;
    this.cancelComment = message.comment;
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

  public validateExportDetails() {
    const exportDetailsDtoValue = this.orderForm.get('exportDetailsDto').value;
    const validatedValues = Object.values(exportDetailsDtoValue).map((val) => (!val ? null : val));

    Object.keys(exportDetailsDtoValue).forEach((key, index) => {
      exportDetailsDtoValue[key] = validatedValues[index];
    });

    return exportDetailsDtoValue;
  }

  deleteNumberOrderFromEcoShopChange(value: boolean) {
    this.deleteNumberOrderFromEcoShop = value;
  }

  public onSubmit(): void {
    this.isSubmitted = true;
    const changedValues: any = {};
    this.getUpdates(this.orderForm, changedValues);

    if (changedValues.exportDetailsDto || this.isFormResetted) {
      changedValues.exportDetailsDto = this.validateExportDetails();
      this.dateExport = changedValues.exportDetailsDto.dateExport;
      this.timeDeliveryFrom = changedValues.exportDetailsDto.timeDeliveryFrom;
      this.timeDeliveryTo = changedValues.exportDetailsDto.timeDeliveryTo;
      this.formatExporteValue(changedValues.exportDetailsDto);
      this.receivingStationId = changedValues.exportDetailsDto.receivingStationId;
    }

    if (changedValues.orderDetailsForm) {
      changedValues.orderDetailDto = this.formatBagsValue(changedValues.orderDetailsForm);
      const keyEcoNumberFromShop = 'ecoNumberFromShop';
      if (changedValues.orderDetailsForm.storeOrderNumbers || this.deleteNumberOrderFromEcoShop) {
        changedValues[keyEcoNumberFromShop] = {
          ecoNumber: this.orderForm.value.orderDetailsForm.storeOrderNumbers
        };
        this.deleteNumberOrderFromEcoShop = false;
      }
    }
    changedValues.ubsCourierPrice = this.ubsCourierPrice;
    changedValues.writeOffStationSum = this.writeOffStationSum;
    changedValues.cancellationComment = this.cancelComment;
    changedValues.cancellationReason = this.cancelReason;

    if (changedValues.responsiblePersonsForm) {
      const arrEmployees: IUpdateResponsibleEmployee[] = [];
      const responsibleProps = Object.keys(changedValues.responsiblePersonsForm);
      responsibleProps.forEach((e) =>
        arrEmployees.push(this.getFilledEmployeeData(changedValues.responsiblePersonsForm[e], this.orderService.matchProps(e)))
      );
      const keyUpdateResponsibleEmployeeDto = 'updateResponsibleEmployeeDto';
      changedValues[keyUpdateResponsibleEmployeeDto] = arrEmployees;
      delete changedValues.responsiblePersonsForm;
    } else if (this.isFormResetted) {
      changedValues.responsiblePersonsForm = this.orderForm.get('responsiblePersonsForm').value;
    }

    if (this.notTakenOutReasonDescription) {
      changedValues.notTakenOutReason = this.notTakenOutReasonDescription;
    }

    this.addIdForUserAndAdress(changedValues);

    this.orderService
      .updateOrderInfo(this.orderId, this.currentLanguage, changedValues, this.notTakenOutReasonImages)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        response.ok ? this.matSnackBar.snackType.changesSaved() : this.matSnackBar.snackType.error();
        if (response.ok) {
          this.getOrderInfo(this.orderId, true);
          if (changedValues?.generalOrderInfo) {
            Object.keys(changedValues?.generalOrderInfo).forEach((key: string) => {
              if (changedValues.generalOrderInfo[key]) {
                this.postDataItem([this.orderId], key, changedValues.generalOrderInfo[key]);
              }
            });
          }
          this.updateExportDataInState(changedValues);
          this.updateResponsibleEmployeeInState(changedValues);
        }
      });
    this.statusCanceledOrDone();
  }

  private updateExportDataInState(changedValues: IOrderInfo) {
    if (changedValues?.exportDetailsDto) {
      if (this.dateExport) {
        this.postDataItem([this.orderId], TableKeys.dateOfExport, this.dateExport);
      }
      if (this.receivingStationId) {
        this.postDataItem([this.orderId], TableKeys.receivingStation, String(this.receivingStationId));
      }
      if (this.timeDeliveryFrom && this.timeDeliveryTo) {
        this.postDataItem([this.orderId], TableKeys.timeOfExport, new Array(this.timeDeliveryFrom, this.timeDeliveryTo).join('-'));
      }
    }
  }

  private updateResponsibleEmployeeInState(changedValues: IOrderInfo) {
    if (changedValues?.updateResponsibleEmployeeDto) {
      changedValues?.updateResponsibleEmployeeDto.forEach((key) => {
        switch (key.positionId) {
          case 2:
            this.postDataItem([this.orderId], TableKeys.responsibleCaller, String(key.employeeId));
            break;
          case 3:
            this.postDataItem([this.orderId], TableKeys.responsibleLogicMan, String(key.employeeId));
            break;
          case 4:
            this.postDataItem([this.orderId], TableKeys.responsibleNavigator, String(key.employeeId));
            break;
          case 5:
            this.postDataItem([this.orderId], TableKeys.responsibleDriver, String(key.employeeId));
            break;
          default:
            break;
        }
      });
    }
  }

  private postDataItem(orderId: number[], columnName: string, newValue: string): void {
    this.store.dispatch(ChangingOrderData({ orderData: [{ orderId, columnName, newValue }] }));
  }

  private getUpdates(formItem: FormGroup | FormArray | FormControl, changedValues: IOrderInfo, name?: string) {
    if (formItem instanceof FormControl) {
      if (name?.includes('confirmedQuantity') || name?.includes('actualQuantity')) {
        formItem.markAsDirty();
      }
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
    const exportDate = new Date(
      exportDetailsDto.dateExport ? exportDetailsDto.dateExport : this.orderForm.get('exportDetailsDto').value.dateExport
    );

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
    const exportDetails = this.orderForm.get('exportDetailsDto').value;
    const allFieldsHaveValue = Object.keys(exportDetails).every((key) => exportDetails[key]);
    const isStatusDoneAndFormFilled = this.currentOrderStatus === OrderStatus.DONE && allFieldsHaveValue;

    if (this.currentOrderStatus === OrderStatus.CANCELED || isStatusDoneAndFormFilled) {
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

    const isStatusIncluded = this.orderService.isStatusInArray(this.currentOrderStatus, this.statuses);
    if (isStatusIncluded) {
      exportDetaisFields.forEach((el) => exportDetails.get(el).clearValidators());
      responsiblePersonNames.forEach((el) => responsiblePersons.get(el).clearValidators());
      exportDetails.reset();
      responsiblePersons.reset();
      this.isFormResetted = true;
    } else {
      exportDetaisFields.forEach((el) => exportDetails.get(el).setValidators([Validators.required]));
      responsiblePersons.get('responsibleCaller')?.setValidators([Validators.required]);
    }
    this.statusCanceledOrDone();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
