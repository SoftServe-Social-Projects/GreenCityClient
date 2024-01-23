import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FriendArrayModel, FriendModel } from '@global-user/models/friend.model';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { GetAllFriends, DeleteFriend } from 'src/app/store/actions/friends.actions';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';

@Component({
  selector: 'app-all-friends',
  templateUrl: './all-friends.component.html',
  styleUrls: ['./all-friends.component.scss']
})
export class AllFriendsComponent implements OnInit {
  public userId: number;
  public friends: FriendModel[] = [];
  private destroy$ = new Subject();
  public scroll = false;
  public currentPage = 0;
  private size = 10;
  public totalPages: number;
  public emptySearchList = false;
  public searchQuery = '';
  public isFetching = false;
  public searchMode = false;
  readonly absent = 'assets/img/noNews.svg';
  friendsList$ = this.store.select((state: IAppState): FriendArrayModel => state.friend.FriendList);
  newFriendList$ = this.store.select((state: IAppState): FriendModel[] => state.friend.FriendsStayInFriendsList);

  constructor(
    private userFriendsService: UserFriendsService,
    private localStorageService: LocalStorageService,
    private matSnackBar: MatSnackBarComponent,
    private store: Store
  ) {}

  ngOnInit() {
    this.initUser();
    this.getAllFriends(this.currentPage);
  }

  public getAllFriends(currentPage: number) {
    this.store.dispatch(GetAllFriends({ page: currentPage, size: this.size }));

    this.friendsList$.pipe(takeUntil(this.destroy$)).subscribe((data: FriendArrayModel) => {
      if (data) {
        this.totalPages = data.totalPages;
        this.friends = data.page;
        this.isFetching = false;
        this.emptySearchList = false;
        this.scroll = false;
      }
    });
  }

  public findFriendByName(value: string): void {
    this.isFetching = true;
    this.searchQuery = value;
    this.searchMode = true;
    this.userFriendsService
      .getFriendsByName(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: FriendArrayModel) => {
          this.emptySearchList = !data.page.length;
          this.friends = data.page;
          this.isFetching = false;
          this.searchMode = false;
        },
        (error) => {
          this.matSnackBar.openSnackBar('snack-bar.error.default');
          this.isFetching = false;
          this.searchMode = false;
        }
      );
  }

  public onScroll(): void {
    if (this.scroll || this.emptySearchList) {
      return;
    }
    this.scroll = true;
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.getAllFriends(this.currentPage);
    }
  }

  public handleDeleteFriend(id: number) {
    this.store.dispatch(DeleteFriend({ id }));
    this.newFriendList$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.friends = data;
    });
  }

  public initUser(): void {
    this.localStorageService.userIdBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((userId: number) => (this.userId = userId));
  }
}
