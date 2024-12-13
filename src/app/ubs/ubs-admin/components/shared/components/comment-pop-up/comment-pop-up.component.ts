import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-comment-pop-up',
  templateUrl: './comment-pop-up.component.html',
  styleUrls: ['./comment-pop-up.component.scss']
})
export class CommentPopUpComponent implements OnInit {
  @Input() header: string;
  @Input() comment: string;

  commentForm: FormGroup;

  constructor(public fb: FormBuilder, private dialogRef: MatDialogRef<CommentPopUpComponent>) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.commentForm = this.fb.group({
      comment: [this.comment, [Validators.maxLength(255)]]
    });
  }

  onSubmit(): void {
    const data = this.commentForm.get('comment').value;
    this.dialogRef.close(data);
  }
}
