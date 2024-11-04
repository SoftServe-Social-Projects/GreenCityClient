import { Injectable, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, forkJoin, map, Subscription } from 'rxjs';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Injectable({
  providedIn: 'root'
})
export class MetaService implements OnDestroy {
  private currentPageKey: string;
  private routeSubscription: Subscription;
  private readonly languageSubscription: Subscription;

  constructor(
    private readonly titleService: Title,
    private readonly metaService: Meta,
    private readonly translate: TranslateService,
    private readonly languageService: LanguageService,
    private readonly router: Router
  ) {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }

    this.languageSubscription = this.languageService.getCurrentLangObs().subscribe((lang) => {
      this.translate.use(lang === 'en' ? 'en' : 'ua');

      if (this.currentPageKey) {
        this.setMeta(this.currentPageKey);
      }
    });
  }

  resetMeta(): void {
    this.setMeta('default');
  }

  setMeta(pageKey: string, placeholdersData?: Record<string, any>): void {
    this.currentPageKey = pageKey;

    const title$ = this.translate.get(`meta.${pageKey}.title`);
    const description$ = this.translate.get(`meta.${pageKey}.description`);

    forkJoin([title$, description$]).subscribe(([translatedTitle, translatedDescription]) => {
      this.titleService.setTitle(this.replacePlaceholders(translatedTitle, placeholdersData));
      this.metaService.updateTag({ name: 'description', content: this.replacePlaceholders(translatedDescription, placeholdersData) });
    });
  }

  private replacePlaceholders(s: string, data?: Record<string, any>): string {
    return s.replace(/{{(.*?)}}/g, (match, key) => data[key] || match);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  unsubscribeAll(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  setMetaOnRouteChange(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    this.routeSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          const currentUrlTree = this.router.parseUrl(this.router.url);
          return currentUrlTree.root.children['primary']?.segments || [];
        })
      )
      .subscribe((segments) => {
        let metaKey: string | null = null;
        const path = segments.map((segment) => segment.path).join('/');

        metaKey = this.pathToMetaKey(path);

        if (metaKey) {
          this.setMeta(metaKey);
        } else {
          this.resetMeta();
        }
      });
  }

  private pathToMetaKey(path: string): string | null {
    const metaMap = new Map<RegExp, string>([
      [/^news$/, 'news'],
      [/^events$/, 'events'],
      [/^places$/, 'places'],
      [/^about$/, 'about'],
      [/^profile$/, 'profile'],
      [/^ubs$/, 'ubs'],
      [/^greenCity$/, 'greenCity'],
      [/^ubs-user\/profile$/, 'userProfile'],
      [/^profile\/\d+\/allhabits$/, 'allHabits'],
      [/^profile\/\d+\/create-habit$/, 'createHabit'],
      [/^ubs-user\/orders$/, 'userOrders'],
      [/^ubs-user\/bonuses$/, 'userBonuses'],
      [/^ubs-user\/messages\/\d+$/, 'userMessages'],
      [/^ubs-admin\/orders$/, 'adminOrders'],
      [/^ubs-admin\/order\/\d+$/, 'adminOrders'],
      [/^ubs-admin\/customers$/, 'adminCustomers'],
      [/^ubs-admin\/certificates$/, 'adminCertificates'],
      [/^ubs-admin\/employee\/\d+$/, 'adminEmployees'],
      [/^ubs-admin\/tariffs$/, 'adminTariffs'],
      [/^ubs-admin\/notifications$/, 'adminNotifications'],
      [/^ubs-admin\/user-agreement$/, 'adminUserAgreement']
    ]);

    for (const [regex, key] of metaMap) {
      if (regex.test(path)) {
        return key;
      }
    }

    return null;
  }
}
