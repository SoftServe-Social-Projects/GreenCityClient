import { OrderService } from '../../services/order.service';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { UBSSubmitOrderComponent } from './ubs-submit-order.component';
import { UBSOrderFormService } from '../../services/ubs-order-form.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { orderDetailsMock, personalMockData } from 'src/app/ubs/mocks/order-data-mock';
import { Store } from '@ngrx/store';
import { orderDetailsSelector, orderSelectors, personalDataSelector } from 'src/app/store/selectors/order.selectors';
import { WarningPopUpComponent } from '@shared/components';
import { HttpErrorResponse } from '@angular/common/http';

describe('UBSSubmitOrderComponent', () => {
  let component: UBSSubmitOrderComponent;
  let fixture: ComponentFixture<UBSSubmitOrderComponent>;
  let store: jasmine.SpyObj<Store>;
  let orderService: jasmine.SpyObj<OrderService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['pipe']);
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['processExistingOrder', 'processNewOrder']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const localStorageServiceSpy = jasmine.createSpyObj('LocalStorageService', ['setUbsPaymentOrderId']);
    const langServiceSpy = jasmine.createSpyObj('LanguageService', ['getLangValue']);
    const spyRouter = jasmine.createSpyObj('Router', ['navigate']);

    storeSpy.pipe.and.callFake((selector: any) => {
      if (selector === orderSelectors) {
        return of({
          certificateUsed: 10,
          pointsUsed: 5,
          orderSum: 100,
          addressId: 123,
          locationId: 456,
          firstFormValid: true
        });
      } else if (selector === orderDetailsSelector) {
        return of(orderDetailsMock);
      } else if (selector === personalDataSelector) {
        return of(personalMockData);
      }
      return of(null);
    });

    await TestBed.configureTestingModule({
      declarations: [UBSSubmitOrderComponent],
      imports: [RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: Store, useValue: storeSpy },
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: UBSOrderFormService, useValue: {} },
        { provide: ActivatedRoute, useValue: { queryParams: of({ existingOrderId: 1 }) } },
        { provide: LocalStorageService, useValue: localStorageServiceSpy },
        { provide: LanguageService, useValue: langServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: spyRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UBSSubmitOrderComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with query params', () => {
    expect(component.existingOrderId).toBe(1);
  });

  it('should open confirmation dialog and call processOrder on confirmation', () => {
    const matDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    matDialogRef.afterClosed.and.returnValue(of(true));
    dialog.open.and.returnValue(matDialogRef);
    spyOn(component, 'processOrder');
    component.onCancel();

    expect(dialog.open).toHaveBeenCalledWith(WarningPopUpComponent, jasmine.any(Object));
    expect(component.processOrder).toHaveBeenCalledWith(false);
  });

  it('should process existing order successfully', () => {
    orderService.processExistingOrder.and.returnValue(of({ orderId: 123, link: 'https://' }));
    component.existingOrderId = 1;
    component.personalData = personalMockData;
    component.orderDetails = orderDetailsMock;
    component.processOrder(true);

    expect(component.isLoadingAnim).toBe(true);
    expect(orderService.processExistingOrder).toHaveBeenCalled();
  });

  it('should handle error and redirect on failure', () => {
    orderService.processExistingOrder.and.returnValue(throwError(() => new Error('Failed')));
    component.existingOrderId = 1;
    component.personalData = personalMockData;
    component.orderDetails = orderDetailsMock;
    component.processOrder(true);

    expect(component.isLoadingAnim).toBe(false);
  });

  it('should handle error from processExistingOrder', () => {
    const errorResponse = new HttpErrorResponse({
      error: { code: 'some code', message: 'some message' },
      status: 404
    });

    if (!router.navigate.calls) {
      spyOn(router, 'navigate');
    }

    orderService.processExistingOrder.and.returnValue(throwError(() => errorResponse));
    component.existingOrderId = 1;
    component.orderDetails = orderDetailsMock;
    component.processOrder();
    fixture.detectChanges();

    expect(component.isLoadingAnim).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['ubs', 'confirm']);
  });
});
