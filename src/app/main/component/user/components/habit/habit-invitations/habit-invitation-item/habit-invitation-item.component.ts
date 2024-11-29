import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HabitService } from '@global-service/habit/habit.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { UserOnlineStatusService } from '@global-user/services/user-online-status.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-habit-invitation-item',
  templateUrl: './habit-invitation-item.component.html',
  styleUrls: ['./habit-invitation-item.component.scss']
})
export class HabitInvitationItemComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  currentLang: string;
  friend = null;
  habit = null;
  userId: number;
  @Input({ required: true }) invitationDetails;

  constructor(
    private readonly userOnlineStatusService: UserOnlineStatusService,
    private readonly localStorageService: LocalStorageService,
    private readonly store: Store,
    private readonly translate: TranslateService,
    private readonly habitService: HabitService
  ) {}

  ngOnInit(): void {
    this.bindLang(this.localStorageService.getCurrentLanguage());
    this.subscribeToLangChange();
    this.localStorageService.userIdBehaviourSubject.subscribe((userId) => (this.userId = userId));
    this.friend = this.invitationDetails.inviter;
    this.habit = this.invitationDetails.habit;
    console.log(this.invitationDetails);
  }

  checkIsOnline(friendId: number): boolean {
    return this.userOnlineStatusService.checkIsOnline(friendId);
  }

  private bindLang(lang: string): void {
    if (lang && this.translate.currentLang !== lang) {
      this.translate.setDefaultLang(lang);
      this.translate.use(lang);
      this.currentLang = lang;
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
