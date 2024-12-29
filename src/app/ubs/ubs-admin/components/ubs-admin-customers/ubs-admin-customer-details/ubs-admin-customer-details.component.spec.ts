import { Location } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { TranslateModule } from '@ngx-translate/core';

import { UbsAdminCustomerDetailsComponent } from './ubs-admin-customer-details.component';
import { AdminCustomersService } from '@ubs/ubs-admin/services/admin-customers.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
describe('UbsAdminCustomerDetailsComponent', () => {
  let component: UbsAdminCustomerDetailsComponent;
  let fixture: ComponentFixture<UbsAdminCustomerDetailsComponent>;
  let adminCustomerServiceMock: jasmine.SpyObj<AdminCustomersService>;
  let httpClientMock: jasmine.SpyObj<HttpClient>;
  let matDialogMock: jasmine.SpyObj<MatDialog>;

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', [
    'getCustomer',
    'removeCurrentCustomer'
  ]);
  let locationMock: Location;

  beforeEach(waitForAsync(() => {
    adminCustomerServiceMock = jasmine.createSpyObj('AdminCustomerService', ['openChat']);
    (localStorageServiceMock.getCustomer as jasmine.Spy).and.returnValue({
      userId: '123',
      chatLink: 'https://example.com'
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [UbsAdminCustomerDetailsComponent],
      providers: [
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: AdminCustomersService, useValue: adminCustomerServiceMock },
        { provide: HttpClient, useValue: httpClientMock },
        { provide: MatDialog, useValue: matDialogMock },
        Location
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminCustomerDetailsComponent);
    component = fixture.componentInstance;
    locationMock = TestBed.inject(Location);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goBack() should be called', () => {
    const spyLock = spyOn(locationMock, 'back');
    component.goBack();
    expect(spyLock).toHaveBeenCalled();
  });

  it('should call adminCustomerService.openChat when onOpenChat is called', () => {
    const chatUrl = 'https://example.com';

    component.onOpenChat(chatUrl);

    expect(adminCustomerServiceMock.openChat).toHaveBeenCalledWith(chatUrl);
  });

  it('should not call adminCustomerService.openChat when chatUrl is undefined', () => {
    component.onOpenChat(undefined);

    expect(adminCustomerServiceMock.openChat).not.toHaveBeenCalled();
  });
});
