import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ShoppingList } from '@global-user/models/shoppinglist.model';
import { HttpClient } from '@angular/common/http';
import { mainLink } from '../../../../../../links';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  public list = [];
  public list$ = new Subject();

  private customList = [];

  constructor(private http: HttpClient) {}

  public fillList(data: ShoppingList[]) {
    this.list = data;
    this.list$.next(this.list);
  }

  public getList(): Observable<any> {
    return this.list$.asObservable();
  }

  public addItem(value: string) {
    const newItem = {
      status: 'ACTIVE',
      text: value,
      selected: false
    };
    this.list = [newItem, ...this.list];
    this.customList.push(newItem);
    this.list$.next(this.list);
  }

  public deleteItem(item) {
    this.list = this.list.filter((elem) => elem.text !== item.text);
    this.list$.next(this.list);
  }

  public select(item) {
    item.selected = !item.selected;
  }

  public saveCustomItems(userId: string, habitId: number) {
    return this.http.post<Array<ShoppingList>>(`${mainLink}custom/shopping-list-items/${userId}/${habitId}/custom-shopping-list-items`, {
      customShoppingListItemSaveRequestDtoList: this.customList
    });
  }

  public getCustomItems(userId: string, habitId: number) {
    this.http.get(`${mainLink}/custom/shopping-list-items/${userId}/${habitId}`).subscribe((res: ShoppingList[]) => {
      this.fillList(res);
    });
  }
}
