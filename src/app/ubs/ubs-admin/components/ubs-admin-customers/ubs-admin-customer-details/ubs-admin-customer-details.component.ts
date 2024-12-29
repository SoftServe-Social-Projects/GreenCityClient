import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Location } from '@angular/common';
import { CommentPopUpComponent } from '../../shared/components/comment-pop-up/comment-pop-up.component';
import { take } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AdminCustomersService } from '@ubs/ubs-admin/services/admin-customers.service';
import { TranslateService } from '@ngx-translate/core';

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
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.customer = this.localStorageService.getCustomer();
  }

  goBack(): void {
    this.localStorageService.removeCurrentCustomer();
    this.location.back();
  }

  openPopUp(column: string, data: string, userId: string): void {
    this.dialogConfig.disableClose = true;
    const modalRef = this.dialog.open(CommentPopUpComponent, this.dialogConfig);

    this.translate.get(column).subscribe((data) => (modalRef.componentInstance.header = data));
    modalRef.componentInstance.comment = data;
    modalRef.componentInstance.isLink = true;

    modalRef.afterClosed().subscribe((updatedData: string | null) => {
      if (updatedData !== null && updatedData !== data) {
        this.adminCustomerService
          .addChatLink(userId, updatedData)
          .pipe(take(1))
          .subscribe(() => {
            if (this.customer && this.customer.userId === userId) {
              this.customer.chatLink = updatedData;
            }
            this.localStorageService.setCustomer(this.customer);
          });
      }
    });
  }

  onOpenChat(chatUrl: string) {
    chatUrl && this.adminCustomerService.openChat(chatUrl);
  }
}
