import { Component, Input, OnChanges, SimpleChanges, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';
import { AddViolationsComponent } from '../add-violations/add-violations.component';
import { IUserInfo } from '../../models/ubs-admin.interface';
import { Masks, Patterns } from 'src/assets/patterns/patterns';

@Component({
  selector: 'app-ubs-admin-order-client-info',
  templateUrl: './ubs-admin-order-client-info.component.html',
  styleUrls: ['./ubs-admin-order-client-info.component.scss']
})
export class UbsAdminOrderClientInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userInfo: IUserInfo;
  @Input() userInfoDto: FormGroup;
  @Input() orderId: number;
  @Input() orderStatus: string;
  @Input() isEmployeeCanEditOrder: boolean;

  phoneMask = Masks.phoneMask;
  isTherePlus = Patterns.isTherePlus;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  pageOpen: boolean;
  userViolationForCurrentOrder: number;
  totalUserViolations: number;
  isOrderDone: boolean;
  isOrderNotTakenOut: boolean;
  isUneditableStatus: boolean;

  constructor(private dialog: MatDialog) {}

  get recipientEmail() {
    return this.userInfoDto.get('recipientEmail');
  }

  get recipientPhoneNumber(): FormControl {
    return this.userInfoDto.get('recipientPhoneNumber') as FormControl;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orderStatus?.currentValue) {
      this.isOrderDone = changes.orderStatus.currentValue === OrderStatus.DONE;
      this.isUneditableStatus =
        this.isOrderDone ||
        changes.orderStatus.currentValue === OrderStatus.CANCELED ||
        changes.orderStatus.currentValue === OrderStatus.BROUGHT_IT_HIMSELF;
      this.isOrderNotTakenOut = changes.orderStatus.currentValue === OrderStatus.NOT_TAKEN_OUT;
    }
  }

  ngOnInit(): void {
    this.pageOpen = true;
    this.setViolationData();
  }

  isViolationBtnShowed(): boolean {
    return this.isOrderNotTakenOut || this.isOrderDone;
  }

  openDetails(): void {
    this.pageOpen = !this.pageOpen;
  }

  setViolationData(): void {
    this.totalUserViolations = this.userInfo.totalUserViolations;
    this.userViolationForCurrentOrder = this.userInfo.userViolationForCurrentOrder;
  }

  openModal(viewMode: boolean): void {
    const matDialogRef = this.dialog.open(AddViolationsComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'admin-cabinet-dialog-container',
      data: {
        id: this.orderId,
        viewMode
      }
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (typeof res === 'number') {
          this.userViolationForCurrentOrder += res;
          this.totalUserViolations += res;
        }
      });
  }

  getErrorMessage(abstractControl: AbstractControl, name?: string): string {
    if (abstractControl.errors.required) {
      return 'input-error.required';
    }

    if (abstractControl.errors.maxlength) {
      return 'input-error.max-length';
    }

    if (abstractControl.errors.pattern && !name) {
      return 'input-error.pattern';
    }

    if (abstractControl.errors.pattern && name === 'recipientPhoneNumber') {
      return 'input-error.number-format';
    }

    if (abstractControl.errors.wrongNumber) {
      return 'input-error.number-wrong';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
