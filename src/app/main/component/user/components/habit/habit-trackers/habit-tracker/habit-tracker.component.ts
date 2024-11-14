import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HabitDto } from 'src/app/main/model/habit/HabitDto';
import { HabitStatisticService } from 'src/app/main/service/habit-statistic/habit-statistic.service';
import { filter, map } from 'rxjs/operators';
import { HabitStatisticsDto } from 'src/app/main/model/habit/HabitStatisticsDto';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Component({
  selector: 'app-habit-tracker',
  templateUrl: './habit-tracker.component.html',
  styleUrls: ['./habit-tracker.component.scss']
})
export class HabitTrackerComponent implements OnInit {
  @Input() habit: HabitDto;
  @Input() chartId: string;
  @Input() usersHabitId: number;
  $habit: Observable<HabitDto> = of<HabitDto>();
  currentStatistic: HabitStatisticsDto;
  habitStatistic: HabitStatisticsDto[];
  chartRedrawTrigger: boolean;
  curDayNumber: number;

  constructor(
    private service: HabitStatisticService,
    public translation: LanguageService
  ) {}

  ngOnInit() {
    this.initCurrentStatistic();
    this.$habit = this.service.habitStatistics.pipe(
      map((habit) => habit.find((item) => item.id === this.habit.id)),
      filter((habit) => habit !== undefined)
    );

    this.$habit.subscribe((data: HabitDto) => {
      this.habit.createDate = new Date(this.habit.createDate);
      this.chartRedrawTrigger = !this.chartRedrawTrigger;
      this.habitStatistic = data.habitStatistics;
    });

    this.curDayNumber = this.countCurrentStatisticDayNumber();
  }

  initCurrentStatistic() {
    const today: Date = new Date();
    if (this.habit.habitStatistics !== undefined) {
      this.currentStatistic = this.habit.habitStatistics.filter((stat) => this.compareDates(today, stat.createdOn))[0];
    }
  }

  compareDates(a: Date, b: Date): boolean {
    return (
      new Date(a).getFullYear() === new Date(b).getFullYear() &&
      new Date(a).getMonth() === new Date(b).getMonth() &&
      new Date(a).getDate() === new Date(b).getDate()
    );
  }

  countCurrentStatisticDayNumber() {
    try {
      for (let i = 0; i < this.habitStatistic.length; i++) {
        if (this.compareDates(this.habitStatistic[i].createdOn, this.currentStatistic.createdOn)) {
          return i + 1;
        }
      }
    } catch (e) {
      console.log('An error occured');
    }
  }
}
