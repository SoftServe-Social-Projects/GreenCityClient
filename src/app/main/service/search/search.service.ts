import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { Observable, Subject } from 'rxjs';
import { SearchDataModel } from '../../model/search/search.model';
import { SearchDto } from 'src/app/main/component/layout/components/models/search-dto';
import { SearchCategory } from 'src/app/shared/search-popup/search-consts';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private backEndLink = environment.backendLink;
  private allElemsSubj = new Subject<any>();
  searchSubject = new Subject<boolean>();
  allSearchSubject = new Subject<boolean>();
  allElements: SearchDto;

  getAllResults(searchQuery: string, category: SearchCategory, lang: string): Observable<SearchDataModel> {
    return this.http.get<SearchDataModel>(`${this.backEndLink}search/${category}?lang=${lang}&searchQuery=${encodeURI(searchQuery)}`);
  }

  getAllResultsByCat(
    query: string,
    category: string = 'news',
    page: number = 0,
    sort: string = '',
    items: number = 9
  ): Observable<SearchDataModel> {
    return this.http.get<SearchDataModel>(
      `${this.backEndLink}search/${category}?searchQuery=${query}&sort=${sort}&page=${page}&size=${items}`
    );
  }

  toggleSearchModal() {
    this.searchSubject.next(true);
  }

  closeSearchSignal() {
    this.searchSubject.next(false);
  }

  toggleAllSearch(value) {
    this.allSearchSubject.next(value);
  }

  getElementsAsObserv(): Observable<any> {
    return this.allElemsSubj.asObservable();
  }

  constructor(private http: HttpClient) {}
}
