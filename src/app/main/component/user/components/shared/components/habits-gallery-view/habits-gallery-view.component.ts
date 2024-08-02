import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { take } from 'rxjs/operators';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { HabitInterface } from '@global-user/components/habit/models/interfaces/habit.interface';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HabitAssignPropertiesDto } from '@global-models/goal/HabitAssignCustomPropertiesDto';
import { habitImages, starIcons } from 'src/app/main/image-pathes/habits-images';

@Component({
  selector: 'app-habits-gallery-view',
  templateUrl: './habits-gallery-view.component.html',
  styleUrls: ['./habits-gallery-view.component.scss']
})
export class HabitsGalleryViewComponent implements OnInit {
  @Input() habit: HabitInterface;

  whiteStar = starIcons.whiteStar;
  greenStar = starIcons.greenStar;
  calendarGreen = habitImages.calendarGreen;
  man = habitImages.man;
  stars = [this.whiteStar, this.whiteStar, this.whiteStar];
  star: number;

  private userId: number;

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

  getStars(complexity: number) {
    for (this.star = 0; this.star < complexity; this.star++) {
      this.stars[this.star] = this.greenStar;
    }
  }

  goHabitMore(): void {
    const link = `/profile/${this.userId}/allhabits/`;
    this.habit.assignId
      ? this.router.navigate([`${link}edithabit`, this.habit.assignId], { relativeTo: this.route })
      : this.router.navigate([`${link}addhabit`, this.habit.id], { relativeTo: this.route });
  }

  addHabit() {
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
