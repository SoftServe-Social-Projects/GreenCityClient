import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CreateEditNewsFormBuilder {
  constructor(private fb: FormBuilder, public localStorageService: LocalStorageService) {}

  getSetupForm() {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(170), this.noWhitespaceValidator]],
      source: [''],
      content: ['', [Validators.required, Validators.minLength(20)]],
      tags: this.fb.array([]),
      image: ['']
    });
  }

  getEditForm(data) {
    return this.fb.group({
      title: [data.title, [Validators.required, Validators.maxLength(170), this.noWhitespaceValidator]],
      source: [data.source],
      content: [data.text || data.content || data.content.html, [Validators.required, Validators.minLength(20)]],
      tags: this.fb.array(
        this.localStorageService.getCurrentLanguage() === 'ua' || this.localStorageService.getCurrentLanguage() === 'ru'
          ? data.tagsUa
          : data.tags
      ),
      image: [data.imagePath]
    });
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhiteSpace = (control.value || '').trim().length === 0;
    const isValid = !isWhiteSpace;
    return isValid ? null : { whitespace: true };
  }
}
