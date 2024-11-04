import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { FriendsHabitPopupModel } from '@global-user/components/habit/models/interfaces/habit-assign.interface';
import { habitImages } from 'src/app/main/image-pathes/habits-images';

@Component({
  selector: 'app-friends-list-pop-up',
  templateUrl: './friends-list-pop-up.component.html',
  styleUrls: ['./friends-list-pop-up.component.scss']
})
export class FriendsListPopUpComponent implements OnInit {
  closeButton = './assets/img/profile/icons/cancel.svg';
  friends: FriendsHabitPopupModel[] = [];
  calendarGreen = habitImages.calendarGreen;

  constructor(
    public matDialogRef: MatDialogRef<FriendsListPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private habitAsignService: HabitAssignService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getFriendsHabitProgress();
  }

  getFriendsHabitProgress(): void {
    this.habitAsignService.getFriendsHabitProgress(this.data.habitId).subscribe((progress) => {
      this.data.friends.forEach((element) => {
        this.friends.push({
          ...element,
          habitProgress: progress.find((p) => p.userId === element.id)
        });
      });
    });
  }

  navigateToFriendsPage(friendId: number, friendsName: string): void {
    this.router.navigate(['/profile', this.data.habitId, 'friends', friendsName, friendId]);
    this.onClose();
  }

  onClose() {
    this.matDialogRef.close();
  }
}
