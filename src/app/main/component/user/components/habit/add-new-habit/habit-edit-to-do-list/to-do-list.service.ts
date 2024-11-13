import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { mainLink } from '../../../../../../links';
import { AllToDoLists, HabitUpdateToDoList, ToDoList } from '@global-user/models/to-do-list.interface';

@Injectable({
  providedIn: 'root'
})
export class ToDoListService {
  constructor(private http: HttpClient) {}

  getHabitToDoList(habitId: number): Observable<ToDoList[]> {
    return this.http.get<ToDoList[]>(`${mainLink}habit/${habitId}/to-do-list`);
  }

  getHabitAllToDoLists(habitAssignId: number, lang: string): Observable<AllToDoLists> {
    return this.http.get<AllToDoLists>(`${mainLink}habit/assign/${habitAssignId}/allUserAndCustomList?lang=${lang}`);
  }

  //
  getUserToDoLists(lang: string): Observable<AllToDoLists[]> {
    return this.http.get<AllToDoLists[]>(`${mainLink}habit/assign/allUserAndCustomToDoListsInprogress?lang=${lang}`);
  }

  updateStandardToDoItemStatus(item: ToDoList, lang: string): Observable<ToDoList[]> {
    const body = {};
    return this.http.patch<ToDoList[]>(`${mainLink}user/to-do-list-items/${item.id}/status/${item.status}?lang=${lang}`, body);
  }

  //
  updateCustomToDoItemStatus(userId: number, item: ToDoList): Observable<ToDoList> {
    const body = {};
    return this.http.patch<ToDoList>(
      `${mainLink}custom/to-do-list-items/${userId}/custom-to-do-ping-list-items?itemId=${item.id}&status=${item.status}`,
      body
    );
  }

  updateHabitToDoList(habitToDoList: HabitUpdateToDoList) {
    const assignId = habitToDoList.habitAssignId;
    const body = {
      customToDoListItemDto: habitToDoList.customToDoList,
      userToDoListItemDto: habitToDoList.standardToDoList
    };
    return this.http.put(`${mainLink}habit/assign/${assignId}/allUserAndCustomList?lang=${habitToDoList.lang}`, body);
  }
}
