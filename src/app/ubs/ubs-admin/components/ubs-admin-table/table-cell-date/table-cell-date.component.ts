import { Component, EventEmitter, Input, Output } from '@angular/core';
import { take } from 'rxjs/operators';
import { IAlertInfo, IEditCell } from 'src/app/ubs/ubs-admin/models/edit-cell.model';
import { AdminTableService } from 'src/app/ubs/ubs-admin/services/admin-table.service';
@Component({
  selector: 'app-table-cell-date',
  templateUrl: './table-cell-date.component.html',
  styleUrls: ['./table-cell-date.component.scss']
})
export class TableCellDateComponent {
  @Input() date;
  @Input() nameOfColumn: string;
  @Input() id: number;
  @Input() ordersToChange: number[];
  @Input() isAllChecked: boolean;
  @Input() uneditableStatus: boolean;

  @Output() editDateCell = new EventEmitter();
  @Output() showBlockedInfo = new EventEmitter();

  isBlocked: boolean;
  isEditable: boolean;
  current: Date = new Date();

  constructor(private adminTableService: AdminTableService) {}

  edit(event?: KeyboardEvent): void {
    if (event && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
    }
    this.isEditable = false;
    this.isBlocked = true;
    let typeOfChange: number[];

    if (this.isAllChecked) {
      typeOfChange = [];
    }
    if (this.ordersToChange.length) {
      typeOfChange = this.ordersToChange;
    }
    if (!this.isAllChecked && !this.ordersToChange.length) {
      typeOfChange = [this.id];
    }

    this.adminTableService
      .blockOrders(typeOfChange)
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
  }

  changeData(e): void {
    const parseDate = Date.parse(e.value);
    const diff = e.value.getTimezoneOffset();
    const date = new Date(parseDate + -diff * 60 * 1000).toISOString();

    const newDateValue: IEditCell = {
      id: this.id,
      nameOfColumn: this.nameOfColumn,
      newValue: date
    };
    this.editDateCell.emit(newDateValue);
    this.isEditable = false;
  }
}
