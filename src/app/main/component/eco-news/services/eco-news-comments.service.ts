import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environment/environment';
import { CommentsService } from '../../comments/services/comments.service';
import { AddedCommentDTO, CommentsModel } from '../../comments/models/comments-model';

@Injectable({
  providedIn: 'root'
})
export class EcoNewsCommentsService implements CommentsService {
  private backEnd = environment.backendLink;

  constructor(private http: HttpClient) {}

  addComment(ecoNewsId: number, text: string, id = 0): Observable<AddedCommentDTO> {
    const formData = new FormData();
    const requestPayload = {
      text: text,
      parentCommentId: id
    };

    formData.append('request', JSON.stringify(requestPayload));
    return this.http.post<AddedCommentDTO>(`${this.backEnd}eco-news/${ecoNewsId}/comments`, formData);
  }

  getActiveCommentsByPage(ecoNewsId: number, page: number, size: number): Observable<CommentsModel> {
    return this.http.get<CommentsModel>(
      `${this.backEnd}eco-news/${ecoNewsId}/comments/active?statuses=ORIGINAL,EDITED&page=${page}&size=${size}`
    );
  }

  getCommentsCount(ecoNewsId: number): Observable<number> {
    return this.http.get<number>(`${this.backEnd}eco-news/${ecoNewsId}/comments/count`);
  }

  getActiveRepliesByPage(parentCommentId: number, page: number, size: number): Observable<CommentsModel> {
    return this.http.get<CommentsModel>(
      `${this.backEnd}eco-news/comments/${parentCommentId}/replies/active?statuses=ORIGINAL,EDITED&page=${page}&size=${size}`
    );
  }

  deleteComments(parentCommentId: number): Observable<boolean> {
    return this.http
      .delete<void>(`${this.backEnd}eco-news/comments/${parentCommentId}`, { observe: 'response' })
      .pipe(map((response) => response.status >= 200 && response.status < 300));
  }

  getCommentLikes(parentCommentId: number): Observable<number> {
    return this.http.get<number>(`${this.backEnd}eco-news/comments/${parentCommentId}/likes/count`);
  }

  getRepliesAmount(parentCommentId: number): Observable<number> {
    return this.http.get<number>(`${this.backEnd}eco-news/comments/${parentCommentId}/replies/active/count`);
  }

  postLike(parentCommentId: number): Observable<void> {
    return this.http.post<void>(`${this.backEnd}eco-news/comments/like?commentId=${parentCommentId}`, {});
  }

  editComment(parentCommentId: number, text: string): Observable<void> {
    return this.http.patch<void>(`${this.backEnd}eco-news/comments?commentId=${parentCommentId}`, text);
  }
}
