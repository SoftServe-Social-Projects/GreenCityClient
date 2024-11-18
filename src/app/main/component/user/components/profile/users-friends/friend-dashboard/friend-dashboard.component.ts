import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AllFriendsComponent } from './all-friends/all-friends.component';
import { RecommendedFriendsComponent } from './recommended-friends/recommended-friends.component';
import { FriendRequestsComponent } from './friend-requests/friend-requests.component';
import { searchIcon } from 'src/app/main/image-pathes/places-icons';

import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { IFriendState } from 'src/app/store/state/friends.state';
import { GetAllFriends, GetAllFriendsRequests } from 'src/app/store/actions/friends.actions';

@Component({
  selector: 'app-friend-dashboard',
  templateUrl: './friend-dashboard.component.html',
  styleUrls: ['./friend-dashboard.component.scss']
})
export class FriendDashboardComponent implements OnInit {
  userId: number;
  destroy$ = new Subject();
  searchTerm$: Subject<string> = new Subject();
  searchIcon = searchIcon;
  hideInput = true;
  allFriendsAmount: number;
  requestFriendsAmount: number;
  private componentRef;
  private size = 10;
  friendsList$ = this.store.select((state: IAppState): IFriendState => state.friend);

  constructor(
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private store: Store
  ) {}

  ngOnInit() {
    this.initUser();
    this.subscribeToLangChange();
    this.bindLang(this.localStorageService.getCurrentLanguage());
    this.preventFrequentQuery();
    this.hideInputField();
    this.getFriends();
  }

  preventFrequentQuery() {
    this.searchTerm$.pipe(debounceTime(400), takeUntil(this.destroy$)).subscribe((value) => {
      this.searchForFriends(value);
    });
  }

  private getFriends() {
    if (this.userId) {
      this.store.dispatch(GetAllFriends({ page: 0, size: this.size }));
      this.store.dispatch(GetAllFriendsRequests({ page: 0, size: this.size }));

      this.friendsList$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        if (data.FriendState && data.FriendRequestState) {
          this.allFriendsAmount = data.FriendState?.totalElements;
          this.requestFriendsAmount = data.FriendRequestState?.totalElements;
        }
      });
    }
  }

  onInput(input): void {
    this.searchTerm$.next(input.value);
  }

  onActivate(outlet): void {
    this.componentRef = outlet;
  }

  searchForFriends(searchText: string): void {
    if (this.componentRef instanceof RecommendedFriendsComponent) {
      this.componentRef.findUserByName(searchText);
    }
    if (this.componentRef instanceof AllFriendsComponent) {
      this.componentRef.findFriendByName(searchText);
    }
  }

  hideInputField(): void {
    this.hideInput = this.componentRef instanceof FriendRequestsComponent;
  }

  initUser(): void {
    this.localStorageService.userIdBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((userId: number) => (this.userId = userId));
  }

  private bindLang(lang: string): void {
    this.translate.setDefaultLang(lang);
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageSubject.pipe(takeUntil(this.destroy$)).subscribe((lang: string) => {
      this.bindLang(lang);
    });
  }
}
