import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AddCertificate, RemoveCertificate, SetCertificateUsed, SetCertificates, SetPointsUsed } from 'src/app/store/actions/order.actions';
import { GetUserBonuses } from 'src/app/store/actions/ubs-user.actions';
import { certificatesSelector, isFirstFormValidSelector, orderSumSelector } from 'src/app/store/selectors/order.selectors';
import { userBonusesSelector } from 'src/app/store/selectors/ubs-user.selectors';
import { ICertificateResponse } from 'src/app/ubs/ubs/models/ubs.interface';
import { CCertificate } from 'src/app/ubs/ubs/models/ubs.model';
import { Masks, Patterns } from 'src/assets/patterns/patterns';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-ubs-order-certificate',
  templateUrl: './ubs-order-certificate.component.html',
  styleUrls: ['./ubs-order-certificate.component.scss']
})
export class UbsOrderCertificateComponent implements OnInit, OnDestroy {
  orderBonusesForm: FormGroup;
  certificates: CCertificate[] = [];
  orderSum = 0;
  points: number;
  pointsUsed = 0;
  certificateSum = 0;
  isFirstFormValid = false;
  certificateMask = Masks.certificateMask;
  certificatePattern = Patterns.serteficatePattern;
  private $destroy: Subject<void> = new Subject<void>();

  get bonus() {
    return this.orderBonusesForm?.controls.bonus;
  }

  get formArrayCertificates() {
    return this.orderBonusesForm.get('formArrayCertificates') as FormArray;
  }

  getCertificateValue(index: number) {
    return this.formArrayCertificates.value[index];
  }

  getFinalSum() {
    return Math.max(this.orderSum - this.certificateSum - this.pointsUsed, 0);
  }

  constructor(
    private fb: FormBuilder,
    public orderService: OrderService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store.dispatch(GetUserBonuses());

    this.initForm();
    this.initListeners();
  }

  initForm(): void {
    this.orderBonusesForm = this.fb.group({
      bonus: new FormControl(false),
      formArrayCertificates: this.fb.array([])
    });
    this.addNewCertificate();

    this.bonus.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(() => this.calculateAll());
  }

  initListeners(): void {
    combineLatest([
      this.store.pipe(select(orderSumSelector)),
      this.store.pipe(select(certificatesSelector)),
      this.store.pipe(select(userBonusesSelector))
    ])
      .pipe(takeUntil(this.$destroy))
      .subscribe(([orderSum, certificates, points]) => {
        this.orderSum = orderSum;
        this.certificates = certificates;
        this.points = points;
        this.calculateAll();
      });

    this.store.pipe(select(isFirstFormValidSelector), takeUntil(this.$destroy)).subscribe((isValid) => {
      this.isFirstFormValid = isValid;
    });
  }

  onActivateCertififcate(index: number): void {
    const code = this.getCertificateValue(index);
    if (!code) {
      return;
    }
    this.orderService
      .processCertificate(code)
      .pipe(take(1))
      .subscribe({
        next: (response: ICertificateResponse) => {
          this.store.dispatch(AddCertificate({ certificate: CCertificate.ofResponse(response) }));
        },
        error: () => {
          this.store.dispatch(AddCertificate({ certificate: CCertificate.ofError(code) }));
        }
      });
  }

  addNewCertificate(): void {
    this.formArrayCertificates.push(
      this.fb.control('', [Validators.required, Validators.minLength(8), Validators.pattern(this.certificatePattern)])
    );
  }

  deleteCertificate(index: number): void {
    this.store.dispatch(RemoveCertificate({ code: this.getCertificateValue(index) }));
    this.formArrayCertificates.removeAt(index);
    if (this.formArrayCertificates.length === 0) {
      this.addNewCertificate();
    }
  }

  isCertificateAlreadyEntered(index: number): boolean {
    return !this.certificates[index] && !!this.certificates.find((cert) => cert.code === this.getCertificateValue(index));
  }

  isActivateCertificateDisabled(index: number): boolean {
    return (
      this.isCertificateAlreadyEntered(index) ||
      this.formArrayCertificates.controls[index].invalid ||
      !this.isFirstFormValid ||
      this.getFinalSum() === 0
    );
  }

  isCanAddCertificate(): boolean {
    return (
      this.certificates.length && this.certificates[this.formArrayCertificates.value.length - 1]?.isValid() && this.getFinalSum() !== 0
    );
  }

  selectPointsRadioBtn(event: KeyboardEvent, radioButtonValue: boolean): void {
    if (['Enter', 'Space', 'NumpadEnter'].includes(event.code)) {
      this.bonus.setValue(radioButtonValue);
    }
  }

  calculateAll(): void {
    this.calculateCertificates();

    if (!this.bonus?.value) {
      this.pointsUsed = 0;
      this.store.dispatch(SetPointsUsed({ pointsUsed: 0 }));
      return;
    }

    const leftToPay = this.orderSum - this.certificateSum;
    if (leftToPay <= 0) {
      this.bonus.setValue(false);
      this.pointsUsed = 0;
    } else {
      this.pointsUsed = Math.min(leftToPay, this.points);
    }

    this.store.dispatch(SetPointsUsed({ pointsUsed: this.pointsUsed }));
  }

  calculateCertificates() {
    const validCertificates = this.certificates.filter((certificate) => certificate.isValid());
    this.certificateSum = validCertificates.reduce((sum, certificate) => sum + certificate.points, 0);
    this.store.dispatch(SetCertificateUsed({ certificateUsed: Math.min(this.orderSum, this.certificateSum) }));
    this.store.dispatch(SetCertificates({ certificates: validCertificates.map((certificate) => certificate.code) }));
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
