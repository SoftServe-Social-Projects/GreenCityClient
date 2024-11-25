import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { CommentsService } from '../../services/comments.service';
import { ProfileService } from '@global-user/components/profile/profile-service/profile.service';
import { AddedCommentDTO, CommentFormData } from 'src/app/main/component/comments/models/comments-model';
import { CommentTextareaComponent } from '../comment-textarea/comment-textarea.component';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})
export class AddCommentComponent implements OnInit {
  @Input() public isImageUploaderOpen = false;
  @Input() public entityId: number;
  @Input() public commentId: number;
  @Output() public imageUploaderStatus = new EventEmitter<boolean>();
  @Output() public updateList = new EventEmitter<AddedCommentDTO>();
  @ViewChild(CommentTextareaComponent) commentTextareaComponent: CommentTextareaComponent;

  avatarImage: string;
  firstName: string;
  uploadedImage: File | null = null;
  showImageControls = true;
  addCommentForm: FormGroup = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(8000), this.noSpaceValidator]]
  });
  commentHtml: string;

  constructor(
    private commentsService: CommentsService,
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.getUserInfo();
  }

  noSpaceValidator(control: FormControl): ValidationErrors {
    return (control.value || '').trim().length ? null : { spaces: true };
  }

  getUserInfo(): void {
    this.profileService.getUserInfo().subscribe((item) => {
      this.firstName = item.name;
      this.avatarImage = item.profilePicturePath;
    });
  }

  resetForm(): void {
    this.addCommentForm.reset();
    this.addCommentForm.controls.content.setValue('');
    this.commentHtml = '';
    this.uploadedImage = null;
    this.imageUploaderStatus.emit(false);
    this.commentTextareaComponent.onCancelImage();
    this.commentTextareaComponent.isEmojiPickerOpen = false;
  }

  setContent(data: { text: string; innerHTML: string; imageFiles?: File[] }) {
    this.addCommentForm.controls.content.setValue(data.text);
    this.commentHtml = data.innerHTML;
    if (data?.imageFiles?.length) {
      this.uploadedImage = data.imageFiles[0];
      this.showImageControls = true;
    }
  }

  onSubmit(): void {
    const commentData: CommentFormData = {
      entityId: this.entityId,
      text: this.commentHtml,
      imageFiles: this.commentTextareaComponent.uploadedImage.map((image) => image.file),
      parentCommentId: this.commentId
    };

    this.commentsService.addComment(commentData).subscribe((comment: AddedCommentDTO) => {
      this.updateList.emit(comment);
      this.resetForm();
    });
  }
}
