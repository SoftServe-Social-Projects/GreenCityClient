import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedCurrencyPipe } from 'src/app/shared/localized-currency-pipe/localized-currency.pipe';
import { UbsUserOrderPaymentPopUpComponent } from './ubs-user-order-payment-pop-up/ubs-user-order-payment-pop-up.component';

import { UbsUserOrdersListComponent } from './ubs-user-orders-list.component';

describe('UbsUserOrdersListComponent', () => {
  let component: UbsUserOrdersListComponent;
  let fixture: ComponentFixture<UbsUserOrdersListComponent>;

  const matDialogMock = jasmine.createSpyObj('dialog', ['open']);
  const fakeIputOrderData = [
    { generalOrderInfo: { id: 3, dateFormed: 55, orderPaymentStatus: 'UNPAID' }, orderDiscountedPrice: 55, extend: true },
    { generalOrderInfo: { id: 7, dateFormed: 66, orderPaymentStatus: 'HALF_PAID' }, orderDiscountedPrice: 0, extend: false },
    { generalOrderInfo: { id: 1, dateFormed: 11, orderPaymentStatus: 'PAID' }, orderDiscountedPrice: -55, extend: false }
  ];
  const fakePoints = 111;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UbsUserOrdersListComponent, LocalizedCurrencyPipe],
      imports: [MatDialogModule, MatExpansionModule, BrowserAnimationsModule, TranslateModule.forRoot()],
      providers: [{ provide: MatDialog, useValue: matDialogMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsUserOrdersListComponent);
    component = fixture.componentInstance;
    component.bonuses = fakePoints;
    component.orders = JSON.parse(JSON.stringify(fakeIputOrderData)) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sortingOrdersByData should be called in ngOnInit', () => {
    const sortingOrdersByDataSpy = spyOn(component, 'sortingOrdersByData');
    component.ngOnInit();
    expect(sortingOrdersByDataSpy).toHaveBeenCalled();
  });

  describe('isOrderPaid', () => {
    it('order is unpaid', () => {
      const isOrderPaidRes = component.isOrderPaid(fakeIputOrderData[0] as any);
      expect(isOrderPaidRes).toBeTruthy();
    });

    it('order is not unpaid', () => {
      const isOrderPaidRes = component.isOrderPaid(fakeIputOrderData[1] as any);
      expect(isOrderPaidRes).toBeFalsy();
    });
  });

  describe('isOrderHalfPaid', () => {
    it('order is half paid', () => {
      const isOrderHalfPaidRes = component.isOrderHalfPaid(fakeIputOrderData[1] as any);
      expect(isOrderHalfPaidRes).toBeTruthy();
    });

    it('order is not half paid', () => {
      const isOrderHalfPaidRes = component.isOrderHalfPaid(fakeIputOrderData[2] as any);
      expect(isOrderHalfPaidRes).toBeFalsy();
    });
  });

  describe('isOrderPriceGreaterThenZero', () => {
    it('price is greater then zero', () => {
      const isOrderPriceGreaterThenZeroRes = component.isOrderPriceGreaterThenZero(fakeIputOrderData[0] as any);
      expect(isOrderPriceGreaterThenZeroRes).toBeTruthy();
    });

    it('price is less then zero', () => {
      const isOrderPriceGreaterThenZeroRes = component.isOrderPriceGreaterThenZero(fakeIputOrderData[2] as any);
      expect(isOrderPriceGreaterThenZeroRes).toBeFalsy();
    });
  });

  describe('isOrderPaymentAccess', () => {
    it('isOrderPriceGreaterThenZero and isOrderPaid are true', () => {
      spyOn(component, 'isOrderPriceGreaterThenZero').and.returnValue(true);
      spyOn(component, 'isOrderPaid').and.returnValue(true);
      const isOrderPaymentAccessRes = component.isOrderPaymentAccess(fakeIputOrderData[0] as any);
      expect(isOrderPaymentAccessRes).toBeTruthy();
    });

    it('isOrderPriceGreaterThenZero and isOrderHalfPaid are true', () => {
      spyOn(component, 'isOrderPriceGreaterThenZero').and.returnValue(true);
      spyOn(component, 'isOrderHalfPaid').and.returnValue(true);
      const isOrderPaymentAccessRes = component.isOrderPaymentAccess(fakeIputOrderData[2] as any);
      expect(isOrderPaymentAccessRes).toBeTruthy();
    });

    it('isOrderPriceGreaterThenZero is false', () => {
      spyOn(component, 'isOrderPriceGreaterThenZero').and.returnValue(false);
      const isOrderPaymentAccessRes = component.isOrderPaymentAccess(fakeIputOrderData[2] as any);
      expect(isOrderPaymentAccessRes).toBeFalsy();
    });
  });

  describe('changeCard', () => {
    it('makes expected calls', () => {
      component.changeCard(7);
      expect(component.orders[0].extend).toBeTruthy();
      expect(component.orders[1].extend).toBeFalsy();
      expect(component.orders[2].extend).toBeFalsy();
    });
  });

  describe('openOrderPaymentDialog', () => {
    it('makes expected calls', () => {
      component.openOrderPaymentDialog(fakeIputOrderData[0] as any);
      expect(matDialogMock.open).toHaveBeenCalledWith(UbsUserOrderPaymentPopUpComponent, {
        data: {
          orderId: 3,
          price: 55,
          bonuses: 111
        }
      });
    });
  });

  describe('openOrderCancelDialog', () => {
    it('makes expected calls', () => {
      component.openOrderCancelDialog(fakeIputOrderData[0] as any);
      expect(matDialogMock.open).toHaveBeenCalled();
    });
  });

  describe('sortingOrdersByData', () => {
    it('sort orsers data', () => {
      const resultOrderData = [
        { generalOrderInfo: { id: 7, dateFormed: 66, orderPaymentStatus: 'HALF_PAID' }, orderDiscountedPrice: 0, extend: false },
        { generalOrderInfo: { id: 3, dateFormed: 55, orderPaymentStatus: 'UNPAID' }, orderDiscountedPrice: 55, extend: true },
        { generalOrderInfo: { id: 1, dateFormed: 11, orderPaymentStatus: 'PAID' }, orderDiscountedPrice: -55, extend: false }
      ];
      component.sortingOrdersByData();
      expect(component.orders).toEqual(resultOrderData as any);
    });
  });
});
