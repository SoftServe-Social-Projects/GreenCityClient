import { takeUntil } from 'rxjs/operators';
import { ProfileService } from './../profile-service/profile.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShoppingList } from '@global-user/models/shoppinglist.model';
import { Subscription, Subject } from 'rxjs';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss'],
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  public shoppingList: ShoppingList[];
  public profileSubscription: Subscription;
  private destroy$ = new Subject<void>();
  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.getShoppingList();
  }

  public getShoppingList(): void {
    this.profileSubscription = this.profileService.getShoppingList().subscribe(
      (shoppingListArr: ShoppingList[]) => (this.shoppingList = shoppingListArr),
      (error) => (this.shoppingList = [])
    );
  }

  public toggleDone(item): void {
    this.profileService
      .toggleStatusOfShoppingItem(item)
      .pipe(takeUntil(this.destroy$))
      .subscribe((success) => this.updateDataOnUi(item));
  }

  private updateDataOnUi(item): any {
    const { status: prevItemStatus } = item;
    const newItemStatus = prevItemStatus === 'ACTIVE' ? 'DONE' : 'ACTIVE';
    return (item.status = newItemStatus);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
