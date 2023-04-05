import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { IGeneralOrderInfo } from '../../models/ubs-admin.interface';
import { OrderService } from '../../services/order.service';
import { MatDialog } from '@angular/material/dialog';
import { AddOrderCancellationReasonComponent } from '../add-order-cancellation-reason/add-order-cancellation-reason.component';
import { AddOrderNotTakenOutReasonComponent } from '../add-order-not-taken-out-reason/add-order-not-taken-out-reason.component';
import { LanguageService } from 'src/app/main/i18n/language.service';

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
  @Output() changedOrderStatus = new EventEmitter<string>();
  @Output() cancelReason = new EventEmitter<string>();

  constructor(public orderService: OrderService, private dialog: MatDialog, private langService: LanguageService) {}
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public availableOrderStatuses;
  public isOrderStatusSelected = true;
  public isHistory = false;

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
      this.availableOrderStatuses = this.orderService.getAvailableOrderStatuses(
        changes.generalInfo.currentValue.orderStatus,
        changes.generalInfo.currentValue.orderStatusesDtos
      );
      this.renderOrderStatus();
    }
  }

  ngOnInit() {
    this.availableOrderStatuses = this.orderService.getAvailableOrderStatuses(
      this.generalInfo.orderStatus,
      this.generalInfo.orderStatusesDtos
    );
  }

  private renderOrderStatus() {
    setTimeout(() => (this.isOrderStatusSelected = false));
    setTimeout(() => (this.isOrderStatusSelected = true));
  }

  public onChangedOrderStatus(statusName: string) {
    this.changedOrderStatus.emit(statusName);
    if (statusName === 'CANCELED') {
      this.openPopup();
    }
    if (statusName === 'NOT_TAKEN_OUT') {
      this.notTakenOutOpenPop(this.generalInfo.id);
    }
  }

  openPopup() {
    this.dialog
      .open(AddOrderCancellationReasonComponent, {
        hasBackdrop: true,
        data: { isHistory: this.isHistory }
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
        if (res.reason === 'OTHER') {
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
        if (res.action === 'cancel') {
          this.onChangedOrderStatus(this.generalInfo.orderStatus);
          this.generalOrderInfo.get('orderStatus').setValue(this.generalInfo.orderStatus);
          return;
        }
        this.generalOrderInfo.get('notTakenOutReason').setValue(res.reason);
        this.generalOrderInfo.get('notTakenOutReason').markAsDirty();
      });
  }

  public setOrderPaymentStatus() {
    let orderState: string;
    this.generalInfo.orderStatusesDtos.find((status) => {
      if (status.key === this.generalInfo.orderStatus) {
        orderState = status.ableActualChange ? 'actual' : 'confirmed';
      }
    });

    if (orderState === 'confirmed') {
      const confirmedPaidCondition1 =
        this.currentOrderPrice > 0 && this.totalPaid > 0 && this.currentOrderPrice <= this.totalPaid && !this.unPaidAmount;
      const confirmedPaidCondition2 =
        this.currentOrderPrice === 0 && this.totalPaid >= 0 && this.currentOrderPrice <= this.totalPaid && !this.unPaidAmount;
      const confirmedPaidCondition = confirmedPaidCondition1 || confirmedPaidCondition2;

      const confirmedUnpaidCondition = this.currentOrderPrice >= 0 && this.totalPaid === 0 && this.unPaidAmount > 0;
      const confirmedHalfPaidCondition =
        this.unPaidAmount > 0 && this.unPaidAmount < this.currentOrderPrice && this.currentOrderPrice > this.totalPaid;

      if (confirmedPaidCondition) {
        this.generalInfo.orderPaymentStatus = 'PAID';
      }

      if (confirmedUnpaidCondition) {
        this.generalInfo.orderPaymentStatus = 'UNPAID';
      }

      if (confirmedHalfPaidCondition) {
        this.generalInfo.orderPaymentStatus = 'HALF_PAID';
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
        this.generalInfo.orderPaymentStatus = 'PAID';
      }

      if (actualUnpaidCondition) {
        this.generalInfo.orderPaymentStatus = 'UNPAID';
      }

      if (actualHalfPaidCondition) {
        this.generalInfo.orderPaymentStatus = 'HALF_PAID';
      }

      // TODO: ADD PAYMENT_REFUNDED CASE THEN IT WILL BE IMPLEMENTED
    }
  }

  public getLangValue(uaValue: string, enValue: string): string {
    return this.langService.getLangValue(uaValue, enValue) as string;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
