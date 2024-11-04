import { AvailableHabitDto } from '@global-models/habit/AvailableHabitDto';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { HabitDto } from '../../model/habit/HabitDto';
import { NewHabitDto } from '../../model/habit/NewHabitDto';
import { habitLink, habitStatisticLink, userLink } from '../../links';

import { LocalStorageService } from '../localstorage/local-storage.service';
import { HabitStatisticsDto } from '../../model/habit/HabitStatisticsDto';
import { HabitStatisticLogDto } from '@global-models/habit/HabitStatisticLogDto';
import { OnLogout } from '../OnLogout';

@Injectable({
  providedIn: 'root'
})
export class HabitStatisticService implements OnLogout {
  private userId: number;
  private $habitStatistics = new BehaviorSubject<HabitDto[]>([]);
  readonly habitStatistics = this.$habitStatistics.asObservable();
  private $availableHabits = new BehaviorSubject<AvailableHabitDto[]>([]);
  readonly availableHabits = this.$availableHabits.asObservable();
  private dataStore: {
    habitStatistics: HabitDto[];
    availableHabits: AvailableHabitDto[];
    newHabits: NewHabitDto[];
  } = { habitStatistics: [], availableHabits: [], newHabits: [] };

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {
    localStorageService.userIdBehaviourSubject.subscribe((userId) => (this.userId = userId));
  }

  loadHabitStatistics(language: string) {
    this.http.get<HabitDto[]>(`${userLink}/${this.userId}/habits?language=${language}`).subscribe({
      next: (data) => {
        this.dataStore.habitStatistics = data;
        this.$habitStatistics.next({ ...this.dataStore }.habitStatistics);
      },
      error: () => console.log('Can not load habit statistic.')
    });
  }

  loadAvailableHabits(language: string) {
    this.http.get<AvailableHabitDto[]>(`${userLink}/${this.userId}/habit-dictionary/available?language=${language}`).subscribe({
      next: (data) => {
        this.dataStore.availableHabits = data;
        this.$availableHabits.next({ ...this.dataStore }.availableHabits);
      },
      error: () => console.log('Can not load available habits.')
    });
  }

  setNewHabitsState(args) {
    if (this.dataStore.newHabits.find((nh) => nh.habitDictionaryId === args.id)) {
      this.dataStore.newHabits = this.dataStore.newHabits.filter((nh) => nh.habitDictionaryId !== args.id);
    } else {
      this.dataStore.newHabits = [...this.dataStore.newHabits, new NewHabitDto(args.id)];
    }
  }

  createHabits(language: string) {
    this.http.post<any>(`${userLink}/${this.userId}/habit?language=${language}`, this.dataStore.newHabits).subscribe({
      next: () => {
        this.clearDataStore(language);
      },
      error: () => console.log('Can not assign new habit for this user')
    });
  }

  deleteHabit(habitId: number, language: string) {
    this.http.delete<any>(`${userLink}/${this.userId}/habit/${habitId}`).subscribe({
      next: () => {
        this.loadAvailableHabits(language);
        this.loadHabitStatistics(language);
      },
      error: () => console.log('Can not remove habit for this user')
    });
  }

  updateHabitStatistic(habitStatisticDto: HabitStatisticsDto) {
    this.http.patch<HabitStatisticsDto>(`${habitStatisticLink}${habitStatisticDto.id}`, habitStatisticDto).subscribe({
      next: (data) => {
        let index: number;

        this.dataStore.habitStatistics.forEach((item, i) => {
          index = item.habitStatistics.findIndex((stat) => stat.id === data.id);
          if (index !== -1) {
            this.dataStore.habitStatistics[i].habitStatistics[index] = new HabitStatisticsDto(
              data.id,
              data.habitRate,
              data.createdOn,
              data.amountOfItems,
              data.habitId
            );

            this.$habitStatistics.next({ ...this.dataStore }.habitStatistics);
          }
        });
      },
      error: () => console.log('Can not update habit statistic')
    });
  }

  createHabitStatistic(habitStatistics: HabitStatisticsDto) {
    const toSend: any = habitStatistics;
    toSend.createdOn = new Date().toISOString();
    this.http.post<HabitStatisticsDto>(`${habitStatisticLink}`, toSend).subscribe({
      next: (data) => {
        this.dataStore.habitStatistics.forEach((habit, habitIndex) => {
          if (habit.id === habitStatistics.habitId) {
            habit.habitStatistics.forEach((stat, statIndex) => {
              if (new Date(stat.createdOn).toLocaleDateString() === new Date(habitStatistics.createdOn).toLocaleDateString()) {
                this.dataStore.habitStatistics[habitIndex].habitStatistics[statIndex] = new HabitStatisticsDto(
                  data.id,
                  data.habitRate,
                  data.createdOn,
                  data.amountOfItems,
                  data.habitId
                );
                this.$habitStatistics.next({ ...this.dataStore }.habitStatistics);
              }
            });
          }
        });
      },
      error: () => console.log('Can not create habit statistic')
    });
  }

  getUserLog(): Observable<any> {
    return this.http.get<HabitStatisticLogDto>(userLink + this.userId + habitLink);
  }

  getNumberOfHabits(): number {
    return this.dataStore.habitStatistics.length;
  }

  clearDataStore(language: string): void {
    this.dataStore.newHabits = [];
    this.loadAvailableHabits(language);
    this.loadHabitStatistics(language);
  }

  getHabitStatisticsDto(hsDto: HabitStatisticsDto, habitDto: HabitDto): HabitStatisticsDto {
    let stat: HabitStatisticsDto;
    if (hsDto.id === null) {
      stat = habitDto.habitStatistics.find((el) => {
        const a = new Date(el.createdOn);
        const b = new Date(hsDto.createdOn);
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
      });
    } else {
      stat = habitDto.habitStatistics.find((el) => el.id === hsDto.id);
    }
    return stat;
  }

  onLogout(): void {
    this.dataStore.newHabits = [];
    this.dataStore.availableHabits = [];
    this.dataStore.habitStatistics = [];
    this.$habitStatistics.next({ ...this.dataStore }.habitStatistics);
    this.$availableHabits.next({ ...this.dataStore }.availableHabits);
  }
}
