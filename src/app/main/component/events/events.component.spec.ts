import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventsComponent } from './events.component';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Language } from 'src/app/main/i18n/Language';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

describe('EventsComponent', () => {
  let component: EventsComponent;
  let languageSubject: BehaviorSubject<string>;
  let fixture: ComponentFixture<EventsComponent>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let localStorageService: jasmine.SpyObj<LocalStorageService>;

  beforeEach(() => {
    languageSubject = new BehaviorSubject('en');
    translateService = jasmine.createSpyObj('TranslateService', ['setDefaultLang']);
    localStorageService = jasmine.createSpyObj('LocalStorageService', ['getCurrentLanguage', 'languageSubject']);
    localStorageService.languageSubject = languageSubject;

    TestBed.configureTestingModule({
      declarations: [EventsComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: TranslateService, useValue: translateService },
        { provide: LocalStorageService, useValue: localStorageService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set default language on initialization', () => {
    const defaultLang = Language.UA;
    localStorageService.getCurrentLanguage.and.returnValue(defaultLang);
    component.ngOnInit();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith(defaultLang);
  });

  it('should subscribe to language changes', () => {
    spyOn(localStorageService.languageSubject, 'subscribe').and.callFake((callback) => {
      callback('testLang');
      return { unsubscribe: () => {} } as any;
    });

    component.ngOnInit();
    expect(localStorageService.languageSubject.subscribe).toHaveBeenCalled();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('testLang');
  });
});
