import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { Notifications } from '../../../ubs/ubs-admin/models/ubs-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserMessagesService implements OnDestroy {
  url = environment.backendUbsLink;
  private readonly destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  countOfNoReadMessages: any;
  language: string;

  constructor(private readonly http: HttpClient) {}

  getNotification(currentPage: number, size: number, language: string): Observable<Notifications> {
    return this.http.get<Notifications>(`${this.url}/notifications?lang=${language}&page=${currentPage}&size=${size}`);
  }

  getCountUnreadNotification(): Observable<number> {
    return this.http.get<number>(`${this.url}/notifications/quantityUnreadenNotifications`);
  }

  markNotificationAsRead(id: number): Observable<void> {
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
