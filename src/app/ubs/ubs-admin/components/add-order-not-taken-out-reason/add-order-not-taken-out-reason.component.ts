import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileHandle } from '../../models/file-handle.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import { ShowImgsPopUpComponent } from 'src/app/shared/show-imgs-pop-up/show-imgs-pop-up.component';
import { NotTakenOutReasonImage } from '../../models/not-taken-out-reason.model';

@Component({
  selector: 'app-add-order-not-taken-out-reason',
  templateUrl: './add-order-not-taken-out-reason.component.html',
  styleUrls: ['./add-order-not-taken-out-reason.component.scss']
})
export class AddOrderNotTakenOutReasonComponent implements OnInit, OnDestroy {
  closeButton = './assets/img/profile/icons/cancel.svg';
  private onDestroy$: Subject<boolean> = new Subject<boolean>();
  notTakenOutReason: string;
  adminName;
  private isUploading = false;
  addNotTakenOutForm: FormGroup;
  maxNumberOfImgs = 6;
  name: string;
  file: File;
  private id;
  isImageSizeError = false;
  isImageTypeError = false;
  date = new Date();
  images: NotTakenOutReasonImage[] = [];
  imagesToDelete: string[] | null = [];
  isOpendFromHistory = false;
  orderID: number;
  reasonDescription: string;
  reasonImages: NotTakenOutReasonImage[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private orderService: OrderService,
    public dialogRef: MatDialogRef<AddOrderNotTakenOutReasonComponent>
  ) {
    this.id = data.id;
  }

  ngOnInit(): void {
    if (this.data.isFromHistory) {
      this.isOpendFromHistory = this.data.isFromHistory;
      this.orderID = this.data.orderID;
      this.reasonDescription = this.data.description;
      this.reasonImages = this.data.images.map((image) => ({ src: image, name: null }));
    }
    this.initForm();
    this.localStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.onDestroy$)).subscribe((firstName) => {
      this.adminName = firstName;
    });
  }
  initForm(): void {
    this.addNotTakenOutForm = this.fb.group({
      notTakenOutReason: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  loadFiles(files: File[]): void {
    if (this.images.length + files.length > this.maxNumberOfImgs) {
      return;
    }
    this.isImageSizeError = false;
    this.isImageTypeError = false;
    files.forEach((file) => {
      this.checkFileExtensionAndSize(file);
      if (this.isImageTypeError || this.isImageSizeError) {
        return;
      }
      this.transferFile(file);
    });
  }

  private checkFileExtensionAndSize(file: File) {
    this.isImageSizeError = file.size >= 10000000;
    this.isImageTypeError = !(file.type === 'image/jpeg' || file.type === 'image/png');
  }

  transferFile(imageFile: File): void {
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => {
      this.images.push({ src: reader.result as string, name: imageFile.name, file: imageFile });
    };
  }

  onFilesDropped(fileHandles: FileHandle[]): void {
    const files = fileHandles.map((handle) => handle.file);
    this.loadFiles(files);
  }

  onFilesSelected(event: any): void {
    this.loadFiles([...event.target.files]);
  }

  openImage(image: NotTakenOutReasonImage): void {
    const imagesForView = this.isOpendFromHistory ? this.reasonImages : this.images;
    this.dialog.open(ShowImgsPopUpComponent, {
      hasBackdrop: true,
      panelClass: 'custom-img-pop-up',
      data: {
        imgIndex: imagesForView.indexOf(image),
        images: imagesForView.map((img) => ({ src: img.src }))
      }
    });
  }

  deleteImage(imageToDelete: NotTakenOutReasonImage): void {
    const isUploaded = imageToDelete.file === null;
    if (isUploaded) {
      this.imagesToDelete.push(imageToDelete.src);
    }
    this.images = this.images.filter((image) => image !== imageToDelete);
  }

  send(): void {
    this.isUploading = true;
    this.dialogRef.close({ description: JSON.stringify(this.addNotTakenOutForm.value.notTakenOutReason), images: this.images });
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }
}
