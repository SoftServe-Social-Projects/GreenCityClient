import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FriendArrayModel, FriendModel } from '@global-user/models/friend.model';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { Subject } from 'rxjs';
import { searchIcon } from 'src/app/main/image-pathes/places-icons';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { HabitService } from '@global-service/habit/habit.service';

@Component({
  selector: 'app-habit-invite-friends-pop-up',
  templateUrl: './habit-invite-friends-pop-up.component.html',
  styleUrls: ['./habit-invite-friends-pop-up.component.scss']
})
export class HabitInviteFriendsPopUpComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject<boolean>();
  userId: number;
  friends: FriendModel[] = [];
  selectedFriends: number[] = [];
  inputFriends: FriendModel[] = [];
  inputValue = '';
  allAdd = false;
  searchIcon = searchIcon;
  habitId: number;
  closeButton = './assets/img/profile/icons/cancel.svg';

  constructor(
    private readonly userFriendsService: UserFriendsService,
    private readonly localStorageService: LocalStorageService,
    private readonly habitService: HabitService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly snackBar: MatSnackBarComponent,
    private readonly dialogRef: MatDialogRef<HabitInviteFriendsPopUpComponent>
  ) {}

  get isAnyFriendSelected(): boolean {
    return this.friends?.some((friend) => friend.added) ?? false;
  }

  ngOnInit() {
    this.habitId = this.data.habitId;
    this.getUserId();
    this.getFriends();
  }

  private getUserId() {
    this.userId = this.localStorageService.getUserId();
  }

  getFriends() {
    this.habitService
      .getFriendsWithInvitations(this.habitId, 0, 10)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: FriendArrayModel) => {
        this.friends = data.page.map((friend) => ({
          ...friend,
          added: friend.hasAcceptedInvitation
        }));
        this.inputFriends = [...this.friends];
      });
  }

  onFriendCheckboxChange(friendId: number, isChecked: boolean) {
    const friend = this.friends.find((f) => f.id === friendId);
    if (friend && !friend.hasAcceptedInvitation && !friend.hasInvitation) {
      friend.added = isChecked;
      this.toggleFriendSelection(friendId, isChecked);
      this.updateAllAdd();
    }
  }

  toggleFriendSelection(friendId: number, isChecked: boolean) {
    if (isChecked) {
      if (!this.selectedFriends.includes(friendId)) {
        this.selectedFriends.push(friendId);
      }
    } else {
      this.selectedFriends = this.selectedFriends.filter((id) => id !== friendId);
    }
  }

  inviteFriends(event: Event) {
    event.preventDefault();
    if (this.habitId && this.selectedFriends.length) {
      this.userFriendsService.inviteFriendsToHabit(this.habitId, this.selectedFriends).subscribe({
        next: () => {
          this.snackBar.openSnackBar('successInviteFriend');
          this.dialogRef.close();
        },
        error: (error) => {
          this.snackBar.openSnackBar('snack-bar.error.default');
        }
      });
    }
  }

  setFriendDisable(friendId: number): boolean {
    const friend = this.friends.find((f) => f.id === friendId);
    return friend ? friend.hasAcceptedInvitation || friend.hasInvitation : false;
  }

  setAllFriendsDisable(): boolean {
    return this.friends.every((friend) => friend.hasInvitation);
  }

  updateAllAdd() {
    this.allAdd = this.friends.length > 0 && this.friends.every((friend) => friend.added);
  }

  someAdd(): boolean {
    return this.friends.some((friend) => friend.added) && !this.allAdd;
  }

  setAll(added: boolean) {
    this.allAdd = added;
    this.friends.forEach((friend) => {
      if (!this.isFriendAddedAlready(friend.id) && !friend.hasInvitation) {
        friend.added = added;
        this.toggleFriendSelection(friend.id, added);
      }
    });
  }

  isFriendAddedAlready(friendId: number): boolean {
    return this.userFriendsService.addedFriends?.some((addedFriend) => addedFriend.id === friendId);
  }

  filterFriendsByInput(input: string): FriendModel[] {
    return this.friends.filter((friend) => friend.name.toLowerCase().includes(input) || friend.email.toLowerCase().includes(input));
  }

  onInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    this.inputValue = input;
    this.allAdd = false;
    this.inputFriends = input ? this.filterFriendsByInput(input) : [...this.friends];
  }

  onClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
