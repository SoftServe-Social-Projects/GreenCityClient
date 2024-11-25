import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedMainModule } from '@shared/shared-main.module';
import { AddCommentComponent } from './components/add-comment/add-comment.component';
import { ViewRepliesComponent } from './components/view-replies/view-replies.component';
import { DeleteCommentComponent } from './components/delete-comment/delete-comment.component';
import { EditCommentComponent } from './components/edit-comment/edit-comment.component';
import { LikeCommentComponent } from './components/like-comment/like-comment.component';
import { ReplyCommentComponent } from './components/reply-comment/reply-comment.component';
import { CommentPaginationComponent } from './components/comment-pagination/comment-pagination.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommentsListComponent } from './components/comments-list/comments-list.component';
import { CommentsContainerComponent } from './components/comments-container/comments-container.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommentTextareaComponent } from './components/comment-textarea/comment-textarea.component';
import { PlaceholderForDivDirective } from './directives/placeholder-for-div.directive';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@NgModule({
  declarations: [
    AddCommentComponent,
    ViewRepliesComponent,
    DeleteCommentComponent,
    EditCommentComponent,
    LikeCommentComponent,
    ReplyCommentComponent,
    CommentPaginationComponent,
    CommentsListComponent,
    CommentsContainerComponent,
    CommentTextareaComponent,
    PlaceholderForDivDirective
  ],
  imports: [SharedMainModule, SharedModule, CommonModule, NgxPaginationModule, MatProgressSpinnerModule, PickerComponent],
  exports: [
    AddCommentComponent,
    ViewRepliesComponent,
    DeleteCommentComponent,
    EditCommentComponent,
    LikeCommentComponent,
    ReplyCommentComponent,
    CommentPaginationComponent,
    CommentsListComponent,
    CommentsContainerComponent
  ]
})
export class CommentsModule {}
