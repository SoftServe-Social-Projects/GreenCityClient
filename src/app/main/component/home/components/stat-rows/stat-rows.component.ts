import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/main/service/user/user.service';

@Component({
  selector: 'app-stat-rows',
  templateUrl: './stat-rows.component.html',
  styleUrls: ['./stat-rows.component.scss']
})
export class StatRowsComponent implements OnInit {
  homePageHabitStats: Array<any>;

  constructor(private userService: UserService) {}

  ngOnInit() {
    /* TODO: homePageHabitStats should be populated entirely by server-side returned data
    instead of manual declaration of habit statistics.*/
    this.userService.getTodayStatisticsForAllHabitItems().subscribe((habitDtoArray) => {
      function getStatisticForHabitItemName(habitItemName: string) {
        const habitItemDto = habitDtoArray.find((it) => it.habitItem === habitItemName);
        if (habitItemDto === undefined) {
          return 0;
        } else {
          return habitItemDto.notTakenItems;
        }
      }
      this.homePageHabitStats = [
        {
          action: 'Не взяли',
          caption: 'пакетів',
          count: getStatisticForHabitItemName('bags'),
          question: 'А скільки пакетів ти не взяв сьогодні ти?',
          iconPath: 'assets/img/habit-pic-bag.png',
          locationText: 'тут можна купити еко-сумочки і торбинки'
        },
        {
          action: 'Не викинули',
          caption: 'склянок',
          count: getStatisticForHabitItemName('caps'),
          question: 'А скільки склянок не викинув сьогодні ти?',
          iconPath: 'assets/img/habit-pic-cup.png',
          locationText: 'заклади, які роблять знижку на напій в своє горнятко'
        }
      ];
    });
  }
}
