import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { take } from 'rxjs/operators';
import { IAlertInfo, IEditCell } from 'src/app/ubs/ubs-admin/models/edit-cell.model';
import { AdminTableService } from 'src/app/ubs/ubs-admin/services/admin-table.service';
import { fromSelect, toSelect } from './table-cell-time-range';

@Component({
  selector: 'app-table-cell-time',
  templateUrl: './table-cell-time.component.html',
  styleUrls: ['./table-cell-time.component.scss']
})
export class TableCellTimeComponent implements OnInit {
  @Input() nameOfColumn: string;
  @Input() id: number;
  @Input() ordersToChange: number[];
  @Input() isAllChecked: boolean;
  @Input() uneditableStatus: boolean;
  @Input() timeOfExport: string;
  @Input() exportDate: string;

  @Output() cancelEdit = new EventEmitter();
  @Output() editTimeCell = new EventEmitter();
  @Output() showBlockedInfo = new EventEmitter();
  @Output() isTimePickerOpened = new EventEmitter();

  fromInput: string;
  toInput: string;
  fromSelect: string[];
  toSelect: string[];
  isEditable: boolean;
  isBlocked: boolean;
  private typeOfChange: number[];
  from: string;
  to: string;
  parseTime = [];

  constructor(private adminTableService: AdminTableService) {}

  ngOnInit(): void {
    this.fromSelect = fromSelect;
    this.toSelect = toSelect;
    this.parseTime_(this.timeOfExport);
    this.fromInput = this.from;
    this.toInput = this.to;
  }

  parseTime_(timeExport: string): void {
    let arr = [];
    const res = timeExport.split('-').map((e) => {
      arr = e.split(':');
      if (arr.length > 2) {
        arr.pop();
      }
      return arr.join(':');
    });
    this.from = res[0];
    this.to = res[1];
  }
  edit(event?: KeyboardEvent): void {
    if (event && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
    }
    this.isTimePickerOpened.emit(true);
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
  }

  setExportTime(data: any): void {
    if (data.dataWasChanged) {
      const newTimeValue: IEditCell = {
        id: this.id,
        nameOfColumn: this.nameOfColumn,
        newValue: `${data.from}-${data.to}`
      };
      this.editTimeCell.emit(newTimeValue);
    } else {
      this.typeOfChange = this.adminTableService.howChangeCell(this.isAllChecked, this.ordersToChange, this.id);

      this.fromInput = this.from;
      this.toInput = this.to;
    }

    this.cancelEdit.emit(this.typeOfChange);
    this.isEditable = false;
    this.isTimePickerOpened.emit(false);
  }
}
