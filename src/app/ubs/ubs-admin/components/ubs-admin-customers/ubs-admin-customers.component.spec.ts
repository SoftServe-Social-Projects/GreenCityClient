import { MatDialog } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { UbsAdminCustomersComponent } from './ubs-admin-customers.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommentPopUpComponent } from '../shared/components/comment-pop-up/comment-pop-up.component';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { AdminCustomersService } from '../../services/admin-customers.service';
import { ColumnParam } from './columnsParams';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ICustomersTable } from '../../models/customers-table.model';
import { ICustomerOrdersTable } from '../../models/customer-orders-table.model';
import { ICustomerViolationTable } from '../../models/customer-violations-table.model';

describe('UbsAdminCustomersComponent', () => {
  let component: UbsAdminCustomersComponent;
  let fixture: ComponentFixture<UbsAdminCustomersComponent>;
  let adminCustomersServiceMock: AdminCustomersService;
  let matDialogMock: jasmine.SpyObj<MatDialog>;
  let dialogRefMock: jasmine.SpyObj<any>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBarComponent>;

  const column: ColumnParam = { title: { ua: 'Заголовок', en: 'Title', key: 'titleKey' }, width: 60 };
  const chatLink = 'https://example.com';
  const userId = 'userId';
  const updatedData = 'newChatLink';

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', [
    'getCustomer',
    'removeCurrentCustomer',
    'setCustomer',
    'getCurrentLanguage'
  ]);

  beforeEach(async () => {
    adminCustomersServiceMock = jasmine.createSpyObj('AdminCustomersService', [
      'getCustomers',
      'getCustomerOrders',
      'getCustomerViolations',
      'addChatLink',
      'openChat'
    ]);
    adminCustomersServiceMock.getCustomers = () => of({} as ICustomersTable);
    adminCustomersServiceMock.getCustomerOrders = () => of({} as ICustomerOrdersTable);
    adminCustomersServiceMock.getCustomerViolations = () => of({} as ICustomerViolationTable);
    adminCustomersServiceMock.addChatLink = () => of(void 0);
    adminCustomersServiceMock.openChat = (chatUrl: string) => {
      chatUrl && window.open(chatUrl, '_blank');
    };

    matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

    snackBarSpy = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);

    dialogRefMock.componentInstance = {
      comment: null,
      isLink: false,
      header: null
    };

    matDialogMock.open.and.returnValue(dialogRefMock);
    dialogRefMock.afterClosed.and.returnValue(of(null));

    (localStorageServiceMock.getCustomer as jasmine.Spy).and.returnValue({
      userId: '123',
      chatLink: 'https://example.com'
    });

    (localStorageServiceMock.getCurrentLanguage as jasmine.Spy).and.returnValue('ua');
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatTableModule,
        SharedModule,
        TranslateModule.forRoot(),
        InfiniteScrollModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule
      ],
      declarations: [UbsAdminCustomersComponent, CommentPopUpComponent],
      providers: [
        { provide: MatSnackBarComponent, useValue: snackBarSpy },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: AdminCustomersService, useValue: adminCustomersServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    (component as any).tableData = [{ userId: 'userId', titleKey: 'oldChatLink' }];

    (component as any).AdminCustomersService = adminCustomersServiceMock;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('detects changes', () => {
    const changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
    const detectChangesSpy = spyOn(changeDetectorRef.constructor.prototype, 'detectChanges');

    component.ngAfterViewChecked();

    expect(detectChangesSpy).toHaveBeenCalled();
  });

  it('method ngOnInit should invoke methods', () => {
    // @ts-ignore
    const spy = spyOn(component, 'setDisplayedColumns');
    // @ts-ignore
    const spy1 = spyOn(component, 'getTable');
    // @ts-ignore
    const spy2 = spyOn(component, 'initFilterForm');
    // @ts-ignore
    const spy3 = spyOn(component, 'onCreateGroupFormValueChange');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });

  it('method getSortingData should invoke methods', () => {
    // @ts-ignore
    const spy = spyOn(component, 'getTable');
    component.getSortingData('', '');
    expect(spy).toHaveBeenCalled();
  });

  it('method togglePopUp should toggle display', () => {
    component.display = 'block';
    component.togglePopUp();
    expect(component.display).toBe('none');
  });

  it('method initFilterForm should assign data to filters', () => {
    (component as any).initFilterForm();
    expect(component.filters).toBe(component.filterForm.value);
  });

  it('method onDeleteFilter should reset data in filterForm', () => {
    component.onDeleteFilter('bonusesFrom', 'bonusesTo');
    expect(component.filterForm.value.bonusesFrom).toBe('');
    expect(component.filterForm.value.bonusesTo).toBe('');
  });

  it('method onClearFilters should reset filterForm', () => {
    component.onClearFilters();
    // @ts-ignore
    expect(component.filterForm.getRawValue()).toEqual(component.initialFilterValues);
  });

  it('onScroll should add 1 to currentPage', () => {
    component.isUpdate = false;
    component.currentPage = 1;
    // @ts-ignore
    component.totalPages = 2;
    component.onScroll();
    expect(component.currentPage).toBe(2);
  });

  it('should return early if userId is null', () => {
    component.openPopUp(column, 'chatLink', null);

    expect(matDialogMock.open).not.toHaveBeenCalled();
  });

  it('should open the dialog with correct configuration', () => {
    component.openPopUp(column, chatLink, userId);

    expect(matDialogMock.open).toHaveBeenCalledWith(CommentPopUpComponent, (component as any).dialogConfig);

    expect(dialogRefMock.componentInstance.comment).toBe(chatLink);
    expect(dialogRefMock.componentInstance.isLink).toBeTruthy();

    expect(dialogRefMock.componentInstance.header).toBe('Заголовок');
  });

  it('should do nothing if dialog closes without changes', () => {
    spyOn(adminCustomersServiceMock, 'addChatLink').and.stub();

    dialogRefMock.afterClosed.and.returnValue(of(null));
    component.openPopUp(column, chatLink, userId);

    expect(adminCustomersServiceMock.addChatLink).not.toHaveBeenCalled();
    expect(snackBarSpy.openSnackBar).not.toHaveBeenCalled();
  });

  it('should call addChatLink and show success message on dialog close with updated data', () => {
    dialogRefMock.afterClosed.and.returnValue(of(updatedData));

    spyOn(adminCustomersServiceMock, 'addChatLink').and.returnValue(of(void 0));
    spyOn(component as any, 'updateTableRow').and.callThrough();

    component.openPopUp(column, chatLink, userId);
    expect(adminCustomersServiceMock.addChatLink).toHaveBeenCalledWith(userId, updatedData);
    expect(component['updateTableRow']).toHaveBeenCalledWith(column, userId, updatedData);
    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('successUpdateLink');
  });

  it('should show error message if addChatLink fails', () => {
    dialogRefMock.afterClosed.and.returnValue(of(updatedData));
    spyOn(adminCustomersServiceMock, 'addChatLink').and.returnValue(throwError(() => 'error'));

    component.openPopUp(column, chatLink, userId);

    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('failUpdateLink');
  });

  it('destroy Subject should be closed after ngOnDestroy()', () => {
    // @ts-ignore
    component.destroy = new Subject<boolean>();
    // @ts-ignore
    spyOn(component.destroy$, 'unsubscribe');
    component.ngOnDestroy();
    // @ts-ignore
    expect(component.destroy$.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
