import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { mainLink } from 'src/app/main/links';
import { AllShoppingLists, HabitUpdateShopList, ShoppingList } from '@user-models/shoppinglist.interface';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  constructor(private http: HttpClient) {}

  getHabitShopList(habitId: number): Observable<ShoppingList[]> {
    return this.http.get<ShoppingList[]>(`${mainLink}habit/${habitId}/shopping-list`);
  }

  getHabitAllShopLists(habitAssignId: number, lang: string): Observable<AllShoppingLists> {
    return this.http.get<AllShoppingLists>(`${mainLink}habit/assign/${habitAssignId}/allUserAndCustomList?lang=${lang}`);
  }

  getUserShoppingLists(lang: string): Observable<AllShoppingLists[]> {
    return this.http.get<AllShoppingLists[]>(`${mainLink}habit/assign/allUserAndCustomShoppingListsInprogress?lang=${lang}`);
  }

  updateStandardShopItemStatus(item: ShoppingList, lang: string): Observable<ShoppingList[]> {
    const body = {};
    return this.http.patch<ShoppingList[]>(`${mainLink}user/shopping-list-items/${item.id}/status/${item.status}?lang=${lang}`, body);
  }

  updateCustomShopItemStatus(userId: number, item: ShoppingList): Observable<ShoppingList> {
    const body = {};
    return this.http.patch<ShoppingList>(
      `${mainLink}custom/shopping-list-items/${userId}/custom-shopping-list-items?itemId=${item.id}&status=${item.status}`,
      body
    );
  }

  updateHabitShopList(habitShopList: HabitUpdateShopList) {
    const assignId = habitShopList.habitAssignId;
    const body = {
      customShoppingListItemDto: habitShopList.customShopList,
      userShoppingListItemDto: habitShopList.standardShopList
    };
    return this.http.put(`${mainLink}habit/assign/${assignId}/allUserAndCustomList?lang=${habitShopList.lang}`, body);
  }
}
