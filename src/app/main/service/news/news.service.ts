import { LanguageService } from 'src/app/main/i18n/language.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NewsDto } from '@home-models/NewsDto';
import { Observable } from 'rxjs';
import { latestNewsLink } from 'src/app/main/links';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  constructor(
    private http: HttpClient,
    private languageService: LanguageService
  ) {}

  loadLatestNews(): Observable<NewsDto[]> {
    const currentLanguage = this.languageService.getCurrentLanguage();

    return this.http.get<NewsDto[]>(`${latestNewsLink}?language=${currentLanguage}`);
  }
}
