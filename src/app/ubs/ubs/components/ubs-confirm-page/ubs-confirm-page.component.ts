import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { JwtService } from '@global-service/jwt/jwt.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import { UBSOrderFormService } from '../../services/ubs-order-form.service';

@Component({
  selector: 'app-ubs-confirm-page',
  templateUrl: './ubs-confirm-page.component.html',
  styleUrls: ['./ubs-confirm-page.component.scss']
})
export class UbsConfirmPageComponent implements OnInit, OnDestroy {
  orderId: string;
  private routeSubscription: Subscription;
  orderResponseError = false;
  orderStatusDone: boolean;
  isSpinner = true;
  pageReloaded = false;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private snackBar: MatSnackBarComponent,
    private jwtService: JwtService,
    private ubsOrderFormService: UBSOrderFormService,
    private shareFormService: UBSOrderFormService,
    public localStorageService: LocalStorageService,
    private orderService: OrderService,
    public router: Router
  ) {}

  toPersonalAccount(): void {
    this.jwtService.userRole$.pipe(takeUntil(this.destroy$)).subscribe((userRole) => {
      const isAdmin = userRole === 'ROLE_UBS_EMPLOYEE';
      this.saveDataOnLocalStorage();
      this.localStorageService.clearPaymentInfo();
      this.router.navigate([isAdmin ? 'ubs-admin' : 'ubs-user', 'orders']);
    });
  }

  ngOnInit() {
    const orderIdWithoutPayment = this.localStorageService.getUbsOrderId();
    this.ubsOrderFormService.orderId.pipe(takeUntil(this.destroy$)).subscribe((oderID) => {
      if (!oderID && this.localStorageService.getUbsBonusesOrderId()) {
        oderID = this.localStorageService.getUbsBonusesOrderId();
        this.pageReloaded = true;
      }
      if (oderID || orderIdWithoutPayment) {
        this.orderId = oderID || this.localStorageService.getUbsOrderId();
        this.orderResponseError = !this.pageReloaded ? this.ubsOrderFormService.getOrderResponseErrorStatus() : !this.pageReloaded;
        this.orderStatusDone = !this.pageReloaded ? this.ubsOrderFormService.getOrderStatus() : this.pageReloaded;
        this.checkPaymentStatus();
        this.removeOrderFromLocalStorage();
        this.renderView();
      } else {
        this.orderService
          .getUbsOrderStatus()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.orderResponseError = response?.result === 'error';
              this.orderStatusDone = !this.orderResponseError;
              this.orderId = response.order_id ? response.order_id.split('_')[0] : this.localStorageService.getUbsPaymentOrderId();
              this.renderView();
              this.isSpinner = false;
            },
            error: (error) => {
              this.orderResponseError = true;
              this.isSpinner = false;
              console.log(error);
            }
          });
      }
    });
  }

  removeOrderFromLocalStorage(): void {
    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url.toString() !== '/ubs/confirm') {
        this.localStorageService.removeOrderWithoutPayment();
        this.localStorageService.removeUbsOrderId();
      }
    });
  }

  checkPaymentStatus(): void {
    const isOrderSavedWithoutPayment = this.localStorageService.getOrderWithoutPayment();
    if (isOrderSavedWithoutPayment) {
      this.localStorageService.setUbsOrderId(this.orderId);
    }
    this.isSpinner = false;
  }

  isUserPageOrderPayment(): boolean {
    return this.localStorageService.getUserPagePayment() === 'true' || this.pageReloaded;
  }

  renderView(): void {
    if (!this.orderResponseError && !this.orderStatusDone) {
      this.saveDataOnLocalStorage();
      const existingOrderId = this.localStorageService.getExistingOrderId();
      existingOrderId
        ? this.snackBar.openSnackBar('successConfirmUpdateOrder')
        : this.snackBar.openSnackBar('successConfirmSaveOrder', this.orderId);
      this.localStorageService.removeUBSExistingOrderId();
    } else if (!this.orderResponseError && this.orderStatusDone) {
      this.saveDataOnLocalStorage();
    }
  }

  saveDataOnLocalStorage(): void {
    this.shareFormService.isDataSaved = true;
    this.orderService.cleanOrderState();
  }

  returnToPayment(url: string): void {
    this.router.navigateByUrl(url);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.localStorageService.clearPaymentInfo();
  }
}
