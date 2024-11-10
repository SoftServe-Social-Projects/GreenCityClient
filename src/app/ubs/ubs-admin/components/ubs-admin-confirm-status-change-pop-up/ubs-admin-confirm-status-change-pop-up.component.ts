import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ubs-admin-confirm-status-change-pop-up',
  templateUrl: './ubs-admin-confirm-status-change-pop-up.component.html',
  styleUrls: ['./ubs-admin-confirm-status-change-pop-up.component.scss']
})
export class UbsAdminConfirmStatusChangePopUpComponent {
  closeButton = './assets/img/profile/icons/cancel.svg';
  constructor(public dialogRef: MatDialogRef<UbsAdminConfirmStatusChangePopUpComponent>) {}
  closeDialog(result: boolean): void {
    this.dialogRef.close(result);
  }
}
