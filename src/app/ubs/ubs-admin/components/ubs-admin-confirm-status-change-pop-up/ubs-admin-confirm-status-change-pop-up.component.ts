import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ubs-admin-confirm-status-change-pop-up',
  templateUrl: './ubs-admin-confirm-status-change-pop-up.component.html',
  styleUrls: ['./ubs-admin-confirm-status-change-pop-up.component.scss']
})
export class UbsAdminConfirmStatusChangePopUpComponent {
  closeButton = './assets/img/profile/icons/cancel.svg';
  constructor(
    public dialogRef: MatDialogRef<UbsAdminConfirmStatusChangePopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { newOption: string }
  ) {}
  closeDialog(result: boolean): void {
    this.dialogRef.close(result);
  }
}
