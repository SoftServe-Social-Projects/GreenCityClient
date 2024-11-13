import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { habitLink } from '../../links';
import { TagInterface } from '@shared/components/tag-filter/tag-filter.model';
import { environment } from '@environment/environment';
import { HabitInterface, HabitListInterface } from '@global-user/components/habit/models/interfaces/habit.interface';
import { ToDoList } from '@global-user/models/to-do-list.interface';
import { CustomHabitDtoRequest, CustomHabit } from '@global-user/components/habit/models/interfaces/custom-habit.interface';
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

  getMutualHabits(friendId: number, page: number, size: number): Observable<HabitListInterface> {
    return this.http.get<HabitListInterface>(`${habitLink}/allMutualHabits/${friendId}?lang=${this.language}&page=${page}&size=${size}`);
  }

  getAllFriendHabits(friendId: number, page: number, size: number): Observable<HabitListInterface> {
    return this.http.get<HabitListInterface>(`${habitLink}/all/${friendId}?lang=${this.language}&page=${page}&size=${size}`);
  }

  getAllHabits(page: number, size: number): Observable<HabitListInterface> {
    return this.http.get<HabitListInterface>(`${habitLink}?lang=${this.language}&page=${page}&size=${size}`);
  }

  getMyAllHabits(page: number, size: number): Observable<HabitListInterface> {
    return this.http.get<HabitListInterface>(`${habitLink}/my?lang=${this.language}&page=${page}&size=${size}`);
  }

  getHabitById(id: number): Observable<HabitInterface> {
    return this.http.get<HabitInterface>(`${habitLink}/${id}?lang=${this.language}`);
  }

  getHabitToDoList(id: number): Observable<Array<ToDoList>> {
    return this.http.get<Array<ToDoList>>(`${habitLink}/${id}/to-do-list?lang=${this.language}`);
  }

  getAllTags(): Observable<Array<TagInterface>> {
    return this.http.get<Array<TagInterface>>(`${this.backEnd}tags/v2/search?type=${this.tagsType}`);
  }

  getHabitsByFilters(requestParams: HttpParams): Observable<HabitListInterface> {
    return this.http.get<HabitListInterface>(`${habitLink}/search`, { params: requestParams });
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
      customToDoListItemDto: habit.toDoList
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
