import { of } from 'rxjs';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { JwtService } from '@global-service/jwt/jwt.service';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { UbsConfirmPageComponent } from './ubs-confirm-page.component';
import { UBSOrderFormService } from '../../services/ubs-order-form.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('UbsConfirmPageComponent', () => {
  let component: UbsConfirmPageComponent;
  let fixture: ComponentFixture<UbsConfirmPageComponent>;
  let router: Router;
  const fakeSnackBar = jasmine.createSpyObj('fakeSnakBar', ['openSnackBar']);
  const fakeUBSOrderFormService = jasmine.createSpyObj('fakeUBSService', [
    'getOrderResponseErrorStatus',
    'getOrderStatus',
    'saveDataOnLocalStorage'
  ]);
  const fakeLocalStorageService = jasmine.createSpyObj('localStorageService', [
    'getFinalSumOfOrder',
    'clearPaymentInfo',
    'getUbsOrderId',
    'setUbsOrderId',
    'getOrderWithoutPayment',
    'removeOrderWithoutPayment',
    'removeUbsOrderId'
  ]);
  const fakeJwtService = jasmine.createSpyObj('fakeJwtService', ['']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UbsConfirmPageComponent],
      imports: [TranslateModule.forRoot(), RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: MatSnackBarComponent, useValue: fakeSnackBar },
        { provide: UBSOrderFormService, useValue: fakeUBSOrderFormService },
        { provide: JwtService, useValue: fakeJwtService },
        { provide: LocalStorageService, useValue: fakeLocalStorageService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsConfirmPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fakeUBSOrderFormService.orderId = of('123');
    fakeJwtService.userRole$ = of('ROLE_UBS_EMPLOYEE');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call renderView with oderID', () => {
    fakeUBSOrderFormService.getOrderResponseErrorStatus.and.returnValue(false);
    fakeUBSOrderFormService.getOrderStatus.and.returnValue(of({ result: 'success', order_id: '123_456' }));
    const renderViewMock = spyOn(component, 'renderView');
    const checkPaymentStatusMock = spyOn(component, 'checkPaymentStatus');
    component.ngOnInit();
    expect(renderViewMock).toHaveBeenCalled();
    expect(checkPaymentStatusMock).toHaveBeenCalled();
  });

  it('ngOnInit should call renderView without oderID', () => {
    const orderService = 'orderService';
    spyOn(component[orderService], 'getUbsOrderStatus').and.returnValue(of({ result: 'success', order_id: '123_456' }));
    const renderViewMock = spyOn(component, 'renderView');
    component.ngOnInit();
    expect(renderViewMock).toHaveBeenCalled();
    expect(component.isSpinner).toBeFalsy();
    expect(component.orderResponseError).toBeFalsy();
  });

  it('in renderView should saveDataOnLocalStorage and openSnackBar be called', () => {
    component.orderStatusDone = false;
    component.orderResponseError = false;
    component.orderId = '132';
    const saveDataOnLocalStorageMock = spyOn(component, 'saveDataOnLocalStorage');
    component.renderView();
    expect(saveDataOnLocalStorageMock).toHaveBeenCalled();
    expect(fakeSnackBar.openSnackBar).toHaveBeenCalledWith('successConfirmSaveOrder', '132');
  });

  it('checkPaymentStatus should set true to orderPaymentError if response.code is payment_not_found', () => {
    const orderService = 'orderService';
    spyOn(component[orderService], 'getUbsOrderStatus').and.returnValue(of({ code: 'payment_not_found', order_id: '123_457' }));
    fakeLocalStorageService.getFinalSumOfOrder.and.returnValue('999');
    component.checkPaymentStatus();
    expect(component.isSpinner).toBeFalsy();
  });

  it('in renderView should saveDataOnLocalStorage when no error occurred', () => {
    component.orderStatusDone = true;
    component.orderResponseError = false;
    const saveDataOnLocalStorageMock = spyOn(component, 'saveDataOnLocalStorage');
    component.renderView();
    expect(saveDataOnLocalStorageMock).toHaveBeenCalled();
  });

  it('in saveDataOnLocalStorage should saveDataOnLocalStorage be called', () => {
    it('in saveDataOnLocalStorage should removeUbsOrderId and saveDataOnLocalStorage be called', () => {
      component.saveDataOnLocalStorage();
      expect(fakeUBSOrderFormService.saveDataOnLocalStorage).toHaveBeenCalled();
    });

    it('should redirect to order', () => {
      const navigateSpy = spyOn(router, 'navigateByUrl');
      component.returnToPayment('/ubs/order');
      expect(navigateSpy).toHaveBeenCalledWith('/ubs/order');
    });

    it('should redirect to ubs-admin/orders', () => {
      const navigateSpy = spyOn(router, 'navigate');
      const saveDataOnLocalStorageMock = spyOn(component, 'saveDataOnLocalStorage');
      component.toPersonalAccount();
      expect(saveDataOnLocalStorageMock).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['ubs-admin', 'orders']);
    });

    it('should redirect to ubs-user/orders', () => {
      fakeJwtService.userRole$ = of('ROLE_USER');
      const navigateSpy = spyOn(router, 'navigate');
      const saveDataOnLocalStorageMock = spyOn(component, 'saveDataOnLocalStorage');
      component.toPersonalAccount();
      expect(saveDataOnLocalStorageMock).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['ubs-user', 'orders']);
    });
  });
});
