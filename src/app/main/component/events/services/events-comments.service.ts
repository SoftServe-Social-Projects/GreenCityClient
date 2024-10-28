import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environment/environment';
import { CommentsService } from '../../comments/services/comments.service';
import { AddedCommentDTO, CommentFormData, CommentsModel } from '../../comments/models/comments-model';
import { CommentService } from '@global-service/comment/comment.service';

@Injectable({
  providedIn: 'root'
})
export class EventsCommentsService implements CommentsService {
  private backEnd = environment.backendLink;

  constructor(
    private readonly http: HttpClient,
    private readonly commentService: CommentService
  ) {}

  addComment(formData: CommentFormData): Observable<AddedCommentDTO> {
    const entityUrl = `${this.backEnd}events/${formData.entityId}/comments`;
    return this.commentService.addCommentByEntityId(entityUrl, formData);
  }

  getActiveCommentsByPage(eventId: number, page: number, size: number): Observable<CommentsModel> {
    return this.http.get<CommentsModel>(`${this.backEnd}events/${eventId}/comments?statuses=ORIGINAL,EDITED&page=${page}&size=${size}`);
  }

  getCommentsCount(eventId: number): Observable<number> {
    return this.http.get<number>(`${this.backEnd}events/${eventId}/comments/count`);
  }

  getActiveRepliesByPage(parentCommentId: number, page: number, size: number): Observable<CommentsModel> {
    return this.http.get<CommentsModel>(
      `${this.backEnd}events/comments/${parentCommentId}/replies/active?statuses=ORIGINAL,EDITED&page=${page}&size=${size}`
    );
  }

  deleteComments(parentCommentId: number): Observable<boolean> {
    return this.http
      .delete<void>(`${this.backEnd}events/comments/${parentCommentId}`, { observe: 'response' })
      .pipe(map((response) => response.status >= 200 && response.status < 300));
  }

  getCommentLikes(parentCommentId: number): Observable<number> {
    return this.http.get<number>(`${this.backEnd}events/comments/${parentCommentId}/likes/count`);
  }

  getRepliesAmount(parentCommentId: number): Observable<number> {
    return this.http.get<number>(`${this.backEnd}events/comments/${parentCommentId}/replies/count`);
  }

  postLike(parentCommentId: number): Observable<void> {
    return this.http.post<void>(`${this.backEnd}events/comments/like/${parentCommentId}`, {});
  }

  editComment(parentCommentId: number, text: string): Observable<void> {
    return this.http.patch<void>(`${this.backEnd}events/comments/${parentCommentId}`, text);
  }
}
