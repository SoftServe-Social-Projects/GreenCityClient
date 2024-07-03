import { Component, EventEmitter, forwardRef, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressInputComponent),
      multi: true
    }
  ]
})
export class AddressInputComponent implements ControlValueAccessor, OnInit {
  value: string | undefined;
  onTouched!: () => void;
  private onChange!: (value: string) => void;
  @Output() private getAddressData: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private translate: TranslateService,
    public localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    this.bindLang(this.localStorageService.getCurrentLanguage());
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  selectAddressApi(event: any) {
    this.getAddressData.emit(event);
  }

  setAddressValue(event: any): void {
    const content = event.formatted_address;
    this.onChange(content);
    this.onTouched();
    this.value = content;
  }

  bindLang(lang: string): void {
    this.translate.setDefaultLang(lang);
  }
}
