import { Component, Input, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrderStatus } from '@ubs/ubs/order-status.enum';
import { BehaviorSubject } from 'rxjs';
import { Address } from 'src/app/ubs/ubs/models/ubs.interface';

@Component({
  selector: 'app-ubs-admin-address-details',
  templateUrl: './ubs-admin-address-details.component.html',
  styleUrls: ['./ubs-admin-address-details.component.scss']
})
export class UbsAdminAddressDetailsComponent implements OnChanges {
  @Input() addressExportDetailsDto: FormControl;
  @Input() address: Address;
  @Input() orderStatus: string;
  pageOpen: boolean;
  isEditableStatus$ = new BehaviorSubject<boolean>(false);

  openDetails(): void {
    this.pageOpen = !this.pageOpen;
  }

  ngOnChanges(): void {
    const status =
      this.orderStatus === OrderStatus.CANCELED ||
      this.orderStatus === OrderStatus.DONE ||
      this.orderStatus === OrderStatus.BROUGHT_IT_HIMSELF;
    this.isEditableStatus$.next(status);
  }
}
