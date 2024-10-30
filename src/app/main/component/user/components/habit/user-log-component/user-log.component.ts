import { Component, OnInit } from '@angular/core';
import { HabitStatisticService } from 'src/app/main/service/habit-statistic/habit-statistic.service';

@Component({
  selector: 'app-user-log',
  templateUrl: './user-log.component.html',
  styleUrls: ['./user-log.component.scss']
})
export class UserLogComponent implements OnInit {
  constructor(private habitStatisticService: HabitStatisticService) {}

  readonly package = 'assets/img/icon/package_statistic.png';
  readonly coffee = 'assets/img/icon/coffee_statistic.png';

  hasStatistic = false;

  $userLog: any;
  $creationDate: Date;
  $amountUnTakenItemsPerMonthBag: number;
  $amountUnTakenItemsPerMonthCap: number;
  $differenceUnTakenItemsWithPreviousDayBag: number;
  $differenceUnTakenItemsWithPreviousDayCap: number;

  ngOnInit() {
    this.retrieveUserLog();
    this.habitStatisticService.habitStatistics.subscribe(
      () => {
        this.retrieveUserLog();
      },
      (error) => {
        this.hasStatistic = false;
        console.log('Error!', error);
      }
    );
  }

  nowDate() {
    const date: Date = new Date();
    return date.getDate() + ' ' + date.toLocaleString('default', { month: 'long' });
  }

  countDay() {
    const date: Date = new Date();
    return date.getDate();
  }

  checkCountForMonth(countHabit: number) {
    return Math.abs(countHabit);
  }

  countDayInCycle() {
    const dateNow = new Date();
    const dateFromDateBase = new Date(this.$creationDate);
    const DifferenceInTime = dateNow.getTime() - dateFromDateBase.getTime();
    const DifferenceInDays = DifferenceInTime / (1000 * 3600 * 24);
    return Math.floor(DifferenceInDays) > 1 ? Math.floor(DifferenceInDays) : 1;
  }

  private retrieveUserLog() {
    this.$userLog = this.habitStatisticService.getUserLog().subscribe({
      next: (data) => {
        this.hasStatistic = true;
        this.$creationDate = data.creationDate;
        this.initializeNotTakenItemsStatistics(data);
      },
      error: (error) => {
        this.hasStatistic = false;
        console.log('Error!', error);
      }
    });
  }

  private initializeNotTakenItemsStatistics(data: any) {
    const cap = data.allItemsPerMonth.filter((obj) => obj.habitItemName === 'cap');
    const bag = data.allItemsPerMonth.filter((obj) => obj.habitItemName === 'bag');
    const diffBag = data.differenceUnTakenItemsWithPreviousDay.filter((obj) => obj.habitItemName === 'bag');
    const diffCap = data.differenceUnTakenItemsWithPreviousDay.filter((obj) => obj.habitItemName === 'cap');
    if (cap.length !== 0) {
      this.$amountUnTakenItemsPerMonthCap = cap[0].habitItemAmount;
    } else {
      this.$amountUnTakenItemsPerMonthCap = 0;
    }
    if (bag.length !== 0) {
      this.$amountUnTakenItemsPerMonthBag = bag[0].habitItemAmount;
    } else {
      this.$amountUnTakenItemsPerMonthBag = 0;
    }
    if (diffCap.length !== 0) {
      this.$differenceUnTakenItemsWithPreviousDayCap = diffCap[0].habitItemAmount;
    } else {
      this.$differenceUnTakenItemsWithPreviousDayCap = 0;
    }
    if (diffBag.length !== 0) {
      this.$differenceUnTakenItemsWithPreviousDayBag = diffBag[0].habitItemAmount;
    } else {
      this.$differenceUnTakenItemsWithPreviousDayBag = 0;
    }
  }
}
