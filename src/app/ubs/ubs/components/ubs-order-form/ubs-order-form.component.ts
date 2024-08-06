import { AfterViewInit, Component, ChangeDetectorRef, ViewChild, DoCheck, HostListener, OnDestroy, OnInit } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FormGroup } from '@angular/forms';
import { UBSSubmitOrderComponent } from '../ubs-submit-order/ubs-submit-order.component';
import { UBSPersonalInformationComponent } from '../ubs-personal-information/ubs-personal-information.component';
import { UBSOrderDetailsComponent } from '../ubs-order-details/ubs-order-details.component';
import { MatStepper } from '@angular/material/stepper';
import { UBSOrderFormService } from '../../services/ubs-order-form.service';
import { Store, select } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { OrderDetails, PersonalData } from '../../models/ubs.interface';
import { ClearOrderData, SetCurrentStep } from 'src/app/store/actions/order.actions';
import { currentStepSelector, isSecondFormValidSelector } from 'src/app/store/selectors/order.selectors';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ubs-order-form',
  templateUrl: './ubs-order-form.component.html',
  styleUrls: ['./ubs-order-form.component.scss']
})
export class UBSOrderFormComponent implements OnInit, AfterViewInit, DoCheck, OnDestroy {
  firstStepForm: FormGroup;
  secondStepForm: FormGroup;
  thirdStepForm: FormGroup;
  completed = false;
  isSecondStepDisabled = true;
  isSecondFormValid$ = this.store.pipe(select(isSecondFormValidSelector));
  currentStep = 0;

  private statePersonalData: PersonalData;
  private stateOrderDetails: OrderDetails;
  private destroy$ = new Subject<void>();

  @ViewChild('firstStep') stepOneComponent: UBSOrderDetailsComponent;
  @ViewChild('secondStep') stepTwoComponent: UBSPersonalInformationComponent;
  @ViewChild('thirdStep') stepThreeComponent: UBSSubmitOrderComponent;
  @ViewChild(MatStepper) stepper: MatStepper;

  constructor(
    private cdr: ChangeDetectorRef,
    private shareFormService: UBSOrderFormService,
    private localStorageService: LocalStorageService,
    private store: Store
  ) {}

  @HostListener('window:beforeunload') onClose() {
    this.saveDataOnLocalStorage();
    return true;
  }

  ngOnInit() {
    this.shareFormService.locationId = this.localStorageService.getLocationId();
    this.shareFormService.locations = this.localStorageService.getLocations();
    this.store.dispatch(SetCurrentStep({ step: 0 }));

    this.store.pipe(select(currentStepSelector), takeUntil(this.destroy$)).subscribe((step: number) => {
      this.currentStep = step;
    });

    setTimeout(() => {
      this.getOrderDetailsFromState();
    }, 0);
  }

  onSelectionChange($event: StepperSelectionEvent) {
    this.store.dispatch(SetCurrentStep({ step: $event.selectedIndex }));
  }

  private getOrderDetailsFromState() {
    this.store.pipe(select((state: IAppState): OrderDetails => state.order.orderDetails)).subscribe((stateOrderDetails: OrderDetails) => {
      this.stateOrderDetails = stateOrderDetails;
      if (this.stateOrderDetails) {
        this.getPersonalDataFromState(this.stateOrderDetails);
      }
    });
  }

  private getPersonalDataFromState(orderDetails: OrderDetails): void {
    this.store.pipe(select((state: IAppState): PersonalData => state.order.personalData)).subscribe((statePersonalData: PersonalData) => {
      this.statePersonalData = statePersonalData;
      if (orderDetails && this.statePersonalData) {
        this.stepper.linear = false;
        this.completed = true;
        setTimeout(() => {
          this.stepper.linear = true;
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.firstStepForm = this.stepOneComponent.orderDetailsForm;
    this.secondStepForm = this.stepTwoComponent.personalDataForm;
    this.thirdStepForm = this.stepThreeComponent.paymentForm;
    this.cdr.detectChanges();
  }

  ngDoCheck(): void {
    this.completed = this.stepper?.selected.state === 'finalStep';
  }

  saveDataOnLocalStorage(): void {
    this.shareFormService.isDataSaved = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(ClearOrderData());
    this.saveDataOnLocalStorage();
  }
}
