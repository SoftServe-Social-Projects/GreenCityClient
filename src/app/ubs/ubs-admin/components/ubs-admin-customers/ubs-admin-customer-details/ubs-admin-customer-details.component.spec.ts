import { Location } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { TranslateModule } from '@ngx-translate/core';

import { UbsAdminCustomerDetailsComponent } from './ubs-admin-customer-details.component';
import { AdminCustomersService } from '@ubs/ubs-admin/services/admin-customers.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { CommentPopUpComponent } from '../../shared/components/comment-pop-up/comment-pop-up.component';
import { of, throwError } from 'rxjs';
describe('UbsAdminCustomerDetailsComponent', () => {
  let component: UbsAdminCustomerDetailsComponent;
  let fixture: ComponentFixture<UbsAdminCustomerDetailsComponent>;
  let adminCustomerServiceMock: jasmine.SpyObj<AdminCustomersService>;
  let httpClientMock: jasmine.SpyObj<HttpClient>;
  let matDialogMock: jasmine.SpyObj<MatDialog>;
  let dialogRefMock: jasmine.SpyObj<any>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBarComponent>;

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', [
    'getCustomer',
    'removeCurrentCustomer',
    'setCustomer'
  ]);
  let locationMock: Location;

  beforeEach(waitForAsync(() => {
    adminCustomerServiceMock = jasmine.createSpyObj('AdminCustomerService', ['openChat', 'addChatLink']);
    matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);

    dialogRefMock.componentInstance = {
      comment: '',
      isLink: true
    };

    matDialogMock.open.and.returnValue(dialogRefMock);
    dialogRefMock.afterClosed.and.returnValue(of(null));

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
        { provide: MatSnackBarComponent, useValue: snackBarSpy },
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

  it('should return early if userId is null', () => {
    component.openDialog('column', 'chatLink', null);

    expect(matDialogMock.open).not.toHaveBeenCalled();
  });

  it('should open the dialog with correct configuration', () => {
    component.openDialog('column', 'chatLink', 'userId');

    expect(matDialogMock.open).toHaveBeenCalledWith(CommentPopUpComponent, (component as any).dialogConfig);
    expect(dialogRefMock.componentInstance.comment).toBe('chatLink');
    expect(dialogRefMock.componentInstance.isLink).toBeTrue();
  });

  it('should do nothing if dialog closes without changes', () => {
    dialogRefMock.afterClosed.and.returnValue(of(null));

    component.openDialog('column', 'chatLink', 'userId');

    expect(adminCustomerServiceMock.addChatLink).not.toHaveBeenCalled();
    expect(snackBarSpy.openSnackBar).not.toHaveBeenCalled();
  });

  it('should call addChatLink and show success message on dialog close with updated data', () => {
    const updatedData = 'newChatLink';

    dialogRefMock.afterClosed.and.returnValue(of(updatedData));
    adminCustomerServiceMock.addChatLink.and.returnValue(of(void 0));

    component.openDialog('column', 'chatLink', 'userId');

    expect(adminCustomerServiceMock.addChatLink).toHaveBeenCalledWith('userId', updatedData);
    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('successUpdateLink');
  });

  it('should show error message if addChatLink fails', () => {
    const updatedData = 'newChatLink';
    dialogRefMock.afterClosed.and.returnValue(of(updatedData));
    adminCustomerServiceMock.addChatLink.and.returnValue(throwError(() => 'error'));

    component.openDialog('column', 'chatLink', 'userId');

    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('failUpdateLink');
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
