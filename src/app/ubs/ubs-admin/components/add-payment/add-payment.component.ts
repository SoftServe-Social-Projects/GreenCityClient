import { Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { iif, of, Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { IPaymentInfoDto, PaymentDetails } from '../../models/ubs-admin.interface';
import { OrderService } from '../../services/order.service';
import { ShowImgsPopUpComponent } from '../../../../shared/show-imgs-pop-up/show-imgs-pop-up.component';
import { ShowPdfPopUpComponent } from '../shared/components/show-pdf-pop-up/show-pdf-pop-up.component';
import { DialogPopUpComponent } from 'src/app/shared/dialog-pop-up/dialog-pop-up.component';
import { Patterns } from 'src/assets/patterns/patterns';
import { formatDate } from '@angular/common';
import { DateAdapter } from '@angular/material/core';
import { ConvertFromDateToStringService } from 'src/app/shared/convert-from-date-to-string/convert-from-date-to-string.service';
import { MatRadioChange } from '@angular/material/radio';
import { EditPaymentConfirmationPopUpComponent } from '../shared/components/edit-payment-confirmation-pop-up/edit-payment-confirmation-pop-up.component';
import { PopUpsStyles } from '../ubs-admin-employee/ubs-admin-employee-table/employee-models.enum';
import { FileHandle } from '../../models/file-handle.model';

interface InputData {
  orderId: number;
  viewMode: boolean;
  payment: IPaymentInfoDto | null;
  isCanPaymentEdit?: boolean;
}

interface PostData {
  form: PaymentDetails;
  file: File;
}

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.component.html',
  styleUrls: ['./add-payment.component.scss']
})
export class AddPaymentComponent implements OnInit, OnDestroy {
  private convertFromDateToStringService: ConvertFromDateToStringService;
  private localeStorageService: LocalStorageService;
  private orderService: OrderService;

  closeButton = './assets/img/profile/icons/cancel.svg';
  orderId: number;
  viewMode: boolean;
  editMode = false;
  isDeleting = false;
  isUploading = false;
  isWarning = false;
  isFileSizeWarning = false;
  isFileTypeWarning = false;
  payment: IPaymentInfoDto | null;
  addPaymentForm: FormGroup;
  isPhotoContainerChoosen = false;
  isLinkToBillChoosed = false;
  file: File;
  pdf = /.pdf$/;
  imagePreview = { src: null, name: null };
  isImageSizeError = false;
  isImageTypeError = false;
  isInitialDataChanged = false;
  isInitialImageChanged = false;
  dataSource = new MatTableDataSource();
  date = new Date();
  adminName: string;
  private maxImageSize = 10485760;
  private destroySub: Subject<boolean> = new Subject<boolean>();
  deleteDialogData = {
    popupTitle: 'add-payment.delete-message',
    popupConfirm: 'employees.btn.yes',
    popupCancel: 'employees.btn.no',
    style: PopUpsStyles.red
  };
  verifyEditingData = {
    popupTitle: 'add-payment.cancel-message',
    popupConfirm: 'employees.btn.yes',
    popupCancel: 'employees.btn.no'
  };
  paymentSum: string;
  isCanPaymentEdit: boolean;
  constructor(
    private injector: Injector,
    private dialogRef: MatDialogRef<AddPaymentComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private adapter: DateAdapter<any>,
    @Inject(MAT_DIALOG_DATA) public data: InputData
  ) {
    this.convertFromDateToStringService = injector.get(ConvertFromDateToStringService);
    this.localeStorageService = injector.get(LocalStorageService);
    this.orderService = injector.get(OrderService);

    const locale = this.localeStorageService.getCurrentLanguage() !== 'ua' ? 'en-GB' : 'uk-UA';
    this.adapter.setLocale(locale);
  }

  ngOnInit(): void {
    this.orderId = this.data.orderId;
    this.viewMode = this.data.viewMode;
    this.payment = this.data.payment;
    this.isCanPaymentEdit = this.data.isCanPaymentEdit;
    this.localeStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.destroySub)).subscribe((firstName) => {
      this.adminName = firstName;
    });
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroySub.next(true);
    this.destroySub.complete();
  }

  initForm() {
    this.addPaymentForm = this.fb.group({
      settlementdate: [
        this.payment?.settlementdate ? formatDate(this.convertDate(this.payment.settlementdate), 'yyyy-MM-dd', 'ua') : null,
        [Validators.required]
      ],
      amount: [this.payment?.amount ?? '', [Validators.required, Validators.pattern(Patterns.paymentAmountPattern)]],
      paymentId: [this.payment?.paymentId ?? '', [Validators.required]],
      receiptLink: [this.payment?.receiptLink ?? '']
    });

    this.imagePreview.src = this.payment?.imagePath;
    if (this.viewMode) {
      this.addPaymentForm.disable();
    }

    this.isLinkToBillChoosed = !!this.payment?.receiptLink;
    this.isPhotoContainerChoosen = !!this.payment?.imagePath;
  }

  convertDate(inputDate: string): string {
    return inputDate?.split('.').reverse().join('-');
  }

  close() {
    this.dialogRef.close(null);
  }

  onChoosePayment(event: MatRadioChange): void {
    if (event.value === 'photoBill') {
      this.isPhotoContainerChoosen = true;
      this.isLinkToBillChoosed = false;
    }
    if (event.value === 'linkToBill') {
      this.isLinkToBillChoosed = true;
      this.isPhotoContainerChoosen = false;
    }

    const receiptLinkControl = this.addPaymentForm.get('receiptLink');
    if (receiptLinkControl && this.isLinkToBillChoosed) {
      receiptLinkControl.setValidators([Validators.required]);
    } else {
      receiptLinkControl.clearValidators();
    }
    receiptLinkControl.updateValueAndValidity();
  }

  showErrorMessage(): boolean {
    const isLinkFieldInvalid =
      this.isLinkToBillChoosed && !this.addPaymentForm.get('receiptLink').value && this.addPaymentForm.get('receiptLink').touched;
    const isPhotoContainerInvalid = this.isPhotoContainerChoosen && !this.imagePreview.src;

    return isPhotoContainerInvalid || isLinkFieldInvalid;
  }

  isFormValid(): boolean {
    const settlementDateControl = this.addPaymentForm.get('settlementdate');
    const amountControl = this.addPaymentForm.get('amount');
    const paymentIdControl = this.addPaymentForm.get('paymentId');

    const isSettlementDateValid = settlementDateControl?.invalid && settlementDateControl?.touched;
    const isAmountValid = amountControl?.invalid && amountControl?.touched;
    const isPaymentIdValid = paymentIdControl?.invalid && paymentIdControl?.touched;

    return isSettlementDateValid || isAmountValid || isPaymentIdValid;
  }

  save() {
    const result: PostData = { form: null, file: null };
    const paymentDetails = this.addPaymentForm.value;
    paymentDetails.amount *= 100;

    paymentDetails.settlementdate = this.convertFromDateToStringService.toISOStringWithTimezoneOffset(paymentDetails.settlementdate);

    result.form = paymentDetails;
    result.file = this.file;

    if (this.editMode) {
      result.form.imagePath = this.file ? '' : this.imagePreview.src ?? '';
    }
    this.processPayment(this.orderId, result);
  }

  processPayment(orderId: number, postData: PostData): void {
    this.isUploading = true;
    of(true)
      .pipe(
        switchMap(() =>
          iif(
            () => this.editMode,
            this.orderService.updatePaymentManually(this.payment?.id, postData.form, postData.file),
            this.orderService.addPaymentManually(orderId, postData.form, postData.file)
          )
        ),
        takeUntil(this.destroySub)
      )
      .subscribe({
        next: (data: IPaymentInfoDto) => {
          data.amount /= 100;
          this.dialogRef.close(data);
        },
        error: (err) => {
          console.error('error', err);
          this.isUploading = false;
        }
      });
  }

  filesDropped(files: FileHandle[]): void {
    this.file = files[0].file;
    this.isWarning = this.showWarning(this.file);
    if (!this.isWarning) {
      this.loadImage();
    }
  }

  private showWarning(file: File): boolean {
    this.isFileSizeWarning = file.size > this.maxImageSize;
    this.isFileTypeWarning = file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'application/pdf';
    return this.isFileSizeWarning || this.isFileTypeWarning;
  }

  onFileSelect(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files.length > 0 && !this.showWarning(files[0])) {
      this.file = files[0];
      this.loadImage();
    }
  }

  loadImage() {
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = () => {
      this.imagePreview.name = this.file.name;
      this.imagePreview.src = reader.result;
      if (this.editMode) {
        this.isInitialImageChanged = true;
      }
    };
  }

  removeImage() {
    this.imagePreview.name = null;
    this.imagePreview.src = null;
    this.file = null;
    if (this.editMode) {
      this.isInitialImageChanged = this.payment.imagePath !== this.imagePreview.src;
    }
  }

  enlargeImage(): void {
    this.isPdf() ? this.openPdf() : this.openImg();
  }

  isPdf(): boolean {
    return this.imagePreview?.src.match(this.pdf) || this.file?.type === 'application/pdf';
  }

  isDisabledSubmitBtn(): boolean {
    const formNotValid = !this.addPaymentForm.touched || !this.addPaymentForm.valid;
    const isViewMode = this.viewMode && !this.editMode;
    const noPhotoChosen = this.isPhotoContainerChoosen && !this.imagePreview.src;
    const noLinkSetted = this.isLinkToBillChoosed && !this.addPaymentForm.get('receiptLink').value;
    const isEditMode = this.editMode;
    const noDataChangedInEditMode = !this.isInitialDataChanged && !this.isInitialImageChanged;
    const noRadioBtnSelected = this.isPhotoContainerChoosen || this.isLinkToBillChoosed;

    return (
      formNotValid ||
      this.isUploading ||
      (isEditMode && noDataChangedInEditMode) ||
      isViewMode ||
      noPhotoChosen ||
      noLinkSetted ||
      !noRadioBtnSelected
    );
  }

  openImg(): void {
    this.dialog.open(ShowImgsPopUpComponent, {
      hasBackdrop: true,
      panelClass: 'custom-img-pop-up',
      data: {
        imgIndex: 0,
        images: [this.imagePreview]
      }
    });
  }

  openPdf(): void {
    this.dialog.open(ShowPdfPopUpComponent, {
      hasBackdrop: true,
      panelClass: 'custom-img-pop-up',
      data: {
        pdfFile: this.imagePreview.src
      }
    });
  }

  editPayment() {
    this.editMode = true;
    this.addPaymentForm.enable();
    this.addPaymentForm.markAsTouched();
    this.addPaymentForm.valueChanges.pipe(takeUntil(this.destroySub)).subscribe((values) => {
      this.isInitialDataChanged =
        this.payment.settlementdate !== values.paymentDate ||
        this.payment.amount !== +values.amount ||
        (this.payment.receiptLink ?? '') !== values.receiptLink ||
        this.payment.paymentId !== values.paymentId;
    });
  }

  deletePayment() {
    const matDialogRef = this.dialog.open(DialogPopUpComponent, {
      data: this.deleteDialogData,
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: ''
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res) {
          this.isDeleting = true;
          this.orderService
            .deleteManualPayment(this.payment.id)
            .pipe(takeUntil(this.destroySub))
            .subscribe({
              next: () => {
                this.dialogRef.close(this.payment.id);
              },
              error: () => {
                this.isDeleting = false;
              }
            });
        }
      });
  }

  verifyEditing(): void {
    if (this.isInitialDataChanged || this.isInitialImageChanged) {
      const matDialogRef = this.dialog.open(EditPaymentConfirmationPopUpComponent, {
        data: this.verifyEditingData,
        hasBackdrop: true
      });

      matDialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }
  newFormat(event: Event) {
    const target = event.target as HTMLInputElement;
    this.paymentSum = parseFloat(target.value).toFixed(2);
    target.value = this.paymentSum;
  }
}
