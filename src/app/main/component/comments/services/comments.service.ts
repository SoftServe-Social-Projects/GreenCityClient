import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddedCommentDTO, CommentFormData, CommentsModel } from '../models/comments-model';

@Injectable({
  providedIn: 'root'
})
export abstract class CommentsService {
  abstract addComment(formData: CommentFormData): Observable<AddedCommentDTO>;

  abstract getActiveCommentsByPage(entityId: number, page: number, size: number): Observable<CommentsModel>;

  abstract getCommentsCount(entityId: number): Observable<number>;

  abstract getActiveRepliesByPage(parentCommentId: number, page: number, size: number): Observable<CommentsModel>;

  abstract deleteComments(parentCommentId: number): Observable<boolean>;

  abstract getCommentLikes(parentCommentId: number): Observable<number>;

  abstract getRepliesAmount(parentCommentId: number): Observable<number>;

  abstract postLike(parentCommentId: number): Observable<void>;

  abstract editComment(parentCommentId: number, text: string): Observable<void>;
}
