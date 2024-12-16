import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IAlertInfo, IEditCell } from '@ubs/ubs-admin/models/edit-cell.model';
import { IColumnBelonging } from '@ubs/ubs-admin/models/ubs-admin.interface';
import { AdminTableService } from '@ubs/ubs-admin/services/admin-table.service';
import { catchError, of, take } from 'rxjs';
import { CommentPopUpComponent } from '../../shared/components/comment-pop-up/comment-pop-up.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
@Component({
  selector: 'app-table-cell-input',
  templateUrl: './table-cell-input.component.html',
  styleUrls: ['./table-cell-input.component.scss']
})
export class TableCellInputComponent {
  @Input() column: IColumnBelonging;
  @Input() id: number;
  @Input() ordersToChange: number[];
  @Input() isAllChecked: boolean;
  @Input() isUneditableStatus: boolean;
  @Input() data: string;

  @Output() cancelEdit = new EventEmitter();
  @Output() editCommentCell = new EventEmitter();
  @Output() showBlockedInfo = new EventEmitter();

  isEditable: boolean;
  isBlocked: boolean;

  private typeOfChange: number[];
  private readonly font = '12px Lato, sans-serif';

  private dialogConfig = new MatDialogConfig();

  constructor(
    private adminTableService: AdminTableService,
    private localStorageService: LocalStorageService,
    public dialog: MatDialog
  ) {}

  edit(): void {
    this.isEditable = false;
    this.isBlocked = true;

    this.typeOfChange = this.adminTableService.howChangeCell(this.isAllChecked, this.ordersToChange, this.id);
    this.adminTableService
      .blockOrders(this.typeOfChange)
      .pipe(
        take(1),
        catchError(() => {
          this.isBlocked = false;
          this.isEditable = true;
          return of([]);
        })
      )
      .subscribe((res: IAlertInfo[]) => {
        this.isBlocked = false;
        if (res && res[0]) {
          this.showBlockedInfo.emit(res);
        } else {
          this.isEditable = true;
          this.openPopUp();
        }
      });
  }

  private openPopUp(): void {
    this.dialogConfig.disableClose = true;
    const modalRef = this.dialog.open(CommentPopUpComponent, this.dialogConfig);
    modalRef.componentInstance.header = this.localStorageService.getCurrentLanguage() === 'ua' ? this.column.ua : this.column.en;
    modalRef.componentInstance.comment = this.data;
    modalRef.afterClosed().subscribe((data) => {
      if (data) {
        const newCommentValue: IEditCell = {
          id: this.id,
          nameOfColumn: this.column.key,
          newValue: data
        };
        this.editCommentCell.emit(newCommentValue);
      }
      this.cancelEdit.emit(this.typeOfChange);
      this.isEditable = false;
    });
  }

  onMouseEnter(event: MouseEvent, tooltip: any): void {
    this.adminTableService.showTooltip(event, tooltip, this.font);
  }
}
