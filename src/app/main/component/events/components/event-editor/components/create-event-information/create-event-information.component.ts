import { Component, Input, OnInit } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ContentChange } from 'ngx-quill';

import { FormGroup } from '@angular/forms';
import { quillConfig } from '../../quillEditorFunc';
import { EVENT_LOCALE, EventLocaleKeys } from '../../../../models/event-consts';
import { ImagesContainer } from '../../../../models/events.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-event-information',
  templateUrl: './create-event-information.component.html',
  styleUrls: ['./create-event-information.component.scss']
})
export class CreateEventInformationComponent implements OnInit {
  isQuillUnfilled = false;
  quillLength = 0;
  quillModules = quillConfig;
  imgArray: string[] = [];
  @Input() eventInfForm: FormGroup;
  minLength = 20;
  maxLength = 63206;
  titleLength: string;
  protected readonly EVENT_LOCALE = EVENT_LOCALE;

  constructor(
    protected localStorageService: LocalStorageService,
    protected router: Router
  ) {}

  get images(): ImagesContainer[] {
    return this.eventInfForm.controls.images.value;
  }

  ngOnInit() {
    this.eventInfForm.get('title').valueChanges.subscribe((value) => {
      this.titleLength = value.length + ' / ' + 70;
    });
  }

  quillContentChanged(content: ContentChange): void {
    const quill = content.editor;
    const range = quill.getSelection();

    this.quillLength = content.text.length - 1;
    this.isQuillUnfilled = this.quillLength < 20;

    const trimmedText = content.text.trimEnd();
    const currentDescription = this.eventInfForm.get('description').value;

    if (currentDescription !== trimmedText) {
      setTimeout(() => {
        this.eventInfForm.get('description').setValue(trimmedText, { emitEvent: false });
        quill.setSelection(range.index, range.length);
      }, 0);
    }
  }

  get quillLabel(): string {
    const typedCharacters = this.quillLength;
    if (typedCharacters < 1) {
      return `${this.getLocale('quillDefault')}`;
    }
    if (typedCharacters > this.maxLength) {
      return `${this.getLocale('quillMaxExceeded')} ${typedCharacters - this.maxLength}`;
    }
    if (typedCharacters < this.minLength) {
      return `${this.getLocale('quillError')} ${this.minLength - typedCharacters}`;
    }
    return `${this.getLocale('quillValid')} ${typedCharacters}`;
  }

  getLocale(localeKey: EventLocaleKeys): string {
    return EVENT_LOCALE[localeKey][this.localStorageService.getCurrentLanguage()];
  }

  setImagesUrlArray(value: ImagesContainer[]): void {
    this.eventInfForm.controls.images.setValue(value);
  }
}
