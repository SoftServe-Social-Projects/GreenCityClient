import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { take } from 'rxjs/operators';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter
} from 'src/app/main/component/events/components/event-editor/components/create-event-dates/components/date-time/moment-date-adapter';
import { IAlertInfo, IEditCell } from 'src/app/ubs/ubs-admin/models/edit-cell.model';
import { AdminTableService } from 'src/app/ubs/ubs-admin/services/admin-table.service';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY'
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};
@Component({
  selector: 'app-table-cell-date',
  templateUrl: './table-cell-date.component.html',
  styleUrls: ['./table-cell-date.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { strict: true } }
  ]
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

  changeData(e: { value: Date }): void {
    if (!e.value) {
      console.error('Invalid date value received.');
      return;
    }

    const date = e.value instanceof Date ? e.value : new Date(e.value);
    const isoDate = date.toISOString();

    const newDateValue: IEditCell = {
      id: this.id,
      nameOfColumn: this.nameOfColumn,
      newValue: isoDate
    };
    this.editDateCell.emit(newDateValue);
    this.isEditable = false;
  }
}
