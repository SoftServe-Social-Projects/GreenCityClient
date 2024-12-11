import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
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

  constructor(translate: TranslateService, localStorageService: LocalStorageService) {
    this.lang = localStorageService.getCurrentLanguage() || translate.defaultLang;
    translate.onDefaultLangChange.pipe(takeUntil(this.destroy$)).subscribe((defaultLangObj) => {
      this.lang = defaultLangObj.lang;
    });
  }

  transform(value: any, fixedDigits: boolean = false): any {
    const formattedValue = fixedDigits ? (+value).toFixed(2) : Math.round(+value * 100) / 100;

    return `${formattedValue} ${LOCALIZED_CURRENCY[this.lang]}`;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
