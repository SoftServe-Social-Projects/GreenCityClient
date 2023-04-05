import { Component, OnDestroy, Input, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { IOrderHistory, IOrderInfo, INotTakenOutReason, ordersStatuses } from '../../models/ubs-admin.interface';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AddOrderCancellationReasonComponent } from '../add-order-cancellation-reason/add-order-cancellation-reason.component';
import { AddOrderNotTakenOutReasonComponent } from '../add-order-not-taken-out-reason/add-order-not-taken-out-reason.component';

@Component({
  selector: 'app-ubs-admin-order-history',
  templateUrl: './ubs-admin-order-history.component.html',
  styleUrls: ['./ubs-admin-order-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UbsAdminOrderHistoryComponent implements OnDestroy, OnChanges {
  @Input() orderInfo: IOrderInfo;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  pageOpen: boolean;
  orderHistory: IOrderHistory[];
  public isHistory = true;
  orderNotTakenOutReason: INotTakenOutReason;
  coloredStatus = ordersStatuses.NotTakenOutUA && ordersStatuses.CanselUA;

  constructor(private orderService: OrderService, private dialog: MatDialog) {}

  parseEventName(eventName: string, index: number) {
    const parts = eventName.split('-').map((part) => part.trim());
    const [status, result] = parts;

    this.orderHistory[index].status = status;
    this.orderHistory[index].result = result;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const orderID = this.orderInfo.generalOrderInfo.id;
    if (changes.orderInfo) {
      this.getOrderHistory(orderID);
      this.getNotTakenOutReason(orderID);
    }
  }

  openDetails() {
    this.pageOpen = !this.pageOpen;
  }

  showPopup(orderHistoryId) {
    this.orderHistory.forEach((order) => {
      if (order.id === orderHistoryId && order.result === ordersStatuses.CanselUA) {
        this.openCancelReason();
      }
      if (order.id === orderHistoryId && order.result === ordersStatuses.NotTakenOutUA) {
        this.openNotTakenOutReason(orderHistoryId);
      }
    });
  }

  openCancelReason() {
    this.dialog.open(AddOrderCancellationReasonComponent, {
      hasBackdrop: true,
      data: {
        isHistory: this.isHistory,
        orderID: this.orderInfo.generalOrderInfo.id
      }
    });
  }

  openNotTakenOutReason(orderHistoryId: number): void {
    this.dialog.open(AddOrderNotTakenOutReasonComponent, {
      hasBackdrop: true,
      data: {
        id: orderHistoryId,
        isFromHistory: true,
        orderID: this.orderInfo.generalOrderInfo.id,
        description: this.orderNotTakenOutReason.description,
        images: this.orderNotTakenOutReason.images
      }
    });
  }

  getNotTakenOutReason(orderId: number) {
    this.orderService
      .getNotTakenOutReason(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log('data', data);
        this.orderNotTakenOutReason = data;
      });
  }

  getOrderHistory(orderId: number): void {
    this.orderService
      .getOrderHistory(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: IOrderHistory[]) => {
        this.orderHistory = data;
        this.orderHistory.forEach((item, index) => {
          this.parseEventName(item.eventName, index);
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
