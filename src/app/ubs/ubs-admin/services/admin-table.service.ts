import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAlertInfo } from '../models/edit-cell.model';
import { environment } from '@environment/environment';
import { IBigOrderTable, IFilteredColumn, IFilteredColumnValue, IFilters, ILocationDetails } from '../models/ubs-admin.interface';
import { columnsToFilterByName } from '@ubs/ubs-admin/models/columns-to-filter-by-name';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import moment from 'moment';
import { Observable } from 'rxjs';
import { MouseEvents } from 'src/app/shared/mouse-events';

const columnMapping: { [key: string]: string } = {
  dateOfExportFrom: 'deliveryDate.from',
  dateOfExportTo: 'deliveryDate.to',
  responsibleDriver: 'responsibleDriverId',
  responsibleNavigator: 'responsibleNavigatorId',
  responsibleCaller: 'responsibleCallerId',
  responsibleLogicMan: 'responsibleLogicManId',
  city: 'citiesEn',
  district: 'districtsEn',
  region: 'regionEn'
};
@Injectable({
  providedIn: 'root'
})
export class AdminTableService {
  columnsForFiltering: IFilteredColumn[] = [];
  filters: any[] = [];
  selectedFilters: IFilters = {};
  url = environment.ubsAdmin.backendUbsAdminLink + '/management/';

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  getTable(columnName?: string, page?: number, filter?: string, size?: number, sortingType?: string, filters?: IFilters) {
    const searchValue = filter ? filter.split(' ').reduce((values, value) => (value ? values + `search=${value}&` : values), '') : '';
    const SORT_BY_AND_PAGE_NUMBER = `sortBy=${columnName}&pageNumber=${page}`;
    const SEARCH_AND_PAGE_SIZE_AND_DIRECTION = searchValue + `pageSize=${size}&sortDirection=${sortingType}`;
    const BASE_QUERY = `${this.url}bigOrderTable?${SORT_BY_AND_PAGE_NUMBER}&${SEARCH_AND_PAGE_SIZE_AND_DIRECTION}`;

    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          params = params.append(this.convertToEndpointName(key), value);
        } else if (Array.isArray(value)) {
          const endpointName = this.convertToEndpointName(key);
          value.forEach((val) => {
            params = params.append(endpointName, val);
          });
        }
      });
    }
    return this.http.get<IBigOrderTable>(BASE_QUERY, { params });
  }

  getColumns() {
    return this.http.get(`${this.url}tableParams`);
  }

  getLocations(): Observable<ILocationDetails[]> {
    return this.http.get<ILocationDetails[]>(`${this.url}locations-details`);
  }

  postData(orderIdsList: number[], columnName: string, newValue: string) {
    return this.http.put(`${this.url}changingOrder`, {
      orderIdsList,
      columnName,
      newValue
    });
  }

  blockOrders(ids: number[]) {
    return this.http.put<IAlertInfo[]>(`${this.url}blockOrders`, ids);
  }

  unblockOrders(ids: number[]): Observable<number[]> {
    return this.http.put<number[]>(`${this.url}unblockOrders`, ids);
  }

  cancelEdit(ids: number[]) {
    return this.http.put(`${this.url}unblockOrders`, ids);
  }

  howChangeCell(all: boolean, group: number[], single: number): number[] {
    if (all) {
      return [];
    }
    if (group.length) {
      return group;
    }
    if (!all && !group.length) {
      return [single];
    }
  }

  setColumnsForFiltering(columns): void {
    this.columnsForFiltering = columns;
  }

  convertToEndpointName(column: string): string {
    return columnMapping[column] || column.replace('From', '.from').replace('To', '.to');
  }

  changeColumnNameEqualToEndPoint(column: string): string {
    let endPointColumnName: string;
    switch (column) {
      case 'dateOfExport':
        endPointColumnName = 'deliveryDate';
        break;
      case 'responsibleDriver':
        endPointColumnName = 'responsibleDriverId';
        break;
      case 'responsibleNavigator':
        endPointColumnName = 'responsibleNavigatorId';
        break;
      case 'responsibleCaller':
        endPointColumnName = 'responsibleCallerId';
        break;
      case 'responsibleLogicMan':
        endPointColumnName = 'responsibleLogicManId';
        break;
      case 'city':
        endPointColumnName = 'citiesEn';
        break;
      case 'district':
        endPointColumnName = 'districtsEn';
        break;
      default:
        endPointColumnName = column;
        break;
    }
    return endPointColumnName;
  }

  changeColumnNameEqualToTable(column: string): string {
    let tableColumnName: string;
    switch (column) {
      case 'deliveryDate':
        tableColumnName = 'dateOfExport';
        break;
      case 'responsibleDriverId':
        tableColumnName = 'responsibleDriver';
        break;
      case 'responsibleNavigatorId':
        tableColumnName = 'responsibleNavigator';
        break;
      case 'responsibleCallerId':
        tableColumnName = 'responsibleCaller';
        break;
      case 'responsibleLogicManId':
        tableColumnName = 'responsibleLogicMan';
        break;
      case 'citiesEn':
        tableColumnName = 'city';
        break;
      case 'districtsEn':
        tableColumnName = 'district';
        break;
      default:
        tableColumnName = column;
        break;
    }
    return tableColumnName;
  }

  isFilterChecked(columnName: string, option: IFilteredColumnValue): boolean {
    const value = columnsToFilterByName.includes(columnName) ? option.en : option.key;
    return (this.selectedFilters?.[columnName] as string[])?.includes(value);
  }

  setCurrentFilters(filters: IFilters): void {
    this.selectedFilters = { ...filters } as { [key: string]: string[] };
  }

  setNewFilters(checked: boolean, currentColumn: string, option: IFilteredColumnValue): void {
    const value = columnsToFilterByName.includes(currentColumn) ? option.en : option.key;

    const currentFilters = Array.isArray(this.selectedFilters[currentColumn]) ? (this.selectedFilters[currentColumn] as string[]) : [];

    const updatedFilters = checked ? [...currentFilters, value] : currentFilters.filter((item) => item !== value);

    this.selectedFilters = {
      ...this.selectedFilters,
      [currentColumn]: updatedFilters
    };
  }

  setNewDateChecked(columnName: string, checked: boolean): void {
    this.selectedFilters[columnName + 'Check'] = checked ? true : false;
  }

  setNewDateRange(columnName: string, dateFrom: string, dateTo: string): void {
    this.selectedFilters[columnName + 'From'] = dateFrom;
    this.selectedFilters[columnName + 'To'] = dateTo;
  }

  swapDatesIfNeeded(dateFrom: Date | null, dateTo: Date | null, dateChecked: boolean): { dateFrom: Date | null; dateTo: Date | null } {
    if (dateChecked && dateFrom?.getTime() > dateTo?.getTime()) {
      return { dateFrom: dateTo, dateTo: dateFrom };
    } else if (!dateChecked) {
      return { dateFrom: dateFrom, dateTo: dateFrom };
    }
    return null;
  }

  changeFilters(checked: boolean, currentColumn: string, option: IFilteredColumnValue): void {
    const elem = {};
    const columnName = this.changeColumnNameEqualToEndPoint(currentColumn);
    const isLocation = columnName === 'citiesEn' || columnName === 'districtsEn';
    this.columnsForFiltering.find((column) => {
      if (column.key === currentColumn) {
        column.values.find((value) => {
          if (value.key === option.key || value.en === option.en) {
            value.filtered = checked;
          }
        });
      }
    });
    this.setColumnsForFiltering(this.columnsForFiltering);
    if (checked) {
      elem[columnName] = isLocation ? option.en : option.key;
      this.filters = [...this.filters, elem];
    } else {
      this.filters = this.filters.filter((filteredElem) => filteredElem[columnName] !== (isLocation ? option.en : option.key));
    }
    this.localStorageService.setUbsAdminOrdersTableTitleColumnFilter(this.filters);
  }

  changeDateFilters(e: MatCheckboxChange, checked: boolean, currentColumn: string): void {
    const elem = {};
    const columnName = this.changeColumnNameEqualToEndPoint(currentColumn);
    const keyNameFrom = `${columnName}From`;
    const keyNameTo = `${columnName}To`;
    const checkboxParent = (e.source._elementRef.nativeElement as HTMLElement).parentElement;
    const inputDateFrom = checkboxParent.querySelector(`#dateFrom${currentColumn}`) as HTMLInputElement;
    const inputDateTo = checkboxParent.querySelector(`#dateTo${currentColumn}`) as HTMLInputElement;
    const dateFrom = inputDateFrom.value;
    let dateTo = inputDateTo.value;

    if (!dateTo) {
      dateTo = this.getTodayDate();
    }

    if (Date.parse(dateFrom) > Date.parse(dateTo)) {
      dateTo = dateFrom;
    }

    if (checked) {
      elem[keyNameFrom] = dateFrom;
      elem[keyNameTo] = dateTo;
      this.filters.push(elem);
      this.localStorageService.setUbsAdminOrdersTableTitleColumnFilter(this.filters);

      this.saveDateFilters(checked, currentColumn, elem);
    } else {
      this.filters = this.filters.filter((filteredElem) => !Object.keys(filteredElem).includes(`${keyNameFrom}`));
      this.saveDateFilters(checked, currentColumn, {});
    }
  }

  changeInputDateFilters(value: string, currentColumn: string, suffix: string, check?: boolean): void {
    const elem = {};
    const columnName = this.changeColumnNameEqualToEndPoint(currentColumn);
    elem[`${columnName}From`] = value;
    elem[`${columnName}To`] = value;
    const keyToChange = `${columnName}${suffix}`;
    const filterToChange = this.filters.find((filter) => Object.keys(filter).includes(`${keyToChange}`));

    if (filterToChange) {
      filterToChange[keyToChange] = value;
      if (Date.parse(filterToChange[`${columnName}From`]) > Date.parse(filterToChange[`${columnName}To`]) && suffix === 'From') {
        filterToChange[`${columnName}To`] = filterToChange[`${columnName}From`];
      }
      if (Date.parse(filterToChange[`${columnName}To`]) < Date.parse(filterToChange[`${columnName}From`]) && suffix === 'To') {
        filterToChange[`${columnName}From`] = filterToChange[`${columnName}To`];
      }
      const element = { ...filterToChange };
      this.saveDateFilters(true, columnName, element);
      this.localStorageService.setUbsAdminOrdersTableTitleColumnFilter(this.filters);
    } else {
      this.filters.push(elem);
      this.saveDateFilters(true, columnName, this.filters);
      this.localStorageService.setUbsAdminOrdersTableTitleColumnFilter(this.filters);
    }
  }

  getDateChecked(dateColumn): boolean {
    const currentColumnDateFilter = this.columnsForFiltering.find((column) => column.key === dateColumn);
    return currentColumnDateFilter.values[0]?.filtered;
  }

  setDateFormat(date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  convertDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  setDateCheckedFromStorage(dateColumn): void {
    const currentColumnDateFilter = this.columnsForFiltering.find((column) => column.key === dateColumn);
    currentColumnDateFilter.values[0].filtered = true;
  }

  getDateValue(suffix: 'From' | 'To', dateColumn): boolean {
    let date;
    const currentColumnDateFilter = this.columnsForFiltering.find((column) => column.key === dateColumn);
    for (const key in currentColumnDateFilter?.values[0]) {
      if (key.includes(suffix)) {
        date = currentColumnDateFilter?.values[0]?.[key];
      }
    }
    return date;
  }

  saveDateFilters(checked, currentColumn, elem) {
    this.columnsForFiltering.forEach((column) => {
      if (column.key === currentColumn) {
        column.values = [{ ...elem, filtered: checked }];
      }
    });
  }

  private getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    let month = (today.getMonth() + 1).toString();
    let day = today.getDate().toString();

    month = +month >= 10 ? month : `0${month}`;
    day = +day >= 10 ? day : `0${day}`;

    const todayDate = `${year}-${month}-${day}`;

    return todayDate;
  }

  setFilters(filters): void {
    this.filters = filters;
  }

  clearColumnFilters(column: string): void {
    const colName = this.changeColumnNameEqualToEndPoint(column);
    this.columnsForFiltering.forEach((col) => {
      if (col.key === colName) {
        col.values.forEach((value) => {
          value.filtered = false;
        });
      }
    });
    this.filters = this.filters.filter((filteredElem) => !filteredElem[colName]);
  }

  showTooltip(event: any, tooltip: any, font: string, maxLength = 50): void {
    event.stopImmediatePropagation();
    const lengthStr = event.target?.innerText.split('').length;
    if (lengthStr > maxLength) {
      tooltip.toggle();
    }

    event.type === MouseEvents.MouseEnter ? this.calculateTextWidth(event, tooltip, font) : tooltip.hide();
  }

  calculateTextWidth(event: any, tooltip: any, font: string, maxLength = 40): void {
    const textContainerWidth = event.target.offsetWidth;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const textWidth = Math.round(context.measureText(event.target.innerText).width);
    if (textContainerWidth < textWidth || Math.abs(textContainerWidth - textWidth) < maxLength) {
      tooltip.show();
    }
  }

  setUbsAdminOrdersTableColumnsWidthPreference(preference: Map<string, number>) {
    const columnWidthDto = Object.fromEntries(preference.entries());
    return this.http.put(`${this.url}orderTableColumnsWidth`, columnWidthDto);
  }

  getUbsAdminOrdersTableColumnsWidthPreference() {
    return this.http.get(`${this.url}orderTableColumnsWidth`);
  }
}
