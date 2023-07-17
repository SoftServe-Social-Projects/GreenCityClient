import { Component, OnDestroy, OnInit } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FriendArrayModel, FriendModel } from '@global-user/models/friend.model';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { Subject } from 'rxjs';
import { searchIcon } from 'src/app/main/image-pathes/places-icons';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-habit-invite-friends-pop-up',
  templateUrl: './habit-invite-friends-pop-up.component.html',
  styleUrls: ['./habit-invite-friends-pop-up.component.scss']
})
export class HabitInviteFriendsPopUpComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject<boolean>();
  userId: number;
  friends: FriendModel[];
  inputFriends: FriendModel[];
  userValue: string;
  allAdd = false;
  addedFriends: FriendModel[] = [];
  searchIcon = searchIcon;

  constructor(private userFriendsService: UserFriendsService, private localStorageService: LocalStorageService) {}

  ngOnInit() {
    this.getUserId();
    this.getFriends();
  }

  private getUserId() {
    this.userId = this.localStorageService.getUserId();
  }

  getFriends() {
    this.userFriendsService
      .getAllFriends(this.userId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: FriendArrayModel) => {
        this.friends = data.page;
      });
  }

  updateAllAdd() {
    this.allAdd = this.friends !== null && this.friends.every((friend) => friend.added);
  }

  someAdd(): boolean {
    if (this.friends) {
      return this.friends.filter((friend) => friend.added).length > 0 && !this.allAdd;
    }
  }

  setAll(added: boolean) {
    this.allAdd = added;
    if (this.friends) {
      return this.friends.map((friend) => (friend.added = added));
    }
  }

  public onInput(input): void {
    this.userValue = input.target.value;
    this.inputFriends = this.friends.filter((friend) => friend.name.includes(this.userValue));
  }

  setAddedFriends() {
    this.friends.map((friend) => {
      const isAdded = this.userFriendsService.addedFriends.some((addedFriend) => addedFriend.id === friend.id);
      if (friend.added && !isAdded) {
        this.userFriendsService.addedFriendsToHabit(friend);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
