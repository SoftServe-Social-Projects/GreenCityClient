import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrderService } from 'src/app/ubs/ubs-admin/services/order.service';
import { OrderStatus, PaymnetStatus } from 'src/app/ubs/ubs/order-status.enum';
import { Masks, Patterns } from 'src/assets/patterns/patterns';
import { IOrderDetails, IOrderInfo, orderPaymentInfo } from '../../models/ubs-admin.interface';
import { limitStatus } from '../ubs-admin-tariffs/ubs-tariffs.enum';

@Component({
  selector: 'app-ubs-admin-order-details-form',
  templateUrl: './ubs-admin-order-details-form.component.html',
  styleUrls: ['./ubs-admin-order-details-form.component.scss']
})
export class UbsAdminOrderDetailsFormComponent implements OnInit, OnChanges {
  private CAPACITY_OF_BIG_BAG = 120;
  LIMIT_OF_ECO_SHOP_NUMBERS = 5;
  SHOP_NUMBER_MASK = Masks.ecoStoreMask;
  SHOP_NUMBER_PATTERN = Patterns.ordersPattern;
  amountOfBigBags: number;
  isVisible: boolean;
  isOrderBroughtByHimself = false;
  bagsInfo;
  orderDetails: IOrderDetails;
  overpayment: number;
  overpaymentMessage: string;
  buyMore = false;
  showUbsCourier = false;
  limitMsg;
  limitAmount;
  courierPrice: number;
  writeoffAtStationSum: number;
  isOrderCancelled = false;
  isOrderPaid = false;
  isCourierPriceInvalid = false;
  pageOpen: boolean;
  isOrderDone = false;
  isOrderNotTakenOut = false;
  isDisabledWriteOffStation = false;
  isDisabledStatus = false;

  @Output() deleteNumberOrderFromEcoShopChanged = new EventEmitter<boolean>();
  @Output() checkMinOrder = new EventEmitter<boolean>();
  @Output() changeCurrentPrice = new EventEmitter<number>();
  @Output() changeUbsCourierPrice = new EventEmitter<number>();
  @Output() changeWriteoffAtStationSum = new EventEmitter<number>();
  @Output() orderStatusChanged = new EventEmitter<boolean>();
  @Output() paymentInfoChanged = new EventEmitter<orderPaymentInfo>();
  @Input() isOrderCancelledAfterFormed: boolean;
  @Input() orderDetailsOriginal: IOrderDetails;
  @Input() orderDetailsForm: FormGroup;
  @Input() orderStatusInfo;
  @Input() totalPaid: number;
  @Input() orderInfo: IOrderInfo;
  @Input() isEmployeeCanEditOrder: boolean;
  @Input() updateBonusAccount: number;
  @Input() paymentInfo: orderPaymentInfo;

  constructor(private readonly orderService: OrderService) {}

  get customerComment() {
    return this.orderDetailsForm.get('customerComment');
  }

  ngOnChanges(changes: SimpleChanges) {
    const curStatus = changes.orderStatusInfo?.currentValue;
    const prevStatus = changes.orderStatusInfo?.previousValue;
    if (curStatus?.key) {
      this.isOrderCancelled = curStatus?.key === OrderStatus.CANCELED;
      this.isOrderBroughtByHimself = curStatus?.key === OrderStatus.BROUGHT_IT_HIMSELF;
      this.isOrderDone = curStatus?.key === OrderStatus.DONE;
      this.isOrderNotTakenOut = curStatus?.key === OrderStatus.NOT_TAKEN_OUT;
    }

    this.isDisabledWriteOffStation = !prevStatus?.key && curStatus?.key === OrderStatus.BROUGHT_IT_HIMSELF;

    if ((curStatus?.key === OrderStatus.CANCELED && prevStatus?.key === OrderStatus.FORMED) || this.isOrderCancelledAfterFormed) {
      this.isOrderCancelledAfterFormed = true;
      this.emitChangedStatus();
      this.courierPrice = 0;
      this.emitUbsPrice(this.courierPrice);
    }

    if (changes.orderDetailsForm) {
      this.resetOrderDetails();
    }

    if (prevStatus?.ableActualChange !== curStatus?.ableActualChange) {
      this.isVisible = !this.isVisible;
    }

    if (changes?.orderStatusInfo) {
      this.isDisabledOrderDetails();
    }
    this.recalculateSum();
  }

  ngOnInit(): void {
    this.isVisible = this.orderStatusInfo.ableActualChange;
    this.isOrderPaid = this.totalPaid !== 0;
    if (this.orderInfo.generalOrderInfo.orderPaymentStatus !== PaymnetStatus.UNPAID) {
      this.orderDetailsForm.get('certificates').disable();
    }
  }

  absSum(sum): number {
    return Math.abs(sum);
  }

  showWriteOffStationField(): boolean {
    const isPaidWithBonuses = this.orderDetails.bonuses !== 0;
    const isPaidWithCert = this.orderDetails.certificateDiscount !== 0;
    return this.isOrderBroughtByHimself && (this.isOrderPaid || isPaidWithBonuses || isPaidWithCert);
  }

  resetOrderDetails() {
    this.orderDetails = JSON.parse(JSON.stringify(this.orderDetailsOriginal));
  }

  private isDisabledOrderDetails() {
    const shouldDisable = this.isOrderBroughtByHimself || this.isOrderCancelled || this.isOrderNotTakenOut || this.isOrderDone;

    if (shouldDisable) {
      this.orderDetails.bags.forEach((bag) => {
        this.orderDetailsForm.controls[`confirmedQuantity${bag.id}`].disable();
      });
      this.orderDetailsForm.controls['certificates'].disable();
      this.orderDetailsForm.controls['storeOrderNumbers'].disable();
    } else {
      this.orderDetails.bags.forEach((bag) => {
        this.orderDetailsForm.controls[`confirmedQuantity${bag.id}`].enable();
      });
      this.orderDetailsForm.controls['certificates'].enable();
      this.orderDetailsForm.controls['storeOrderNumbers'].enable();
    }
    this.isDisabledStatus = shouldDisable;
  }

  recalculateSum() {
    if (!this.writeoffAtStationSum) {
      this.writeoffAtStationSum = this.orderInfo.writeOffStationSum ? this.orderInfo.writeOffStationSum : 0;
    }
    if (!this.courierPrice) {
      this.courierPrice = this.orderDetails.courierPricePerPackage;
    }
    this.resetBagsInfo();
    this.setBagsInfo();
    this.calculateFinalSum();
  }

  private resetBagsInfo(): void {
    this.bagsInfo = {
      amount: {
        planned: 0,
        confirmed: 0,
        actual: 0
      },
      sum: {
        planned: 0,
        confirmed: 0,
        actual: 0
      },
      finalSum: {
        planned: 0,
        confirmed: 0,
        actual: 0
      },
      bonuses: 0,
      certificateDiscount: 0
    };
  }

  private setBagsInfo(): void {
    this.orderDetails.bags.forEach((bag) => {
      this.bagsInfo = {
        amount: {
          planned: this.bagsInfo.amount.planned + bag.planned,
          confirmed: this.bagsInfo.amount.confirmed + bag.confirmed,
          actual: this.bagsInfo.amount.actual + bag.actual
        },
        sum: {
          planned: this.bagsInfo.sum.planned + bag.planned * bag.price,
          confirmed: this.bagsInfo.sum.confirmed + bag.confirmed * bag.price,
          actual: this.bagsInfo.sum.actual + bag.actual * bag.price
        },
        finalSum: {
          planned: 0,
          confirmed: 0,
          actual: 0
        },
        bonuses: this.orderDetails.bonuses,
        certificateDiscount: this.orderDetails.certificateDiscount
      };
    });
  }

  getOrderBonusValue(bonuses: number) {
    const bonusesQuantity = bonuses ? '-' + bonuses : '';
    return this.isOrderCancelled ? 0 : bonusesQuantity;
  }

  private calculateFinalSum(): void {
    const bonusesAndCert = this.isOrderCancelled
      ? this.bagsInfo.certificateDiscount
      : this.bagsInfo.bonuses + this.bagsInfo.certificateDiscount;
    this.checkMinOrderLimit();
    this.bagsInfo.finalSum = {
      planned: this.bagsInfo.sum.planned - bonusesAndCert - this.orderDetails.paidAmount,
      confirmed: this.bagsInfo.sum.confirmed - bonusesAndCert - this.orderDetails.paidAmount,
      actual: this.bagsInfo.sum.actual - bonusesAndCert - this.orderDetails.paidAmount
    };

    if (this.isOrderBroughtByHimself) {
      this.bagsInfo.finalSum.confirmed = this.writeoffAtStationSum;
      this.bagsInfo.finalSum.actual = this.writeoffAtStationSum;
    }

    if (this.isVisible && this.showUbsCourier) {
      this.bagsInfo.finalSum.actual = this.bagsInfo.sum.actual - bonusesAndCert - this.courierPrice;
    }

    this.calculateOverpayment();
    this.setFinalFullPrice();
  }

  openDetails(): void {
    this.pageOpen = !this.pageOpen;
  }

  onQuantityChange(bagType, bagId): void {
    this.orderDetails.bags.forEach((bag) => {
      if (bag.id === Number(bagId)) {
        bag[bagType] = this.orderDetailsForm.get(bagType + 'Quantity' + bagId).value;
        this.bagsInfo.sum[bagType] = this.bagsInfo.amount[bagType] = 0;
        this.orderDetails.bags.forEach((bagObj) => {
          this.bagsInfo.sum[bagType] += bagObj[bagType] * bagObj.price;
          this.bagsInfo.amount[bagType] += +bagObj[bagType];
        });
        this.emitCurrentOrderPrice(this.bagsInfo.sum[bagType]);
        this.calculateFinalSum();
      }
    });
  }

  private emitUbsPrice(sum: number): void {
    this.changeUbsCourierPrice.emit(sum);
  }

  private emitChangedStatus(): void {
    this.orderStatusChanged.emit();
  }

  private emitSumForStation(sum: number): void {
    this.changeWriteoffAtStationSum.emit(sum);
  }

  private emitCurrentOrderPrice(sum: number): void {
    this.changeCurrentPrice.emit(sum);
  }

  private calculateOverpayment() {
    const bagType = this.orderStatusInfo.ableActualChange ? 'actual' : 'confirmed';
    let newSum = this.bagsInfo?.sum[bagType];
    if (this.showUbsCourier) {
      newSum += this.courierPrice || 0;
    }
    if (this.showWriteOffStationField()) {
      newSum += this.writeoffAtStationSum;
    }

    //Calculate overpayment with bonuses and certificate (check later)
    const overpayment = Math.max(
      this.paymentInfo.paymentTableInfoDto.paidAmount + this.bagsInfo.certificateDiscount + this.bagsInfo.bonuses - newSum,
      0
    );
    const unPaid = Math.max(
      newSum - this.paymentInfo.paymentTableInfoDto.paidAmount - this.bagsInfo.certificateDiscount - this.bagsInfo.bonuses,
      0
    );
    this.overpayment = overpayment || -unPaid;

    const isChanged =
      overpayment !== this.paymentInfo.paymentTableInfoDto.overpayment ||
      unPaid !== this.paymentInfo.paymentTableInfoDto.unPaidAmount ||
      newSum !== this.paymentInfo.orderFullPrice;

    if (isChanged) {
      this.paymentInfoChanged.emit({
        paymentTableInfoDto: { ...this.paymentInfo.paymentTableInfoDto, overpayment: overpayment, unPaidAmount: unPaid },
        orderFullPrice: newSum
      });
    }
    Object.keys(this.bagsInfo.finalSum).forEach((type) => {
      if (this.bagsInfo.finalSum[type] < 0) {
        this.bagsInfo.finalSum[type] = 0;
      }
    });
    this.overpaymentMessage = this.orderService.getOverpaymentMsg(this.overpayment);
  }
  private setFinalFullPrice() {
    const bagType = this.orderStatusInfo.ableActualChange ? 'actual' : 'confirmed';
    this.orderDetailsForm.controls.orderFullPrice.setValue(this.bagsInfo.finalSum[bagType]);
  }

  private setAmountOfBigBags(type) {
    this.amountOfBigBags = 0;
    this.orderDetails.bags.forEach((bag) => {
      if (bag.capacity === this.CAPACITY_OF_BIG_BAG) {
        this.amountOfBigBags += bag[type];
      }
    });
  }

  private checkMinOrderLimit() {
    const type = this.orderStatusInfo.ableActualChange ? 'actual' : 'confirmed';
    let expression: boolean;
    this.showUbsCourier = this.buyMore = false;
    this.checkMinOrder.emit(true);
    this.setAmountOfBigBags(type);
    if (this.orderDetails.courierInfo.courierLimit === limitStatus.limitByAmountOfBag) {
      expression = this.orderDetails.courierInfo.max
        ? this.amountOfBigBags < this.orderDetails.courierInfo.min || this.amountOfBigBags > this.orderDetails.courierInfo.max
        : this.amountOfBigBags < this.orderDetails.courierInfo.min;
      this.limitMsg = {
        min: 'order-details.min-bags',
        max: 'order-details.max-bags'
      };
      this.limitAmount = {
        min: this.orderDetails.courierInfo.min,
        max: this.orderDetails.courierInfo.max || '-'
      };
    } else if (this.orderDetails.courierInfo.courierLimit === limitStatus.limitByPriceOfOrder) {
      expression = this.orderDetails.courierInfo.max
        ? this.bagsInfo.sum[type] < this.orderDetails.courierInfo.min || this.bagsInfo.sum[type] > this.orderDetails.courierInfo.max
        : this.bagsInfo.sum[type] < this.orderDetails.courierInfo.min;
      this.limitMsg = {
        min: 'order-details.min-sum',
        max: 'order-details.max-sum'
      };
      this.limitAmount = {
        min: this.orderDetails.courierInfo.min,
        max: this.orderDetails.courierInfo.max || '-'
      };
    }
    if (expression) {
      if (type === 'actual') {
        this.showUbsCourier = true;
        this.checkEmptyOrder();
      } else {
        this.buyMore = true;
        this.checkMinOrder.emit(false);
      }
    }

    if (this.isOrderCancelledAfterFormed) {
      this.showUbsCourier = false;
    }
  }

  private checkEmptyOrder() {
    if (
      this.orderStatusInfo.ableActualChange === 'actual' &&
      this.orderStatusInfo.key !== OrderStatus.CANCELED &&
      this.bagsInfo.amount.actual === 0
    ) {
      this.checkMinOrder.emit(false);
    }
  }

  getStoreOrderNumbers() {
    return (this.orderDetailsForm.controls.storeOrderNumbers as FormArray).controls;
  }

  checkMaxOrdersFromShop(): boolean {
    const arr = this.orderDetailsForm.controls.storeOrderNumbers as FormArray;
    const currentAmountOfNumbersFromShop = arr.controls.length;
    return currentAmountOfNumbersFromShop < this.LIMIT_OF_ECO_SHOP_NUMBERS;
  }

  addOrderNumberFromShop(): void {
    const arr = this.orderDetailsForm.controls.storeOrderNumbers as FormArray;
    arr.push(new FormControl('', [Validators.pattern(Patterns.orderEcoStorePattern)]));
  }

  deleteOrder(index: number): void {
    (this.orderDetailsForm.controls.storeOrderNumbers as FormArray).removeAt(index);
    this.orderDetailsForm.markAsDirty();
    this.deleteNumberOrderFromEcoShopChanged.emit(true);
  }

  changeWriteOffSum(e): void {
    this.writeoffAtStationSum = +e.target.value;
    this.emitSumForStation(this.writeoffAtStationSum);
    this.calculateFinalSum();
  }

  changeUbsCourierSum(e): void {
    this.courierPrice = +e.target.value;
    this.isCourierPriceInvalid = this.courierPrice > this.orderDetailsForm.value.orderFullPrice;
    this.emitUbsPrice(this.courierPrice);
    this.calculateFinalSum();
  }
}
