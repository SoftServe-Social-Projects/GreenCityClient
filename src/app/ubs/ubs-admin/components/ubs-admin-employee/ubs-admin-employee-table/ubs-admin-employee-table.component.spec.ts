import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ScannedActionsSubject, Store } from '@ngrx/store';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatMenuModule } from '@angular/material/menu';

import { UbsAdminEmployeeService } from 'src/app/ubs/ubs-admin/services/ubs-admin-employee.service';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { UbsAdminEmployeeTableComponent } from './ubs-admin-employee-table.component';
import { UbsAdminEmployeeEditFormComponent } from '../ubs-admin-employee-edit-form/ubs-admin-employee-edit-form.component';
import { DialogPopUpComponent } from 'src/app/shared/dialog-pop-up/dialog-pop-up.component';
import { Actions } from '@ngrx/effects';

describe('UbsAdminEmployeeTableComponent', () => {
  let component: UbsAdminEmployeeTableComponent;
  let fixture: ComponentFixture<UbsAdminEmployeeTableComponent>;

  const dialogRefStub = {
    afterClosed() {
      return of(true);
    }
  };

  const fakeTableItems = {
    content: ['fakeData1', 'fakeData2'],
    totalPages: 7
  };

  const mockedEmployeePositions = [
    {
      id: 2,
      name: 'fake',
      nameEn: 'fakeEn'
    }
  ];

  const defaultImagePath =
    'https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg';

  const fakeEmployees = [
    {
      email: 'fake',
      employeePositions: mockedEmployeePositions,
      firstName: 'fake',
      id: 1,
      image: defaultImagePath,
      lastName: 'fake',
      phoneNumber: 'fake',
      tariffs: [
        {
          id: 1,
          region: {
            id: 1,
            nameEn: 'Kyiv Oblast',
            nameUk: 'Київська область'
          },
          locationsDtos: [
            {
              id: 1,
              nameEn: 'Kyiv',
              nameUk: 'Київ'
            }
          ],
          courier: {
            id: 1,
            nameEn: 'UBS',
            nameUk: 'УБС'
          },
          hasChat: true
        },
        {
          id: 2,
          region: {
            id: 1,
            nameEn: 'Kyiv Oblast',
            nameUk: 'Київська область'
          },
          locationsDtos: [
            {
              id: 2,
              nameEn: 'Irpin',
              nameUk: 'Ірпінь'
            }
          ],
          courier: {
            id: 1,
            nameEn: 'UBS',
            nameUk: 'УБС'
          },
          hasChat: false
        }
      ]
    },
    {
      email: 'fake2',
      employeePositions: mockedEmployeePositions,
      firstName: 'fake2',
      id: 1,
      image: defaultImagePath,
      lastName: 'fake2',
      phoneNumber: 'fake2',
      tariffs: [
        {
          id: 1,
          region: {
            id: 1,
            nameEn: 'Kyiv Oblast',
            nameUk: 'Київська область'
          },
          locationsDtos: [
            {
              id: 1,
              nameEn: 'Kyiv',
              nameUk: 'Київ'
            }
          ],
          courier: {
            id: 1,
            nameEn: 'UBS',
            nameUk: 'УБС'
          },
          hasChat: true
        }
      ]
    }
  ];

  const ubsAdminEmployeeServiceMock = jasmine.createSpyObj('ubsAdminEmployeeServiceMock', ['getAllStations', 'getAllPositions']);
  ubsAdminEmployeeServiceMock.getAllStations.and.returnValue(of(['fakeStation1', 'fakeStation2', 'fakeStation3']));
  ubsAdminEmployeeServiceMock.getAllPositions.and.returnValue(of(['fakePosition1', 'fakePosition2', 'fakePosition3']));
  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  ubsAdminEmployeeServiceMock.searchValue = new BehaviorSubject('test');
  ubsAdminEmployeeServiceMock.filterDataSubject$ = new Subject();
  storeMock.select = () => of(fakeTableItems as any);
  const matDialogMock = jasmine.createSpyObj('matDialog', ['open']);
  const languageServiceMock = jasmine.createSpyObj('languageServiceMock', ['getCurrentLanguage']);
  languageServiceMock.getCurrentLanguage.and.returnValue('ua');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UbsAdminEmployeeTableComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        MatTableModule,
        InfiniteScrollModule,
        ReactiveFormsModule,
        MatMenuModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: Store, useValue: storeMock },
        { provide: UbsAdminEmployeeService, useValue: ubsAdminEmployeeServiceMock },
        { provide: LanguageService, useValue: languageServiceMock },
        { provide: Actions, useValue: of() },
        { provide: ScannedActionsSubject, useValue: of() }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminEmployeeTableComponent);
    component = fixture.componentInstance;
    spyOn(component.searchValue, 'pipe').and.returnValue(of(''));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call initSearch inside ngOnInit', () => {
    const spy = spyOn(component, 'initSearch');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should change the init data after calling getEmployeesPages', () => {
    component.getEmployeesPages();
    expect(storeMock.dispatch).toHaveBeenCalled();
  });

  it('updateTable method should call getEmployeesPages', () => {
    component.isUpdateTable = false;
    const spy = spyOn(component, 'getEmployeesPages');
    component.updateTable();
    expect(spy).toHaveBeenCalled();
    expect(component.isUpdateTable).toEqual(true);
  });

  it('table should be updated on scroll', () => {
    component.isUpdateTable = false;
    component.currentPageForTable = 2;
    component.totalPagesForTable = 4;
    const spy = spyOn(component, 'updateTable');
    component.onScroll();
    expect(spy).toHaveBeenCalled();
    expect(component.currentPageForTable).toEqual(3);
  });

  it('should open edit dialog', () => {
    const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') };
    component.openEditDialog(fakeEmployees[0], mockEvent as any);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(matDialogMock.open).toHaveBeenCalledWith(UbsAdminEmployeeEditFormComponent, {
      data: fakeEmployees[0],
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'admin-cabinet-dialog-container'
    });
  });

  it('should open permitions dialog', () => {
    const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') };
    component.openPermissionsDialog(fakeEmployees[0], mockEvent as any);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(matDialogMock.open).toHaveBeenCalled();
  });

  it('should open delete dialog', () => {
    const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') };
    matDialogMock.open.and.returnValue(dialogRefStub as any);
    component.openDeleteDialog(fakeEmployees[0], mockEvent as any);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(matDialogMock.open).toHaveBeenCalledWith(DialogPopUpComponent, {
      data: component.deleteDialogData,
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'delete-dialog-container'
    });
  });
});
