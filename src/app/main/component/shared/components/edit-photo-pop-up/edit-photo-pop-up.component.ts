import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditProfileService } from '@global-user/services/edit-profile.service';
import { FileHandle } from '@eco-news-models/create-news-interface';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { DragAndDropComponent } from '../drag-and-drop/drag-and-drop.component';

@Component({
  selector: 'app-edit-photo-pop-up',
  templateUrl: './edit-photo-pop-up.component.html',
  styleUrls: ['./edit-photo-pop-up.component.scss']
})
export class EditPhotoPopUpComponent implements OnInit {
  avatarImg: string;
  cancelButton = './assets/img/profile/icons/cancel.svg';
  file: FileHandle = null;
  isWarning = false;
  selectedPhoto = false;
  selectedFile: File = null;
  isNotification: boolean;
  loadingAnim: boolean;
  isDragAndDropMenu = false;
  croppedImage: string | File;
  shouldCancel = false;

  @ViewChild(DragAndDropComponent) dragAndDropComponent: DragAndDropComponent;

  constructor(
    private matDialogRef: MatDialogRef<EditPhotoPopUpComponent>,
    private editProfileService: EditProfileService,
    private snackBar: MatSnackBarComponent,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit(): void {
    this.setUserAvatar();
  }

  savePhoto(): void {
    this.loadingAnim = true;
    const formData = new FormData();
    formData.append('image', this.selectedFile);
    this.editProfileService.updateProfilePhoto(formData).subscribe({
      next: () => {
        this.loadingAnim = false;
        this.closeEditPhoto();
      },
      error: () => {
        this.loadingAnim = false;
        this.openErrorDialog();
      }
    });
  }

  deletePhoto(): void {
    this.loadingAnim = true;
    this.editProfileService.deleteProfilePhoto().subscribe({
      next: () => {
        this.loadingAnim = false;
        this.closeEditPhoto();
      },
      error: () => {
        this.loadingAnim = false;
        this.openErrorDialog();
      }
    });
  }

  closeEditPhoto(): void {
    this.matDialogRef.close();
  }

  cancelPhoto() {
    this.dragAndDropComponent.cancelChanges();
    this.selectedFile = null;
  }

  private setUserAvatar(): void {
    this.avatarImg = this.data.img;
  }

  private openErrorDialog(): void {
    this.snackBar.openSnackBar('error');
  }

  imageCropped(fileHandle: FileHandle): void {
    if (!fileHandle?.file) {
      return;
    }
    this.selectedFile = fileHandle.file;
  }
}
