import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UbsOrderCertificateComponent } from './ubs-order-certificate.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { LocalizedCurrencyPipe } from 'src/app/shared/localized-currency-pipe/localized-currency.pipe';
import { UbsOrderLocationPopupComponent } from '../ubs-order-location-popup/ubs-order-location-popup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UBSOrderFormService } from 'src/app/ubs/ubs/services/ubs-order-form.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IMaskModule } from 'angular-imask';
import { Store } from '@ngrx/store';
import { ubsOrderServiseMock } from 'src/app/ubs/mocks/order-data-mock';

describe('UbsOrderCertificateComponent', () => {
  let component: UbsOrderCertificateComponent;
  let fixture: ComponentFixture<UbsOrderCertificateComponent>;
  const shareFormService = jasmine.createSpyObj('shareFormService', [
    'orderDetails',
    'changeAddCertButtonVisibility',
    'addCert',
    'changeOrderDetails'
  ]);
  shareFormService.addCert = of(false);

  const localStorageService = jasmine.createSpyObj('localStorageService', ['getCurrentLanguage', 'languageSubject', 'getUbsOrderData']);

  const storeMock = jasmine.createSpyObj('Store', ['select', 'dispatch']);
  storeMock.select.and.returnValue(of({ order: ubsOrderServiseMock }));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UbsOrderCertificateComponent, LocalizedCurrencyPipe, UbsOrderLocationPopupComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        RouterTestingModule,
        MatDialogModule,
        BrowserAnimationsModule,
        IMaskModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: UBSOrderFormService, useValue: shareFormService },
        { provide: LocalStorageService, useValue: localStorageService },
        {
          provide: Store,
          useValue: {
            pipe: () => of(),
            dispatch: () => of(),
            select: jasmine.createSpy().and.returnValue(of({ order: ubsOrderServiseMock })) // Mock selectors
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsOrderCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
