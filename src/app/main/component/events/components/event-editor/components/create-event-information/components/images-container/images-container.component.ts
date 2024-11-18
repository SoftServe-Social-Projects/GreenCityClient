import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { FileHandle } from 'src/app/ubs/ubs-admin/models/file-handle.model';
import { EventsService } from 'src/app/main/component/events/services/events.service';
import { ImagesContainer } from 'src/app/main/component/events/models/events.interface';
import { MatDialog } from '@angular/material/dialog';
import { EditImagePopUpComponent } from 'src/app/shared/edit-image-pop-up/edit-image-pop-up.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-images-container',
  templateUrl: './images-container.component.html',
  styleUrls: ['./images-container.component.scss']
})
export class ImagesContainerComponent implements OnInit {
  defImgs = [
    '/assets/img/events/illustration-earth.png',
    '/assets/img/events/illustration-money.png',
    '/assets/img/events/illustration-people.png',
    '/assets/img/events/illustration-recycle.png',
    '/assets/img/events/illustration-store.png'
  ];
  editMode: boolean;
  @Input() images: ImagesContainer[] = [];
  imageCount = 0;
  isImageSizeError: boolean;
  selected = '';

  @ViewChild('takeInput') InputVar: ElementRef;

  @Output() imagesOutput = new EventEmitter<ImagesContainer[]>();

  private isImageTypeError = false;

  constructor(
    private snackBar: MatSnackBarComponent,
    private eventService: EventsService,
    private matDialog: MatDialog
  ) {}

  selectImg(img: number): void {
    this.images.forEach((value) => (value.main = false));
    this.images[img].main = true;
    [this.images[0], this.images[img]] = [this.images[img], this.images[0]];
    this.images[0].main = true;

    this.imagesOutput.emit(this.images);
  }

  ngOnInit(): void {
    if (!this.images.length) {
      this.chooseImage(this.defImgs[0]);
    } else {
      this.imageCount = this.images.length;
    }
  }

  chooseImage(img: string) {
    if (this.imageCount === 5) {
      this.snackBar.openSnackBar('errorMaxPhotos');
      return;
    }
    const imageName = img.substring(img.lastIndexOf('/') + 1);
    this.eventService.getImageAsFile(img).subscribe((blob: Blob) => {
      const imageFile = new File([blob], imageName, { type: 'image/png' });
      this.validateImage(imageFile);
    });
  }

  filesDropped(files: FileHandle[]): void {
    const imageFile = files[0].file;
    this.validateImage(imageFile);
  }

  loadFile(event: Event): void {
    const imageFile: File = (event.target as HTMLInputElement).files[0];
    this.InputVar.nativeElement.value = '';
    this.validateImage(imageFile);
  }

  onEdit(image: ImagesContainer, index: number): void {
    const dialogRef = this.matDialog.open(EditImagePopUpComponent, {
      data: { index, image, aspectRatio: 16 / 9 },
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      maxHeight: '100vh'
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((data) => {
        if (!data?.croppedImage || data?.index < 0) {
          return;
        }

        this.images[data.index] = { ...this.images[data.index], file: data.croppedImage, url: URL.createObjectURL(data.croppedImage) };
      });
  }

  deleteImage(img: ImagesContainer, i: number): void {
    if (this.images.length === 1) {
      this.snackBar.openSnackBar('errorMinPhoto');
      return;
    }
    this.images.splice(i, 1);
    if (this.images.length && img.main) {
      this.images[0].main = true;
    }

    this.imageCount -= 1;

    this.imagesOutput.emit(this.images);
  }

  private validateImage(file: File) {
    const result = this.isFileCorrect(file);
    if (result && this.imageCount < 5) {
      this.processValidImage(file);
    } else {
      this.handleInvalidImageFile();
    }
  }

  //TODO should be rewritten. Mutate and return is controversial
  private isFileCorrect(file: File): boolean {
    this.isImageSizeError = file.size >= 10000000;
    this.isImageTypeError = !(file.type === 'image/jpeg' || file.type === 'image/png');
    return !this.isImageSizeError && !this.isImageTypeError;
  }

  private processValidImage(imageFile: File): void {
    const reader: FileReader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      this.imageCount += 1;

      const image = { file: imageFile, main: false, url: result };

      if (this.imageCount === 1) {
        image.main = true;
      }

      this.images.push(image);
      this.imagesOutput.emit(this.images);
    };
    // TODO Display snack bar error on error load
    reader.onerror = () => {
      console.log(reader.error);
    };
    reader.readAsDataURL(imageFile);
  }

  private handleInvalidImageFile(): void {
    if (this.isImageTypeError && this.isImageSizeError) {
      this.snackBar.openSnackBar('errorImageTypeSize');
    } else if (this.isImageTypeError) {
      this.snackBar.openSnackBar('errorImageType');
    } else if (this.isImageSizeError) {
      this.snackBar.openSnackBar('errorImageSize');
    } else {
      this.snackBar.openSnackBar('errorMaxPhotos');
    }
  }
}
