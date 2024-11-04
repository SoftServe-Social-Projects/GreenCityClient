import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { TranslateModule } from '@ngx-translate/core';
import { ContentChange, QuillModule } from 'ngx-quill';
import { Language } from 'src/app/main/i18n/Language';
import { CreateEventInformationComponent } from './create-event-information.component';

describe('CreateEventInformationComponent', () => {
  let component: CreateEventInformationComponent;
  let fixture: ComponentFixture<CreateEventInformationComponent>;
  let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;

  beforeEach(waitForAsync(() => {
    const localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', ['getCurrentLanguage']);
    TestBed.configureTestingModule({
      declarations: [CreateEventInformationComponent],
      imports: [
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatSelectModule,
        MatChipsModule,
        QuillModule.forRoot(),
        MatSnackBarModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        NoopAnimationsModule
      ],
      providers: [FormBuilder, { provide: LocalStorageService, useValue: localStorageServiceMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    localStorageServiceSpy = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEventInformationComponent);
    component = fixture.componentInstance;
    component.eventInfForm = new FormBuilder().group({
      title: ['Test'],
      description: ['Description'],
      open: [true],
      images: [[]],
      duration: [1],
      tags: [[]]
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return empty label when quillLength is less than 1', () => {
    component.quillLength = 0;
    localStorageServiceSpy.getCurrentLanguage.and.returnValue(Language.EN);
    expect(component.quillLabel).toBe('');
  });

  it('should return error message when quillLength is less than minLength', () => {
    component.quillLength = 15;
    localStorageServiceSpy.getCurrentLanguage.and.returnValue(Language.EN);
    expect(component.quillLabel).toBe('Not enough characters. Left: 5');
  });

  it('should set description value in form on blur', fakeAsync(() => {
    const mockContent = {
      text: 'Description'
    };

    const text = 'Description   ';

    component.eventInfForm.get('description')?.setValue(text);
    expect(component.eventInfForm.get('description')?.value).toBe(text);
    component.updateDescriptionOnBlur();
    tick();
    fixture.detectChanges();
    expect(component.eventInfForm.get('description')?.value).toBe(text.trimEnd());
  }));

  it('should return error message with remaining characters when quillLength is less than minLength', () => {
    component.quillLength = 10;
    spyOn(component, 'getLocale').and.returnValue('Not enough characters. Left:');
    expect(component.quillLabel).toBe('Not enough characters. Left: 10');
  });

  it('should return max exceeded error message when quillLength exceeds maxLength', () => {
    component.quillLength = 63210;
    spyOn(component, 'getLocale').and.returnValue('Error: Max length exceeded by');
    expect(component.quillLabel).toBe('Error: Max length exceeded by 4');
  });

  it('should update quillLength and form value on valid content change and blur', fakeAsync(() => {
    const mockContent = {
      text: 'Description    '
    };

    component.quillLength = 0;
    component.isQuillUnfilled = true;
    component.eventInfForm.get('description')?.setValue(mockContent.text);

    //updates length
    component.quillContentChanged(mockContent as any);
    tick();
    expect(component.quillLength).toBe(mockContent.text.length - 1);
    expect(component.eventInfForm.get('description')?.value).toBe(mockContent.text);
    expect(component.isQuillUnfilled).toBe(component.quillLength < 20);

    component.updateDescriptionOnBlur();
    tick();
    expect(component.quillLength).toBe(mockContent.text.trimEnd().length - 1);
    expect(component.eventInfForm.get('description')?.value).toBe(mockContent.text.trimEnd());
  }));

  it('should return default label when quillLength is zero', () => {
    component.quillLength = 0;
    localStorageServiceSpy.getCurrentLanguage.and.returnValue(Language.EN);
    spyOn(component, 'getLocale').and.callThrough();
    expect(component.quillLabel).toBe('');
    expect(component.getLocale).toHaveBeenCalledWith('quillDefault');
  });

  it('should return error message when quillLength is less than minLength', () => {
    component.quillLength = 15;
    localStorageServiceSpy.getCurrentLanguage.and.returnValue(Language.EN);
    spyOn(component, 'getLocale').and.callThrough();
    expect(component.quillLabel).toBe('Not enough characters. Left: 5');
    expect(component.getLocale).toHaveBeenCalledWith('quillError');
  });

  it('should return max exceeded message when quillLength exceeds maxLength', () => {
    component.quillLength = 63207;
    localStorageServiceSpy.getCurrentLanguage.and.returnValue(Language.EN);
    spyOn(component, 'getLocale').and.callThrough();
    expect(component.quillLabel).toBe('The maximum character length is greater than 1');
    expect(component.getLocale).toHaveBeenCalledWith('quillMaxExceeded');
  });

  it('should return valid label when quillLength is within valid range', () => {
    component.quillLength = 50;
    localStorageServiceSpy.getCurrentLanguage.and.returnValue(Language.EN);
    spyOn(component, 'getLocale').and.callThrough();
    expect(component.quillLabel).toBe('Number of characters: 50');
    expect(component.getLocale).toHaveBeenCalledWith('quillValid');
  });
});
