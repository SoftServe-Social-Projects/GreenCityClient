import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { habitLink } from '../../links';
import { TagInterface } from '@shared/components/tag-filter/tag-filter.model';
import { environment } from '@environment/environment';
import { HabitInterface, HabitListInterface } from '@global-user/components/habit/models/interfaces/habit.interface';
import { ShoppingList } from '@global-user/models/shoppinglist.interface';
import { CustomHabitDtoRequest, CustomHabit, HabitPageable } from '@global-user/components/habit/models/interfaces/custom-habit.interface';
import { FriendProfilePicturesArrayModel } from '@global-user/models/friend.model';
import { FileHandle } from '@eco-news-models/create-news-interface';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  language: string;
  destroy$: ReplaySubject<any> = new ReplaySubject<any>(1);
  imageFile: FileHandle = null;
  private tagsType = 'HABIT';
  private backEnd = environment.backendLink;
  private httpOptions = {
    headers: new HttpHeaders({
      Authorization: 'my-auth-token'
    })
  };

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {
    localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((language) => (this.language = language));
  }

  getAllHabits(page: number, size: number): Observable<HabitListInterface> {
    return this.http.get<HabitListInterface>(`${habitLink}?lang=${this.language}&page=${page}&size=${size}`);
  }

  getHabitById(id: number): Observable<HabitInterface> {
    return this.http.get<HabitInterface>(`${habitLink}/${id}?lang=${this.language}`);
  }

  getHabitShoppingList(id: number): Observable<Array<ShoppingList>> {
    return this.http.get<Array<ShoppingList>>(`${habitLink}/${id}/shopping-list?lang=${this.language}`);
  }

  getAllTags(): Observable<Array<TagInterface>> {
    return this.http.get<Array<TagInterface>>(`${this.backEnd}tags/v2/search?type=${this.tagsType}`);
  }

  getHabitsByTagAndLang(criteria: HabitPageable): Observable<HabitListInterface> {
    const params = this.getHttpParams(criteria);
    return this.http.get<HabitListInterface>(`${habitLink}/tags/search?lang=${this.language}`, { params });
  }

  getHabitsByFilters(criteria: HabitPageable): Observable<HabitListInterface> {
    const params = this.getHttpParams(criteria);
    return this.http.get<HabitListInterface>(`${habitLink}/search?lang=${this.language}`, { params });
  }

  addCustomHabit(habit: CustomHabit, lang: string): Observable<CustomHabitDtoRequest> {
    const formData = this.prepareCustomHabitRequest(habit, lang);
    return this.http.post<CustomHabitDtoRequest>(`${habitLink}/custom`, formData, this.httpOptions);
  }

  changeCustomHabit(habit: CustomHabit, lang: string, id: number): Observable<CustomHabitDtoRequest> {
    const formData = this.prepareCustomHabitRequest(habit, lang);
    return this.http.put<CustomHabitDtoRequest>(`${habitLink}/update/${id}`, formData, this.httpOptions);
  }

  getFriendsTrakingSameHabitByHabitId(id: number): Observable<FriendProfilePicturesArrayModel[]> {
    return this.http.get<FriendProfilePicturesArrayModel[]>(`${habitLink}/${id}/friends/profile-pictures`);
  }

  deleteCustomHabit(id: number): Observable<CustomHabitDtoRequest> {
    return this.http.delete<CustomHabitDtoRequest>(`${habitLink}/delete/${id}`);
  }

  private getHttpParams(criteria: HabitPageable): HttpParams {
    let params = new HttpParams();
    if (criteria.filters && Array.isArray(criteria.filters)) {
      criteria.filters.forEach((filter) => {
        if (filter === 'isCustomHabit=true' || filter === 'isCustomHabit=false') {
          const [key, value] = filter.split('=');
          params = params.append(key, value);
        } else {
          params = params.append('filters', filter);
        }
      });
    }
    return params;
  }

  private prepareCustomHabitRequest(habit: CustomHabit, lang: string): FormData {
    const body = {
      habitTranslations: [
        {
          name: habit.title,
          description: habit.description,
          habitItem: '',
          languageCode: lang
        }
      ],
      complexity: habit.complexity,
      defaultDuration: habit.duration,
      tagIds: habit.tagIds,
      customShoppingListItemDto: habit.shopList
    };

    const formData = new FormData();
    formData.append('request', JSON.stringify(body));
    if (this.imageFile) {
      formData.append('image', this.imageFile.file);
      this.imageFile = null;
    }

    const accessToken = this.localStorageService.getAccessToken();
    this.httpOptions.headers.set('Authorization', `Bearer ${accessToken}`);
    this.httpOptions.headers.append('Content-Type', 'multipart/form-data');

    return formData;
  }
}
