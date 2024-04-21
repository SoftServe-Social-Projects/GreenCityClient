import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { take } from 'rxjs/operators';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { HabitInterface } from '@global-user/components/habit/models/interfaces/habit.interface';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HabitAssignPropertiesDto } from '@global-models/goal/HabitAssignCustomPropertiesDto';

@Component({
  selector: 'app-habits-gallery-view',
  templateUrl: './habits-gallery-view.component.html',
  styleUrls: ['./habits-gallery-view.component.scss']
})
export class HabitsGalleryViewComponent implements OnInit {
  @Input() habit: HabitInterface;
  private userId: number;
  public whiteStar = 'assets/img/icon/star-2.png';
  public greenStar = 'assets/img/icon/star-1.png';
  public stars = [this.whiteStar, this.whiteStar, this.whiteStar];
  public star: number;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public snackBar: MatSnackBarComponent,
    public localStorageService: LocalStorageService,
    public habitAssignService: HabitAssignService
  ) {}

  ngOnInit() {
    this.getStars(this.habit.complexity);
    this.userId = this.localStorageService.getUserId();
  }

  public getStars(complexity: number) {
    for (this.star = 0; this.star < complexity; this.star++) {
      this.stars[this.star] = this.greenStar;
    }
  }

  public goHabitMore(): void {
    const link = `/profile/${this.userId}/allhabits/`;
    this.habit.assignId
      ? this.router.navigate([`${link}edithabit`, this.habit.assignId], { relativeTo: this.route })
      : this.router.navigate([`${link}addhabit`, this.habit.id], { relativeTo: this.route });

    const isUserCustomHabit = this.habit.usersIdWhoCreatedCustomHabit === this.userId;

    // if (isUserCustomHabit) {
    //   if (this.habit.habitAssignStatus) {
    //     // this.router.navigate([`${link}addhabit`, this.habit.assignId], { relativeTo: this.route });
    //     console.log('custom habit', { habit: this.habit, assignId: this.habit.assignId });
    //   } else {
    //     this.router.navigate([`${link}addhabit/${this.habit.id}/edit-habit`], { relativeTo: this.route });
    //   }
    // } else {
    //   console.log('habit assign id', this.habit.assignId);
    //   if (this.habit.isAssigned) {
    //     this.router.navigate([`${link}addhabit`, this.habit.assignId], { relativeTo: this.route });
    //   } else {
    //     this.router.navigate([`${link}addhabit`, this.habit.id], { relativeTo: this.route });
    //   }
    // }
  }

  public addHabit() {
    this.habit.isCustomHabit ? this.assignCustomHabit() : this.assignStandartHabit();
  }

  private assignStandartHabit() {
    this.habitAssignService
      .assignHabit(this.habit.id)
      .pipe(take(1))
      .subscribe(() => {
        this.afterHabitWasChanged();
      });
  }

  private assignCustomHabit() {
    const defailtItemsIds = [];
    const friendsIdsList = [];
    const habitAssignProperties: HabitAssignPropertiesDto = {
      defaultShoppingListItems: defailtItemsIds,
      duration: this.habit.defaultDuration
    };
    this.habitAssignService
      .assignCustomHabit(this.habit.id, friendsIdsList, habitAssignProperties)
      .pipe(take(1))
      .subscribe(() => {
        this.afterHabitWasChanged();
      });
  }

  private afterHabitWasChanged() {
    this.router.navigate(['profile', this.userId]);
    this.snackBar.openSnackBar('habitAdded');
  }
}
