import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { forkJoin, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Bag, OrderDetails, PersonalData } from '../../ubs/models/ubs.interface';
import { OrderService } from '../../ubs/services/order.service';
import { UBSOrderFormService } from '../../ubs/services/ubs-order-form.service';
import { IUserOrderInfo, OrderStatusEn, PaymentStatusEn } from './models/UserOrder.interface';
import { UbsUserOrderCancelPopUpComponent } from './ubs-user-order-cancel-pop-up/ubs-user-order-cancel-pop-up.component';
import { UbsUserOrderPaymentPopUpComponent } from './ubs-user-order-payment-pop-up/ubs-user-order-payment-pop-up.component';

@Component({
  selector: 'app-ubs-user-orders-list',
  templateUrl: './ubs-user-orders-list.component.html',
  styleUrls: ['./ubs-user-orders-list.component.scss']
})
export class UbsUserOrdersListComponent implements OnInit, OnDestroy {
  @Input() orders: IUserOrderInfo[];
  @Input() bonuses: number;

  currentLanguage: string;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  orderDetails: OrderDetails;
  personalDetails: PersonalData;
  bags: Bag[];
  anotherClient = 'false';
  orderId: string;
  orderDetailsForSessionStorage;

  constructor(
    public dialog: MatDialog,
    private localStorageService: LocalStorageService,
    private router: Router,
    public ubsOrderService: UBSOrderFormService,
    public orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.localStorageService.getCurrentLanguage();
    this.localStorageService.languageSubject.pipe(takeUntil(this.destroy$)).subscribe((lang: string) => {
      this.currentLanguage = lang;
    });
    this.sortingOrdersByData();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  isOrderUnpaid(order: IUserOrderInfo): boolean {
    return order.paymentStatusEng === PaymentStatusEn.UNPAID;
  }

  isOrderHalfPaid(order: IUserOrderInfo): boolean {
    return order.paymentStatusEng === PaymentStatusEn.HALFPAID;
  }

  isOrderCanceled(order: IUserOrderInfo): boolean {
    return order.orderStatusEng === OrderStatusEn.CANCELED;
  }

  isOrderDoneOrCancel(order: IUserOrderInfo): boolean {
    const isOrderDone = order.orderStatusEng === OrderStatusEn.DONE;
    const isOrderCancelled = order.orderStatusEng === OrderStatusEn.CANCELED;
    return isOrderDone || isOrderCancelled;
  }

  isOrderPriceGreaterThenZero(order: IUserOrderInfo): boolean {
    return order.orderFullPrice > 0;
  }

  isOrderPaymentAccess(order: IUserOrderInfo): boolean {
    return (
      this.isOrderPriceGreaterThenZero(order) && (this.isOrderUnpaid(order) || this.isOrderHalfPaid(order)) && !this.isOrderCanceled(order)
    );
  }

  canOrderBeCancel(order: IUserOrderInfo): boolean {
    return (
      order.paymentStatusEng !== PaymentStatusEn.HALFPAID &&
      order.orderStatusEng !== OrderStatusEn.ADJUSTMENT &&
      order.orderStatusEng !== OrderStatusEn.BROUGHT_IT_HIMSELF &&
      order.orderStatusEng !== OrderStatusEn.NOT_TAKEN_OUT &&
      order.orderStatusEng !== OrderStatusEn.CANCELED &&
      order.orderStatusEng !== OrderStatusEn.DONE
    );
  }

  changeCard(id: number): void {
    this.orders.forEach((order) => (order.extend = order.id === id ? !order.extend : false));
  }

  private openOrderPaymentPopUp(order: IUserOrderInfo): void {
    this.dialog.open(UbsUserOrderPaymentPopUpComponent, {
      maxWidth: '500px',
      panelClass: 'ubs-user-order-payment-pop-up-vertical-scroll',
      data: {
        orderId: order.id,
        price: order.amountBeforePayment,
        bonuses: this.bonuses
      }
    });
  }

  openOrderPaymentDialog(order: IUserOrderInfo): void {
    const isOrderFormed = order.orderStatusEng === OrderStatusEn.FORMED;
    this.isOrderUnpaid(order) && isOrderFormed ? this.getDataForLocalStorage(order) : this.openOrderPaymentPopUp(order);
    this.orderService.cleanOrderState();
  }

  getBagsQuantity(bagTypeName: string, capacity: number, order: IUserOrderInfo): number | null {
    const bags = order.bags;
    const bag = bags.find((item) => item.capacity === capacity && item.service === bagTypeName);
    return bag ? bag.count : null;
  }

  getDataForLocalStorage(order: IUserOrderInfo): void {
    this.localStorageService.removeUbsOrderAndPersonalData();

    let orderDataResponse: OrderDetails;
    let personalDataResponse: PersonalData;

    const orderDataRequest: Observable<OrderDetails> = this.orderService
      .getExistingOrderDetails(order.id)
      .pipe(takeUntil(this.destroy$))
      .pipe(
        tap((orderData) => {
          orderDataResponse = orderData;
        })
      );
    const personalDataRequest: Observable<PersonalData> = this.orderService
      .getPersonalData()
      .pipe(takeUntil(this.destroy$))
      .pipe(
        tap((personalData) => {
          personalDataResponse = personalData;
        })
      );

    forkJoin([orderDataRequest, personalDataRequest]).subscribe(() => {
      this.bags = orderDataResponse.bags;
      this.bags.forEach((item) => {
        const bagsQuantity = this.getBagsQuantity(item.name, item.capacity, order);
        item.quantity = bagsQuantity;
      });

      this.orderDetails = {
        additionalOrders: order.additionalOrders,
        bags: this.bags,
        certificates: [],
        certificatesSum: 0,
        finalSum: order.orderFullPrice,
        orderComment: order.orderComment,
        points: this.bonuses,
        pointsSum: 0,
        pointsToUse: 0,
        total: order.orderFullPrice
      };

      this.personalDetails = personalDataResponse;
      this.personalDetails.senderEmail = order.sender.senderEmail !== this.personalDetails.email ? order.sender.senderEmail : null;
      this.personalDetails.senderFirstName = order.sender.senderName !== this.personalDetails.firstName ? order.sender.senderName : null;
      this.personalDetails.senderLastName =
        order.sender.senderSurname !== this.personalDetails.lastName ? order.sender.senderSurname : null;
      this.personalDetails.senderPhoneNumber =
        order.sender.senderPhone !== this.personalDetails.phoneNumber ? order.sender.senderPhone : null;
      this.anotherClient = order.sender.senderName !== this.personalDetails.firstName ? 'true' : 'false';
      this.orderId = order.id.toString();
      this.setDataToLocalStorage();
    });
  }

  private filterUtil(id: number) {
    return this.bags.filter((item) => item.id === id)[0].quantity;
  }

  setDataToLocalStorage(): void {
    const personalData = JSON.stringify(this.personalDetails);
    const orderData = JSON.stringify(this.orderDetails);
    this.localStorageService.setUbsOrderDataBeforeRedirect(personalData, orderData, this.anotherClient, this.orderId);
    this.redirectToStepOne();
  }

  redirectToStepOne(): void {
    this.router.navigate(['ubs/order'], { queryParams: { existingOrderId: this.orderId } });
  }

  openOrderCancelDialog(order: IUserOrderInfo): void {
    this.dialog.open(UbsUserOrderCancelPopUpComponent, {
      data: {
        orderId: order.id,
        orders: this.orders
      }
    });
  }

  sortingOrdersByData(): void {
    this.orders.sort((a: IUserOrderInfo, b: IUserOrderInfo): number => (a.dateForm < b.dateForm ? 1 : -1));
  }
}
