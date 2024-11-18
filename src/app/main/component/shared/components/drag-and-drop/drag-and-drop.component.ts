import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { FileHandle } from '@eco-news-models/create-news-interface';

@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss']
})
export class DragAndDropComponent {
  selectedFile: File = null;
  selectedFileUrl: string;
  imageChangedEvent: FileHandle[];
  isCropper = true;
  isWarning = false;
  croppedImage: ImageCroppedEvent;
  @Input() file: FileHandle;
  @Input() height: number;
  @Input() isDisabledButton: boolean;
  @Input() aspectRatio: number;
  @Input() roundCropper: boolean;
  @Input() showTopMessage = true;
  @Output() newFile = new EventEmitter<FileHandle>();
  @Output() warning = new EventEmitter<boolean>();

  stopCropping(): void {
    this.autoCropping();
    this.isCropper = false;
    this.isWarning = false;
  }

  cancelChanges(): void {
    this.file = null;
    this.isCropper = true;
    this.croppedImage = null;
    this.selectedFile = null;
    this.selectedFileUrl = null;
    this.newFile.emit(this.file);
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event;
    if (this.isDisabledButton) {
      this.autoCropping();
    }
  }

  filesDropped(files: FileHandle[]): void {
    this.file = files[0];
    this.isCropper = true;
    this.showWarning();
  }

  onFileSelected(event): void {
    this.selectedFile = event.target.files[0] as File;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = (ev) => this.handleFile(ev);
  }

  private autoCropping() {
    const changeFile = new File([this.croppedImage.blob], this.file.file.name, { type: 'image/png' });

    const reader = new FileReader();
    reader.readAsDataURL(changeFile);
    reader.onloadend = () => {
      const base64data = reader.result;

      const file = {
        url: base64data,
        file: changeFile
      };
      if (!this.isDisabledButton) {
        this.file = { ...file };
      }
      this.newFile.emit(file);
    };
  }
  private handleFile(event): void {
    this.selectedFileUrl = event.target.result;
    this.file = { url: this.selectedFileUrl, file: this.selectedFile };
    this.showWarning();
  }

  private showWarning(): void {
    this.isWarning = !((this.file.file.type === 'image/jpeg' || this.file.file.type === 'image/png') && this.file.file.size < 10485760);
    if (this.isWarning) {
      this.file = null;
    } else {
      this.newFile.emit(this.file);
    }
    this.warning.emit(this.isWarning);
  }
}
