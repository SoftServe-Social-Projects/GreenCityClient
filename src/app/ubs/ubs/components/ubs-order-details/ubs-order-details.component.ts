import { Observable, Subject, combineLatest } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBaseComponent } from '@shared/components/form-base/form-base.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Bag, CourierLocations, LocationsDtosList, OrderDetails } from '../../models/ubs.interface';
import { UbsOrderLocationPopupComponent } from './ubs-order-location-popup/ubs-order-location-popup.component';
import { ExtraPackagesPopUpComponent } from './extra-packages-pop-up/extra-packages-pop-up.component';
import { Masks, Patterns } from 'src/assets/patterns/patterns';
import { Store, select } from '@ngrx/store';
import {
  GetCourierLocations,
  GetExistingOrderDetails,
  GetLocationId,
  GetOrderDetails,
  GetExistingOrderTariff,
  GetUbsCourierId,
  SetAdditionalOrders,
  SetFirstFormStatus,
  SetOrderComment,
  SetOrderSum,
  SetBags
} from 'src/app/store/actions/order.actions';
import {
  UBSCourierIdSelector,
  certificateUsedSelector,
  courierLocationsSelector,
  existingOrderInfoSelector,
  isOrderDetailsLoadingSelector,
  locationIdSelector,
  orderDetailsSelector,
  pointsUsedSelector,
  tariffIdIdSelector
} from 'src/app/store/selectors/order.selectors';
import { courierLimitValidator, uniqueArrayValidator } from 'src/app/ubs/ubs/services/order-validators';
import { ICourierInfo } from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';
import { IUserOrderInfo } from 'src/app/ubs/ubs-user/ubs-user-orders-list/models/UserOrder.interface';
import { WarningPopUpComponent } from '@shared/components';
import { emptyOrValid } from 'src/app/shared/validators/empthy-or-valid.validator';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Component({
  selector: 'app-ubs-order-details',
  templateUrl: './ubs-order-details.component.html',
  styleUrls: ['./ubs-order-details.component.scss']
})
export class UBSOrderDetailsComponent extends FormBaseComponent implements OnInit, OnDestroy {
  isOrderDetailsLoading: Observable<boolean>;
  bags: Bag[];
  locations: CourierLocations;
  orderDetailsForm: FormGroup;
  locationId: number;
  currentLocation: string;
  courierId: number;
  currentLanguage: string;
  orderSum = 0;
  pointsUsed = 0;
  certificateUsed = 0;
  finalSum = 0;
  isDialogOpen = false;
  existingOrderId: number;
  limitOfEcoShopOrdersQuantity = 5;

  previousPath = 'ubs';
  courierUBSName = 'UBS';
  SHOP_NUMBER_MASK = Masks.ecoStoreMask;
  ecoStoreMask = Masks.ecoStoreMask;
  servicesMask = Masks.servicesMask;
  commentPattern = Patterns.ubsCommentPattern;
  additionalOrdersPattern = Patterns.orderEcoStorePattern;
  private readonly $destroy: Subject<void> = new Subject<void>();

  popupConfig = {
    hasBackdrop: true,
    closeOnNavigation: true,
    disableClose: true,
    panelClass: 'custom-ubs-style',
    data: {
      popupTitle: 'confirmation.title',
      popupSubtitle: 'confirmation.subTitle',
      popupConfirm: 'confirmation.cancel',
      popupCancel: 'confirmation.dismiss',
      isUBS: true
    }
  };

  @Output() secondStepDisabledChange = new EventEmitter<boolean>();
  existingOrderInfo: IUserOrderInfo;

  get bagsGroup() {
    return this.orderDetailsForm?.get('bags') as FormGroup;
  }

  get orderComment() {
    return this.orderDetailsForm.get('orderComment');
  }

  get additionalOrders() {
    return this.orderDetailsForm.get('additionalOrders') as FormArray;
  }

  getBagQuantity(id: number): number {
    return +this.getBagQuantityFormControl(id).value;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly localStorageService: LocalStorageService,
    public orderService: OrderService,
    private readonly langService: LanguageService,
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    router: Router,
    dialog: MatDialog
  ) {
    super(router, dialog, orderService, localStorageService);
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      this.existingOrderId = params.existingOrderId;
      this.existingOrderId >= 0 ? this.fetchDataForExistingOrder() : this.fetchDataForNewOrder();
    });

    this.initForm();
    this.initListeners();

    this.subscribeToLangChange();
  }

  fetchDataForNewOrder(): void {
    this.store.dispatch(GetUbsCourierId({ name: this.courierUBSName }));

    this.store
      .pipe(
        select(UBSCourierIdSelector),
        filter((id) => typeof id === 'number' && !isNaN(id)),
        distinctUntilChanged(),
        takeUntil(this.$destroy)
      )
      .subscribe((courierId) => {
        this.courierId = courierId;
        this.store.dispatch(GetLocationId({ courierId }));
      });

    this.store
      .pipe(
        select(locationIdSelector),
        filter((id) => typeof id === 'number' && !isNaN(id)),
        distinctUntilChanged(),
        takeUntil(this.$destroy)
      )
      .subscribe((locationId) => {
        this.locationId = locationId;
        this.store.dispatch(GetCourierLocations({ courierId: this.courierId, locationId }));
      });

    this.store
      .pipe(
        select(tariffIdIdSelector),
        filter((id) => typeof id === 'number' && !isNaN(id)),
        distinctUntilChanged(),
        takeUntil(this.$destroy)
      )
      .subscribe((tariffId) => {
        if (this.locationId >= 0) {
          this.store.dispatch(GetOrderDetails({ locationId: this.locationId, tariffId }));
        }
      });
  }

  fetchDataForExistingOrder(): void {
    this.store.dispatch(GetExistingOrderDetails({ orderId: this.existingOrderId }));
    this.store.dispatch(GetExistingOrderTariff({ orderId: this.existingOrderId }));

    this.store
      .pipe(
        select(locationIdSelector),
        distinctUntilChanged(),
        takeUntil(this.$destroy),
        filter((id) => id !== null)
      )
      .subscribe((locationId) => {
        this.locationId = locationId;
      });

    this.store.pipe(select(existingOrderInfoSelector), takeUntil(this.$destroy)).subscribe((orderInfo: IUserOrderInfo) => {
      this.existingOrderInfo = orderInfo;
      if (this.orderDetailsForm) {
        this.initExistingOrderValues();
      }
    });
  }

  initListeners(): void {
    this.isOrderDetailsLoading = this.store.pipe(select(isOrderDetailsLoadingSelector));
    combineLatest([
      this.store.pipe(select(courierLocationsSelector), distinctUntilChanged(), filter(Boolean)),
      this.store.pipe(select(orderDetailsSelector), distinctUntilChanged(), filter(Boolean))
    ])
      .pipe(takeUntil(this.$destroy))
      .subscribe(([locations, orderDetails]: [CourierLocations, OrderDetails]) => {
        if (!this.bags || this.bags[0]?.id !== orderDetails.bags[0].id) {
          this.locations = locations;
          this.bags = orderDetails.bags;
          this.initFormBags();
          this.dispatchAdditionalOrders();
          this.dispatchOrderComment();
        }
      });

    combineLatest([
      this.store.pipe(select(courierLocationsSelector), distinctUntilChanged(), takeUntil(this.$destroy)),
      this.store.pipe(select(locationIdSelector), distinctUntilChanged(), takeUntil(this.$destroy))
    ]).subscribe(([locations, locationId]) => {
      this.locations = locations;

      if (locations && locationId !== null) {
        this.initLocation();
      }
    });

    this.store.pipe(select(pointsUsedSelector), takeUntil(this.$destroy)).subscribe((pointsUsed) => {
      this.pointsUsed = pointsUsed;
      this.calculateFinalSum();
    });
    this.store.pipe(select(certificateUsedSelector), takeUntil(this.$destroy)).subscribe((certificateUsed) => {
      this.certificateUsed = certificateUsed;
      this.calculateFinalSum();
    });
  }

  initForm(): void {
    this.orderDetailsForm = this.fb.group({
      bags: this.fb.group({}),
      additionalOrders: this.fb.array([], uniqueArrayValidator()),
      orderComment: new FormControl('', Validators.maxLength(255))
    });
    this.addOrder();

    this.orderDetailsForm.statusChanges.pipe(distinctUntilChanged(), takeUntil(this.$destroy)).subscribe((state) => {
      this.changeSecondStepDisabled(state === 'INVALID');
      this.store.dispatch(SetFirstFormStatus({ isValid: state === 'VALID' }));
    });

    this.additionalOrders.valueChanges.pipe(debounceTime(400), takeUntil(this.$destroy)).subscribe(() => this.dispatchAdditionalOrders());
    this.orderComment.valueChanges.pipe(debounceTime(400), takeUntil(this.$destroy)).subscribe(() => this.dispatchOrderComment());

    if (this.existingOrderInfo) {
      this.initExistingOrderValues();
    }

    this.areChangesSaved = true;
  }

  dispatchAdditionalOrders(): void {
    this.store.dispatch(SetAdditionalOrders({ orders: this.additionalOrders.value.filter(Boolean) }));
  }

  dispatchOrderComment(): void {
    this.store.dispatch(SetOrderComment({ comment: this.orderComment.value }));
  }

  initFormBags(): void {
    const courierLimits: ICourierInfo = {
      courierLimit: this.locations.courierLimit,
      min: this.locations.min,
      max: this.locations.max
    };

    const isKyiv = this.getLocationById().nameEn === 'Kyiv';

    const newBagsGroup = this.fb.group(
      {},
      { validators: courierLimitValidator(this.bags, courierLimits, this.langService.getCurrentLanguage(), isKyiv) }
    );

    this.bags.forEach((bag: Bag) => {
      newBagsGroup.addControl(`quantity${bag.id}`, new FormControl(String(bag.quantity ?? 0), [Validators.min(0), Validators.max(999)]));
    });
    this.orderDetailsForm.setControl('bags', newBagsGroup);
    this.calculateOrderSum();
    this.subscribeToQuantityChanges();
  }

  initExistingOrderValues(): void {
    if (this.existingOrderInfo) {
      this.orderComment.setValue(this.existingOrderInfo.orderComment);
      if (this.existingOrderInfo.additionalOrders?.length > 0) {
        this.additionalOrders.clear();
        this.existingOrderInfo.additionalOrders.forEach((order) => this.addOrder(order));
      }
    }
  }

  initLocation(): void {
    const location = this.getLocationById();

    if (!location) {
      return;
    }

    const region = this.locations.regionDto;

    this.currentLocation = this.orderService.getLocationName(location, region);
  }

  getLocationById(): LocationsDtosList | undefined {
    return this.locations?.locationsDtosList.find((el) => el.locationId === this.locationId);
  }

  changeQuantity(id: number, value: number): void {
    const formControl = this.getBagQuantityFormControl(id);
    const maxValue = 999;
    const minValue = 0;
    const newValue = +this.getBagQuantity(id) + value;

    if (newValue <= maxValue && newValue >= minValue) {
      formControl.setValue(String(newValue));
      this.calculateOrderSum();
    }
    this.store.dispatch(SetBags({ bagId: id, bagValue: this.getBagQuantity(id) }));
  }

  checkOnNumber(event: KeyboardEvent): boolean {
    return !isNaN(Number(event.key));
  }

  calculateOrderSum(): void {
    let orderSum = 0;

    this.bags?.forEach((bag) => {
      const quantity = this.getBagQuantity(bag.id);
      if (quantity) {
        orderSum += bag.price * quantity;
        this.store.dispatch(SetBags({ bagId: bag.id, bagValue: quantity }));
      }
    });

    this.orderSum = orderSum;
    this.store.dispatch(SetOrderSum({ orderSum }));
    this.calculateFinalSum();
  }

  calculateFinalSum(): void {
    this.finalSum = Math.max(this.orderSum - this.certificateUsed - this.pointsUsed, 0);
  }

  subscribeToQuantityChanges(): void {
    this.bags.forEach((bag) => {
      const formControl = this.getBagQuantityFormControl(bag.id);

      if (formControl) {
        formControl.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(() => {
          this.calculateOrderSum();
        });
      }
    });
  }

  isCanAddEcoShopOrderNumber(): boolean {
    return this.additionalOrders.valid && new Set(this.additionalOrders.value.filter(Boolean)).size === this.additionalOrders.value.length;
  }

  addOrder(value: string = ''): void {
    const newFormControl = new FormControl(value, [emptyOrValid([Validators.minLength(1)]), Validators.maxLength(8)]);
    this.additionalOrders.push(newFormControl);
  }

  deleteOrder(index: number): void {
    this.additionalOrders.removeAt(index);
    if (this.additionalOrders.value.length === 0) {
      this.addOrder();
    }
  }

  removeOrder(event: KeyboardEvent, index: number): void {
    if (['Enter', 'Space', 'NumpadEnter'].includes(event.code)) {
      this.deleteOrder(index);
    }
  }

  isAlreadyEntered(index: number): boolean {
    return this.additionalOrders.value.filter((order) => order === this.additionalOrders.value[index]).length > 1;
  }

  isFormInitialized(): boolean {
    return Object.keys(this.bagsGroup.controls).length > 0;
  }

  getFormValues(): boolean {
    return this.orderSum > 0;
  }

  openLocationDialog(): void {
    this.isDialogOpen = true;
    const dialogRef = this.dialog.open(UbsOrderLocationPopupComponent, {
      hasBackdrop: true,
      disableClose: false,
      closeOnNavigation: false
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res?.data) {
          this.orderDetailsForm.markAllAsTouched();
        }
        this.isDialogOpen = false;
      });
  }

  openExtraPackages(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'extra-packages';
    dialogConfig.closeOnNavigation = false;
    dialogConfig.hasBackdrop = true;

    this.dialog.open(ExtraPackagesPopUpComponent, dialogConfig);
  }

  private changeSecondStepDisabled(value: boolean): void {
    this.secondStepDisabledChange.emit(value);
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageSubject.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.currentLanguage = this.localStorageService.getCurrentLanguage();
      this.initLocation();
    });
  }

  private getBagQuantityFormControl(id: number): AbstractControl | null {
    return this.orderDetailsForm.controls.bags.get('quantity' + id);
  }

  onCancel(): void {
    const matDialogRef = this.dialog.open(WarningPopUpComponent, this.popupConfig);

    matDialogRef
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.router.navigate(['ubs']);
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
