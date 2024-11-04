import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Observer, ReplaySubject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { EcoNewsModel } from '../models/eco-news-model';
import { environment } from '@environment/environment';
import { EcoNewsDto } from '../models/eco-news-dto';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class EcoNewsService implements OnDestroy {
  private backEnd = environment.backendLink;
  private language: string;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe((language) => (this.language = language));
  }

  getEcoNewsListByPage(page: number, quantity: number): Observable<EcoNewsDto> {
    return this.http.get<EcoNewsDto>(`${this.backEnd}eco-news?page=${page}&size=${quantity}`);
  }

  getEcoNewsList(params: HttpParams): Observable<EcoNewsDto> {
    return this.http.get<EcoNewsDto>(`${this.backEnd}eco-news`, { params });
  }

  getEcoNewsListByTitle(title: string, page: number, quantity: number): Observable<EcoNewsDto> {
    return this.http.get<EcoNewsDto>(`${this.backEnd}eco-news?title=${title}&page=${page}&size=${quantity}`);
  }

  getEcoNewsListByAutorId(authorId: number, page: number, quantity: number) {
    return this.http.get(`${this.backEnd}eco-news?author-id=${authorId}&page=${page}&size=${quantity}`);
  }

  getNewsListByTags(page: number, quantity: number, tags: Array<string>) {
    return this.http.get(`${this.backEnd}eco-news?tags=${tags}&page=${page}&size=${quantity}`);
  }

  getUserFavoriteNews(page: number, quantity: number, userId: number): Observable<EcoNewsDto> {
    return this.http.get<EcoNewsDto>(`${this.backEnd}eco-news?page=${page}&size=${quantity}&statuses=SAVED&user-id=${userId}`);
  }

  getNewsList(): Observable<any> {
    const headers = new HttpHeaders();
    headers.set('Content-type', 'application/json');
    return new Observable((observer: Observer<any>) => {
      this.http
        .get<EcoNewsDto>(`${this.backEnd}eco-news`)
        .pipe(take(1))
        .subscribe((newsDto: EcoNewsDto) => {
          observer.next(newsDto);
        });
    });
  }

  getEcoNewsById(id: number): Observable<EcoNewsModel> {
    return this.http.get<EcoNewsModel>(`${this.backEnd}eco-news/${id}?lang=${this.language}`);
  }

  getRecommendedNews(id: number): Observable<EcoNewsModel[]> {
    return this.http.get<EcoNewsModel[]>(`${this.backEnd}eco-news/${id}/recommended`);
  }

  getIsLikedByUser(econewsId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.backEnd}eco-news/${econewsId}/likes/${userId}`);
  }

  postToggleLike(id: number): Observable<any> {
    return this.http.post(`${this.backEnd}eco-news/${id}/likes`, {});
  }

  deleteNews(id: number): Observable<any> {
    return this.http.delete(`${this.backEnd}eco-news/${id}`);
  }

  addNewsToFavorites(id: number) {
    return this.http.post(`${this.backEnd}eco-news/${id}/favorites`, {});
  }

  removeNewsFromFavorites(id: number) {
    return this.http.delete(`${this.backEnd}eco-news/${id}/favorites`, {});
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
