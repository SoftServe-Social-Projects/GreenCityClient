import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Observer, ReplaySubject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { EcoNewsModel, NewsTagInterface } from '../models/eco-news-model';
import { environment } from 'src/environments/environment';
import { EcoNewsDto } from '../models/eco-news-dto';
import { LocalStorageService } from 'src/app/main/service/localstorage/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class EcoNewsService implements OnDestroy {
  private backEnd = environment.backendLink;
  private language: string;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe((language) => (this.language = language));
  }

  public getAllPresentTags(): Observable<Array<NewsTagInterface>> {
    return this.http.get<Array<NewsTagInterface>>(`${this.backEnd}econews/tags/all?lang=${this.language}`);
  }

  public getEcoNewsListByPage(page: number, quantity: number) {
    return this.http.get(`${this.backEnd}econews?page=${page}&size=${quantity}`);
  }

  public getNewsListByTags(page: number, quantity: number, tags: Array<string>) {
    return this.http.get(`${this.backEnd}econews/tags?page=${page}&size=${quantity}&tags=${tags}`);
  }

  public getNewsList(): Observable<any> {
    const headers = new HttpHeaders();
    headers.set('Content-type', 'application/json');
    return new Observable((observer: Observer<any>) => {
      this.http
        .get<EcoNewsDto>(`${this.backEnd}econews`)
        .pipe(take(1))
        .subscribe((newsDto: EcoNewsDto) => {
          observer.next(newsDto);
        });
    });
  }

  public getEcoNewsById(id: string): Observable<EcoNewsModel> {
    return this.http.get<EcoNewsModel>(`${this.backEnd}econews/${id}`);
  }

  public getRecommendedNews(id: number): Observable<EcoNewsModel> {
    return this.http.get<EcoNewsModel>(`${this.backEnd}econews/recommended?openedEcoNewsId=${id}`);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
