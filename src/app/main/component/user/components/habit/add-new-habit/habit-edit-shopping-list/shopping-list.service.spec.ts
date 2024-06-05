import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ShoppingListService } from './shopping-list.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '@environment/environment';
import {
  ALLUSERSHOPLISTS,
  CUSTOMSHOPITEM,
  SHOPLIST,
  SHOPLISTITEMONE,
  SHOPLISTITEMTWO,
  UPDATEHABITSHOPLIST
} from '../../mocks/shopping-list-mock';

describe('ShoppingListService', () => {
  let service: ShoppingListService;
  let httpMock: HttpTestingController;

  const mainLink = environment.backendLink;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [ShoppingListService, TranslateService]
    });

    service = TestBed.inject(ShoppingListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return allShopList by habitId on getHabitAllShopLists', () => {
    service.getHabitAllShopLists(2, 'en').subscribe((data) => {
      expect(data).toEqual(ALLUSERSHOPLISTS);
    });

    const req = httpMock.expectOne(`${mainLink}habit/assign/2/allUserAndCustomList?lang=en`);
    expect(req.request.responseType).toEqual('json');
    expect(req.request.method).toBe('GET');
    req.flush(ALLUSERSHOPLISTS);
  });

  it('should return all user shopList by lang on getUserShoppingLists', () => {
    service.getUserShoppingLists('ua').subscribe((data) => {
      expect(data).toEqual([ALLUSERSHOPLISTS]);
    });

    const req = httpMock.expectOne(`${mainLink}habit/assign/allUserAndCustomShoppingListsInprogress?lang=ua`);
    expect(req.request.responseType).toEqual('json');
    expect(req.request.method).toBe('GET');
    req.flush([ALLUSERSHOPLISTS]);
  });

  it('should update Standard Shop Item Status', () => {
    service.updateStandardShopItemStatus(SHOPLISTITEMTWO, 'ua').subscribe((data) => {
      expect(data).toEqual([SHOPLISTITEMTWO]);
    });
    const req = httpMock.expectOne(`${mainLink}user/shopping-list-items/2/status/INPROGRESS?lang=ua`);
    expect(req.request.method).toBe('PATCH');
    req.flush([SHOPLISTITEMTWO]);
  });

  it('should update Custom Shop Item Status', () => {
    service.updateCustomShopItemStatus(1, SHOPLISTITEMTWO).subscribe((data) => {
      expect(data).toEqual(SHOPLISTITEMTWO);
    });
    const req = httpMock.expectOne(`${mainLink}custom/shopping-list-items/1/custom-shopping-list-items?itemId=2&status=INPROGRESS`);
    expect(req.request.method).toBe('PATCH');
    req.flush(SHOPLISTITEMTWO);
  });

  it('should update Habit Shop List', () => {
    service.updateHabitShopList(UPDATEHABITSHOPLIST).subscribe((data) => {
      expect(data).toEqual(null);
    });
    const req = httpMock.expectOne(`${mainLink}habit/assign/2/allUserAndCustomList?lang=ua`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });
});
