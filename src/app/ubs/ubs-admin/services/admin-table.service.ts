import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAlertInfo } from '../models/edit-cell.model';
import { environment } from '@environment/environment.js';
import { IBigOrderTable, IFilteredColumn, IFilteredColumnValue } from '../models/ubs-admin.interface';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Injectable({
  providedIn: 'root'
})
export class AdminTableService {
  columnsForFiltering: IFilteredColumn[] = [];
  filters: any[] = [];
  url = environment.ubsAdmin.backendUbsAdminLink + '/management/';

  constructor(private http: HttpClient) {}

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
          const keyFrom = objKeys[0];
          const keyTo = objKeys[1];
          filtersQuery += `&${keyFrom}=${elem[keyFrom]}&${keyTo}=${elem[keyTo]}`;
        }
      });
    }
    return this.http.get<IBigOrderTable>(`${BASE_QUERY}${filtersQuery}`);
  }

  getColumns() {
    return this.http.get(`${this.url}tableParams`);
  }

  postData(orderId: number[], columnName: string, newValue: string) {
    return this.http.put(`${this.url}changingOrder`, {
      orderId,
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
      default:
        endPointColumnName = column;
        break;
    }
    return endPointColumnName;
  }

  changeFilters(checked: boolean, currentColumn: string, option: IFilteredColumnValue): void {
    const elem = {};
    const columnName = this.changeColumnNameEqualToEndPoint(currentColumn);
    this.columnsForFiltering.find((column) => {
      if (column.key === currentColumn) {
        column.values.find((value) => {
          if (value.key === option.key) {
            value.filtered = checked;
          }
        });
      }
    });
    this.setColumnsForFiltering(this.columnsForFiltering);
    if (checked) {
      elem[columnName] = option.key;
      this.filters = [...this.filters, elem];
    } else {
      this.filters = this.filters.filter((filteredElem) => filteredElem[columnName] !== option.key);
    }
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
      this.saveDateFilters(checked, currentColumn, elem);
    } else {
      this.filters = this.filters.filter((filteredElem) => !Object.keys(filteredElem).includes(`${keyNameFrom}`));
      this.saveDateFilters(checked, currentColumn, {});
    }
  }

  changeInputDateFilters(value: string, currentColumn: string, suffix: string): void {
    const columnName = this.changeColumnNameEqualToEndPoint(currentColumn);
    const keyToChange = `${columnName}${suffix}`;
    const filterToChange = this.filters.find((filter) => Object.keys(filter).includes(`${keyToChange}`));

    if (filterToChange) {
      filterToChange[keyToChange] = value;
      if (Date.parse(filterToChange[`${columnName}From`]) > Date.parse(filterToChange[`${columnName}To`])) {
        filterToChange[`${columnName}To`] = filterToChange[`${columnName}From`];
      }
      const elem = { ...filterToChange };
      this.saveDateFilters(true, currentColumn, elem);
    }
  }

  getDateChecked(dateColumn): boolean {
    const currentColumnDateFilter = this.columnsForFiltering.find((column) => {
      return column.key === dateColumn;
    });
    return currentColumnDateFilter.values[0]?.filtered;
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

  private saveDateFilters(checked, currentColumn, elem) {
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
}
