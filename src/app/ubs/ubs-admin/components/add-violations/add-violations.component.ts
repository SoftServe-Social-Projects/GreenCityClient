import { Component, OnDestroy, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FileHandle } from '../../models/file-handle.model';
import { iif, of, Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ShowImgsPopUpComponent } from 'src/app/shared/show-imgs-pop-up/show-imgs-pop-up.component';
import { DialogPopUpComponent } from 'src/app/shared/dialog-pop-up/dialog-pop-up.component';
import { PopUpsStyles } from '../ubs-admin-employee/ubs-admin-employee-table/employee-models.enum';

interface InitialData {
  violationLevel: string;
  violationDescription: string;
  initialImages: string[];
}

interface DataToSend {
  orderID: number;
  violationDescription: string;
  violationLevel: string;
  imagesToDelete?: string[] | null;
}

interface ViolationImage {
  src: string;
  name: string | null;
  file: File;
}

@Component({
  selector: 'app-add-violations',
  templateUrl: './add-violations.component.html',
  styleUrls: ['./add-violations.component.scss']
})
export class AddViolationsComponent implements OnInit, OnDestroy {
  maxNumberOfImgs = 6;
  images: ViolationImage[] = [];
  isImageSizeError = false;
  isImageTypeError = false;
  isUploading = false;
  isDeleting = false;
  addViolationForm: FormGroup;
  orderId;
  name: string;
  imagesToDelete: string[] | null = [];
  initialData: InitialData;
  isInitialDataChanged = false;
  isInitialImageDataChanged = false;
  date = new Date();
  unsubscribe: Subject<any> = new Subject();
  viewMode = false;
  editMode = false;
  isLoading = false;
  deleteDialogData = {
    popupTitle: 'add-violation-modal.delete-message',
    popupConfirm: 'employees.btn.yes',
    popupCancel: 'employees.btn.no',
    style: PopUpsStyles.red
  };
  clearChangesDialogData = {
    popupTitle: 'add-violation-modal.clear-changes',
    popupConfirm: 'employees.btn.yes',
    popupCancel: 'employees.btn.no',
    style: PopUpsStyles.red
  };
  imageSizeLimit = 10485760;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private orderService: OrderService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AddViolationsComponent>
  ) {
    this.orderId = data.id;
    this.viewMode = data.viewMode;
  }

  @ViewChild('takeInput') InputVar: ElementRef;

  ngOnInit() {
    this.initForm();
    if (this.viewMode) {
      this.loadInitialData();
    }
    this.localStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.unsubscribe)).subscribe((firstName) => {
      this.name = firstName;
    });
  }

  private initForm(): void {
    this.addViolationForm = this.fb.group({
      violationLevel: ['LOW', [Validators.required]],
      violationDescription: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.orderService
      .getViolationOfCurrentOrder(this.orderId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((violation) => {
        this.addViolationForm.setValue({
          violationLevel: violation.violationLevel,
          violationDescription: violation.description
        });
        this.addViolationForm.controls.violationLevel.disable();
        this.addViolationForm.controls.violationDescription.disable();
        this.images = violation.images.map((url) => ({ src: url, name: null, file: null }));
        this.date = violation.violationDate;
        this.isLoading = false;
        this.initialData = {
          violationLevel: violation.violationLevel,
          violationDescription: violation.description,
          initialImages: violation.images
        };
      });
  }

  prepareDataToSend(): FormData {
    const { violationLevel, violationDescription } = this.addViolationForm.value;
    const data: DataToSend = {
      orderID: this.orderId,
      violationDescription,
      violationLevel
    };
    if (this.editMode) {
      data.imagesToDelete = this.imagesToDelete.length ? this.imagesToDelete : null;
    }
    const formData: FormData = new FormData();
    const stringifiedDataToSend = JSON.stringify(data);
    formData.append('add', stringifiedDataToSend);
    this.images.forEach((image) => {
      if (image.file) {
        formData.append(this.editMode ? 'multipartFiles' : 'files', image.file);
      }
    });
    return formData;
  }

  send(): void {
    this.isUploading = true;
    const dataToSend = this.prepareDataToSend();
    of(true)
      .pipe(
        switchMap(() =>
          iif(
            () => this.editMode,
            this.orderService.updateViolationOfCurrentOrder(dataToSend),
            this.orderService.addViolationToCurrentOrder(dataToSend)
          )
        ),
        takeUntil(this.unsubscribe)
      )
      .subscribe(() => {
        this.dialogRef.close(this.editMode || 1);
      });
  }

  loadFiles(files: File[]): void {
    if (this.images.length + files.length > this.maxNumberOfImgs) {
      return;
    }

    this.isImageSizeError = false;
    this.isImageTypeError = false;
    files.forEach((file) => {
      this.isImageTypeError = !this.validateFileExtension(file);
      this.isImageSizeError = !this.validateFileSize(file);
      if (this.isImageTypeError || this.isImageSizeError) {
        return;
      }
      this.transferFile(file);
      if (this.editMode) {
        this.isInitialImageDataChanged = true;
      }
    });
  }

  onFilesDropped(fileHandles: FileHandle[]): void {
    const files = fileHandles.map((handle) => handle.file);
    this.loadFiles(files);
  }

  onFilesSelected(event: any): void {
    this.loadFiles([...event.target.files]);
    this.InputVar.nativeElement.value = '';
  }

  private transferFile(imageFile: File): void {
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => {
      this.images.push({ src: reader.result as string, name: imageFile.name, file: imageFile });
    };
  }

  validateFileExtension(file: File) {
    return file.type === 'image/jpeg' || file.type === 'image/png';
  }

  validateFileSize(file: File) {
    return file.size <= this.imageSizeLimit;
  }

  checkImageDataChanges(): void {
    const initialImageSources = this.initialData.initialImages;
    const imageSources = this.images.map((img) => img.src);
    this.isInitialImageDataChanged = JSON.stringify(imageSources) !== JSON.stringify(initialImageSources);
  }

  openImg(image: ViolationImage): void {
    this.dialog.open(ShowImgsPopUpComponent, {
      hasBackdrop: true,
      panelClass: 'custom-img-pop-up',
      data: {
        imgIndex: this.images.indexOf(image),
        images: this.images.map((img) => ({ src: img.src }))
      }
    });
  }

  editViolation(): void {
    this.editMode = true;
    this.addViolationForm.controls.violationLevel.enable();
    this.addViolationForm.controls.violationDescription.enable();
    this.addViolationForm.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe((value) => {
      this.isInitialDataChanged =
        this.initialData.violationLevel !== value.violationLevel || this.initialData.violationDescription !== value.violationDescription;
    });
  }

  deleteViolation(): void {
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
          this.orderService.deleteViolationOfCurrentOrder(this.orderId).subscribe(() => {
            this.dialogRef.close(-1);
          });
        }
      });
  }

  deleteChanges(): void {
    const matDialogRef = this.dialog.open(DialogPopUpComponent, {
      data: this.clearChangesDialogData,
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
          this.dialogRef.close();
        }
      });
  }

  deleteImage(imageToDelete: ViolationImage): void {
    const isUploaded = imageToDelete.file === null;
    if (isUploaded) {
      this.imagesToDelete.push(imageToDelete.src);
    }
    this.images = this.images.filter((image) => image !== imageToDelete);
    this.checkImageDataChanges();
  }

  closeDialog() {
    if (this.isInitialDataChanged || this.isInitialImageDataChanged) {
      this.deleteChanges();
    } else {
      this.dialogRef.close();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
  }
}
