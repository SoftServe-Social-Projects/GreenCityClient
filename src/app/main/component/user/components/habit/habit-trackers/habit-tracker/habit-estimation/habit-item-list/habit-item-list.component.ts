import { Component, Input, OnInit } from '@angular/core';
import { HabitDto } from 'src/app/main/model/habit/HabitDto';
import { HabitStatisticsDto } from 'src/app/main/model/habit/HabitStatisticsDto';
import { HabitStatisticService } from 'src/app/main/service/habit-statistic/habit-statistic.service';
import { filter, map, tap } from 'rxjs/operators';
import { Photo } from 'src/app/main/model/photo/photo';
import { HabitItem } from '../habit-item/HabitItem';

@Component({
  selector: 'app-habit-item-list',
  templateUrl: './habit-item-list.component.html',
  styleUrls: ['./habit-item-list.component.scss']
})
export class HabitItemListComponent implements OnInit {
  habitItems: HabitItem[] = [];
  @Input() habitDto: HabitDto;
  @Input() habitStatistic: HabitStatisticsDto;
  currentNumber = 0;
  isExpanded: boolean;

  constructor(private habitStatisticService: HabitStatisticService) {}

  ngOnInit(): void {
    this.initHabitItems();

    this.habitStatisticService.habitStatistics
      .pipe(
        map((hab) => hab.find((item) => item.id === this.habitDto.id)),
        filter((hab) => hab !== undefined),
        tap((hab) => hab.habitStatistics.forEach((hs) => (hs.createdOn = new Date(hs.createdOn))))
      )
      .subscribe((data: HabitDto) => {
        const stat = this.habitStatisticService.getHabitStatisticsDto(this.habitStatistic, data);
        this.habitStatistic = stat;
        this.currentNumber = stat.amountOfItems;
        this.isExpanded = stat.amountOfItems > 8;
        this.drawCurrentNumberItems();
      });
  }

  setAllActive(elCount: number) {
    for (let i = 0; i < elCount; i++) {
      this.habitItems[i].setActive();
    }
  }

  drawCurrentNumberItems() {
    for (let i = 0; i < this.habitItems.length; i++) {
      if (i < this.currentNumber) {
        this.habitItems[i].setActive();
      } else {
        this.habitItems[i].setNonActive();
      }
    }
  }

  update(habitItem: HabitItem) {
    const stat: HabitStatisticsDto = new HabitStatisticsDto(
      this.habitStatistic.id,
      this.habitStatistic.habitRate,
      this.habitStatistic.createdOn,
      habitItem.numb === this.habitStatistic.amountOfItems ? 0 : habitItem.numb,
      this.habitDto.id
    );

    if (this.habitStatistic.id === null) {
      this.create(stat);
    } else {
      this.habitStatisticService.updateHabitStatistic(stat);
    }
  }

  create(habitStatistic: HabitStatisticsDto) {
    this.habitStatisticService.createHabitStatistic(habitStatistic);
  }

  initHabitItems() {
    for (let i = 0; i < 16; i++) {
      this.habitItems.push(new HabitItem(i + 1, this.getIcon(), false));
    }
  }

  collapse() {
    if (this.currentNumber > 8) {
      this.update(this.habitItems[7]);
    }
    this.isExpanded = false;
  }

  expand() {
    this.isExpanded = true;
  }

  getCollapsed(): HabitItem[] {
    const collapsed: HabitItem[] = [];

    for (let i = 0; i < 8; i++) {
      collapsed.push(this.habitItems[i]);
    }

    return collapsed;
  }

  getExpanded(): HabitItem[] {
    const collapsed: HabitItem[] = [];

    for (let i = 8; i < this.habitItems.length; i++) {
      collapsed.push(this.habitItems[i]);
    }

    return collapsed;
  }

  getIcon(): Photo {
    return { name: `assets/img/icon/${this.habitDto.habitDictionary.image}.png` };
  }
}
