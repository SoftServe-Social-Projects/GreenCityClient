import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalTextComponent } from '../modal-text/modal-text.component';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { TariffConfirmationPopUpInterface } from 'src/app/ubs/ubs-admin/models/ubs-pop-up.interface';

@Component({
  selector: 'app-tariff-confirmation-pop-up',
  templateUrl: './tariff-confirmation-pop-up.component.html',
  styleUrls: ['./tariff-confirmation-pop-up.component.scss']
})
export class TariffConfirmationPopUpComponent implements OnInit {
  name: string;
  datePipe = new DatePipe('ua');
  newDate = this.datePipe.transform(new Date(), 'MMM dd, yyyy');
  unsubscribe: Subject<any> = new Subject();
  values: TariffConfirmationPopUpInterface;

  constructor(
    private localeStorageService: LocalStorageService,
    @Inject(MAT_DIALOG_DATA) public modalData: TariffConfirmationPopUpInterface,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<TariffConfirmationPopUpComponent>,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    this.values = this.modalData;
    this.localeStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.unsubscribe)).subscribe((firstName) => {
      this.name = firstName;
    });
  }

  getLangValue(uaValue: string, enValue: string): string {
    return this.langService.getLangValue(uaValue, enValue) as string;
  }

  onNoClick(): void {
    const matDialogRef = this.dialog.open(ModalTextComponent, {
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        title: 'modal-text.cancel',
        name: 'cancel',
        text: 'modal-text.cancel-message',
        action: 'modal-text.yes'
      }
    });
    matDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.dialogRef.close(false);
      }
    });
  }

  actionClick(): void {
    this.dialogRef.close(true);
  }
}
