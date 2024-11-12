import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { IAlertInfo, IEditCell } from 'src/app/ubs/ubs-admin/models/edit-cell.model';
import { AdminTableService } from 'src/app/ubs/ubs-admin/services/admin-table.service';
import { IDataForPopUp } from '../../../models/ubs-admin.interface';
import { OrderService } from '../../../services/order.service';
import { AddOrderCancellationReasonComponent } from '../../add-order-cancellation-reason/add-order-cancellation-reason.component';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';
import { UbsAdminSeveralOrdersPopUpComponent } from '../../ubs-admin-several-orders-pop-up/ubs-admin-several-orders-pop-up.component';
import { UbsAdminConfirmStatusChangePopUpComponent } from '../../ubs-admin-confirm-status-change-pop-up/ubs-admin-confirm-status-change-pop-up.component';

@Component({
  selector: 'app-table-cell-select',
  templateUrl: './table-cell-select.component.html',
  styleUrls: ['./table-cell-select.component.scss']
})
export class TableCellSelectComponent implements OnInit {
  @Input() optional: any;
  @Input() id: number;
  @Input() nameOfColumn: string;
  @Input() key: string;
  @Input() currentValue: string;
  @Input() lang: string;
  @Input() ordersToChange: number[];
  @Input() isAllChecked: boolean;
  @Input() doneOrCanceled: boolean;
  @Input() showPopUp: boolean;
  @Input() dataForPopUp: IDataForPopUp[];

  public isEditable: boolean;
  public isBlocked: boolean;
  private newOption: string;
  private typeOfChange: number[];
  private checkStatus: boolean;
  private dialogConfig = new MatDialogConfig();

  @Output() cancelEdit = new EventEmitter();
  @Output() editCellSelect = new EventEmitter();
  @Output() showBlockedInfo = new EventEmitter();
  @Output() editButtonClick = new EventEmitter();
  @Output() orderCancellation = new EventEmitter();

  constructor(private adminTableService: AdminTableService, private orderService: OrderService, public dialog: MatDialog) {}

  ngOnInit() {
    this.currentValue = this.optional.filter((item) => item.key === this.key)[0];
    if (!this.currentValue) {
      this.currentValue = '';
    }
    this.filterStatuses();
  }

  private filterStatuses(): void {
    if (this.nameOfColumn === 'orderStatus') {
      this.optional = this.orderService.getAvailableOrderStatuses(this.key, this.optional);
    }
  }
  // The condition of pickup details for required fields
  private filterStatusesForPopUp(): boolean {
    const statuses = [OrderStatus.ADJUSTMENT, OrderStatus.CONFIRMED, OrderStatus.ON_THE_ROUTE, OrderStatus.DONE];
    const key = this.optional[this.findKeyForNewOption()].key;
    return statuses.includes(key);
  }
  private findKeyForNewOption(): number {
    return this.optional.findIndex((item) => item[this.lang] === this.newOption);
  }
  public edit(): void {
    this.isEditable = false;
    this.isBlocked = true;
    this.typeOfChange = this.adminTableService.howChangeCell(this.isAllChecked, this.ordersToChange, this.id);
    this.adminTableService
      .blockOrders(this.typeOfChange)
      .pipe(take(1))
      .subscribe((res: IAlertInfo[]) => {
        if (res[0] === undefined) {
          this.isBlocked = false;
          this.isEditable = true;
        } else {
          this.isEditable = false;
          this.isBlocked = false;
          this.showBlockedInfo.emit(res);
        }
      });
    this.editButtonClick.emit(this.id);
  }

  public save(): void {
    const newValueObj = this.findKeyForNewOption();
    if (newValueObj === -1) {
      this.typeOfChange = this.adminTableService.howChangeCell(this.isAllChecked, this.ordersToChange, this.id);
      this.isEditable = false;
      this.cancelEdit.emit(this.typeOfChange);
    } else {
      const newSelectValue: IEditCell = {
        id: this.id,
        nameOfColumn: this.nameOfColumn,
        newValue: this.optional[newValueObj].key
      };
      this.editCellSelect.emit(newSelectValue);
      this.isEditable = false;
      this.newOption = '';
      this.cancelEdit.emit(this.typeOfChange);
    }
  }

  private openPopUp(): void {
    this.dialogConfig.disableClose = true;
    const modalRef = this.dialog.open(UbsAdminSeveralOrdersPopUpComponent, this.dialogConfig);
    modalRef.componentInstance.dataFromTable = this.dataForPopUp;
    modalRef.componentInstance.ordersId = this.ordersToChange;
    modalRef.componentInstance.currentLang = this.lang;
    modalRef.afterClosed().subscribe((result) => {
      result ? this.save() : this.cancel();
    });
  }

  saveClick(): void {
    if (this.nameOfColumn !== 'orderStatus') {
      this.save();
      return;
    }
    const isCancelOption = ['Canceled', 'Скасовано'].includes(this.newOption);
    const isConfirmOption = ['Сформовано', 'Formed', 'Confirmed', 'Підтверджено', 'Привезе сам', 'Brought by himself'].includes(
      this.newOption
    );

    if (isConfirmOption) {
      this.openConfirmPopUp();
    } else if (isCancelOption) {
      this.openCancelPopUp();
    } else if (this.checkStatus && this.showPopUp) {
      this.checkIfStatusConfirmed();
    } else {
      this.save();
    }
  }

  checkIfStatusConfirmed(): void {
    if (this.newOption !== 'Confirmed' && this.newOption !== 'Підтверджено') {
      this.openPopUp();
    } else {
      this.save();
    }
  }

  public cancel(): void {
    this.typeOfChange = this.adminTableService.howChangeCell(this.isAllChecked, this.ordersToChange, this.id);
    this.cancelEdit.emit(this.typeOfChange);
    this.newOption = '';
    this.isEditable = false;
  }

  public chosenOption(e: any): void {
    this.newOption = e.target.value;
    this.checkStatus = this.filterStatusesForPopUp();
  }

  public openCancelPopUp(): void {
    this.dialog
      .open(AddOrderCancellationReasonComponent, {
        hasBackdrop: true
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res.action === 'cancel') {
          this.cancel();
          return;
        }
        const orderCancellationData = {
          cancellationReason: res.reason,
          cancellationComment: res.reason === 'OTHER' ? res.comment : null
        };
        this.orderCancellation.emit(orderCancellationData);
        this.save();
      });
  }
  openConfirmPopUp(): void {
    this.dialogConfig.data = { newOption: this.newOption };
    this.dialog
      .open(UbsAdminConfirmStatusChangePopUpComponent, this.dialogConfig)
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (!res) {
          this.cancel();
          return;
        }
        this.save();
      });
  }
}
