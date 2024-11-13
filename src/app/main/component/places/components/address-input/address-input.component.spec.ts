import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddressInputComponent } from './address-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Language } from 'src/app/main/i18n/Language';

describe('AddressInputComponent', () => {
  let component: AddressInputComponent;
  let fixture: ComponentFixture<AddressInputComponent>;
  const fakeLocalStorageService: LocalStorageService = jasmine.createSpyObj('LocalStorageService', ['getCurrentLanguage']);
  fakeLocalStorageService.getCurrentLanguage = () => 'en' as Language;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [AddressInputComponent],
      providers: [{ provide: LocalStorageService, useValue: fakeLocalStorageService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should be initialized correctly', () => {
    const spy = spyOn(component, 'bindLang');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('en');
  });

  it('Should to set value', () => {
    component.writeValue('Test');
    expect(component.value).toEqual('Test');
  });
});
