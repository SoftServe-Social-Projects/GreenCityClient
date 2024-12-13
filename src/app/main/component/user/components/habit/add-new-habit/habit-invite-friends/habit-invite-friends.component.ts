import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FriendProfilePicturesArrayModel } from '@global-user/models/friend.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HabitService } from '@global-service/habit/habit.service';
import { HabitInviteFriendsPopUpComponent } from './habit-invite-friends-pop-up/habit-invite-friends-pop-up.component';
import { FriendsListPopUpComponent } from '@global-user/components/shared/components/friends-list-pop-up/friends-list-pop-up.component';

@Component({
  selector: 'app-habit-invite-friends',
  templateUrl: './habit-invite-friends.component.html',
  styleUrls: ['./habit-invite-friends.component.scss']
})
export class HabitInviteFriendsComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<void> = new Subject<void>();
  friends: FriendProfilePicturesArrayModel[] = [];

  @Input() habitId: number;
  @Input() habitAssignId: number;

  constructor(
    private readonly habitService: HabitService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchFriendsTrackingHabit();
  }

  fetchFriendsTrackingHabit(): void {
    if (!this.habitAssignId) {
      return;
    }
    this.habitService
      .getFriendsTrakingSameHabitByHabitAssignId(this.habitAssignId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((friends) => {
        this.friends = friends;
      });
  }

  openInviteFriendsDialog(): void {
    const dialogRef = this.dialog.open(HabitInviteFriendsPopUpComponent, {
      hasBackdrop: true,
      data: {
        habitId: this.habitId,
        friends: [...this.friends],
       
      }
    });

    dialogRef.backdropClick().subscribe(() => dialogRef.close());
  }

  openFriendsPopup(): void {
    const dialogRef = this.dialog.open(FriendsListPopUpComponent, {
      data: {
        habitId: this.habitAssignId,
        friends: this.friends
      },
      width: '400px',
      height: '500px',
      hasBackdrop: true
    });

    dialogRef.backdropClick().subscribe(() => dialogRef.close());
  }

  calculateDotsPosition(friendCount: number): string {
    const positions = ['0%', '20%', '40%', '60%', '80%'];
    const maxFriends = Math.min(friendCount, 5);
    return `calc(${positions[maxFriends - 1]} + 60px)`;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
