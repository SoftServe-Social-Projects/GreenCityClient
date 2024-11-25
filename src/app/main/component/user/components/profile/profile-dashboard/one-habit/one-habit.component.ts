import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { take, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HabitService } from '@global-service/habit/habit.service';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { HabitMark } from '@global-user/components/habit/models/HabitMark.enum';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HabitAssignInterface } from '@global-user/components/habit/models/interfaces/habit-assign.interface';
import { FriendProfilePicturesArrayModel } from '@global-user/models/friend.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FriendsListPopUpComponent } from '@global-user/components/shared/components/friends-list-pop-up/friends-list-pop-up.component';
import { habitImages } from 'src/app/main/image-pathes/habits-images';

@Component({
  selector: 'app-one-habit',
  templateUrl: './one-habit.component.html',
  styleUrls: ['./one-habit.component.scss']
})
export class OneHabitComponent implements OnInit, OnDestroy {
  @Input() habit: HabitAssignInterface;
  currentDate: string;
  showPhoto: boolean;
  daysCounter: number;
  habitMark: string;
  isRequest = false;
  friends: FriendProfilePicturesArrayModel[] = [];
  numberOfFriendsToDisplay = 3;
  lengthOfFriendsNamesList = 15;
  calendarGreen = habitImages.calendarGreen;
  man = habitImages.man;

  private destroy$ = new Subject<void>();
  private descriptionType = {
    acquired: () => {
      this.setHabitValue(false);
      this.habitMark = HabitMark.ACQUIRED;
    },
    done: () => {
      this.setHabitValue(false);
      this.habitMark = HabitMark.DONE;
    },
    undone: () => {
      this.setHabitValue(true);
      this.habitMark = HabitMark.UNDONE;
    }
  };

  @Output() nowAcquiredHabit = new EventEmitter();

  constructor(
    private habitAssignService: HabitAssignService,
    public datePipe: DatePipe,
    public router: Router,
    public habitService: HabitService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.currentDate = this.datePipe.transform(new Date(), 'yyy-MM-dd');
    this.buildHabitDescription();
    this.getUsersFriendTrakingSameHabit();
  }

  goToHabitProfile(): void {
    const userId = localStorage.getItem('userId');
    this.router.navigate([`profile/${userId}/allhabits/edithabit/${this.habit.id}`]);
  }

  buildHabitDescription(): void {
    const isDone = this.habit.habitStatusCalendarDtoList.some((item) => item.enrollDate === this.currentDate);
    if (this.habit.status === HabitStatus.ACQUIRED) {
      this.descriptionType.acquired();
    } else if (this.habit.status === HabitStatus.INPROGRESS) {
      if (isDone) {
        this.descriptionType.done();
      } else {
        this.descriptionType.undone();
      }
    }
  }

  setGreenCircleInCalendar(isSetCircle: boolean) {
    const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    const lastDayInMonth = this.datePipe.transform(lastDay, 'yyy-MM-dd');
    const dataFromDashBoard = this.habitAssignService.habitsFromDashBoard.find((item) => item.enrollDate === this.currentDate);
    if (dataFromDashBoard) {
      const habitAssign = dataFromDashBoard.habitAssigns.find((item) => item.habitAssignId === this.habit.id);
      if (habitAssign) {
        habitAssign.enrolled = isSetCircle;
      }
    } else {
      this.habitAssignService
        .getAssignHabitsByPeriod(this.currentDate, lastDayInMonth)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.habitAssignService.habitsFromDashBoard = res;
          this.habitAssignService.habitsFromDashBoard
            .find((item) => item.enrollDate === this.currentDate)
            .habitAssigns.find((item) => item.habitAssignId === this.habit.id).enrolled = isSetCircle;
        });
    }
  }

  enroll() {
    this.isRequest = true;
    this.habitAssignService
      .enrollByHabit(this.habit.id, this.currentDate)
      .pipe(take(1))
      .subscribe((response) => {
        this.setGreenCircleInCalendar(true);
        if (response.status === HabitStatus.ACQUIRED) {
          this.descriptionType.acquired();
          this.nowAcquiredHabit.emit(response);
        } else {
          this.habit.habitStatusCalendarDtoList = response.habitStatusCalendarDtoList;
          this.habit.workingDays = response.workingDays;
          this.habit.habitStreak = response.habitStreak;
          this.buildHabitDescription();
          this.isRequest = false;
        }
      });
  }

  unenroll() {
    this.isRequest = true;
    this.habitAssignService
      .unenrollByHabit(this.habit.id, this.currentDate)
      .pipe(take(1))
      .subscribe((response) => {
        this.setGreenCircleInCalendar(false);
        this.habit.habitStatusCalendarDtoList = response.habitStatusCalendarDtoList;
        this.habit.workingDays = response.workingDays;
        this.habit.habitStreak = response.habitStreak;
        this.buildHabitDescription();
        this.isRequest = false;
      });
  }

  getDayName(): string {
    return this.habit.habitStreak === 1 ? 'user.habit.one-habit.good-day' : 'user.habit.one-habit.good-days';
  }

  private setHabitValue(check: boolean): void {
    this.daysCounter = this.habit.workingDays;
    this.showPhoto = check;
  }

  getUsersFriendTrakingSameHabit(): void {
    this.habitService
      .getFriendsTrakingSameHabitByHabitAssignId(this.habit.id)
      .pipe(take(1))
      .subscribe((resp) => (this.friends = resp));
  }

  getTooltipText(): string {
    if (this.friends.length < this.lengthOfFriendsNamesList) {
      return this.friends.map((friend) => friend.name).join('\n');
    } else {
      let friendsNames = '';
      for (let i = 0; i < this.lengthOfFriendsNamesList; i++) {
        friendsNames += this.friends[i].name + '\n';
      }
      friendsNames += '...';
      return friendsNames;
    }
  }

  onDialogOpen() {
    const dialogRef: MatDialogRef<FriendsListPopUpComponent> = this.dialog.open(FriendsListPopUpComponent, {
      data: {
        friends: this.friends,
        habitId: this.habit.id
      },
      width: '400px',
      height: '400px',
      hasBackdrop: true
    });

    dialogRef.backdropClick().subscribe(() => {
      dialogRef.close();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
