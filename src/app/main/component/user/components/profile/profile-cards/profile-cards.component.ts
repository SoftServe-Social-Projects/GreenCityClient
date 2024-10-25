import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, takeUntil } from 'rxjs/operators';
import { Subject, of, timer } from 'rxjs';
import { FactOfTheDay } from '@global-user/models/factOfTheDay';
import { ProfileService } from '../profile-service/profile.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ProfileStatistics } from '@global-user/models/profile-statistiscs';

@Component({
  selector: 'app-profile-cards',
  templateUrl: './profile-cards.component.html',
  styleUrls: ['./profile-cards.component.scss']
})
export class ProfileCardsComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject<void>();
  factKey = 'factOfTheDay';
  habitFactKey = 'habitFactOfTheDay';
  factOfTheDay: FactOfTheDay;
  habitFactOfTheDay: FactOfTheDay;
  error: string;

  constructor(
    private readonly profileService: ProfileService,
    private readonly localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadFactsFromLocalStorage();
      this.checkAndUpdateFacts();
    });

    timer(0, this.localStorageService.ONE_DAY_IN_MILLIS)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkAndUpdateFacts();
      });
  }

  loadFactsFromLocalStorage(): void {
    this.factOfTheDay = this.localStorageService.getFactFromLocalStorage(this.factKey);
    this.habitFactOfTheDay = this.localStorageService.getFactFromLocalStorage(this.habitFactKey);
  }

  checkAndUpdateFacts(): void {
    this.profileService
      .getUserProfileStatistics()
      .pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      )
      .subscribe((profileStats: ProfileStatistics) => {
        const lastFetchTime = localStorage.getItem('lastFetchTime');
        const currentTime = Date.now();
        const oneDay = this.localStorageService.ONE_DAY_IN_MILLIS;

        if (this.isMoreThanOneDayPassed(lastFetchTime, currentTime, oneDay)) {
          this.clearFacts();
          this.updateFacts(currentTime, profileStats?.amountHabitsInProgress > 0);
        }

        if (profileStats?.amountHabitsInProgress > 0) {
          if (!this.habitFactOfTheDay) {
            this.fetchAndSaveHabitFact(currentTime);
          }
        } else {
          this.clearFacts(true);
        }
      });
  }

  updateFacts(currentTime: number, hasHabits: boolean): void {
    this.fetchAndSaveRandomFact(currentTime);

    if (hasHabits) {
      this.fetchAndSaveHabitFact(currentTime);
    }
  }

  private fetchAndSaveHabitFact(currentTime: number): void {
    this.profileService
      .getFactsOfTheDayByTags()
      .pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      )
      .subscribe((fact: FactOfTheDay | null) => {
        if (fact) {
          this.habitFactOfTheDay = fact;
          this.localStorageService.saveFactToLocalStorage(fact, currentTime, this.habitFactKey);
        }
      });
  }

  private fetchAndSaveRandomFact(currentTime: number): void {
    this.profileService
      .getRandomFactOfTheDay()
      .pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      )
      .subscribe((fact: FactOfTheDay | null) => {
        if (fact) {
          this.factOfTheDay = fact;
          this.localStorageService.saveFactToLocalStorage(fact, currentTime, this.factKey);
        }
      });
  }

  isMoreThanOneDayPassed(lastHabitFetchTime: string | null, currentTime: number, oneDay: number): boolean {
    return !lastHabitFetchTime || currentTime - Number(lastHabitFetchTime) > oneDay;
  }

  clearFacts(isHabit: boolean = false): void {
    this.habitFactOfTheDay = null;
    this.localStorageService.clearFromLocalStorage(this.habitFactKey, isHabit);

    !isHabit && this.localStorageService.clearFromLocalStorage(this.factKey);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
