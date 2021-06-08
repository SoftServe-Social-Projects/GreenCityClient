import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export const LOCALIZED_CURRENCY = {
  en: 'UAH',
  ua: 'грн',
  ru: 'грн'
};

@Pipe({
  name: 'localizedCurrency',
  pure: false
})
export class LocalizedCurrencyPipe implements PipeTransform, OnDestroy {
  private lang: string;
  private destroy$: Subject<any> = new Subject();

  constructor(translate: TranslateService) {
    this.lang = localStorage.getItem('language') || translate.defaultLang;
    translate.onDefaultLangChange.pipe(takeUntil(this.destroy$)).subscribe((defaultLangObj) => {
      this.lang = defaultLangObj.lang;
    });
  }

  transform(value: any, ...args: any[]): any {
    return `${value} ${LOCALIZED_CURRENCY[this.lang]}`;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}
