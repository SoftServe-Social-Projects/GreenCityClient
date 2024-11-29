import { Component, OnDestroy, OnInit } from '@angular/core';
import { HabitService } from '@global-service/habit/habit.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-habit-invitations',
  templateUrl: './habit-invitations.component.html',
  styleUrls: ['./habit-invitations.component.scss']
})
export class HabitInvitationsComponent implements OnInit, OnDestroy {
  requests = [];
  scroll = false;
  readonly absent = 'assets/img/noNews.svg';
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  userId = 1;

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly store: Store,
    private readonly translate: TranslateService,
    private readonly habitService: HabitService
  ) {}

  ngOnInit(): void {
    this.bindLang(this.localStorageService.getCurrentLanguage());
    this.subscribeToLangChange();
    this.localStorageService.userIdBehaviourSubject.subscribe((userId) => (this.userId = userId));
    console.log('init');
    this.getInvitations();
  }

  getInvitations() {
    this.habitService
      .getHabitInvitations(0, 10)
      .pipe()
      .subscribe({
        next: (res) => {
          this.requests = res.page;
          console.log(this.requests);
        },
        error: (err) => {
          console.error('Error fetching habit invitations:', err);
        }
      });
  }

  onScroll() {}

  private bindLang(lang: string): void {
    if (lang && this.translate.currentLang !== lang) {
      this.translate.setDefaultLang(lang);
      this.translate.use(lang);
    }
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe((lang: string) => {
      this.bindLang(lang);
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
