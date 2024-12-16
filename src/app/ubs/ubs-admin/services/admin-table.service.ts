import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAlertInfo } from '../models/edit-cell.model';
import { environment } from '@environment/environment.js';
import { IBigOrderTable, IFilteredColumn, IFilteredColumnValue } from '../models/ubs-admin.interface';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import * as moment from 'moment';
import { MouseEvents } from 'src/app/shared/mouse-events';

@Injectable({
  providedIn: 'root'
})
export class AdminTableService {
  columnsForFiltering: IFilteredColumn[] = [];
  filters: any[] = [];
  url = environment.ubsAdmin.backendUbsAdminLink + '/management/';

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {}

  getTable(columnName?: string, page?: number, filter?: string, size?: number, sortingType?: string) {
    const searchValue = filter ? filter.split(' ').reduce((values, value) => (value ? values + `search=${value}&` : values), '') : '';
    const SORT_BY_AND_PAGE_NUMBER = `sortBy=${columnName}&pageNumber=${page}`;
    const SEARCH_AND_PAGE_SIZE_AND_DIRECTION = searchValue + `pageSize=${size}&sortDirection=${sortingType}`;
    const BASE_QUERY = `${this.url}bigOrderTable?${SORT_BY_AND_PAGE_NUMBER}&${SEARCH_AND_PAGE_SIZE_AND_DIRECTION}`;
    let filtersQuery = '';
    if (this.filters.length) {
      this.filters.forEach((elem) => {
        const objKeys = Object.keys(elem);
        if (objKeys.length === 1) {
          const key = objKeys[0];
          filtersQuery += `&${key}=${elem[key]}`;
        }
        if (objKeys.length === 2) {
          const keyFrom = objKeys[0].replace('From', '.from');
          const keyTo = objKeys[1].replace('To', '.to');
          const key1 = objKeys[0];
          const key2 = objKeys[1];
          filtersQuery += `&${keyFrom}=${elem[key1]}&${keyTo}=${elem[key2]}`;
        }
      });
    }
    return this.http.get<IBigOrderTable>(`${BASE_QUERY}${filtersQuery}`);
  }

  getColumns() {
    return this.http.get(`${this.url}tableParams`);
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

  public cancelEdit(ids: number[]) {
    return this.http.put(`${this.url}unblockOrders`, ids);
  }

  public howChangeCell(all: boolean, group: number[], single: number): number[] {
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

  public changeColumnNameEqualToEndPoint(column: string): string {
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

  public changeColumnNameEqualToTable(column: string): string {
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
    const currentColumnDateFilter = this.columnsForFiltering.find((column) => {
      return column.key === dateColumn;
    });
    return currentColumnDateFilter.values[0]?.filtered;
  }

  setDateFormat(date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  setDateCheckedFromStorage(dateColumn): void {
    const currentColumnDateFilter = this.columnsForFiltering.find((column) => {
      return column.key === dateColumn;
    });
    currentColumnDateFilter.values[0].filtered = true;
  }

  getDateValue(suffix: 'From' | 'To', dateColumn): boolean {
    let date;
    const currentColumnDateFilter = this.columnsForFiltering.find((column) => {
      return column.key === dateColumn;
    });
    for (const key in currentColumnDateFilter?.values[0]) {
      if (key.includes(suffix)) {
        date = currentColumnDateFilter?.values[0]?.[key];
      }
    }
    return date;
  }

  public saveDateFilters(checked, currentColumn, elem) {
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
    let todayDate: string;

    month = +month >= 10 ? month : `0${month}`;
    day = +day >= 10 ? day : `0${day}`;

    todayDate = `${year}-${month}-${day}`;

    return todayDate;
  }

  public setFilters(filters): void {
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

  showTooltip(event: MouseEvent, tooltip: any, font: string, maxLength = 50): void {
    event.stopImmediatePropagation();
    const target = event.target as HTMLElement;
    const lengthStr = target?.innerText.split('').length;
    if (lengthStr > maxLength) {
      tooltip.toggle();
    }

    event.type === MouseEvents.MouseEnter ? this.calculateTextWidth(event, tooltip, font) : tooltip.hide();
  }

  calculateTextWidth(event: MouseEvent, tooltip: any, font: string, maxLength = 40): void {
    const target = event.target as HTMLElement;
    const textContainerWidth = target?.offsetWidth;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const textWidth = Math.round(context.measureText(target?.innerText).width);
    if (textContainerWidth < textWidth || Math.abs(textContainerWidth - textWidth) < maxLength) {
      tooltip.show();
    }
  }

  setUbsAdminOrdersTableColumnsWidthPreference(preference: Map<string, number>) {
    const columnWidthDto = Object.fromEntries(preference.entries());
    return this.http.put(`${this.url}orderTableColumnsWidth`, columnWidthDto);
  }

  public getUbsAdminOrdersTableColumnsWidthPreference() {
    return this.http.get(`${this.url}orderTableColumnsWidth`);
  }
}
