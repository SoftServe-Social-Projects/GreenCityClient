import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Location } from '@angular/common';
import { CommentPopUpComponent } from '../../shared/components/comment-pop-up/comment-pop-up.component';
import { EMPTY, mergeMap, take, tap } from 'rxjs';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AdminCustomersService } from '@ubs/ubs-admin/services/admin-customers.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';

@Component({
  selector: 'app-ubs-admin-customer-details',
  templateUrl: './ubs-admin-customer-details.component.html',
  styleUrls: ['./ubs-admin-customer-details.component.scss']
})
export class UbsAdminCustomerDetailsComponent implements OnInit {
  private readonly dialogConfig = new MatDialogConfig();
  customer: any;

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly adminCustomerService: AdminCustomersService,
    private readonly translate: TranslateService,
    private readonly location: Location,
    private readonly snackBar: MatSnackBarComponent,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.customer = this.localStorageService.getCustomer();
  }

  goBack(): void {
    this.localStorageService.removeCurrentCustomer();
    this.location.back();
  }

  openPopUp(column: string, chatLink: string | null, userId: string | null): void {
    if (!userId) {
      return;
    }

    this.dialogConfig.disableClose = true;
    const modalRef = this.dialog.open(CommentPopUpComponent, this.dialogConfig);
    if (!modalRef.componentInstance) {
      return;
    }

    this.setDialogHeader(modalRef, column);

    modalRef.componentInstance.comment = chatLink;
    modalRef.componentInstance.isLink = true;

    modalRef
      .afterClosed()
      .pipe(
        take(1),
        mergeMap((updatedData: string | null) => {
          if (updatedData === null || updatedData === chatLink) {
            return EMPTY;
          }
          return this.adminCustomerService.addChatLink(userId, updatedData).pipe(tap(() => this.updateCustomerData(userId, updatedData)));
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.openSnackBar('successUpdateLink');
        },
        error: () => {
          this.snackBar.openSnackBar('failUpdateLink');
        }
      });
  }

  private setDialogHeader(modalRef: MatDialogRef<CommentPopUpComponent>, column: string): void {
    this.translate
      .get(column)
      .pipe(take(1))
      .subscribe({
        next: (translatedText) => (modalRef.componentInstance.header = translatedText),
        error: () => {
          modalRef.componentInstance.header = column;
        }
      });
  }

  private updateCustomerData(userId: string, updatedData: string) {
    if (this.customer && this.customer.userId === userId) {
      this.customer.chatLink = updatedData;
    }
    this.localStorageService.setCustomer(this.customer);
  }

  onOpenChat(chatUrl: string) {
    chatUrl && this.adminCustomerService.openChat(chatUrl);
  }
}
