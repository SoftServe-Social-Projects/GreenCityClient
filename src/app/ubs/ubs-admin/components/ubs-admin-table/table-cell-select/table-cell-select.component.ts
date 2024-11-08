import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { finalize, take } from 'rxjs/operators';
import { IAlertInfo, IEditCell } from 'src/app/ubs/ubs-admin/models/edit-cell.model';
import { AdminTableService } from 'src/app/ubs/ubs-admin/services/admin-table.service';
import { IDataForPopUp } from '../../../models/ubs-admin.interface';
import { OrderService } from '../../../services/order.service';
import { AddOrderCancellationReasonComponent } from '../../add-order-cancellation-reason/add-order-cancellation-reason.component';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';
import { UbsAdminSeveralOrdersPopUpComponent } from '../../ubs-admin-several-orders-pop-up/ubs-admin-several-orders-pop-up.component';
import { MatSelect } from '@angular/material/select';

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
  @Input() currentValue = '';
  @Input() lang: string;
  @Input() ordersToChange: number[];
  @Input() isAllChecked: boolean;
  @Input() uneditableStatus: boolean;
  @Input() showPopUp: boolean;
  @Input() dataForPopUp: IDataForPopUp[];

  isLocked = false; //Locked by user
  isBlocked = false; //Blocked by someone else
  isTryingToLock = false;
  isSelectOpened = false;
  isDisabled = true;
  options = [];
  private newOption: string;
  private typeOfChange: number[];
  private checkStatus: boolean;
  private dialogConfig = new MatDialogConfig();

  @Output() cancelEdit = new EventEmitter();
  @Output() editCellSelect = new EventEmitter();
  @Output() showBlockedInfo = new EventEmitter();
  @Output() editButtonClick = new EventEmitter();
  @Output() orderCancellation = new EventEmitter();

  @ViewChild('select') select: MatSelect;

  constructor(
    private adminTableService: AdminTableService,
    private orderService: OrderService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentValue = this.optional.filter((item) => item.key === this.key)[0];
    this.filterStatuses();
  }

  onSelectClick(): void {
    if (this.isLocked) {
      return;
    }

    this.lockOrder();
  }

  onSelectClosed(): void {
    this.isLocked = false;
    this.isDisabled = true;

    this.releaseLock();
  }

  lockOrder(): void {
    this.isTryingToLock = true;

    this.adminTableService
      .blockOrders([this.id])
      .pipe(
        take(1),
        finalize(() => {
          this.editButtonClick.emit(this.id);
          this.isTryingToLock = false;
        })
      )
      .subscribe({
        next: (res: IAlertInfo[]) => {
          this.processLockResponse(res);
        }
      });
  }

  save(): void {
    const newValueObj = this.findKeyForNewOption();
    if (newValueObj === -1) {
      this.typeOfChange = this.adminTableService.howChangeCell(this.isAllChecked, this.ordersToChange, this.id);
      this.cancelEdit.emit(this.typeOfChange);
    } else {
      const newSelectValue: IEditCell = {
        id: this.id,
        nameOfColumn: this.nameOfColumn,
        newValue: this.optional[newValueObj].key
      };
      this.editCellSelect.emit(newSelectValue);
      this.newOption = '';
      this.cancelEdit.emit(this.typeOfChange);
    }
  }

  saveClick(): void {
    if (this.nameOfColumn === 'orderStatus' && this.checkStatus && this.showPopUp) {
      this.checkIfStatusConfirmed();
    } else if (this.nameOfColumn === 'orderStatus' && (this.newOption === 'Canceled' || this.newOption === 'Скасовано')) {
      this.openCancelPopUp();
    } else if (this.nameOfColumn === 'orderStatus') {
      this.save();
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

  cancel(): void {
    this.typeOfChange = this.adminTableService.howChangeCell(this.isAllChecked, this.ordersToChange, this.id);
    this.cancelEdit.emit(this.typeOfChange);
    this.newOption = '';
  }

  chosenOption(e: any): void {
    this.newOption = e.target.value;
    this.checkStatus = this.filterStatusesForPopUp();
  }

  openCancelPopUp(): void {
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

  private processLockResponse(res: IAlertInfo[]): void {
    if (res.length) {
      this.isBlocked = true;
      this.isLocked = false;
      this.isDisabled = true;
      this.showBlockedInfo.emit(res);
    } else {
      this.isLocked = true;
      this.isBlocked = false;
      this.isDisabled = false;
      setTimeout(() => {
        this.select.open();
      });
    }
  }

  private releaseLock(): void {
    this.adminTableService.unblockOrders([this.id]).pipe(take(1)).subscribe();
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
}
