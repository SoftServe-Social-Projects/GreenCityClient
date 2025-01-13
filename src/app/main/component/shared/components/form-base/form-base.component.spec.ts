import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { FormBaseComponent } from './form-base.component';
import { Store } from '@ngrx/store';
import { ubsOrderServiseMock } from 'src/app/ubs/mocks/order-data-mock';
import { TranslateService } from '@ngx-translate/core';

describe('FormBaseComponent', () => {
  let component: FormBaseComponent;
  let fixture: ComponentFixture<FormBaseComponent>;
  let router: Router;
  let matDialog: MatDialog;
  const dialogRefStub = {
    afterClosed() {
      return of(true);
    }
  };

  const mockTranslateService = {
    get: jasmine.createSpy('get').and.returnValue(of('mockTranslation')),
    instant: jasmine.createSpy('instant').and.returnValue('mockTranslation')
  };

  const storeMock = jasmine.createSpyObj('Store', ['select', 'dispatch']);
  storeMock.select.and.returnValue(of({ order: ubsOrderServiseMock }));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormBaseComponent],
      imports: [RouterTestingModule, MatDialogModule, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: Store, useValue: storeMock },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormBaseComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    matDialog = TestBed.inject(MatDialog);
    spyOn(component.orderService, 'cancelUBSwithoutSaving');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cancelPopupJustifying and removeItem be called in cancel', () => {
    const spyCancelPopupJustifying = spyOn(FormBaseComponent.prototype as any, 'cancelPopupJustifying');
    const spyLocalStorage = spyOn(window.localStorage, 'removeItem');
    component.cancel(true);
    expect(spyCancelPopupJustifying).toHaveBeenCalledWith(true);
    expect(spyLocalStorage).toHaveBeenCalledWith('newsTags');
  });
});
