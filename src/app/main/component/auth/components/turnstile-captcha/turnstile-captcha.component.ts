import { AfterViewInit, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Language } from 'src/app/main/i18n/Language';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Component({
  selector: 'app-turnstile-captcha',
  templateUrl: './turnstile-captcha.component.html',
  styleUrls: ['./turnstile-captcha.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TurnstileCaptchaComponent),
      multi: true
    }
  ]
})
export class TurnstileCaptchaComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input() siteKey!: string;
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() size: 'normal' | 'compact' | 'invisible' | 'flexible' = 'flexible';

  @Output() captchaError = new EventEmitter<void>();

  private captchaRendered = false;
  private captchaToken: string | null = null;
  private language: 'uk' | 'en' = 'uk';
  private widgetId: string | null = null;

  private onChange = (token: string | null) => {};
  private onTouched = () => {};

  constructor(private readonly languageService: LanguageService) {}

  ngOnInit() {
    this.languageService.getCurrentLangObs().subscribe((selectedLanguage: Language) => {
      this.language = selectedLanguage === 'en' ? 'en' : 'uk';
    });
  }

  ngAfterViewInit(): void {
    if (!this.captchaRendered) {
      this.renderTurnstile();
    }
  }

  get turnstile(): any {
    return (window as any).turnstile;
  }

  private renderTurnstile(): void {
    try {
      if (this.turnstile) {
        this.widgetId = this.turnstile.render('#turnstile-container', {
          sitekey: this.siteKey,
          callback: this.javascriptCallback.bind(this),
          theme: this.theme,
          size: this.size,
          'error-callback': this.errorCallback.bind(this),
          'expired-callback': this.expiredCallback.bind(this),
          language: this.language
        });
        this.captchaRendered = true;
      } else {
        console.error('Turnstile library is not available on the window object.');
      }
    } catch (error) {
      console.error('Error initializing Turnstile:', error);
    }
  }

  private javascriptCallback(token: string): void {
    this.captchaToken = token;
    this.onChange(token);
    this.onTouched();
  }

  private errorCallback(): void {
    console.error('An error occurred during CAPTCHA validation.');
    this.captchaError.emit();
    this.onChange(null);
  }

  private expiredCallback(): void {
    console.error('Captcha token has expired.');
    this.onChange(null);
  }

  writeValue(token: string | null): void {
    this.captchaToken = token;
  }

  clearToken(): void {
    this.turnstile.reset(this.widgetId);

    this.captchaToken = null;
    this.onChange(null);
  }

  registerOnChange(fn: (token: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
