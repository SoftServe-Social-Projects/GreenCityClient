import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { Notifications } from '../../../ubs/ubs-admin/models/ubs-user.model';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserMessagesService implements OnDestroy {
  url = environment.backendUbsLink;
  private readonly destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  countOfNoReadMessages: any;
  language: string;

  constructor(
    private readonly http: HttpClient,
    private readonly localStorageService: LocalStorageService
  ) {
    localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe((language) => (this.language = language));
  }

  getNotification(currentPage: number, size: number): Observable<Notifications> {
    return this.http.get<Notifications>(`${this.url}/notifications?lang=${this.language}&page=${currentPage}&size=${size}`);
  }

  getCountUnreadNotification(): Observable<number> {
    return this.http.get<number>(`${this.url}/notifications/quantityUnreadenNotifications`);
  }

  setReadNotification(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/notifications/${id}/viewNotification`, {});
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/notifications/${id}`);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }
}
