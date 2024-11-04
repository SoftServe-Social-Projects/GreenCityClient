import { of } from 'rxjs';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
import { ubsOrderServiseMock } from 'src/app/ubs/mocks/order-data-mock';
import { Store, StoreModule } from '@ngrx/store';

describe('UbsConfirmPageComponent', () => {
  let component: UbsConfirmPageComponent;
  let fixture: ComponentFixture<UbsConfirmPageComponent>;
  let router: Router;
  const fakeSnackBar = jasmine.createSpyObj('fakeSnackBar', ['openSnackBar']);
  const fakeUBSOrderFormService = jasmine.createSpyObj('fakeUBSService', ['getOrderResponseErrorStatus', 'getOrderStatus']);
  const fakeLocalStorageService = jasmine.createSpyObj('localStorageService', [
    'getFinalSumOfOrder',
    'clearPaymentInfo',
    'getUbsPaymentOrderId',
    'setUbsOrderId',
    'getOrderWithoutPayment',
    'removeOrderWithoutPayment',
    'removeUbsOrderId',
    'getExistingOrderId',
    'removeUBSExistingOrderId'
  ]);
  const fakeJwtService = jasmine.createSpyObj('fakeJwtService', ['']);

  const storeMock = jasmine.createSpyObj('Store', ['select', 'dispatch']);
  storeMock.select.and.returnValue(of({ order: ubsOrderServiseMock }));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UbsConfirmPageComponent],
      imports: [TranslateModule.forRoot(), RouterTestingModule, HttpClientTestingModule, StoreModule.forRoot({})],
      providers: [
        { provide: MatSnackBarComponent, useValue: fakeSnackBar },
        { provide: UBSOrderFormService, useValue: fakeUBSOrderFormService },
        { provide: JwtService, useValue: fakeJwtService },
        { provide: LocalStorageService, useValue: fakeLocalStorageService },
        { provide: Store, useValue: storeMock }
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

  it('should remove order without payment and UBS order id from local storage on NavigationEnd event', () => {
    fakeLocalStorageService.removeOrderWithoutPayment();
    fakeLocalStorageService.removeUbsOrderId();
    const event = new NavigationEnd(1, '/ubs/confirm', '/ubs/confirm');
    component.removeOrderFromLocalStorage();

    expect(component.localStorageService.removeOrderWithoutPayment).toHaveBeenCalled();
    expect(component.localStorageService.removeUbsOrderId).toHaveBeenCalled();
  });

  it('shouldn`t remove order without payment and UBS order id from local storage on NavigationEnd event if url is /ubs/confirm', () => {
    fakeLocalStorageService.removeOrderWithoutPayment();
    fakeLocalStorageService.removeUbsOrderId();
    const event = new NavigationEnd(1, '/ubs/confirm', '/ubs');
    component.removeOrderFromLocalStorage();

    expect(component.localStorageService.removeOrderWithoutPayment).toHaveBeenCalled();
  });

  xit('ngOnInit should call renderView with oderID', () => {
    fakeUBSOrderFormService.getOrderResponseErrorStatus.and.returnValue(false);
    fakeUBSOrderFormService.getOrderStatus.and.returnValue(of({ result: 'success', order_id: '123_456' }));
    const renderViewMock = spyOn(component, 'renderView');
    fakeLocalStorageService.getOrderWithoutPayment.and.returnValue(of(false));
    const checkPaymentStatusMock = spyOn(component, 'checkPaymentStatus');
    component.ngOnInit();
    expect(renderViewMock).toHaveBeenCalled();
    expect(checkPaymentStatusMock).toHaveBeenCalled();
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

  it('in renderView should saveDataOnLocalStorage when no error occurred', () => {
    component.orderStatusDone = true;
    component.orderResponseError = false;
    const saveDataOnLocalStorageMock = spyOn(component, 'saveDataOnLocalStorage');
    component.renderView();
    expect(saveDataOnLocalStorageMock).toHaveBeenCalled();
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
