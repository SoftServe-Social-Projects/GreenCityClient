import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { IGeneralOrderInfo, IPaymentStatus, NotTakenOutReasonImages } from '../../models/ubs-admin.interface';
import { OrderService } from '../../services/order.service';
import { MatDialog } from '@angular/material/dialog';
import { AddOrderCancellationReasonComponent } from '../add-order-cancellation-reason/add-order-cancellation-reason.component';
import { AddOrderNotTakenOutReasonComponent } from '../add-order-not-taken-out-reason/add-order-not-taken-out-reason.component';
import { OrderStatus, PaymnetStatus, CancellationReason } from 'src/app/ubs/ubs/order-status.enum';
import { OrderStatusEn, PaymentStatusEn } from 'src/app/ubs/ubs-user/ubs-user-orders-list/models/UserOrder.interface';

@Component({
  selector: 'app-ubs-admin-order-status',
  templateUrl: './ubs-admin-order-status.component.html',
  styleUrls: ['./ubs-admin-order-status.component.scss']
})
export class UbsAdminOrderStatusComponent implements OnChanges, OnInit, OnDestroy {
  @Input() currentOrderPrice: number;
  @Input() generalOrderInfo: FormGroup;
  @Input() totalPaid: number;
  @Input() unPaidAmount: number;
  @Input() generalInfo: IGeneralOrderInfo;
  @Input() currentLanguage: string;
  @Input() additionalPayment: string;
  @Input() isEmployeeCanEditOrder: boolean;
  @Output() changedOrderStatus = new EventEmitter<string>();
  @Output() cancelReason = new EventEmitter<string>();
  @Output() notTakenOutReason = new EventEmitter<{ description: string; images: NotTakenOutReasonImages[] }>();

  constructor(
    public orderService: OrderService,
    private dialog: MatDialog
  ) {}
  private destroy$: Subject<boolean> = new Subject<boolean>();

  availableOrderStatuses;
  availablePaymentOrderStatuses: IPaymentStatus[];
  isOrderStatusSelected = true;
  isHistory = false;
  uneditableStatus: boolean;

  get adminComment() {
    return this.generalOrderInfo.get('adminComment');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.additionalPayment) {
      this.generalInfo.orderPaymentStatus = changes.additionalPayment.currentValue;
    }
    if (changes.currentOrderPrice || changes.totalPaid) {
      this.setOrderPaymentStatus();
    }

    if (changes.generalInfo) {
      if (changes.generalInfo.currentValue.orderPaymentStatusNameEng === PaymentStatusEn.UNPAID) {
        this.generalInfo.orderPaymentStatus = PaymnetStatus.UNPAID;
      }
      this.availableOrderStatuses = this.orderService.getAvailableOrderStatuses(
        changes.generalInfo.currentValue.orderStatus,
        changes.generalInfo.currentValue.orderStatusesDtos
      );
      if (changes.generalInfo.currentValue.orderStatus) {
        this.updateUneditableStatus(changes.generalInfo.currentValue.orderStatus);
      }
      this.renderOrderStatus();
    }
  }

  ngOnInit() {
    this.availableOrderStatuses = this.orderService.getAvailableOrderStatuses(
      this.generalInfo.orderStatus,
      this.generalInfo.orderStatusesDtos
    );
    this.availablePaymentOrderStatuses = this.generalInfo.orderPaymentStatusesDto;
  }

  private renderOrderStatus() {
    setTimeout(() => (this.isOrderStatusSelected = false));
    setTimeout(() => (this.isOrderStatusSelected = true));
  }

  onChangedOrderStatus(statusName: string) {
    this.changedOrderStatus.emit(statusName);
    if (statusName === OrderStatus.CANCELED) {
      this.openPopup();
    }
    if (statusName === OrderStatus.NOT_TAKEN_OUT) {
      this.notTakenOutOpenPop(this.generalInfo.id);
    }
    this.updateUneditableStatus(statusName as OrderStatus);
  }

  private updateUneditableStatus(status: OrderStatus): void {
    this.uneditableStatus = [OrderStatus.DONE, OrderStatus.CANCELED, OrderStatus.BROUGHT_IT_HIMSELF].includes(status);
  }

  openPopup() {
    this.dialog
      .open(AddOrderCancellationReasonComponent, {
        hasBackdrop: true,
        data: { isHistory: this.isHistory },
        maxHeight: '100vh'
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res.action === 'cancel') {
          this.onChangedOrderStatus(this.generalInfo.orderStatus);
          this.generalOrderInfo.get('orderStatus').setValue(this.generalInfo.orderStatus);
          return;
        }
        this.generalOrderInfo.get('cancellationReason').setValue(res.reason);
        this.generalOrderInfo.get('cancellationReason').markAsDirty();
        if (res.reason === CancellationReason.OTHER) {
          this.generalOrderInfo.get('cancellationComment').setValue(res.comment);
          this.generalOrderInfo.get('cancellationComment').markAsDirty();
        }
        this.cancelReason.emit(res);
      });
  }

  notTakenOutOpenPop(user) {
    this.dialog
      .open(AddOrderNotTakenOutReasonComponent, {
        hasBackdrop: true,
        data: {
          id: this.generalInfo.id
        }
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res) {
          this.notTakenOutReason.emit(res);
        } else {
          this.onChangedOrderStatus(this.generalInfo.orderStatus);
          this.generalOrderInfo.get('orderStatus').setValue(this.generalInfo.orderStatus);
        }
      });
  }

  setOrderPaymentStatus() {
    let orderState: string;
    this.generalInfo.orderStatusesDtos.find((status) => {
      if (status.key === this.generalInfo.orderStatus) {
        orderState = status.ableActualChange ? 'actual' : OrderStatusEn.CONFIRMED;
      }
    });

    if (orderState === OrderStatusEn.CONFIRMED) {
      const confirmedPaidCondition1 =
        this.currentOrderPrice > 0 && this.totalPaid > 0 && this.currentOrderPrice <= this.totalPaid && !this.unPaidAmount;
      const confirmedPaidCondition2 =
        this.currentOrderPrice === 0 && this.totalPaid >= 0 && this.currentOrderPrice <= this.totalPaid && !this.unPaidAmount;
      const confirmedPaidCondition = confirmedPaidCondition1 || confirmedPaidCondition2;

      const confirmedUnpaidCondition = this.currentOrderPrice >= 0 && this.totalPaid === 0 && this.unPaidAmount > 0;
      const confirmedHalfPaidCondition =
        this.unPaidAmount > 0 && this.unPaidAmount < this.currentOrderPrice && this.currentOrderPrice > this.totalPaid;

      if (confirmedPaidCondition) {
        this.generalInfo.orderPaymentStatus = PaymnetStatus.PAID;
      }

      if (confirmedUnpaidCondition) {
        this.generalInfo.orderPaymentStatus = PaymnetStatus.UNPAID;
      }

      if (confirmedHalfPaidCondition) {
        this.generalInfo.orderPaymentStatus = PaymnetStatus.HALF_PAID;
      }
    } else if (orderState === 'actual') {
      const actualPaidCondition1 =
        this.currentOrderPrice > 0 && this.totalPaid > 0 && this.currentOrderPrice <= this.totalPaid && !this.unPaidAmount;
      const actualPaidCondition2 =
        this.currentOrderPrice === 0 && this.totalPaid >= 0 && this.currentOrderPrice <= this.totalPaid && !this.unPaidAmount;
      const actualPaidCondition = actualPaidCondition1 || actualPaidCondition2;

      const actualUnpaidCondition = this.currentOrderPrice === 0 && this.totalPaid === 0 && this.unPaidAmount > 0;
      const actualHalfPaidCondition =
        this.unPaidAmount > 0 && this.unPaidAmount < this.currentOrderPrice && this.currentOrderPrice > this.totalPaid;

      if (actualPaidCondition) {
        this.generalInfo.orderPaymentStatus = PaymnetStatus.PAID;
      }

      if (actualUnpaidCondition) {
        this.generalInfo.orderPaymentStatus = PaymnetStatus.UNPAID;
      }

      if (actualHalfPaidCondition) {
        this.generalInfo.orderPaymentStatus = PaymnetStatus.HALF_PAID;
      }

      // TODO: ADD PAYMENT_REFUNDED CASE THEN IT WILL BE IMPLEMENTED
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
