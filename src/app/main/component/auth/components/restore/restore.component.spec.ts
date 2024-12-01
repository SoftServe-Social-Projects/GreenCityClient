import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RestorePasswordService } from 'src/app/main/service/auth/restore-password.service';
import { Language } from 'src/app/main/i18n/Language';
import { LocalStorageService } from 'src/app/main/service/localstorage/local-storage.service';
import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { RestoreComponent } from './restore.component';

describe('RestoreComponent', () => {
  let component: RestoreComponent;
  let fixture: ComponentFixture<RestoreComponent>;

  const matDialogMock: MatDialogRef<any> = jasmine.createSpyObj('MatDialogRef', ['close']);
  matDialogMock.close = () => true;

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', ['getCurrentLanguage']);
  localStorageServiceMock.getCurrentLanguage = () => 'en' as Language;

  const restorePasswordServiceMock: RestorePasswordService = jasmine.createSpyObj('RestorePasswordService', ['sendEmailForRestore']);
  restorePasswordServiceMock.sendEmailForRestore = (email, lang) => true;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RestoreComponent],
      imports: [TranslateModule.forRoot(), FormsModule, MatDialogModule, HttpClientTestingModule],
      providers: [{ provide: MatDialogRef, useValue: matDialogMock }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send email', inject([RestorePasswordService], (service: RestorePasswordService) => {
    const spy = spyOn(service as any, 'sendEmailForRestore');

    component.sentEmail();
    expect(spy).toHaveBeenCalled();
  }));
});
