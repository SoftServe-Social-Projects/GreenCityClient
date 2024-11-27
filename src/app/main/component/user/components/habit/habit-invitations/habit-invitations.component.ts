import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-habit-invitations',
  templateUrl: './habit-invitations.component.html',
  styleUrls: ['./habit-invitations.component.scss']
})
export class HabitInvitationsComponent implements OnInit {
  requests = [];
  scroll = false;
  readonly absent = 'assets/img/noNews.svg';
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly store: Store,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.bindLang(this.localStorageService.getCurrentLanguage());
    this.subscribeToLangChange();
    console.log('init');
    this.getInvitations();
  }

  getInvitations() {}

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
}
