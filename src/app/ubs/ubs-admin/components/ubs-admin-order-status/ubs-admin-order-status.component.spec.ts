import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { OrderService } from '../../services/order.service';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddOrderCancellationReasonComponent } from '../add-order-cancellation-reason/add-order-cancellation-reason.component';

import { UbsAdminOrderStatusComponent } from './ubs-admin-order-status.component';
import { of, Subject } from 'rxjs';

describe('UbsAdminOrderStatusComponent', () => {
  let component: UbsAdminOrderStatusComponent;
  let fixture: ComponentFixture<UbsAdminOrderStatusComponent>;

  const OrderServiceFake = {
    getAvailableOrderStatuses: jasmine.createSpy('getAvailableOrderStatuses')
  };

  const matDialogMock = jasmine.createSpyObj('matDialog', ['open']);
  const dialogRefStubCancel = {
    afterClosed() {
      return of({ action: 'cancel', reason: 'OTHER', comment: 'coment' });
    }
  };
  const dialogRefStubOther = {
    afterClosed() {
      return of({ action: false, reason: 'OTHER', comment: 'coment' });
    }
  };

  const FormGroupMock = new FormGroup({
    orderStatus: new FormControl(''),
    paymentStatus: new FormControl(''),
    adminComment: new FormControl(''),
    cancellationReason: new FormControl(''),
    cancellationComment: new FormControl('')
  });

  const GeneralInfoFake = {
    orderStatus: 'DONE',
    adminComment: 'Admin',
    orderPaymentStatus: 'PAID',
    orderStatusesDtos: [
      { ableActualChange: false, key: 'DONE', translation: 'Formed' },
      { ableActualChange: false, key: 'ADJUSTMENT', translation: 'Adjustment' },
      { ableActualChange: false, key: 'BROUGHT_IT_HIMSELF', translation: 'Brought by himself' },
      { ableActualChange: true, key: 'CANCELED', translation: 'Canceled' }
    ]
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UbsAdminOrderStatusComponent],
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
      providers: [
        { provide: OrderService, useValue: OrderServiceFake },
        { provide: MatDialog, useValue: matDialogMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminOrderStatusComponent);
    component = fixture.componentInstance;
    component.generalInfo = GeneralInfoFake as any;
    component.generalOrderInfo = FormGroupMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges should call setOrderPaymentStatus once', () => {
    component.currentOrderPrice = 2;
    spyOn(component, 'setOrderPaymentStatus');
    component.ngOnChanges({ currentOrderPrice: true } as any);
    expect(component.setOrderPaymentStatus).toHaveBeenCalledTimes(1);
  });

  it('getAvailableOrderStatuses should been called once ', () => {
    OrderServiceFake.getAvailableOrderStatuses.calls.reset();
    component.ngOnInit();
    expect(component.orderService.getAvailableOrderStatuses).toHaveBeenCalledTimes(1);
  });

  it('onChangedOrderStatus should call changedOrderStatus and openPopup', () => {
    spyOn(component, 'openPopup');
    spyOn(component.changedOrderStatus, 'emit');

    component.onChangedOrderStatus('CANCELED');
    expect(component.changedOrderStatus.emit).toHaveBeenCalled();
    expect(component.openPopup).toHaveBeenCalledTimes(1);
  });

  it('openPopup  dialog.open should been called with arguments and onChangedOrderStatus called once', () => {
    spyOn(component, 'onChangedOrderStatus');
    matDialogMock.open.and.returnValue(dialogRefStubCancel as any);
    component.openPopup();
    expect(component.onChangedOrderStatus).toHaveBeenCalledTimes(1);
  });

  it('openPopup  dialog.open should been called and pass res.Reason', () => {
    spyOn(component, 'onChangedOrderStatus');
    matDialogMock.open.and.returnValue(dialogRefStubOther as any);
    component.openPopup();
    expect((component as any).dialog.open).toHaveBeenCalledWith(AddOrderCancellationReasonComponent, {
      hasBackdrop: true
    });
  });

  it('setOrderPaymentStatus orderState shold be "confirmed" and should return orderPayment status UNPAID ', () => {
    GeneralInfoFake.orderStatusesDtos[0].ableActualChange = false;
    component.currentOrderPrice = 1;
    component.totalPaid = 0;
    component.setOrderPaymentStatus();
    expect(GeneralInfoFake.orderPaymentStatus).toBe('UNPAID');
  });

  it('setOrderPaymentStatus orderState shold be "confirmed" and should return orderPayment status HALF_PAID', () => {
    GeneralInfoFake.orderStatusesDtos[0].ableActualChange = false;
    component.currentOrderPrice = 2;
    component.totalPaid = 1;
    component.setOrderPaymentStatus();
    expect(GeneralInfoFake.orderPaymentStatus).toBe('HALF_PAID');
  });

  it('setOrderPaymentStatus orderState shold be "confirmed" and should return orderPayment status PAID', () => {
    GeneralInfoFake.orderStatusesDtos[0].ableActualChange = false;
    component.currentOrderPrice = 0;
    component.totalPaid = 1;
    component.setOrderPaymentStatus();
    expect(GeneralInfoFake.orderPaymentStatus).toBe('PAID');
  });

  it('setOrderPaymentStatus orderState shold be "actual" and should return orderPayment status UNPAID', () => {
    GeneralInfoFake.orderStatusesDtos[0].ableActualChange = true;
    component.currentOrderPrice = 0;
    component.totalPaid = 0;
    component.setOrderPaymentStatus();
    expect(GeneralInfoFake.orderPaymentStatus).toBe('UNPAID');
  });

  it('destroy Subject should be closed after ngOnDestroy()', () => {
    (component as any).destroy$ = new Subject<boolean>();
    spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect((component as any).destroy$.complete).toHaveBeenCalledTimes(1);
  });
});
