import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material';
import { CommentsComponent } from './components/comments.component';
import { SharedModule } from '@shared/shared.module';
import { AddCommentComponent } from './components/add-comment/add-comment.component';
import { CommentBodyComponent } from './components/comment-body/comment-body.component';
import { ViewRepliesComponent } from './components/view-replies/view-replies.component';
import { DeleteCommentComponent } from './components/delete-comment/delete-comment.component';
import { EditCommentComponent } from './components/edit-comment/edit-comment.component';
import { LikeCommentComponent } from './components/like-comment/like-comment.component';
import { ReplyCommentComponent } from './components/reply-comment/reply-comment.component';
import { LikesCounterComponent } from './components/likes-counter/likes-counter.component';
import { CommentCounterComponent } from './components/comment-counter/comment-counter.component';
import { CommentPaginationComponent } from './components/comment-pagination/comment-pagination.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    CommentsComponent,
    AddCommentComponent,
    CommentBodyComponent,
    ViewRepliesComponent,
    DeleteCommentComponent,
    EditCommentComponent,
    LikeCommentComponent,
    ReplyCommentComponent,
    LikesCounterComponent,
    EditCommentComponent,
    CommentCounterComponent,
    CommentPaginationComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    NgxPaginationModule,
    MatProgressSpinnerModule
  ],
  exports: [
    AddCommentComponent,
    ViewRepliesComponent,
    DeleteCommentComponent,
    EditCommentComponent,
    LikeCommentComponent,
    ReplyCommentComponent,
    LikesCounterComponent,
    EditCommentComponent,
    CommentCounterComponent,
    CommentPaginationComponent,
    CommentBodyComponent
  ],
  providers: []
})

export class CommentsModule { }


