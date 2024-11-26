import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { select, Store } from '@ngrx/store';
import { columnsToFilterByName } from '@ubs/ubs-admin/models/columns-to-filter-by-name';
import { Subject, timer } from 'rxjs';
import { debounceTime, filter, take, takeUntil } from 'rxjs/operators';
import { MouseEvents } from 'src/app/shared/mouse-events';
import {
  AddFilterMultiAction,
  AddFiltersAction,
  ChangingOrderData,
  ClearFilters,
  GetColumns,
  GetColumnToDisplay,
  GetLocationsDetails,
  GetTable,
  RemoveFilter,
  SetColumnToDisplay
} from 'src/app/store/actions/bigOrderTable.actions';
import { filtersSelector, isFiltersAppliedSelector, locationsDetailsSelector } from 'src/app/store/selectors/big-order-table.selectors';
import { IAppState } from 'src/app/store/state/app.state';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';
import { IAlertInfo, IEditCell } from '../../models/edit-cell.model';
import { nonSortableColumns } from '../../models/non-sortable-columns.model';
import {
  IBigOrderTable,
  IBigOrderTableParams,
  ICityDetails,
  IColumnDTO,
  IDateFilters,
  IDistrictDetails,
  IFilteredColumn,
  IFilteredColumnValue,
  IFilters,
  ILocationDetails,
  IOrdersViewParameters
} from '../../models/ubs-admin.interface';
import { AdminTableService } from '../../services/admin-table.service';
import { TableHeightService } from '../../services/table-height.service';
import { TableColorKeys, TableKeys } from '../../services/table-keys.enum';
import { ColumnFiltersPopUpComponent } from '../shared/components/column-filters-pop-up/column-filters-pop-up.component';
import { defaultColumnsWidthPreference } from './ubs-admin-table-default-width';
import { UbsAdminTableExcelPopupComponent } from './ubs-admin-table-excel-popup/ubs-admin-table-excel-popup.component';

@Component({
  selector: 'app-ubs-admin-table',
  templateUrl: './ubs-admin-table.component.html',
  styleUrls: ['./ubs-admin-table.component.scss']
})
export class UbsAdminTableComponent implements OnInit, AfterViewChecked, OnDestroy {
  currentLang: string;
  nonSortableColumns = nonSortableColumns;
  sortingColumn: string;
  sortType: string;
  columns: IColumnDTO[] = [];
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  previousIndex: number;
  isLoading = true;
  editCellProgressBar: boolean;
  isUpdate = false;
  destroy: Subject<boolean> = new Subject<boolean>();
  arrowDirection: string;
  isTableHeightSet = false;
  tableData: any[];
  totalElements = 0;
  allElements: number;
  totalPages: number;
  currentPage = 0;
  currentDate: Date;
  currentDateStr: string;
  pageSize = 25;
  idsToChange: number[] = [];
  allChecked = false;
  tableViewHeaders = [];
  blockedInfo: IAlertInfo[] = [];
  isAllColumnsDisplayed: boolean;
  count: number;
  display = 'none';
  filterValue = '';
  isPopupOpen: boolean;
  stickyColumn = [];
  model: string;
  modelChanged: Subject<string> = new Subject<string>();
  previousSettings: string[];
  displayedColumnsView: IColumnDTO[] = [];
  displayedColumnsViewTitles: string[] = [];
  firstPageLoad: boolean;
  isStoreEmpty: boolean;
  isPostData = false;
  dataForPopUp = [];
  uneditableStatuses = [OrderStatus.CANCELED, OrderStatus.DONE, OrderStatus.BROUGHT_IT_HIMSELF];
  stickyColumnsAmount = 4;
  nestedSortProperty = 'title.key';
  noFiltersApplied = true;
  isFiltersOpened = false;
  isTimePickerOpened = false;
  showPopUp: boolean;
  mouseEvents = MouseEvents;
  cancellationReason: string;
  cancellationComment: string;
  @ViewChild(MatTable, { read: ElementRef }) private matTableRef: ElementRef;
  defaultColumnWidth = 120; // In px
  minColumnWidth = 100;
  columnsWidthPreference: Map<string, number>;
  restoredFilters = [];
  isRestoredFilters = false;
  dateForm: FormGroup;
  filters: IDateFilters[] = [];
  allFilters: IFilters;
  searchTerms: Record<string, string> = {};
  locationDetails: ILocationDetails[] = [];
  locationsForFiltering: Record<string, IFilteredColumnValue[]> = {};
  defaultColumnsWidth: Map<string, number> = new Map(Object.entries(defaultColumnsWidthPreference));
  bigOrderTable$ = this.store.select((state: IAppState): IBigOrderTable => state.bigOrderTable.bigOrderTable);
  bigOrderTableParams$ = this.store.select((state: IAppState): IBigOrderTableParams => state.bigOrderTable.bigOrderTableParams);
  ordersViewParameters$ = this.store.select((state: IAppState): IOrdersViewParameters => state.bigOrderTable.ordersViewParameters);
  isFiltersApplied$ = this.store.select(isFiltersAppliedSelector);

  constructor(
    private store: Store<IAppState>,
    private router: Router,
    private adminTableService: AdminTableService,
    private localStorageService: LocalStorageService,
    private tableHeightService: TableHeightService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private fb: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
  }

  ngOnInit() {
    this.firstPageLoad = true;
    this.initDateForm();
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy)).subscribe((lang) => {
      this.currentLang = lang;
      if (this.tableData) {
        this.formatTableData();
      }
    });

    this.currentDate = new Date();
    this.currentDateStr = this.adminTableService.setDateFormat(this.currentDate);

    this.modelChanged.pipe(debounceTime(500)).subscribe((model) => {
      this.currentPage = 0;
      this.tableData = [];
      this.getTable(model, 'id', 'DESC', true);
    });

    this.ordersViewParameters$.subscribe((items: IOrdersViewParameters) => {
      if (items) {
        this.displayedColumns = items.titles.split(',')[0] === ' ' ? [] : items.titles.split(',');
      }
    });

    this.isStoreEmpty = true;
    this.bigOrderTable$.subscribe((item) => {
      if (item) {
        if (this.isPostData) {
          this.idsToChange = [];
        }
        this.editCellProgressBar = false;
        this.allChecked = false;
        this.isStoreEmpty = false;
        this.currentPage = item.number;
        if (this.firstPageLoad) {
          this.firstPageLoad = false;
          this.totalElements = item[`totalElements`];
          this.tableData = JSON.parse(JSON.stringify(item[`content`]));
          this.allElements = !this.allElements ? this.totalElements : this.allElements;
          this.dataSource = new MatTableDataSource(this.tableData);
          this.isTableHeightSet = false;
        } else {
          const data = JSON.parse(JSON.stringify(item[`content`]));
          this.tableData = [...this.tableData, ...data.slice(this.tableData.length)];
          this.dataSource.data = this.tableData;
          this.isUpdate = false;
        }
        this.totalPages = item[`totalPages`];
        this.formatTableData();
        this.adminTableService.getUbsAdminOrdersTableColumnsWidthPreference().subscribe((res) => {
          this.columnsWidthPreference = new Map(Object.entries(res));
          setTimeout(() => this.applyColumnsWidthPreference(), 0);
        });
        this.isLoading = false;
      }
    });
    this.bigOrderTableParams$.subscribe((columns: IBigOrderTableParams) => {
      if (columns) {
        const columnsForFiltering: Array<IFilteredColumn> = [];
        this.tableViewHeaders = columns.columnBelongingList;
        this.columns = JSON.parse(JSON.stringify(columns.columnDTOList));
        this.displayedColumnsView = columns.columnDTOList;
        this.displayedColumnsViewTitles = this.displayedColumnsView.map((item) => item.title.key);
        this.columns.forEach((column) => {
          if (column.filtered) {
            const filteredColumn = {
              key: column.title.key,
              en: column.title.en,
              ua: column.title.ua,
              values: [...column.checked]
            };
            columnsForFiltering.push(filteredColumn);
          }
        });
        this.setColumnsForFiltering(columnsForFiltering);
        if (this.displayedColumns.length === 0) {
          this.setDisplayedColumns();
        }
        const { sortDirection, sortBy } = columns.page;
        if (this.isStoreEmpty) {
          this.getTable(this.filterValue, sortBy, sortDirection, true);
        }
        this.editDetails();
      }
      this.sortColumnsToDisplay();
      this.checkAllColumnsDisplayed();

      this.restoredFilters = this.localStorageService.getUbsAdminOrdersTableTitleColumnFilter();

      if (!this.restoredFilters.length) {
        this.isRestoredFilters = true;
      }

      if (this.restoredFilters && !this.isRestoredFilters && this.getColumnsForFiltering().length) {
        this.noFiltersApplied = false;

        this.restoredFilters.forEach((filter) => {
          if (Object.keys(filter).length < 2) {
            const column = this.adminTableService.changeColumnNameEqualToTable(Object.keys(filter)[0]);
            const isLocation = column === TableKeys.city || column === TableKeys.district;
            const value = String(Object.values(filter)[0]);
            const options: IFilteredColumnValue = isLocation ? { en: value } : { key: value };
            this.changeFilters(true, column, options);
            this.applyFilters();
          } else {
            const column = this.adminTableService.changeColumnNameEqualToTable(Object.keys(filter)[0].split('From')[0]);
            this.adminTableService.saveDateFilters(true, column, filter);
            this.adminTableService.setDateCheckedFromStorage(column);
            this.adminTableService.filters = [...this.adminTableService.filters, filter];
            this.localStorageService.setUbsAdminOrdersTableTitleColumnFilter(this.adminTableService.filters);
          }
        });
        this.isRestoredFilters = true;
      }
    });

    if (this.isStoreEmpty) {
      this.getColumns();
      this.store.dispatch(GetColumnToDisplay());
    }

    this.store.dispatch(GetLocationsDetails());

    this.store.pipe(select(locationsDetailsSelector), takeUntil(this.destroy)).subscribe((locations) => {
      this.locationDetails = locations;
      this.updateLocationsForFiltering();
    });
  }

  updateLocationsForFiltering(): void {
    columnsToFilterByName.forEach((columnName) => {
      this.locationsForFiltering[columnName] = this.getLocationsForFiltering(columnName);
    });
  }

  ngAfterViewChecked() {
    if (!this.isTableHeightSet) {
      const table = document.getElementById('table');
      const tableContainer = document.getElementById('table-container');
      this.isTableHeightSet = this.tableHeightService.setTableHeightToContainerHeight(table, tableContainer);
      if (!this.isTableHeightSet) {
        this.onScroll();
        this.isUpdate = false;
      }
    }
    this.cdr.detectChanges();
  }

  get isAllSelected(): boolean {
    const numRows = this.dataSource?.data.filter((row) => !this.checkStatusOfOrders(row.id)).length;

    return numRows && this.selection.selected.length === numRows;
  }

  get isIndeterminate(): boolean {
    return !!this.idsToChange.length && !this.isAllSelected;
  }

  initDateForm(): void {
    this.dateForm = this.fb.group({
      orderDateFrom: new FormControl(''),
      orderDateTo: new FormControl(''),
      orderDateCheck: new FormControl(false),
      dateOfExportFrom: new FormControl(''),
      dateOfExportTo: new FormControl(''),
      dateOfExportCheck: new FormControl(false),
      paymentDateFrom: new FormControl(''),
      paymentDateTo: new FormControl(''),
      paymentDateCheck: new FormControl(false)
    });
    this.initFiltersListener();
    this.filters = this.dateForm.value;
  }

  initFiltersListener(): void {
    this.store.pipe(takeUntil(this.destroy), select(filtersSelector), filter(Boolean)).subscribe((filters: IFilters) => {
      this.dateForm.patchValue(filters);
      this.filters = this.dateForm.value;
      this.allFilters = filters;
    });
  }

  getControlValue(column: string, suffix: string): string | boolean {
    return this.dateForm.get(`${column}${suffix}`).value;
  }

  checkAllColumnsDisplayed(): void {
    this.isAllColumnsDisplayed = this.displayedColumns.length === this.displayedColumnsView.length;
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
    this.modelChanged.next(filterValue);
    this.localStorageService.setAdminOrdersDateFilter(this.filters);
  }

  dropListDropped(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
    this.sortColumnsToDisplay();
    const displayedColumns = this.displayedColumns.join(',');
    this.store.dispatch(SetColumnToDisplay({ columns: encodeURIComponent(displayedColumns), titles: displayedColumns }));
    setTimeout(() => this.applyColumnsWidthPreference(), 0);
  }

  stickColumns() {
    this.stickyColumn = [];
    const displayedColumnsViewCopy = JSON.parse(JSON.stringify(this.displayedColumnsView));

    for (let i = 0; i < this.stickyColumnsAmount; i++) {
      this.stickyColumn.push(this.displayedColumns[i]);
    }

    displayedColumnsViewCopy.forEach((item) => {
      item.sticky = this.stickyColumn.includes(item.title.key);
    });

    this.displayedColumnsView = displayedColumnsViewCopy;
  }

  masterToggle(event: MatCheckboxChange): void {
    this.allChecked = event.checked;

    if (this.isAllSelected) {
      this.selection.clear();
      this.idsToChange.length = 0;

      return;
    }

    this.dataSource.data.forEach((row) => {
      if (!this.checkStatusOfOrders(row.id) && !this.idsToChange.includes(row.id)) {
        this.selection.select(row);
        this.idsToChange.push(row.id);
      }
    });
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  isStatus(row): string {
    switch (row.orderStatus) {
      case OrderStatus.CANCELED:
      case OrderStatus.BROUGHT_IT_HIMSELF:
        return TableColorKeys.GRAY_300;
      case OrderStatus.DONE:
        return TableColorKeys.GREEN_600;
      case OrderStatus.ADJUSTMENT:
        return TableColorKeys.YELLOW_500;
      case OrderStatus.CONFIRMED:
        return TableColorKeys.GREEN_500;
      case OrderStatus.ON_THE_ROUTE:
        return TableColorKeys.GREEN_200;
    }
  }

  showBlockedMessage(info): void {
    this.blockedInfo = info;

    const uniqUsers: string[] = [];
    const convertInfo = [];

    this.blockedInfo.forEach((item: IAlertInfo) => {
      if (!uniqUsers.includes(item.userName)) {
        uniqUsers.push(item.userName);
      }

      const index = this.dataSource.filteredData.findIndex((row) => row.id === item.orderId);
      this.selection.deselect(this.dataSource.filteredData[index]);

      if (this.idsToChange.includes(item.orderId)) {
        this.idsToChange = this.idsToChange.filter((id) => id !== item.orderId);
      }
    });

    uniqUsers.forEach((userName) => {
      let ids: number[] = [];
      this.blockedInfo.forEach((userInfo: IAlertInfo) => {
        if (userName === userInfo.userName) {
          ids.push(userInfo.orderId);
        }
      });
      convertInfo.push({ ordersId: ids, userName });
      ids = [];
    });
    this.blockedInfo = convertInfo;

    timer(7000)
      .pipe(take(1))
      .subscribe(() => {
        this.blockedInfo = [];
      });
  }

  changeColumns(checked: boolean, key: string, positionIndex): void {
    this.displayedColumns = checked
      ? [...this.displayedColumns.slice(0, positionIndex), key, ...this.displayedColumns.slice(positionIndex)]
      : this.displayedColumns.filter((item) => item !== key);
    this.checkAllColumnsDisplayed();
    this.sortColumnsToDisplay();
  }

  toggleFilters(): void {
    this.isFiltersOpened = !this.isFiltersOpened;
  }

  toggleTableView(): void {
    this.display = this.display === 'none' ? 'block' : 'none';
    this.isPopupOpen = !this.isPopupOpen;
    if (!this.isPopupOpen) {
      const displayedColumns = this.displayedColumns.join(',');
      this.store.dispatch(SetColumnToDisplay({ columns: encodeURIComponent(displayedColumns), titles: displayedColumns }));
    }
    this.previousSettings = this.displayedColumns;
  }

  showAllColumns(isCheckAll: boolean): void {
    isCheckAll ? this.setUnDisplayedColumns() : this.setDisplayedColumns();
  }

  private getColumns() {
    this.store.dispatch(GetColumns());
  }

  private getTable(filterValue: string, columnName = this.sortingColumn || 'id', sortingType = this.sortType || 'DESC', reset = true) {
    this.isLoading = true;
    this.store.dispatch(GetTable({ columnName, page: this.currentPage, filter: filterValue, size: this.pageSize, sortingType, reset }));
  }

  formatTableData() {
    const currency = {
      ua: 'грн',
      en: 'UAH'
    };

    this.tableData.forEach((row) => {
      const priceKeys = [TableKeys.amountDue, TableKeys.totalOrderSum, TableKeys.generalDiscount, TableKeys.totalPayment];
      for (const key of priceKeys) {
        row[key] = parseFloat(row[key]).toFixed(2) + ' ' + currency[this.currentLang];
      }
      const arr = row.orderCertificateCode?.split(', ');
      if (arr && arr.length > 0) {
        row.orderCertificatePoints = arr.reduce((res, elem) => {
          res = parseInt(res, 10);
          res += parseInt(elem, 10);
          return res ? res + '' : '';
        });
      }
    });
  }

  updateTableData() {
    this.isUpdate = true;
    this.store.dispatch(
      GetTable({
        columnName: this.sortingColumn || 'id',
        page: this.currentPage,
        filter: this.filterValue,
        size: this.pageSize,
        sortingType: this.sortType || 'DESC',
        reset: false
      })
    );
  }

  isLocationColumn(columnName: string): boolean {
    return columnsToFilterByName.includes(columnName);
  }

  onSearchTermChange(columnName: string, event: Event): void {
    this.searchTerms[columnName] = event.target['value'];

    this.locationsForFiltering[columnName] = this.getLocationsForFiltering(columnName);
  }

  getOptionsForFiltering(column: IFilteredColumn): IFilteredColumnValue[] {
    return this.isLocationColumn(column.key) ? this.locationsForFiltering[column.key] : column.values;
  }

  getLocationsForFiltering(columnName: string): IFilteredColumnValue[] {
    let locations = [];

    if (columnName === 'region') {
      locations = this.locationDetails;
    } else if (columnName === 'city') {
      locations = this.getCitiesForFiltering();
    } else if (columnName === 'district') {
      locations = this.getDistrictsForFiltering();
    }

    const term = this.searchTerms[columnName]?.toLowerCase() ?? '';
    return locations
      .filter((location) => location.nameEn.toLowerCase().includes(term) || location.nameUk.toLowerCase().includes(term))
      ?.slice(0, 100)
      .map((location) => ({ key: location.id, en: location.nameEn, ua: location.nameUa }));
  }

  getCitiesForFiltering(): ICityDetails[] {
    const filters = this.adminTableService.selectedFilters.region;
    const regionIds = Array.isArray(filters) ? this.getRegionIds(filters) : [];
    const cities = this.locationDetails.map((region) => region.cities).flat();

    return regionIds.length ? cities.filter((city) => regionIds.includes(city.regionId)) : cities;
  }

  getDistrictsForFiltering(): IDistrictDetails[] {
    const filters = this.adminTableService.selectedFilters.city;
    const cityIds = Array.isArray(filters) ? this.getCityIds(filters) : [];
    const districts = this.getCitiesForFiltering()
      .map((city) => city.districts)
      .flat();

    return cityIds.length ? districts.filter((district) => cityIds.includes(district.cityId)) : districts;
  }

  //Temporary solution, need to refactor after back-end is ready to filter locations by id
  private getRegionIds(names: string[]): number[] {
    return this.locationDetails.filter((location) => names.includes(location.nameEn)).map((location) => location.id);
  }

  //Temporary solution, need to refactor after back-end is ready to filter locations by id
  private getCityIds(names: string[]): number[] {
    return this.locationDetails
      .map((location) => location.cities)
      .flat()
      .filter((city) => names.includes(city.nameEn))
      .map((city) => city.id);
  }

  getSortingData(columnName, sortingType) {
    this.sortingColumn = columnName;
    this.sortType = sortingType;
    this.arrowDirection = this.arrowDirection === columnName ? null : columnName;
    this.currentPage = 0;
    this.firstPageLoad = true;
    this.getTable(this.filterValue, columnName, sortingType, true);
  }

  openExportExcel(): void {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(UbsAdminTableExcelPopupComponent, dialogConfig);
    const sortedOrders = this.tableData.filter((el) => this.idsToChange.includes(el.id));
    dialogRef.componentInstance.isElementSelected = !!sortedOrders.length;
    dialogRef.componentInstance.selectedElements = sortedOrders;
    dialogRef.componentInstance.totalElements = this.totalElements;
    dialogRef.componentInstance.allElements = this.allElements;
    dialogRef.componentInstance.sortingColumn = this.sortingColumn;
    dialogRef.componentInstance.sortType = this.sortType;
    dialogRef.componentInstance.search = this.filterValue;
    dialogRef.componentInstance.dataForTranslation = this.displayedColumnsView;
    dialogRef.componentInstance.columnToDisplay = this.displayedColumns;
    dialogRef.componentInstance.name = 'Orders-Table.xlsx';
  }

  onScroll() {
    const table = document.getElementById('table');
    const tableContainer = document.getElementById('table-container');
    this.tableHeightService.setTableHeightToContainerHeight(table, tableContainer);
    if (!this.isUpdate && this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.updateTableData();
    }
  }
  editDetails(): void {
    const keys: TableKeys[] = [
      TableKeys.receivingStation,
      TableKeys.responsibleDriver,
      TableKeys.responsibleCaller,
      TableKeys.responsibleLogicMan,
      TableKeys.responsibleNavigator
    ];
    this.displayedColumnsView
      .filter((el) => keys.includes(TableKeys[el.title.key as keyof typeof TableKeys]))
      .forEach((field) => this.dataForPopUp.push({ arrayData: field.checked, title: field.titleForSorting }));
  }
  // checks if all required fields is filled in
  openPopUpRequires(orderId?: number): void {
    const keysForEditDetails = [
      TableKeys.responsibleDriver,
      TableKeys.responsibleCaller,
      TableKeys.responsibleLogicMan,
      TableKeys.responsibleNavigator,
      TableKeys.dateOfExport,
      TableKeys.timeOfExport,
      TableKeys.receivingStation
    ];
    if (this.idsToChange.length === 0) {
      this.idsToChange.push(orderId);
    }
    let sortedOrders = this.tableData.filter((el) => this.idsToChange.includes(el.id));
    sortedOrders = sortedOrders
      .map((e) => keysForEditDetails.filter((elem) => e[elem] === null || e[elem] === ''))
      .filter((arrayList) => arrayList?.length !== 0);
    this.showPopUp = sortedOrders.length !== 0;
  }

  selectRowsToChange(event: MatCheckboxChange, row: any): void {
    this.selection.toggle(row);

    if (event.checked && !this.idsToChange.includes(row.id)) {
      this.idsToChange.push(row.id);
    } else {
      this.idsToChange = this.idsToChange.filter((item: number) => item !== row.id);
    }

    this.allChecked = this.isAllSelected;
  }

  editCell(e: IEditCell): void {
    if (this.allChecked) {
      this.editAll(e);
    } else if (this.idsToChange.length === 1) {
      this.editSingle(e);
    } else {
      this.editGroup(e);
    }
  }

  cancelEditCell(ids: number[]): void {
    this.adminTableService.cancelEdit(ids).subscribe();
    this.idsToChange = [];
    this.allChecked = false;
  }

  setIsTimePickerOpened(isOpened: boolean): void {
    this.isTimePickerOpened = isOpened;
  }

  closeAlertMess(): void {
    this.blockedInfo = [];
  }

  private setDisplayedColumns(): void {
    this.displayedColumnsView.forEach((column, index) => {
      this.displayedColumnsViewTitles[index] = column.title.key;
    });
    this.isAllColumnsDisplayed = true;
    this.displayedColumns = this.displayedColumnsViewTitles;
    this.count = this.displayedColumnsViewTitles.length;
    this.sortColumnsToDisplay();
  }
  private setUnDisplayedColumns(): void {
    this.displayedColumnsViewTitles = [];
    this.displayedColumns = ['select'];
    this.isAllColumnsDisplayed = false;
  }

  private editSingle(e: IEditCell): void {
    this.editCellProgressBar = true;
    const id = this.tableData.findIndex((item) => item.id === e.id);
    const newRow = { ...this.tableData[id], [e.nameOfColumn]: e.newValue };
    const newTableData = [...this.tableData.slice(0, id), newRow, ...this.tableData.slice(id + 1)];
    this.tableData = newTableData;
    this.dataSource = new MatTableDataSource(newTableData);
    this.openPopUpRequires(id);
    this.postData([e.id], e.nameOfColumn, e.newValue);
  }

  private editGroup(e: IEditCell): void {
    this.editCellProgressBar = true;
    const ids = [];
    let newTableDataCombine = this.tableData;

    for (const idIter of this.idsToChange) {
      const check = this.tableData.findIndex((item) => item.id === idIter);
      if (check > -1) {
        ids.push(check);
      }
    }

    for (const idGroup of ids) {
      const newRowGroup = { ...this.tableData[idGroup], [e.nameOfColumn]: e.newValue };
      newTableDataCombine = [...newTableDataCombine.slice(0, idGroup), newRowGroup, ...newTableDataCombine.slice(idGroup + 1)];
    }

    this.tableData = newTableDataCombine;
    this.dataSource = new MatTableDataSource(newTableDataCombine);
    this.postData(this.idsToChange, e.nameOfColumn, e.newValue);
  }

  addOrderCancellationData(orderCancellationData: { cancellationReason: string; cancellationComment: string | null }) {
    this.cancellationReason = orderCancellationData.cancellationReason;
    this.cancellationComment = orderCancellationData.cancellationComment;
  }

  private editAll(e: IEditCell): void {
    this.editCellProgressBar = true;
    const newTableData = this.tableData.map((item) => ({
      ...item,
      [e.nameOfColumn]: e.newValue
    }));
    this.tableData = newTableData;
    this.dataSource = new MatTableDataSource(newTableData);
    this.allChecked = false;
    this.idsToChange = [];
    this.editCellProgressBar = false;
    // empty array define that we change all in column
    this.postData([], e.nameOfColumn, e.newValue);
  }

  private postData(orderId: number[], columnName: string, newValue: string): void {
    const orderData = [{ orderId, columnName, newValue }];
    if (this.cancellationReason) {
      orderData.push({ orderId, columnName: TableKeys.cancellationReason, newValue: this.cancellationReason });
    }
    if (this.cancellationComment) {
      orderData.push({ orderId, columnName: TableKeys.cancellationComment, newValue: this.cancellationComment });
    }
    this.store.dispatch(ChangingOrderData({ orderData }));
    this.isPostData = true;
    this.cancellationReason = null;
    this.cancellationComment = null;
  }

  toggleAccordion(e: MouseEvent): void {
    (e.target as HTMLElement).parentElement.parentElement.querySelector('.accordion-collapse').classList.toggle('show');
    const matIcon = (e.target as HTMLElement).closest('div').querySelector('mat-icon');
    matIcon.textContent = matIcon.textContent === 'keyboard_arrow_down' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  openOrder(id: number): void {
    this.adminTableService.blockOrders([id]).subscribe();
    this.router
      .navigate(['ubs-admin', 'order', `${id}`])
      .then(() => {})
      .catch((error) => {
        console.error('Navigation error:', error);
      });
  }

  showTooltip(event, title, tooltip) {
    event.stopImmediatePropagation();

    const lengthStrUa = title.ua.split('').length;
    const lengthStrEn = title.en.split('').length;
    if ((this.currentLang === 'ua' && lengthStrUa > 17) || (this.currentLang === 'en' && lengthStrEn > 18)) {
      tooltip.toggle();
    }

    event.type === MouseEvents.MouseEnter ? this.calculateTextWidth(event, tooltip) : tooltip.hide();
  }

  calculateTextWidth(event, tooltip): void {
    const textContainerWidth = event.target.offsetWidth;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '14.8px Lato, sans-serif';
    const textWidth = Math.round(context.measureText(event.target.innerText).width);

    if (textContainerWidth < textWidth) {
      tooltip.show();
    }
  }

  getColumnsForFiltering() {
    return this.adminTableService.columnsForFiltering;
  }

  changeFilters(checked: boolean, currentColumn: string, option: IFilteredColumnValue): void {
    this.tableData = [];
    this.isLoading = true;
    const value = columnsToFilterByName.includes(currentColumn) ? option.en : option.key;

    checked
      ? this.store.dispatch(AddFilterMultiAction({ filter: { column: currentColumn, value }, fetchTable: true }))
      : this.store.dispatch(RemoveFilter({ filter: { column: currentColumn, value }, fetchTable: true }));
  }

  isChecked(columnName: string, option: IFilteredColumnValue): boolean {
    return this.adminTableService.isFilterChecked(columnName, option) || false;
  }

  onFilterChange(checked: boolean, currentColumn: string, option: IFilteredColumnValue): void {
    this.noFiltersApplied = false;
    this.adminTableService.setNewFilters(checked, currentColumn, option);

    if (columnsToFilterByName.includes(currentColumn)) {
      this.updateLocationsForFiltering();
    }
  }

  onDateChecked(event: MatCheckboxChange, checked: boolean, columnKey: string): void {
    this.adminTableService.setNewDateChecked(columnKey, checked);
    this.onDateChange(columnKey);
  }

  onDateChange(columnKey: string): void {
    this.noFiltersApplied = false;

    const dateFromValue = this.getControlValue(columnKey, 'From') as string;
    const dateToValue = this.getControlValue(columnKey, 'To') as string;
    const dateChecked = this.getControlValue(columnKey, 'Check') as boolean;

    const dateFrom = dateFromValue ? new Date(dateFromValue) : null;
    const dateTo = dateToValue ? new Date(dateToValue) : null;

    const swappedDates = this.adminTableService.swapDatesIfNeeded(dateFrom, dateTo, dateChecked);

    const swappedDateFrom = swappedDates ? swappedDates.dateFrom : dateFrom;
    const swappedDateTo = swappedDates ? swappedDates.dateTo : dateTo;

    this.dateForm.get(`${columnKey}From`)?.setValue(swappedDateFrom);
    this.dateForm.get(`${columnKey}To`)?.setValue(swappedDateTo);

    const formattedDateFrom = swappedDateFrom ? this.adminTableService.setDateFormat(swappedDateFrom) : '';
    const formattedDateTo = swappedDateTo ? this.adminTableService.setDateFormat(swappedDateTo) : '';

    this.adminTableService.setNewDateRange(columnKey, formattedDateFrom, formattedDateTo);
  }

  discardDateChanges(event: Event, columnKey: string, type: 'from' | 'to' | ''): void {
    event.stopPropagation();
    if (type === 'from' || type === '') {
      this.dateForm.get(`${columnKey}From`)?.setValue('');
    } else if (type === 'to' || type === '') {
      this.dateForm.get(`${columnKey}To`)?.setValue('');
    }

    this.onDateChange(columnKey);
  }

  clearFilters(): void {
    this.store.dispatch(ClearFilters({ fetchTable: true }));
    this.tableData = [];
    this.isLoading = true;
    const columnsForFiltering = this.adminTableService.columnsForFiltering;
    columnsForFiltering.forEach((column) => {
      column.values.forEach((value) => {
        value.filtered = false;
      });
    });
    this.setColumnsForFiltering(columnsForFiltering);
    this.dateForm.reset();
    this.initDateForm();
  }

  applyFilters(): void {
    const selectedFilters = this.adminTableService.selectedFilters;
    if (selectedFilters) {
      this.store.dispatch(AddFiltersAction({ filters: selectedFilters, fetchTable: false }));
    }

    this.currentPage = 0;
    this.firstPageLoad = true;
    this.getTable(this.filterValue, this.sortingColumn || 'id', this.sortType || 'DESC', true);
  }

  resetCurrentFilters(e: Event): void {
    e.stopPropagation();
    this.adminTableService.setCurrentFilters(this.allFilters);

    Object.keys(this.allFilters).forEach((key) => {
      if (key.endsWith('From') || key.endsWith('To')) {
        const controlKey = key.replace(/From|To/, '');
        const dateFrom = this.allFilters[controlKey + 'From'];
        const dateTo = this.allFilters[controlKey + 'To'];

        this.dateForm.get(controlKey + 'From')?.setValue(dateFrom ? new Date(dateFrom as string) : null);
        this.dateForm.get(controlKey + 'To')?.setValue(dateTo ? new Date(dateTo as string) : null);
        this.dateForm.get(controlKey + 'Check')?.setValue(this.allFilters[controlKey + 'Check']);
      }
    });
  }

  openColumnFilterPopup(event: MouseEvent, column) {
    const popupWidth = 350;
    const popupHeight = 400;
    const isDateFilter = column.title.key.toLowerCase().includes('date');
    const target = new ElementRef(event.target);
    const dialogRef = this.dialog.open(ColumnFiltersPopUpComponent, {
      panelClass: 'dropdown-menu',
      data: {
        trigger: target,
        isDateFilter,
        columnName: column.title.key,
        width: popupWidth,
        height: popupHeight,
        currentLang: this.currentLang
      }
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data && Array.isArray(data)) {
        const [buttonName] = data;
        if (buttonName === 'apply') {
          this.applyFilters();
        }
      }
    });
  }

  sortColumnsToDisplay() {
    const displayedColumnsCopy = JSON.parse(JSON.stringify(this.displayedColumns));
    const prop = this.nestedSortProperty.split('.');
    const len = prop.length;
    setTimeout(() => this.applyColumnsWidthPreference(), 0);
    this.columns.sort((a, b) => {
      let i = 0;
      while (i < len) {
        a = a[prop[i]];
        b = b[prop[i]];
        i++;
      }
      return displayedColumnsCopy.indexOf(a) - displayedColumnsCopy.indexOf(b);
    });

    this.checkAllColumnsDisplayed();
    if (!this.isAllColumnsDisplayed) {
      const undisplayedColumns = [];
      for (const column of this.columns) {
        if (!this.displayedColumns.includes(column.title.key)) {
          undisplayedColumns.push(column);
        }
      }
      undisplayedColumns.length =
        undisplayedColumns.length % this.columns.length >= 0 ? undisplayedColumns.length % this.columns.length : 0;
      for (let i = 0; i < undisplayedColumns.length; i++) {
        this.columns.push(this.columns[i]);
      }
      this.columns.splice(0, undisplayedColumns.length);
    }
    this.columns.forEach((item) => {
      item.index = this.columns.indexOf(item);
    });
    this.displayedColumnsView = this.columns;
    this.stickColumns();
  }

  onResizeColumn(event: MouseEvent, columnIndex: number): void {
    if (!this.isTimePickerOpened) {
      const resizeHandleWidth = 15;
      const resizeStartX = event.pageX;
      let lastStickyOffsetShift = 0;

      columnIndex = this.isResizingTargetColumn(event) ? columnIndex : columnIndex - 1;

      const {
        left: leftColumnBoundary,
        right: rightColumnBoundary,
        width: originalColumnWidth
      } = this.getColumnHeaderBoundaries(columnIndex);

      const isResizingLeft = resizeStartX <= leftColumnBoundary + resizeHandleWidth;
      const isResizingRight = resizeStartX >= rightColumnBoundary - resizeHandleWidth;

      if (!isResizingLeft && !isResizingRight) {
        return;
      }

      event.preventDefault();

      let newColumnWidth = originalColumnWidth;
      // eslint-disable-next-line prefer-const
      let cleanupMouseMoveFn;
      // eslint-disable-next-line prefer-const
      let cleanupMouseUpFn;

      const onMouseMove = (moveEvent) => {
        const movedToX = moveEvent.pageX;
        const diffX = isResizingRight ? movedToX - resizeStartX : -movedToX + resizeStartX;

        newColumnWidth = originalColumnWidth + diffX > 100 ? originalColumnWidth + diffX : 100;

        this.setColumnWidth(columnIndex, newColumnWidth);

        if (columnIndex < this.stickyColumnsAmount - 1) {
          const actualResize = newColumnWidth - originalColumnWidth;

          for (let i = columnIndex + 1; i < this.stickyColumnsAmount; i++) {
            this.shiftStickyColumnX(i, actualResize - lastStickyOffsetShift);
          }

          lastStickyOffsetShift = actualResize;
        }
      };
      const onMouseUp = () => {
        this.updateColumnsWidthPreference(columnIndex, newColumnWidth);
        cleanupMouseMoveFn();
        cleanupMouseUpFn();
      };
      cleanupMouseMoveFn = this.renderer.listen('document', 'mousemove', onMouseMove);
      cleanupMouseUpFn = this.renderer.listen('document', 'mouseup', onMouseUp);
    }
  }

  private isResizingTargetColumn(event: MouseEvent) {
    const column = event.target as HTMLElement;

    if (!column) {
      return;
    }

    const columnBounds = column.getBoundingClientRect();
    const columnMidpoint = columnBounds.left + columnBounds.width / 2;

    return event.clientX > columnMidpoint;
  }

  private getTableOffsetX(): number {
    return this.getColumnHeaderBoundaries(0)?.left;
  }

  private getColumnHeaderBoundaries(index: number) {
    const headerRow = this.matTableRef?.nativeElement.children[0];
    const cell = headerRow?.children[0]?.children[index];
    return cell?.getBoundingClientRect();
  }

  private setStickyColumnOffsetX(index: number, offset: number): void {
    // Relative to table start
    const columnKey = this.columns[index].title.key;
    const columnCells = Array.from(document.getElementsByClassName('mat-column-' + columnKey));
    columnCells.forEach((cell) => {
      this.renderer.setStyle(cell, 'left', `${offset}px`);
    });
  }

  private shiftStickyColumnX(index: number, shift: number): void {
    const columnKey = this.columns[index].title.key;
    const columnCells = Array.from(document.getElementsByClassName('mat-column-' + columnKey));
    columnCells.forEach((cell) => {
      const currentLeft = parseInt((cell as HTMLElement).style.left, 10) || 100;
      const newLeft = currentLeft + shift;
      this.renderer.setStyle(cell, 'left', `${newLeft}px`);
    });
  }

  private setColumnWidth(index: number, width: number): void {
    const columnKey = this.columns[index].title.key;
    const columnCells = Array.from(document.getElementsByClassName('mat-column-' + columnKey));
    columnCells.forEach((cell) => {
      this.renderer.setStyle(cell, 'width', `${width}px`);
    });
  }

  applyColumnsWidthPreference(): void {
    if (!this.columnsWidthPreference) {
      this.columnsWidthPreference = new Map();
    }
    for (const [idx, col] of this.columns.entries()) {
      const width = this.columnsWidthPreference.get(col.title.key) ?? this.defaultColumnWidth;
      this.setColumnWidth(idx, width);
    }
    const tableOffsetX = this.getTableOffsetX();
    if (tableOffsetX === undefined) {
      return;
    }
    for (let idx = 1; idx < this.stickyColumnsAmount; idx++) {
      const columnHeaderBoundaries = this.getColumnHeaderBoundaries(idx - 1);
      if (columnHeaderBoundaries) {
        this.setStickyColumnOffsetX(idx, columnHeaderBoundaries.right - tableOffsetX);
      }
    }
  }

  updateColumnsWidthPreference(columnIndex: number, newWidth: number) {
    const column: IColumnDTO = this.columns[columnIndex];
    column.weight = newWidth;
    if (!this.columnsWidthPreference) {
      this.columnsWidthPreference = new Map();
    }
    this.columnsWidthPreference.set(column.title.key, newWidth);
    this.adminTableService
      .setUbsAdminOrdersTableColumnsWidthPreference(this.columnsWidthPreference)
      .pipe(takeUntil(this.destroy))
      .subscribe();
  }

  setColumnsForFiltering(columns): void {
    this.adminTableService.setColumnsForFiltering(columns);
  }

  checkForCheckedBoxes(columnName: string): boolean {
    if (!this.allFilters) {
      return false;
    }

    const isFiltered = Object.keys(this.allFilters)?.some((key) => {
      if (!key.startsWith(columnName)) {
        return false;
      }

      if (Array.isArray(this.allFilters[key])) {
        return (this.allFilters[key] as string[])?.length > 0;
      } else {
        return true;
      }
    });

    if (!isFiltered) {
      return false;
    }

    return !!this.allFilters[columnName.toLowerCase().includes('date') ? `${columnName}From` : columnName];
  }

  checkIfFilteredBy(columnKey: string): boolean {
    let key: string;
    switch (columnKey) {
      case TableKeys.paymentDate:
        key = TableKeys.paymentDateFrom;
        break;
      case TableKeys.orderDate:
        key = TableKeys.orderDateFrom;
        break;
      case TableKeys.city:
        key = TableKeys.citiesEn;
        break;
      case TableKeys.district:
        key = TableKeys.districtsEn;
        break;
      default:
        key = columnKey;
        break;
    }
    return this.adminTableService.filters ? this.adminTableService.filters.some((obj) => Object.keys(obj)[0] === key) : false;
  }

  checkStatusOfOrders(id: number): boolean {
    return this.uneditableStatuses.includes(this.tableData.find((el) => el.id === id).orderStatus);
  }
  showTable(): string {
    return this.displayedColumns.length > 1 ? 'block' : 'none';
  }

  resetDefaultWidth(): void {
    this.showAllColumns(false);
    this.columnsWidthPreference = this.defaultColumnsWidth;
    for (let i = 1; i < this.columns.length - 1; i++) {
      const cols = document.querySelectorAll('.column_cell.ng-star-inserted');
      const col = cols[i - 1] as HTMLElement;
      const width = this.defaultColumnsWidth.get(this.columns[i].title.key);
      col.style.width = width + 'px';
    }
    this.applyColumnsWidthPreference();

    this.adminTableService.setUbsAdminOrdersTableColumnsWidthPreference(this.defaultColumnsWidth).pipe(takeUntil(this.destroy)).subscribe();
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
