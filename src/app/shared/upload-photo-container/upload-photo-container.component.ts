import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-upload-photo-container',
  templateUrl: './upload-photo-container.component.html',
  styleUrls: ['./upload-photo-container.component.scss']
})
export class UploadPhotoContainerComponent implements OnInit {
  isHorisontalImg: boolean;
  private croppedImage: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<UploadPhotoContainerComponent>
  ) {}

  ngOnInit(): void {
    const img = new Image();
    img.src = this.data.file.url;

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      this.isHorisontalImg = height >= width;
    };
  }

  getMainContainerStyle(): { height: string; width: string } {
    return {
      height: this.isHorisontalImg ? '700px' : '530px',
      width: this.isHorisontalImg ? '500px' : '630px'
    };
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
  }

  onSaveChanges(): void {
    this.dialogRef.close(this.croppedImage);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
