import { formatDate } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ChangeDetectorRef, OnChanges } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { IExportDetails } from '../../models/ubs-admin.interface';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-ubs-admin-export-details',
  templateUrl: './ubs-admin-export-details.component.html',
  styleUrls: ['./ubs-admin-export-details.component.scss']
})
export class UbsAdminExportDetailsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() exportInfo: IExportDetails;
  @Input() exportDetailsDto: FormGroup;
  @Input() orderStatus: string;
  @Input() isEmployeeCanEditOrder: boolean;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  pageOpen: boolean;
  showTimePicker = false;
  fromSelect: string[];
  toSelect: string[];
  fromInput: string;
  toInput: string;
  from: string;
  to: string;
  currentHour: string;
  allReceivingStations: string[];
  currentDate: string;
  isUneditableStatus = false;
  resetFieldImg = './assets/img/ubs-tariff/bigClose.svg';
  private readonly statuses = [OrderStatus.BROUGHT_IT_HIMSELF, OrderStatus.CANCELED];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    public orderService: OrderService
  ) {}

  ngOnChanges(): void {
    const isFormRequired = !this.orderService.isStatusInArray(this.orderStatus, this.statuses);
    const everyFieldFilled = Object.keys(this.exportDetailsDto.controls).every((key) => !!this.exportDetailsDto.get(key).value);
    const someFieldFilled = Object.keys(this.exportDetailsDto.controls).some((key) => !!this.exportDetailsDto.get(key).value);
    const hasNotValidFields = everyFieldFilled !== someFieldFilled;

    Object.keys(this.exportDetailsDto.controls).forEach((controlName) => {
      if ((hasNotValidFields || isFormRequired) && this.orderStatus !== OrderStatus.FORMED) {
        this.exportDetailsDto.get(controlName).setValidators(Validators.required);
        this.exportDetailsDto.setErrors({ incorrect: true });
      } else {
        this.exportDetailsDto.setErrors(null);
        this.exportDetailsDto.get(controlName).setErrors(null);
        this.exportDetailsDto.get(controlName).clearValidators();
      }
      this.exportDetailsDto.get(controlName).updateValueAndValidity({ onlySelf: true });
      this.exportDetailsDto.updateValueAndValidity();
    });

    if (
      this.orderStatus === OrderStatus.CANCELED ||
      this.orderStatus === OrderStatus.DONE ||
      this.orderStatus === OrderStatus.BROUGHT_IT_HIMSELF
    ) {
      this.isUneditableStatus = true;
    }

    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.initTime();
    this.allReceivingStations = this.exportInfo.allReceivingStations.map((e) => e.name);
    this.currentDate = new Date().toISOString().split('T')[0];
  }

  loadArrowImage() {
    return this.orderService.getArrowImageSrc(this.isFormRequired, this.pageOpen, this.exportDetailsDto.valid, this.isUneditableStatus);
  }

  resetValue(): void {
    this.exportDetailsDto.get('receivingStationId').setValue(null);
  }

  openDetails(): void {
    this.pageOpen = !this.pageOpen;
  }

  get isFormRequired(): boolean {
    return !this.pageOpen && !this.exportDetailsDto.valid && !this.isUneditableStatus;
  }

  showTimePickerClick(): void {
    if (this.isEmployeeCanEditOrder) {
      this.showTimePicker = true;
      this.fromInput = this.exportDetailsDto.get('timeDeliveryFrom').value;
      this.toInput = this.exportDetailsDto.get('timeDeliveryTo').value;
    }
  }

  checkDate(event: any): void {
    if (this.currentDate === event.target.value && this.currentHour > this.exportDetailsDto.value.timeDeliveryFrom) {
      this.exportDetailsDto.get('timeDeliveryFrom').setValue('');
      this.exportDetailsDto.get('timeDeliveryTo').setValue('');
    }
  }

  getExportDate(): string {
    return this.exportDetailsDto.get('dateExport').value;
  }

  setExportTime(data: any): void {
    this.exportDetailsDto.get('timeDeliveryFrom').setValue(data.from);
    this.exportDetailsDto.get('timeDeliveryTo').setValue(data.to);
    this.exportDetailsDto.get('timeDeliveryFrom').markAsDirty();
    this.exportDetailsDto.get('timeDeliveryTo').markAsDirty();
    this.showTimePicker = false;
  }

  initTime(): void {
    this.currentHour = formatDate(Date.now().toString(), 'HH:mm', 'en-US');
  }

  isTimeValid(): boolean {
    return this.exportDetailsDto.get('timeDeliveryFrom').invalid || this.exportDetailsDto.get('timeDeliveryTo').invalid;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
