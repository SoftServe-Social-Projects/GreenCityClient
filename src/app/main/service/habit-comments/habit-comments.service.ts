import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environment/environment';
import { CommentsService } from 'src/app/main/component/comments/services/comments.service';
import { AddedCommentDTO, CommentFormData, CommentsModel } from 'src/app/main/component/comments/models/comments-model';
import { CommentService } from '@global-service/comment/comment.service';

@Injectable({
  providedIn: 'root'
})
export class HabitCommentsService implements CommentsService {
  private readonly backEnd = environment.backendLink;

  constructor(
    private readonly http: HttpClient,
    private readonly commentService: CommentService
  ) {}

  addComment(formData: CommentFormData): Observable<AddedCommentDTO> {
    const entityUrl = `${this.backEnd}habits/${formData.entityId}/comments`;
    return this.commentService.addCommentByEntityId(entityUrl, formData);
  }

  getActiveCommentsByPage(habitId: number, page: number, size: number): Observable<CommentsModel> {
    const url = `${this.backEnd}habits/comments/active?habitId=${habitId}&page=${page}&size=${size}`;
    return this.http.get<CommentsModel>(url);
  }

  getCommentsCount(habitId: number): Observable<number> {
    return this.http.get<number>(`${this.backEnd}habits/${habitId}/comments/count`);
  }

  getActiveRepliesByPage(parentCommentId: number, page: number, size: number): Observable<CommentsModel> {
    return this.http.get<CommentsModel>(`${this.backEnd}habits/comments/${parentCommentId}/replies/active?page=${page}&size=${size}`);
  }

  deleteComments(parentCommentId: number): Observable<boolean> {
    return this.http
      .delete<void>(`${this.backEnd}habits/comments/${parentCommentId}`, { observe: 'response' })
      .pipe(map((response) => response.status >= 200 && response.status < 300));
  }

  getRepliesAmount(parentCommentId: number): Observable<number> {
    return this.http.get<number>(`${this.backEnd}habits/comments/${parentCommentId}/replies/active/count`);
  }

  postLike(parentCommentId: number): Observable<void> {
    return this.http.post<void>(`${this.backEnd}habits/comments/like?commentId=${parentCommentId}`, {});
  }

  getCommentLikes(parentCommentId: number): Observable<number> {
    return this.http.get<number>(`${this.backEnd}habits/comments/${parentCommentId}/likes/count`);
  }

  editComment(parentCommentId: number, text: string): Observable<void> {
    return this.http.patch<void>(`${this.backEnd}habits/comments?id=${parentCommentId}`, { text });
  }
}
