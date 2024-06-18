import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Patterns } from 'src/assets/patterns/patterns';
import { ShoppingListService } from '@global-user/components/habit/add-new-habit/habit-edit-shopping-list/shopping-list.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subscription } from 'stompjs';
import { AllShoppingLists, ShoppingList } from '@global-user/models/shoppinglist.interface';
import { TodoStatus } from '@global-user/components/habit/models/todo-status.enum';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit {
  shoppingList: ShoppingList[] = [];
  toggle: boolean;
  private userId: number;
  currentLang: string;
  profileSubscription: Subscription;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private localStorageService: LocalStorageService,
    private shopListService: ShoppingListService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = this.localStorageService.getUserId();
    this.subscribeToLangChange();
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageBehaviourSubject.subscribe((lang: string) => {
      this.currentLang = lang;
      if (this.localStorageService.getUserId()) {
        this.getAllShopLists();
      }
    });
  }

  private getAllShopLists(): void {
    this.shopListService
      .getUserShoppingLists(this.currentLang)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        const customShopList = this.convertShopList(list, 'custom');
        const standardShopList = this.convertShopList(list, 'standard');
        customShopList.forEach((el) => (el.custom = true));
        this.shoppingList = [...customShopList, ...standardShopList];
      });
  }

  convertShopList(list: AllShoppingLists[], type: string): ShoppingList[] {
    return list.reduce((acc, obj) => acc.concat(type === 'custom' ? obj.customShoppingListItemDto : obj.userShoppingListItemDto), []);
  }

  isValidURL(url: string): boolean {
    return Patterns.isValidURL.test(url);
  }

  openCloseList(): void {
    this.toggle = !this.toggle;
  }

  toggleDone(item: ShoppingList): void {
    item.status = item.status === TodoStatus.inprogress ? TodoStatus.done : TodoStatus.inprogress;
    item.custom ? this.updateStatusCustomItem(item) : this.updateStatusItem(item);
  }

  private updateStatusItem(item: ShoppingList): void {
    this.shopListService
      .updateStandardShopItemStatus(item, this.currentLang)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateShopList(item);
      });
  }

  private updateStatusCustomItem(item: ShoppingList): void {
    this.shopListService
      .updateCustomShopItemStatus(this.userId, item)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateShopList(item);
      });
  }

  private updateShopList(item: ShoppingList): void {
    this.shoppingList = this.shoppingList.map((el) => (el.id === item.id ? { ...el, status: item.status } : el));
    this.cdr.detectChanges();
  }
}
