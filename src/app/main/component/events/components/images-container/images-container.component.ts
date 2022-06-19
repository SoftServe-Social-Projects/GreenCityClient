import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FileHandle } from 'src/app/ubs/ubs-admin/models/file-handle.model';
import { EventImage } from '../../models/events.interface';

@Component({
  selector: 'app-images-container',
  templateUrl: './images-container.component.html',
  styleUrls: ['./images-container.component.scss']
})
export class ImagesContainerComponent implements OnInit {
  private isImageTypeError = false;
  private dragAndDropLabel = '+';
  private imgArray: File[] = [];
  private imagesCount = 5;

  public images: EventImage[] = [];
  public editMode: boolean;
  private imagesTodelete: string[] = [];

  public imageCount = 0;

  isImageSizeError: boolean;

  @ViewChild('takeInput') InputVar: ElementRef;

  @Input() imagesEditArr: string[];

  @Output() imgArrayOutput = new EventEmitter<Array<File>>();
  @Output() deleteImagesOutput = new EventEmitter<Array<string>>();

  constructor(private localStorageService: LocalStorageService) {}
  ngOnInit(): void {
    this.editMode = this.localStorageService.getEditMode();
    this.initImages();
    if (this.editMode) {
      this.imageCount = this.imagesEditArr.length;
      this.images.forEach((el, ind) => {
        if (this.imagesEditArr[ind]) {
          el.src = this.imagesEditArr[ind];
        }
        if (el.src) {
          el.isLabel = false;
        }
        if (!el.src && this.images[ind - 1].src) {
          el.isLabel = true;
        }
      });
    }
  }

  private initImages(): void {
    for (let i = 0; i < this.imagesCount; i++) {
      this.images.push({ src: null, label: this.dragAndDropLabel, isLabel: false });
    }
    this.images[0].isLabel = true;
  }

  public filesDropped(files: FileHandle[]): void {
    const imageFile = files[0].file;
    this.transferFile(imageFile);
  }

  private transferFile(imageFile: File): void {
    if (!this.isImageTypeError) {
      const reader: FileReader = new FileReader();
      this.imgArray.push(imageFile);
      this.imgArrayOutput.emit(this.imgArray);
      if (this.editMode) {
        this.deleteImagesOutput.emit(this.imagesTodelete);
      }

      reader.readAsDataURL(imageFile);
      reader.onload = () => {
        this.assignImage(reader.result);
      };
    }
  }

  private assignImage(result: any): void {
    for (let i = 0; i < this.images.length; i++) {
      if (!this.images[i].src) {
        this.images[i].src = result;
        if (this.images[i + 1]) {
          this.images[i + 1].isLabel = true;
        }
        this.images[i].isLabel = false;
        this.imageCount++;
        break;
      }
    }
  }

  public deleteImage(i: number): void {
    this.images.splice(i, 1);
    this.imgArray.splice(i, 1);
    this.imgArrayOutput.emit(this.imgArray);
    if (this.editMode) {
      this.deleteImagesOutput.emit(this.imagesTodelete);
    }
    let allowLabel = false;
    if (i === this.imagesCount - 1) {
      allowLabel = true;
    }
    this.images.push({ src: null, label: this.dragAndDropLabel, isLabel: allowLabel });
    this.imageCount--;
    if (this.editMode && !this.imagesTodelete.find((el) => el === this.imagesEditArr[i])) {
      this.imagesTodelete.push(this.imagesEditArr[i]);
    }
  }

  public loadFile(event: Event): void {
    const imageFile: File = (event.target as HTMLInputElement).files[0];
    this.InputVar.nativeElement.value = '';
    this.transferFile(imageFile);
  }
}
