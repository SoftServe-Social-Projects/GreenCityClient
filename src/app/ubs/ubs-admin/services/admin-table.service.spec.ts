import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminTableService } from './admin-table.service';
import { environment } from '@environment/environment.js';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { IFilteredColumnValue } from '../models/ubs-admin.interface';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { OrderStatus } from '../../ubs/order-status.enum';

describe('AdminTableService', () => {
  let httpMock: HttpTestingController;
  let service: AdminTableService;
  let localStorageService: LocalStorageService;
  const urlMock = environment.ubsAdmin.backendUbsAdminLink + '/management';
  const isdMock = [1, 2, 3];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AdminTableService);
    localStorageService = TestBed.inject(LocalStorageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return table', () => {
    service.getTable('code', 0, '', 5, 'DESC').subscribe((data) => {
      expect(data).toBeDefined();
    });
    const req = httpMock.expectOne(`${urlMock}/bigOrderTable?sortBy=code&pageNumber=0&pageSize=5&sortDirection=DESC`);
    expect(req.request.method).toBe('GET');
  });

  it('should set objKeys if filters lengs 1', () => {
    service.filters = [{ filt: 'test' }];
    service.getTable('code', 0, '', 5, 'DESC');
    service.filters.forEach((el) => {
      const objKeys = Object.keys(el);
      expect(objKeys[0]).toBe('filt');
    });
  });

  it('should set objKeys if filters lengs 2', () => {
    service.filters = [{ paymentDateFrom: '2022-10-08', paymentDateTo: '2022-10-08' }];
    service.getTable('code', 0, '', 5, 'DESC');
    service.filters.forEach((el) => {
      const objKeys = Object.keys(el);
      expect(objKeys[0]).toBe('paymentDateFrom');
      expect(objKeys[1]).toBe('paymentDateTo');
    });
  });

  it('should return columns', () => {
    service.getColumns().subscribe((data) => {
      expect(data).toBeDefined();
    });
    const req = httpMock.expectOne(`${urlMock}/tableParams`);
    expect(req.request.method).toBe('GET');
  });

  it('blockOrders should be called', () => {
    service.blockOrders(isdMock).subscribe((data) => {
      expect(data).toBeDefined();
    });
    const req = httpMock.expectOne(`${urlMock}/blockOrders`);
    expect(req.request.method).toBe('PUT');
  });

  it('should put data according to order id and column', () => {
    service.postData([3000], 'orderStatus', 'Changed').subscribe((data) => {
      expect(data).toBeDefined();
    });
    const req = httpMock.expectOne(`${urlMock}/changingOrder`);
    expect(req.request.method).toBe('PUT');
  });

  it('cancelEdit should be called', () => {
    service.cancelEdit(isdMock).subscribe((data) => {
      expect(data).toBeDefined();
    });
    const req = httpMock.expectOne(`${urlMock}/unblockOrders`);
    expect(req.request.method).toBe('PUT');
  });

  it('should return [] when howChangeCell is called', () => {
    const change = service.howChangeCell(true, [], null);
    expect(change).toEqual([]);
  });
  it('should return group with numbers when howChangeCell is called', () => {
    const change = service.howChangeCell(false, [1, 2], null);
    expect(change).toEqual([1, 2]);
  });
  it('should return singhle number when howChangeCell is called', () => {
    const change = service.howChangeCell(false, [], 3);
    expect(change).toEqual([3]);
  });

  it('should return column equal to table names', () => {
    const columns = [
      'deliveryDate',
      'responsibleDriverId',
      'responsibleNavigatorId',
      'responsibleCallerId',
      'responsibleLogicManId',
      'orderStatus',
      'citiesEn',
      'districtsEn'
    ];
    const mockedColumns = [
      'dateOfExport',
      'responsibleDriver',
      'responsibleNavigator',
      'responsibleCaller',
      'responsibleLogicMan',
      'orderStatus',
      'city',
      'district'
    ];

    columns.forEach((column) => {
      const change = service.changeColumnNameEqualToTable(column);
      expect(change).toEqual(mockedColumns[columns.indexOf(column)]);
    });
  });

  it('should return column equal to endpont names', () => {
    const columns = [
      'dateOfExport',
      'responsibleDriver',
      'responsibleNavigator',
      'responsibleCaller',
      'responsibleLogicMan',
      'orderStatus',
      'city',
      'district'
    ];
    const mockedColumns = [
      'deliveryDate',
      'responsibleDriverId',
      'responsibleNavigatorId',
      'responsibleCallerId',
      'responsibleLogicManId',
      'orderStatus',
      'citiesEn',
      'districtsEn'
    ];

    columns.forEach((column) => {
      const change = service.changeColumnNameEqualToEndPoint(column);
      expect(change).toEqual(mockedColumns[columns.indexOf(column)]);
    });
  });

  it('should set as checked column', () => {
    const column = 'orderStatus';
    service.columnsForFiltering = [
      {
        en: 'Order status',
        key: 'orderStatus',
        ua: 'Статус замовлення',
        values: [
          { en: 'Formed', filtered: false, key: OrderStatus.FORMED, ua: 'Сформовано' },
          { en: 'Canceled', filtered: false, key: OrderStatus.CANCELED, ua: 'Скасовано' },
          { en: 'Completed', filtered: false, key: OrderStatus.DONE, ua: 'Завершено' }
        ]
      }
    ];

    const currentColumnDateFilter = service.columnsForFiltering.find((col) => {
      return col.key === column;
    });
    service.setDateCheckedFromStorage(column);
    expect(currentColumnDateFilter.values[0].filtered).toBeTruthy();
  });

  it('method changeFilters should set value to localStorageService', () => {
    let option: IFilteredColumnValue;
    option = { key: OrderStatus.FORMED, ua: 'Сформовано', en: 'Formed', filtered: false };
    service.changeFilters(true, 'orderStatus', option);
    expect(localStorageService.getUbsAdminOrdersTableTitleColumnFilter()).toContain({ orderStatus: option.key });
  });

  it('should set isLocation', () => {
    let currentColumn = 'orderStatus';
    let isLocation = currentColumn === 'citiesEn';
    expect(isLocation).toBeFalsy();
    currentColumn = 'citiesEn';
    isLocation = currentColumn === 'citiesEn';
    expect(isLocation).toBeTruthy();
    currentColumn = 'districtsEn';
    isLocation = currentColumn === 'districtsEn';
    expect(isLocation).toBeTruthy();
  });

  it('should call changeDateFilters', () => {
    spyOn(service, 'changeDateFilters');
    const event = new MatCheckboxChange();
    service.changeDateFilters(event, true, 'dateColumn');
    expect(service.changeDateFilters).toHaveBeenCalledWith(event, true, 'dateColumn');
  });

  it('should call changeInputDateFilters', () => {
    spyOn(service, 'changeInputDateFilters');
    const value = '2022-10-12';
    const currentColumn = 'orderDate';
    const suffix = 'From';
    const check = false;
    service.changeInputDateFilters(value, currentColumn, suffix, check);
    expect(service.changeInputDateFilters).toHaveBeenCalledWith('2022-10-12', 'orderDate', 'From', false);
  });

  it('should call changeColumnNameEqualToEndPoint on changeInputDateFilters', () => {
    spyOn(service, 'changeColumnNameEqualToEndPoint');
    service.changeInputDateFilters('2022-10-12', 'paymentDate', 'To', false);
    expect(service.changeColumnNameEqualToEndPoint).toHaveBeenCalledWith('paymentDate');
  });

  it('should set columnName on changeInputDateFilters', () => {
    const currentColumn = 'dateOfExport';
    const suffix = 'To';
    const column = service.changeColumnNameEqualToEndPoint(currentColumn);
    const convColumn = `${column}${suffix}`;
    service.changeInputDateFilters('2022-10-12', currentColumn, 'To', false);
    expect(column).toBe('deliveryDate');
    expect(convColumn).toBe('deliveryDateTo');
  });

  it('should set elem keyNameFrom value on changeInputDateFilters', () => {
    const value = '2022-10-01';
    service.changeInputDateFilters(value, 'orderDate', 'From', false);
    const elem = {};
    const keyNameFrom = 'orderDateFrom';
    elem[keyNameFrom] = value;
    expect(elem).toEqual({ orderDateFrom: '2022-10-01' });
  });

  it('should set elem keyNameTo value on changeInputDateFilters', () => {
    const value = '2022-10-12';
    service.changeInputDateFilters(value, 'deliveryDate', 'From', false);
    const elem = {};
    const keyNameTo = 'deliveryDateTo';
    elem[keyNameTo] = value;
    expect(elem).toEqual({ deliveryDateTo: '2022-10-12' });
  });

  it('changeInputDateFilters should set keyNameFrom value', () => {
    const currentColumn = 'orderDate';
    const suffix = 'From';
    service.changeInputDateFilters('2022-10-12', currentColumn, suffix, false);
    const keyNameFrom = `${currentColumn}From`;
    expect(keyNameFrom).toBe('orderDateFrom');
  });

  it('changeInputDateFilters should set keyNameTo value', () => {
    const currentColumn = 'orderDate';
    const suffix = 'To';
    service.changeInputDateFilters('2022-10-12', currentColumn, suffix, false);
    const keyNameTo = `${currentColumn}To`;
    expect(keyNameTo).toBe('orderDateTo');
  });

  it('should set filterToChange on changeInputDateFilters', () => {
    const value = '2022-10-12';
    const currentColumn = 'orderDate';
    const suffix = 'From';
    spyOn(service, 'saveDateFilters');
    service.changeInputDateFilters(value, currentColumn, suffix, false);
    const keyToChange = 'orderDateFrom';
    service.filters = [{ orderDateFrom: '2022-10-08' }];
    const filterToChange = service.filters.find((filter) => Object.keys(filter).includes(keyToChange));
    expect(filterToChange).toEqual({ orderDateFrom: '2022-10-08' });
    expect(service.saveDateFilters).toHaveBeenCalledWith(true, 'orderDate', [{ orderDateFrom: '2022-10-12', orderDateTo: '2022-10-12' }]);
  });

  it('should set filterToChange undefined on changeInputDateFilters', () => {
    const value = '2022-10-12';
    spyOn(service, 'saveDateFilters');
    service.changeInputDateFilters(value, 'orderDate', 'To', false);
    service.filters = [{ orderDateFrom: '2022-10-08' }];
    const keyToChange = 'orderDateTo';
    const filterToChange = service.filters.find((filter) => Object.keys(filter).includes(keyToChange));
    expect(filterToChange).toEqual(undefined);
    expect(service.saveDateFilters).toHaveBeenCalledWith(true, 'orderDate', [{ orderDateFrom: '2022-10-12', orderDateTo: '2022-10-12' }]);
  });

  it('should push el on changeInputDateFilters', () => {
    spyOn(service, 'saveDateFilters');
    service.filters = [{ orderDateFrom: '2022-10-08' }];
    const el = { order: '2022' };
    service.filters.push(el);
    expect(service.filters).toEqual([{ orderDateFrom: '2022-10-08' }, { order: '2022' }]);
    expect(service.filters.length).toBe(2);
    service.saveDateFilters(true, 'orderDate', service.filters);
    expect(service.saveDateFilters).toHaveBeenCalledWith(true, 'orderDate', [{ orderDateFrom: '2022-10-08' }, { order: '2022' }]);
  });

  it('should url mock be equal url', () => {
    expect(service.url).toEqual(urlMock + '/');
  });

  it('getDateValue expect getDateValue shoud be call', () => {
    spyOn(service, 'getDateValue');
    service.getDateValue('From', 'dateColumn');
    expect(service.getDateValue).toHaveBeenCalledWith('From', 'dateColumn');
  });

  it('should convert date format by setDateFormat', () => {
    const date = 'Mon Nov 28 2022 13:01:36 GMT+0200 (за східноєвропейським стандартним часом)';
    const convertedDate = service.setDateFormat(date);
    expect(convertedDate).toBe('2022-11-28');
  });

  it('should call local storage setUbsAdminOrdersTableTitleColumnFilter method', () => {
    spyOn(localStorageService, 'setUbsAdminOrdersTableTitleColumnFilter');
    const filters = [{ orderDate: '2022-10-12' }];
    localStorageService.setUbsAdminOrdersTableTitleColumnFilter(filters);
    expect(localStorageService.setUbsAdminOrdersTableTitleColumnFilter).toHaveBeenCalledWith([{ orderDate: '2022-10-12' }]);
  });

  it('saveDateFilters should be call', () => {
    spyOn(service, 'saveDateFilters');
    service.saveDateFilters(true, 'dateColumn', 'From');
    expect(service.saveDateFilters).toHaveBeenCalledWith(true, 'dateColumn', 'From');
  });

  it('getDateChecked should be call', () => {
    spyOn(service, 'getDateChecked');
    service.getDateChecked('dateColumn');
    expect(service.getDateChecked).toHaveBeenCalledWith('dateColumn');
  });

  it('should set column width preferences', () => {
    const preference = new Map<string, number>([
      ['column1', 100],
      ['column2', 200]
    ]);
    service.setUbsAdminOrdersTableColumnsWidthPreference(preference).subscribe((data) => {
      expect(data).toBeDefined();
    });

    const req = httpMock.expectOne(`${urlMock}/orderTableColumnsWidth`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      column1: 100,
      column2: 200
    });
  });

  it('should get column width preferences', () => {
    const preference = {
      column1: 100,
      column2: 200
    };
    service.getUbsAdminOrdersTableColumnsWidthPreference().subscribe((data) => {
      expect(data).toBeDefined();
      expect(data).toEqual(preference);
    });

    const req = httpMock.expectOne(`${urlMock}/orderTableColumnsWidth`);
    expect(req.request.method).toBe('GET');
    req.flush(preference);
  });
});
