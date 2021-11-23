import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserOrdersService } from '../services/user-orders.service';
import { UbsUserOrderPaymentPopUpComponent } from './ubs-user-order-payment-pop-up/ubs-user-order-payment-pop-up.component';

@Component({
  selector: 'app-ubs-user-orders-list',
  templateUrl: './ubs-user-orders-list.component.html',
  styleUrls: ['./ubs-user-orders-list.component.scss']
})
export class UbsUserOrdersListComponent {
  @Input() orders: any[];

  constructor(private userOrdersService: UserOrdersService) {}

  constructor(private userOrdersService: UserOrdersService, public dialog: MatDialog) {}

  isOrderFormed(order: any) {
    return order.orderStatus === 'FORMED';
  }

  isOrderUnpaid(order: any) {
    return order.orderStatus === 'DONE_UNPAID' || order.orderStatus === 'FORMED';
  }

  isOrderDone(order: any) {
    return order.orderStatus === 'ON_THE_ROUTE' || order.orderStatus === 'CONFIRMED' || order.orderStatus === 'DONE';
  }

  changeCard(id: number) {
    this.orders.forEach((order) => {
      if (order.id === id) {
        order.extend = !order.extend;
      }
    });
  }

  openOrderPaymentDialog(order: any) {
    this.dialog.open(UbsUserOrderPaymentPopUpComponent, {
      data: {
        price: order.orderDiscountedPrice,
        orderId: order.id
      }
    });
    
  deleteCard(orderId: number) {
    this.userOrdersService.deleteOrder(orderId).subscribe();
    for (let i = 0; i < this.orders.length; i++) {
      if (this.orders[i].id === orderId) {
        this.orders.splice(i, 1);
        break;
      }
    }
  }
}
