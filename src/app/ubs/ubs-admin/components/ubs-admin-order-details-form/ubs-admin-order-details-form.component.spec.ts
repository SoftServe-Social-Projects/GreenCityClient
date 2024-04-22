import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../services/order.service';
import { UbsAdminOrderDetailsFormComponent } from './ubs-admin-order-details-form.component';
import { FormGroup, FormControl, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { OrderInfoMockedData } from './../../services/orderInfoMock';

describe('UbsAdminOrderDetailsFormComponent', () => {
  let component: UbsAdminOrderDetailsFormComponent;
  let fixture: ComponentFixture<UbsAdminOrderDetailsFormComponent>;
  const orderStatusMock = {
    key: OrderStatus.FORMED,
    ableActualChange: false
  };
  const fakeOrderInfo = OrderInfoMockedData;
  const bagsInfoMock = {
    amount: {
      planned: 11,
      confirmed: 19,
      actual: 27
    },
    sum: {
      planned: 105,
      confirmed: 190,
      actual: 275
    },
    finalSum: {
      planned: 60,
      confirmed: 120,
      actual: 180
    },
    bonuses: 20,
    certificateDiscount: 30
  };

  const orderDetailsMock = {
    bonuses: 100,
    paidAmount: 200,
    certificateDiscount: 50,
    bags: [
      { planned: 2, confirmed: 3, actual: 4, price: 10 },
      { planned: 1, confirmed: 2, actual: 3, price: 20 },
      { planned: 3, confirmed: 4, actual: 5, price: 5 }
    ],
    courierInfo: {},
    courierPricePerPackage: 50
  };

  const orderDetailsFormMock = new FormGroup({
    storeOrderNumbers: new FormControl([777]),
    certificates: new FormControl(''),
    customerComment: new FormControl(''),
    orderFullPrice: new FormControl(9999)
  });

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue']);
  languageServiceMock.getLangValue = (valUa: string, valEn: string) => valUa;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UbsAdminOrderDetailsFormComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: MatDialogRef, useValue: [] },
        { provide: LanguageService, useValue: languageServiceMock },
        OrderService,
        FormBuilder
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminOrderDetailsFormComponent);
    component = fixture.componentInstance;
    component.orderStatusInfo = orderStatusMock;
    component.orderDetailsForm = orderDetailsFormMock;
    component.orderDetails = orderDetailsMock as any;
    component.bagsInfo = bagsInfoMock;
    component.orderInfo = fakeOrderInfo;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('life cycle hook ngOnInit', () => {
    component.totalPaid = 300;
    component.orderInfo.generalOrderInfo.orderPaymentStatus = 'PAID';
    component.ngOnInit();
    expect(component.isVisible).toBe(component.orderStatusInfo.ableActualChange);
    expect(component.isOrderPaid).toBeTruthy();
    expect(component.orderDetailsForm.get('certificates').disable()).toBe(undefined);
  });

  it('should update writeoffAtStationSum, emit sum for station, and calculate final sum when changeWriteOffSum is called', () => {
    const emitSumForStationSpy = spyOn(component as any, 'emitSumForStation');
    const calculateFinalSumSpy = spyOn(component as any, 'calculateFinalSum');
    const eventMock = { target: { value: '150' } };
    component.changeWriteOffSum(eventMock);

    expect(component.writeoffAtStationSum).toEqual(150);
    expect(emitSumForStationSpy).toHaveBeenCalledWith(150);
    expect(calculateFinalSumSpy).toHaveBeenCalled();
  });

  it('should update courierPrice, check if courierPrice is invalid', () => {
    component.orderDetailsForm.patchValue({ orderFullPrice: 1000 });
    const emitUbsPriceSpy = spyOn(component as any, 'emitUbsPrice');
    const calculateFinalSumSpy = spyOn(component as any, 'calculateFinalSum');
    const eventMock = { target: { value: '150' } };
    component.changeUbsCourierSum(eventMock);

    expect(component.courierPrice).toEqual(150);
    expect(component.isCourierPriceInvalid).toBe(false);
    expect(emitUbsPriceSpy).toHaveBeenCalledWith(150);
    expect(calculateFinalSumSpy).toHaveBeenCalled();
  });

  it('should return true when the order is brought by himself and paid', () => {
    component.isOrderBroughtByHimself = true;
    component.isOrderPaid = true;

    expect(component.showWriteOffStationField()).toBeTruthy();
  });

  it('should return false when the order is not brought by himself', () => {
    component.isOrderBroughtByHimself = false;
    component.isOrderPaid = true;

    expect(component.showWriteOffStationField()).toBeFalsy();
  });

  it('should return false when the order is brought by himself but not paid, and no bonuses or certificate are used', () => {
    component.isOrderBroughtByHimself = true;
    component.isOrderPaid = false;
    component.orderDetails.bonuses = 0;
    component.orderDetails.certificateDiscount = 0;

    expect(component.showWriteOffStationField()).toBeFalsy();
  });

  it('should reset bagsInfo to the initial state', () => {
    (component as any).resetBagsInfo();

    const initialStateBagInfo = {
      amount: {
        planned: 0,
        confirmed: 0,
        actual: 0
      },
      sum: {
        planned: 0,
        confirmed: 0,
        actual: 0
      },
      finalSum: {
        planned: 0,
        confirmed: 0,
        actual: 0
      },
      bonuses: 0,
      certificateDiscount: 0
    };

    expect(component.bagsInfo).toEqual(initialStateBagInfo);
  });

  it('should calculate final sum correctly', () => {
    component.isVisible = true;
    component.showUbsCourier = true;
    component.courierPrice = 20;
    component.writeoffAtStationSum = 5;

    (component as any).calculateFinalSum();

    expect(component.bagsInfo.finalSum.planned).toBe(55);
    expect(component.bagsInfo.finalSum.actual).toBe(225);
  });

  it('should calculate final sum correctly', () => {
    const spy = spyOn(component as any, 'checkMinOrderLimit');
    const spy2 = spyOn(component as any, 'calculateOverpayment');
    const spy3 = spyOn(component as any, 'setFinalFullPrice');

    (component as any).calculateFinalSum();
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });

  it('should toggle the value of pageOpen property', () => {
    component.pageOpen = false;
    component.openDetails();
    expect(component.pageOpen).toBe(true);

    component.openDetails();
    expect(component.pageOpen).toBe(false);
  });

  it('should emit changeUbsCourierPrice when emitUbsPrice is called', () => {
    const changeUbsCourierPriceSpy = spyOn(component.changeUbsCourierPrice, 'emit');
    const sum = 50;
    (component as any).emitUbsPrice(sum);
    expect(changeUbsCourierPriceSpy).toHaveBeenCalledWith(sum);
  });

  it('should emit orderStatusChanged when emitChangedStatus is called', () => {
    const orderStatusChangedSpy = spyOn(component.orderStatusChanged, 'emit');
    (component as any).emitChangedStatus();
    expect(orderStatusChangedSpy).toHaveBeenCalled();
  });

  it('should emit changeWriteoffAtStationSum when emitSumForStation is called', () => {
    const changeWriteoffAtStationSumSpy = spyOn(component.changeWriteoffAtStationSum, 'emit');
    const sum = 30;
    (component as any).emitSumForStation(sum);
    expect(changeWriteoffAtStationSumSpy).toHaveBeenCalledWith(sum);
  });

  it('should emit changeCurrentPrice when emitCurrentOrderPrice is called', () => {
    const changeCurrentPriceSpy = spyOn(component.changeCurrentPrice, 'emit');
    const sum = 100;
    (component as any).emitCurrentOrderPrice(sum);
    expect(changeCurrentPriceSpy).toHaveBeenCalledWith(sum);
  });

  describe('getOrderBonusValue', () => {
    it('should return 0 if the order is cancelled', () => {
      component.isOrderCancelled = true;
      expect(component.getOrderBonusValue(100)).toEqual(0);
    });

    it('should return negative bonuses if the order is not cancelled and bonuses are present', () => {
      component.isOrderCancelled = false;
      expect(component.getOrderBonusValue(100)).toEqual('-100');
    });

    it('should return empty string if the order is not cancelled and bonuses are not present', () => {
      component.isOrderCancelled = false;
      expect(component.getOrderBonusValue(null)).toEqual('');
    });
  });

  it('should isDisabledConfirmQuantity() return true', () => {
    component.isOrderBroughtByHimself = true;
    component.isDisabledConfirmQuantity();
    expect(component.isDisabledConfirmQuantity()).toBeTruthy();
  });

  it('should isDisabledConfirmQuantity() return true', () => {
    component.isOrderBroughtByHimself = false;
    component.isOrderCancelled = false;
    component.isOrderNotTakenOut = false;
    component.isOrderDone = false;
    component.isDisabledConfirmQuantity();
    expect(component.isDisabledConfirmQuantity()).toBeFalsy();
  });

  it('should calculateOverpayment metod call if isOrderBroughtByHimself = true', () => {
    component.isOrderBroughtByHimself = true;
    component.orderDetails.bonuses = 10;
    component.orderDetails.paidAmount = 20;
    component.orderDetails.certificateDiscount = 5;
    component.writeoffAtStationSum = 7;
    (component as any).calculateOverpayment();
    expect(component.overpayment).toBe(28);
  });

  it('should calculateOverpayment metod call if showUbsCourier = true', () => {
    component.showUbsCourier = true;
    component.bagsInfo.sum.confirmed = 140;
    component.orderDetails.certificateDiscount = 12;
    component.courierPrice = 20;
    component.orderDetails.bonuses = 250;

    (component as any).calculateOverpayment();
    expect(component.overpayment).toBe(102);
  });

  it('should calculateOverpayment metod call if showUbsCourier = false and isOrderBroughtByHimself = false', () => {
    component.showUbsCourier = false;
    component.showUbsCourier = false;
    component.bagsInfo.sum.confirmed = 140;
    component.orderDetails.certificateDiscount = 12;
    component.orderDetails.bonuses = 250;
    component.orderDetails.paidAmount = 20;
    (component as any).calculateOverpayment();
    expect(component.overpayment).toBe(142);
  });

  it('should changeWriteOffSum metod call', () => {
    const eventMock = { target: { value: '150' } };
    const spy = spyOn(component as any, 'emitSumForStation');
    const spy2 = spyOn(component as any, 'calculateFinalSum');
    component.changeWriteOffSum(eventMock);
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should return ua value by getLangValue', () => {
    const value = component.getLangValue('value', 'enValue');
    expect(value).toBe('value');
  });
});
