import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UbsUserOrderPaymentPopUpComponent } from './ubs-user-order-payment-pop-up/ubs-user-order-payment-pop-up.component';
import { UbsUserOrderCancelPopUpComponent } from './ubs-user-order-cancel-pop-up/ubs-user-order-cancel-pop-up.component';
import { IUserOrderInfo, CheckPaymentStatus, CheckOrderStatus } from './models/UserOrder.interface';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Bag, OrderDetails, PersonalData } from '../../ubs/models/ubs.interface';
import { Router } from '@angular/router';
import { OrderService } from '../../ubs/services/order.service';
import { UBSOrderFormService } from '../../ubs/services/ubs-order-form.service';

@Component({
  selector: 'app-ubs-user-orders-list',
  templateUrl: './ubs-user-orders-list.component.html',
  styleUrls: ['./ubs-user-orders-list.component.scss']
})
export class UbsUserOrdersListComponent implements OnInit, OnDestroy {
  @Input() orders: IUserOrderInfo[];
  @Input() bonuses: number;

  public currentLanguage: string;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  orderDetails: OrderDetails;
  personalDetails: PersonalData;
  bags: Bag[];

  constructor(
    public dialog: MatDialog,
    private localStorageService: LocalStorageService,
    private router: Router,
    public ubsOrderService: UBSOrderFormService
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

  public isOrderUnpaid(order: IUserOrderInfo): boolean {
    return order.paymentStatusEng === CheckPaymentStatus.UNPAID;
  }

  public isOrderHalfPaid(order: IUserOrderInfo): boolean {
    return order.paymentStatusEng === CheckPaymentStatus.HALFPAID;
  }

  public isOrderCanceled(order: IUserOrderInfo): boolean {
    return order.orderStatusEng === CheckOrderStatus.CANCELED;
  }

  public isOrderPriceGreaterThenZero(order: IUserOrderInfo): boolean {
    return order.orderFullPrice > 0;
  }

  public isOrderPaymentAccess(order: IUserOrderInfo): boolean {
    return this.isOrderPriceGreaterThenZero(order) && (this.isOrderUnpaid(order) || this.isOrderHalfPaid(order));
  }

  public changeCard(id: number): void {
    this.orders.forEach((order) => (order.extend = order.id === id ? !order.extend : false));
  }

  public openOrderPaymentDialog(order: IUserOrderInfo): void {
    if (order.paymentStatusEng === 'Unpaid') {
      this.getUserData();
      this.setDataForLocalStorage(order);
      const personalData = JSON.stringify(this.personalDetails);
      const orderData = JSON.stringify(this.orderDetails);
      this.localStorageService.setUbsOrderData(personalData, orderData);
      this.router.navigate(['ubs/order'], { queryParams: { isThisExistingOrder: true } });
    } else {
      this.dialog.open(UbsUserOrderPaymentPopUpComponent, {
        data: {
          orderId: order.id,
          price: order.orderFullPrice,
          bonuses: this.bonuses
        }
      });
    }
  }

  public getBagsQuantity(bagTypeName: string, capacity: number, order: IUserOrderInfo): number | null {
    const bags = order.bags;
    const bag = bags.find((item) => {
      return item.capacity === capacity && item.service === bagTypeName;
    });
    return bag ? bag.count : null;
  }

  public getUserData(): void {
    this.localStorageService.removeUbsOrderData();
    this.personalDetails = this.ubsOrderService.getPersonalData();
  }

  public setDataForLocalStorage(order: IUserOrderInfo): void {
    this.bags = [
      {
        id: 1,
        capacity: 120,
        name: 'Безпечні відходи',
        nameEng: 'Safe waste',
        price: 250,
        quantity: this.getBagsQuantity('Безпечні відходи', 120, order)
      },
      {
        id: 2,
        capacity: 120,
        name: 'Текстильні відходи',
        nameEng: 'Textile waste',
        price: 300,
        quantity: this.getBagsQuantity('Текстильні відходи', 120, order)
      },
      {
        id: 3,
        capacity: 20,
        name: 'Текстильні відходи',
        nameEng: 'Textile waste',
        price: 50,
        quantity: this.getBagsQuantity('Текстильні відходи', 20, order)
      }
    ];

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
    this.personalDetails.senderEmail = order.sender.senderEmail;
    this.personalDetails.senderFirstName = order.sender.senderName;
    this.personalDetails.senderLastName = order.sender.senderSurname;
    this.personalDetails.senderPhoneNumber = order.sender.senderPhone;
  }

  public openOrderCancelDialog(order: IUserOrderInfo): void {
    this.dialog.open(UbsUserOrderCancelPopUpComponent, {
      data: {
        orderId: order.id,
        orders: this.orders
      }
    });
  }

  public sortingOrdersByData(): void {
    this.orders.sort((a: IUserOrderInfo, b: IUserOrderInfo): number => {
      return a.dateForm < b.dateForm ? 1 : -1;
    });
  }
}
