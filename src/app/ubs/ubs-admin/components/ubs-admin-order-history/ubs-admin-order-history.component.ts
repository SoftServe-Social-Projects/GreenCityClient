import { Component, OnDestroy, Input, ViewEncapsulation, SimpleChanges, OnChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { IOrderHistory, IOrderInfo, INotTakenOutReason, ordersStatuses } from '../../models/ubs-admin.interface';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AddOrderCancellationReasonComponent } from '../add-order-cancellation-reason/add-order-cancellation-reason.component';
import { AddOrderNotTakenOutReasonComponent } from '../add-order-not-taken-out-reason/add-order-not-taken-out-reason.component';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Component({
  selector: 'app-ubs-admin-order-history',
  templateUrl: './ubs-admin-order-history.component.html',
  styleUrls: ['./ubs-admin-order-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UbsAdminOrderHistoryComponent implements OnDestroy, OnChanges, OnInit {
  @Input() orderInfo: IOrderInfo;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  private currentLanguage: string;
  pageOpen: boolean;
  orderHistory: IOrderHistory[];
  orderNotTakenOutReason: INotTakenOutReason;
  cancellationReason: string;
  cancellationComment: string;
  statusNotTakenOut = ordersStatuses.NotTakenOutUA;
  statusCancel = ordersStatuses.CancelUA;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.languageService
      .getCurrentLangObs()
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang) => {
        this.currentLanguage = lang;
        this.getOrderHistory(this.orderInfo.generalOrderInfo.id);
      });
  }

  parseEventName(eventName: string, index: number) {
    if (eventName.includes(' - ') && this.isParsableFormat(eventName)) {
      const parts = eventName.split('-').map((part) => part.trim());
      const [status, result] = parts;

      this.orderHistory[index].status = status;
      this.orderHistory[index].result = result;
    } else {
      this.orderHistory[index].status = eventName;
      this.orderHistory[index].result = null;
    }
  }

  private isParsableFormat(eventName: string): boolean {
    const parsablePatterns = ['Статус Замовлення', 'Order Status'];

    return parsablePatterns.some((pattern) => eventName.startsWith(pattern));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const orderID = this.orderInfo.generalOrderInfo.id;
    if (changes.orderInfo && this.currentLanguage) {
      this.getOrderHistory(orderID);
      this.getNotTakenOutReason(orderID);
      this.getOrderCancelReason(orderID);
    }
  }

  openDetails() {
    this.pageOpen = !this.pageOpen;
  }

  showPopup(orderHistoryId: number, event?: KeyboardEvent) {
    if (event && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
    }

    this.orderHistory.forEach((order) => {
      if (order.id !== orderHistoryId) {
        return;
      }
      if (order.result === ordersStatuses.CancelUA) {
        this.openCancelReason();
      }
      if (order.result === ordersStatuses.NotTakenOutUA) {
        this.openNotTakenOutReason(orderHistoryId);
      }
    });
  }

  openCancelReason() {
    this.dialog.open(AddOrderCancellationReasonComponent, {
      hasBackdrop: true,
      data: {
        isHistory: true,
        orderID: this.orderInfo.generalOrderInfo.id,
        reason: this.cancellationReason,
        comment: this.cancellationComment
      },
      maxHeight: '100vh'
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
        this.orderNotTakenOutReason = data;
      });
  }

  getOrderCancelReason(orderId: number) {
    this.orderService
      .getOrderCancelReason(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        this.cancellationReason = message.cancellationReason;
        this.cancellationComment = message.cancellationComment;
      });
  }

  getOrderHistory(orderId: number): void {
    this.orderService
      .getOrderHistory(orderId, this.currentLanguage)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: IOrderHistory[]) => {
        this.orderHistory = data;
        this.orderHistory.forEach((item, index) => {
          this.parseEventName(item.eventName, index);
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
