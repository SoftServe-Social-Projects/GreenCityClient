import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { FormBuilder } from '@angular/forms';

import { IAppState } from 'src/app/store/state/app.state';
import { Employees, Page } from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';
import { UbsAdminEmployeeService } from 'src/app/ubs/ubs-admin/services/ubs-admin-employee.service';
import { UbsAdminEmployeeEditFormComponent } from '../ubs-admin-employee-edit-form/ubs-admin-employee-edit-form.component';
import { PopUpsStyles, EmployeeStatus } from './employee-models.enum';
import { DeleteEmployee, GetEmployees, ActivateEmployee } from 'src/app/store/actions/employee.actions';
import { DialogPopUpComponent } from '../../../../../shared/dialog-pop-up/dialog-pop-up.component';
import { UbsAdminEmployeePermissionsFormComponent } from '../ubs-admin-employee-permissions-form/ubs-admin-employee-permissions-form.component';
import { FilterData } from '../../../models/tariffs.interface';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { modifiedEmployee } from 'src/app/store/selectors/employee';

@Component({
  selector: 'app-ubs-admin-employee-table',
  templateUrl: './ubs-admin-employee-table.component.html',
  styleUrls: ['./ubs-admin-employee-table.component.scss']
})
export class UbsAdminEmployeeTableComponent implements OnInit {
  @Input() public isThisUserCanEditEmployee: boolean;
  @Input() public isThisUserCanEditEmployeeAuthorities: boolean;
  @Input() public isThisUserCanDeleteEmployee: boolean;
  @Input() public userHasRights: boolean;
  currentPageForTable = 0;
  isUpdateTable = false;
  isLoading = true;
  sizeForTable = 100;
  search: string;
  searchValue: BehaviorSubject<string> = new BehaviorSubject<string>('');
  totalPagesForTable: number;
  tableData: Page[];
  employees: Page[];
  filteredTableData: Page[] = [];
  firstPageLoad = true;
  reset = true;
  filterDatas: FilterData = { positions: [], regions: [], locations: [], couriers: [], employeeStatus: 'ACTIVE' };
  employees$ = this.store.select((state: IAppState): Employees => state.employees.employees);
  employeesData$ = this.store.select(modifiedEmployee);
  isTooltipOpened: boolean;
  isStatusActive = EmployeeStatus.active;
  isStatusInactive = EmployeeStatus.inactive;
  deleteDialogData = {
    popupTitle: 'employees.warning-title',
    popupConfirm: 'employees.btn.deactivate',
    popupCancel: 'employees.btn.cancel',
    style: PopUpsStyles.lightGreen
  };

  activateDialogData = {
    popupTitle: 'employees.activate-employee-title',
    popupConfirm: 'employees.btn.yes',
    popupCancel: 'employees.btn.no',
    style: PopUpsStyles.lightGreen,
    іsPermissionConfirm: false,
    isItrefund: false
  };

  icons = {
    edit: './assets/img/ubs-admin-employees/edit.svg',
    settings: './assets/img/ubs-admin-employees/gear.svg',
    delete: './assets/img/ubs-admin-employees/bin.svg',
    activate: './assets/img/ubs-tariff/restore.svg',
    crumbs: './assets/img/ubs-admin-employees/crumbs.svg',
    email: './assets/img/ubs-admin-employees/mail.svg',
    phone: './assets/img/ubs-admin-employees/phone.svg',
    location: './assets/img/ubs-admin-employees/location.svg',
    filter: './assets/img/ubs-admin-employees/filter.svg',
    info: './assets/img/ubs-admin-employees/info.svg'
  };

  constructor(
    private ubsAdminEmployeeService: UbsAdminEmployeeService,
    private languageService: LanguageService,
    private dialog: MatDialog,
    private store: Store<IAppState>,
    public fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.ubsAdminEmployeeService.filterDataSubject$.subscribe((filterList: FilterData) => {
      this.filterDatas = { ...filterList };
      this.initSearch();
    });
    this.initSearch();
  }

  initSearch(): void {
    this.ubsAdminEmployeeService.searchValue.pipe(debounceTime(500), distinctUntilChanged()).subscribe((item) => {
      this.search = item;
      this.currentPageForTable = 0;
      this.reset = true;
      this.firstPageLoad = true;
      this.getTable();
    });
  }

  getTable() {
    this.isLoading = true;
    this.getEmployeesPages();

    this.employees$.subscribe((item: Employees) => {
      if (item) {
        this.totalPagesForTable = item[`totalPages`];
        if (this.firstPageLoad) {
          this.isLoading = false;
          this.firstPageLoad = false;
        }
        this.isUpdateTable = false;
        this.reset = false;
      }
    });
  }

  updateTable() {
    this.isUpdateTable = true;
    this.getEmployeesPages();
  }

  getEmployeesPages(): void {
    this.store.dispatch(
      GetEmployees({
        pageNumber: this.currentPageForTable,
        pageSize: this.sizeForTable,
        search: this.search,
        reset: this.reset,
        filterData: this.filterDatas
      })
    );
  }

  onScroll() {
    if (!this.isUpdateTable && this.currentPageForTable < this.totalPagesForTable - 1) {
      this.currentPageForTable++;
      this.updateTable();
    }
  }

  openEditDialog(employeeData: Page, event: Event) {
    event.stopPropagation();
    this.dialog.open(UbsAdminEmployeeEditFormComponent, {
      data: employeeData,
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'admin-cabinet-dialog-container'
    });
  }

  openPermissionsDialog(employeeData: Page, event: Event): void {
    event.stopPropagation();
    this.dialog.open(UbsAdminEmployeePermissionsFormComponent, {
      data: employeeData,
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });
  }

  openDeleteDialog(employeeData: Page, event: Event): void {
    event.stopPropagation();
    const matDialogRef = this.dialog.open(DialogPopUpComponent, {
      data: this.deleteDialogData,
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'delete-dialog-container'
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res) {
          this.store.dispatch(DeleteEmployee({ id: employeeData.id }));
          this.initSearch();
        }
      });
  }

  openActivateDialog(employeeData: Page, event: Event): void {
    event.stopPropagation();
    const matDialogRef = this.dialog.open(DialogPopUpComponent, {
      data: this.activateDialogData,
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'activate-dialog-container'
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res) {
          this.store.dispatch(ActivateEmployee({ id: employeeData.id }));
          this.initSearch();
        }
      });
  }

  getLangValue(uaValue: string, enValue: string): string {
    return this.languageService.getLangValue(uaValue, enValue) as string;
  }
}
