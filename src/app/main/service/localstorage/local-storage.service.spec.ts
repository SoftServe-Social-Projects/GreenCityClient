import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from './local-storage.service';
import { Subject } from 'rxjs';
import { EventResponse } from '../../component/events/models/events.interface';
import { CourierLocations } from 'src/app/ubs/ubs/models/ubs.interface';
import { FactOfTheDay } from '@global-user/models/factOfTheDay';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  const ACCESS_TOKEN = 'accessToken';

  const mockEvent: EventResponse = {
    additionalImages: ['image1.jpg', 'image2.jpg'],
    creationDate: '2022-05-31',
    dates: [
      {
        coordinates: {
          latitude: 0,
          longitude: 0,
          cityEn: 'cityUa',
          cityUa: 'cityEn',
          countryEn: 'Ukraine',
          countryUa: 'Україна',
          houseNumber: '55',
          regionEn: 'Lvivska oblast',
          regionUa: 'Львівська область',
          streetEn: 'Svobody Ave',
          streetUa: 'Свободи',
          formattedAddressEn: 'Свободи, 55, Львів, Львівська область, Україна',
          formattedAddressUa: 'Svobody Ave, 55, Lviv, Lvivska oblast, Ukraine'
        },
        event: null,
        finishDate: 'finishDate',
        id: null,
        onlineLink: 'link',
        startDate: '2022-02-01T00:00:00Z'
      }
    ],
    description: 'Test event description',
    id: 123,
    open: true,
    organizer: {
      id: 456,
      name: 'Test organizer',
      organizerRating: 3
    },
    tags: [{ id: 789, nameUa: 'Test tag UA', nameEn: 'Test tag EN' }],
    title: 'Test event title',
    titleImage: 'testImage.jpg',
    isSubscribed: true,
    isFavorite: false,
    countComments: 5,
    likes: 8,
    isRelevant: true,
    isOrganizedByFriend: false,
    eventRate: 0
  };

  const factMock: FactOfTheDay = {
    id: 1,
    content: 'Mock Fact of the Day'
  };
  const factKey = 'factOfTheDay';
  const currentTime = Date.now();

  const fakeLanguageSubject: Subject<string> = new Subject<string>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    });
    service = TestBed.inject(LocalStorageService);
    service.languageSubject = fakeLanguageSubject;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setUbsOrderId and getUbsOrderId', () => {
    it('should set the orderId to localStorage', () => {
      const orderId = '12345';
      service.setUbsOrderId(orderId);
      expect(localStorage.getItem('UbsOrderId')).toEqual(String(orderId));
    });

    it('should accept a number as an argument', () => {
      const orderId = 12345;
      service.setUbsOrderId(orderId);
      expect(localStorage.getItem('UbsOrderId')).toEqual(JSON.stringify(orderId));
    });

    it('should return false if UbsOrderId is undefined', () => {
      localStorage.removeItem('UbsOrderId');
      expect(service.getUbsOrderId()).toBeFalsy();
    });

    it('should return the stored value if UbsOrderId is defined', () => {
      const orderId = '12345';
      localStorage.setItem('UbsOrderId', JSON.stringify(orderId));
      expect(service.getUbsOrderId()).toEqual(JSON.parse(localStorage.getItem('UbsOrderId')));
    });
  });

  it('should set and get habits gallery view', () => {
    service.setHabitsGalleryView(true);
    expect(service.getHabitsGalleryView()).toBeTruthy();

    service.setHabitsGalleryView(false);
    expect(service.getHabitsGalleryView()).toBeFalsy();
  });

  it('should get access token', () => {
    const token = '12345';
    localStorage.setItem(ACCESS_TOKEN, token);
    expect(service.getAccessToken()).toEqual(token);
  });

  describe('setEditMode and getEditMode', () => {
    it('should set and get edit mode', () => {
      const key = 'testKey';
      service.setEditMode(key, true);
      expect(localStorage.getItem(key)).toEqual('true');
      service.setEditMode(key, false);
      expect(localStorage.getItem(key)).toEqual('false');
      localStorage.removeItem(key);
      expect(service.getEditMode()).toBeFalsy();
    });
  });

  describe('setCurentPage', () => {
    it('should set the current page in localStorage', () => {
      const key = 'CURRENT_PAGE';
      const pageName = 'about';
      service.setCurentPage(key, pageName);
      expect(localStorage.getItem(key)).toBe(pageName);
    });
  });

  describe('setAccessToken', () => {
    it('should set access token in localStorage and remove UBS registration', () => {
      const accessTokenKey = 'ACCESS_TOKEN';
      const accessTokenValue = 'abc123';
      const ubsRegistrationKey = 'UBS_REGISTRATION';
      localStorage.setItem(accessTokenKey, accessTokenValue);
      service.setAccessToken(accessTokenValue);
      expect(localStorage.getItem(accessTokenKey)).toBe(accessTokenValue);
      expect(localStorage.getItem(ubsRegistrationKey)).toBeNull();
    });
  });

  describe('setRefreshToken', () => {
    it('should set the refresh token in local storage', () => {
      const refreshToken = '12345';
      const localStorageSpy = spyOn(localStorage, 'setItem');
      service.setRefreshToken(refreshToken);
      expect(localStorageSpy).toHaveBeenCalledWith('refreshToken', refreshToken);
    });
  });

  describe('setUserId', () => {
    it('should set the user id in local storage and update the behaviour subject', () => {
      const userId = 1;
      const localStorageSpy = spyOn(localStorage, 'setItem');
      service.setUserId(userId);
      expect(localStorageSpy).toHaveBeenCalledWith('userId', String(userId));
    });
  });

  describe('setFirstName', () => {
    it('should set the first name in local storage and update the behaviour subject', () => {
      const name = 'John';
      const localStorageSpy = spyOn(localStorage, 'setItem');
      service.setFirstName(name);
      expect(localStorageSpy).toHaveBeenCalledWith('name', name);
    });
  });

  describe('setFirstSignIn/unsetFirstSignIn', () => {
    it('should set firstSignIn in local storage to true', () => {
      service.setFirstSignIn();
      expect(localStorage.getItem('firstSignIn')).toEqual('true');
    });

    it('should unset firstSignIn in local storage to false', () => {
      localStorage.setItem('firstSignIn', 'true');
      service.unsetFirstSignIn();
      expect(localStorage.getItem('firstSignIn')).toEqual('false');
    });
  });

  it('should get first sign in', () => {
    localStorage.setItem('firstSignIn', 'true');
    expect(service.getFirstSighIn()).toBeTruthy();
  });

  it('should clear local storage and reset subjects', () => {
    localStorage.setItem('language', 'ua');
    service.clear();
    expect(service.firstNameBehaviourSubject.value).toBeNull();
    expect(service.userIdBehaviourSubject.value).toBeNull();
  });

  it('should set UBS registration value to true if no user id is present in local storage', () => {
    service.setUbsRegistration(true);
    expect(service.ubsRegBehaviourSubject.value).toBeTruthy();
    expect(localStorage.getItem('callUbsRegWindow')).toBeTruthy();
  });

  describe('UBS Registration', () => {
    it('should return true if callUbsRegWindow is true', () => {
      localStorage.setItem('callUbsRegWindow', 'true');
      expect(service.getUbsRegistration()).toBe(true);
    });

    it('should remove callUbsRegWindow from localStorage', () => {
      localStorage.setItem('callUbsRegWindow', 'true');
      service.removeUbsRegistration();
      expect(localStorage.getItem('callUbsRegWindow')).toBeNull();
    });

    it('should set UBSpersonalData and UBSorderData in localStorage', () => {
      const personalData = 'John Doe';
      const orderData = 'Order 123';
      service.setUbsOrderData(personalData, orderData);
      expect(localStorage.getItem('UBSpersonalData')).toBe(personalData);
      expect(localStorage.getItem('UBSorderData')).toBe(orderData);
    });
  });

  describe('removeanotherClientData', () => {
    it('should remove anotherClient from localStorage', () => {
      localStorage.setItem('anotherClient', 'test');
      service.removeanotherClientData();
      expect(localStorage.getItem('anotherClient')).toBeNull();
    });
  });

  describe('setLocationId', () => {
    it('should set currentLocationId in localStorage', () => {
      const currentLocationId = 1;
      service.setLocationId(currentLocationId);
      expect(JSON.parse(localStorage.getItem('currentLocationId'))).toEqual(currentLocationId);
    });

    it('should set locations in localStorage', () => {
      const locations = [
        { id: 1, name: 'location1' },
        { id: 2, name: 'location2' }
      ] as any;
      service.setLocations(locations);
      expect(JSON.parse(localStorage.getItem('locations'))).toEqual(locations);
    });
  });

  describe('setOrderWithoutPayment', () => {
    it('should set saveOrderWithoutPayment in localStorage as true when value is true', () => {
      service.setOrderWithoutPayment(true);
      expect(JSON.parse(localStorage.getItem('saveOrderWithoutPayment'))).toBeTruthy();
    });

    it('should set saveOrderWithoutPayment in localStorage as false when value is false', () => {
      service.setOrderWithoutPayment(false);
      expect(JSON.parse(localStorage.getItem('saveOrderWithoutPayment'))).toBeFalsy();
    });
  });

  describe('getOrderWithoutPayment', () => {
    it('should parse and return the saveOrderWithoutPayment item from local storage', () => {
      const saveOrderWithoutPayment = { id: 1, name: 'Test Order' };
      localStorage.setItem('saveOrderWithoutPayment', JSON.stringify(saveOrderWithoutPayment));
      const result = service.getOrderWithoutPayment();
      expect(result).toEqual(saveOrderWithoutPayment);
    });
  });

  describe('UbsPaymentOrderId', () => {
    it('should set the UbsPaymentOrderId in local storage', () => {
      const orderId = '123';
      service.setUbsPaymentOrderId(orderId);
      expect(localStorage.getItem('UbsPaymentOrderId')).toEqual(String(orderId));
    });

    it('should get the UbsPaymentOrderId from local storage', () => {
      const orderId = '123';
      localStorage.setItem('UbsPaymentOrderId', JSON.stringify(orderId));
      expect(service.getUbsPaymentOrderId()).toEqual(orderId);
    });

    it('should remove the UbsPaymentOrderId from local storage', () => {
      localStorage.setItem('UbsPaymentOrderId', JSON.stringify('123'));
      service.removeUbsPaymentOrderId();
      expect(localStorage.getItem('UbsPaymentOrderId')).toBeNull();
    });
  });

  it('should remove the saveOrderWithoutPayment from local storage', () => {
    const order = { id: 1, name: 'Test Order' };
    localStorage.setItem('saveOrderWithoutPayment', JSON.stringify(order));
    service.removeOrderWithoutPayment();
    const result = localStorage.getItem('saveOrderWithoutPayment');
    expect(result).toBeFalsy();
  });

  it('should remove UBSExistingOrderId', () => {
    localStorage.setItem('UBSExistingOrderId', '123');
    service.removeUBSExistingOrderId();
    expect(localStorage.getItem('UBSExistingOrderId')).toBeNull();
  });

  describe('IsUserPagePayment', () => {
    it('should set IsUserPagePayment in local storage', () => {
      service.setUserPagePayment(true);
      expect(localStorage.getItem('IsUserPagePayment')).toEqual('true');
    });

    it('should get IsUserPagePayment from local storage', () => {
      localStorage.setItem('IsUserPagePayment', JSON.stringify(true));
      expect(service.getUserPagePayment()).toEqual('true');
    });

    it('should remove the IsUserPagePayment key from localStorage', () => {
      localStorage.setItem('IsUserPagePayment', 'true');
      service.removeUserPagePayment();
      expect(localStorage.getItem('IsUserPagePayment')).toBeNull();
    });
  });

  it('should clear payment info', () => {
    localStorage.setItem('UbsPaymentOrderId', '456');
    localStorage.setItem('IsUserPagePayment', 'true');
    service.clearPaymentInfo();
    expect(localStorage.getItem('UbsPaymentOrderId')).toBeNull();
    expect(localStorage.getItem('IsUserPagePayment')).toBeNull();
  });

  it('should remove UBS order data', () => {
    localStorage.setItem('UBSpersonalData', 'personalData');
    localStorage.setItem('UBSorderData', 'orderData');
    localStorage.setItem('currentLocationId', '123');
    localStorage.setItem('locations', 'locations');
    localStorage.setItem('addressId', '456');
    localStorage.setItem('anotherClient', 'anotherClient');
    service.removeUbsOrderData();
    expect(localStorage.getItem('UBSpersonalData')).toBeNull();
    expect(localStorage.getItem('UBSorderData')).toBeNull();
    expect(localStorage.getItem('currentLocationId')).toBeNull();
    expect(localStorage.getItem('locations')).toBeNull();
    expect(localStorage.getItem('addressId')).toBeNull();
    expect(localStorage.getItem('anotherClient')).toBeNull();
  });

  it('should set the value of firstSignIn in local storage', () => {
    service.setFirstSignIn();
    expect(localStorage.getItem('firstSignIn')).toEqual('true');
  });

  it('should unset the value of firstSignIn in local storage', () => {
    service.unsetFirstSignIn();
    expect(localStorage.getItem('firstSignIn')).toEqual('false');
  });

  describe('Test for setUbsBonusesOrderId and getUbsBonusesOrderId functions', () => {
    it('should set and retrieve the correct order ID', () => {
      const orderId = '122';
      service.setUbsBonusesOrderId(orderId);
      expect(localStorage.getItem('UbsBonusesOrderId')).toEqual(String(orderId));
    });

    it('should return the stored value if UbsBonusesOrderId is defined', () => {
      const orderId = '12345';
      localStorage.setItem('UbsBonusesOrderId', JSON.stringify(orderId));
      expect(service.getUbsBonusesOrderId()).toEqual(JSON.parse(localStorage.getItem('UbsBonusesOrderId')));
    });
  });

  it('should remove the UbsOrderId from local storage', () => {
    localStorage.setItem('UbsOrderId', '123');
    service.removeUbsOrderId();
    expect(localStorage.getItem('UbsOrderId')).toBeNull();
  });

  it('should remove the saveOrderWithoutPayment from local storage', () => {
    localStorage.setItem('saveOrderWithoutPayment', JSON.stringify('order'));
    service.removeOrderWithoutPayment();
    expect(localStorage.getItem('saveOrderWithoutPayment')).toBeNull();
  });

  it('should remove the UBSExistingOrderId from local storage', () => {
    localStorage.setItem('UBSExistingOrderId', '123');
    service.removeUBSExistingOrderId();
    expect(localStorage.getItem('UBSExistingOrderId')).toBeNull();
  });

  it('should set firstSignIn to true in localStorage', () => {
    service.setFirstSignIn();
    expect(localStorage.getItem('firstSignIn')).toEqual('true');
  });

  it('should set firstSignIn to false in localStorage', () => {
    service.unsetFirstSignIn();
    expect(localStorage.getItem('firstSignIn')).toEqual('false');
  });

  it('should remove saveOrderWithoutPayment from localStorage', () => {
    localStorage.setItem('saveOrderWithoutPayment', 'test');
    service.removeOrderWithoutPayment();
    expect(localStorage.getItem('saveOrderWithoutPayment')).toBeFalsy();
  });

  it('should remove UBSExistingOrderId from localStorage', () => {
    localStorage.setItem('UBSExistingOrderId', 'test');
    service.removeUBSExistingOrderId();
    expect(localStorage.getItem('UBSExistingOrderId')).toBeFalsy();
  });

  it('should clear payment info from localStorage', () => {
    service.setUbsPaymentOrderId('abc');
    service.setUserPagePayment(true);
    service.clearPaymentInfo();
    expect(service.getUbsPaymentOrderId()).toBeFalsy();
    expect(service.getUserPagePayment()).toBeFalsy();
  });

  it('should remove Ubs order and personal data', () => {
    localStorage.setItem('UBSpersonalData', JSON.stringify({ name: 'John', age: 30 }));
    localStorage.setItem('UBSorderData', JSON.stringify({ orderId: 123 }));
    service.removeUbsOrderAndPersonalData();
    expect(localStorage.getItem('UBSpersonalData')).toBeNull();
    expect(localStorage.getItem('UBSorderData')).toBeNull();
  });

  it('should remove UBSpersonalData and UBSorderData', () => {
    localStorage.setItem('UBSpersonalData', JSON.stringify({}));
    localStorage.setItem('UBSorderData', JSON.stringify({}));
    service.removeUbsOrderAndPersonalData();
    expect(localStorage.getItem('UBSpersonalData')).toBeNull();
    expect(localStorage.getItem('UBSorderData')).toBeNull();
  });

  it('should get UBS personal data', () => {
    localStorage.setItem('UBSpersonalData', JSON.stringify({ name: 'John Doe' }));
    const personalData = service.getUbsPersonalData();
    expect(personalData).toEqual({ name: 'John Doe' });
  });

  it('should get current location id', () => {
    localStorage.setItem('currentLocationId', '1');
    const locationId = service.getLocationId();
    expect(locationId).toBe(1);
  });

  describe('getExistingOrderId()', () => {
    it('should return the existing order id from local storage', () => {
      localStorage.setItem('UBSExistingOrderId', '12345');
      expect(service.getExistingOrderId()).toBe('12345');
    });

    it('should return null if the existing order id does not exist in local storage', () => {
      expect(service.getExistingOrderId()).toBeNull();
    });
  });

  describe('getLocations()', () => {
    it('should return a valid JSON object from local storage', () => {
      const locations: CourierLocations = { location1: 'New York', location2: 'London' } as any;
      localStorage.setItem('locations', JSON.stringify(locations));
      expect(service.getLocations()).toEqual(locations);
    });

    it('should return null if the locations does not exist in local storage', () => {
      expect(service.getLocations()).toBeNull();
    });
  });

  describe('setCustomer/getCustomer()', () => {
    it('should set and get a customer object to/from local storage correctly', () => {
      const customer = { name: 'John Doe' };
      service.setCustomer(customer);
      expect(service.getCustomer()).toEqual(customer);
    });

    it('should return null if no customer exists in local storage', () => {
      expect(service.getCustomer()).toBeNull();
    });

    it('should remove current customer from local storage', () => {
      localStorage.setItem('currentCustomer', JSON.stringify({ id: 1, name: 'John Doe' }));
      service.removeCurrentCustomer();
      expect(localStorage.getItem('currentCustomer')).toBeNull();
    });
  });

  describe('setOrderIdToRedirect and getOrderIdToRedirect', () => {
    it('should set order id to redirect in local storage and emit event', () => {
      spyOn(service.ubsRedirectionBehaviourSubject, 'next').and.callThrough();
      service.setOrderIdToRedirect(123);
      expect(service.ubsRedirectionBehaviourSubject.next).toHaveBeenCalledWith(123);
    });

    it('should return NaN if order id to redirect is not in local storage', () => {
      expect(service.getOrderIdToRedirect()).toBeNaN();
    });
  });

  describe('getAdminOrdersDateFilter', () => {
    it('should return null if the filter is not set', () => {
      localStorage.removeItem('UbsAdminOrdersDateFilters');
      const filter = service.getAdminOrdersDateFilter();
      expect(filter).toBeNull();
    });

    it('should remove UbsAdminOrdersDateFilters from local storage', () => {
      localStorage.setItem(
        'UbsAdminOrdersDateFilters',
        JSON.stringify({ startDate: new Date(2022, 1, 1), endDate: new Date(2022, 1, 31) })
      );
      service.removeAdminOrderDateFilters();
      expect(localStorage.getItem('UbsAdminOrdersDateFilters')).toBeNull();
    });

    it('should set UbsAdminOrdersTableTitleColumnFilters in local storage', () => {
      const filters = [
        { column: 'column1', value: 'value1' },
        { column: 'column2', value: 'value2' }
      ];
      service.setUbsAdminOrdersTableTitleColumnFilter(filters);
      expect(JSON.parse(localStorage.getItem('UbsAdminOrdersTableTitleColumnFilters'))).toEqual([
        { column: 'column1', value: 'value1' },
        { column: 'column2', value: 'value2' }
      ]);
    });

    it('should remove UbsAdminOrdersTableTitleColumnFilters from local storage', () => {
      localStorage.setItem(
        'UbsAdminOrdersTableTitleColumnFilters',
        JSON.stringify([
          {
            column: 'column1',
            value: 'value1'
          }
        ])
      );
      service.removeAdminOrderFilters();
      expect(localStorage.getItem('UbsAdminOrdersTableTitleColumnFilters')).toBeNull();
    });

    it('should get UbsAdminOrdersTableTitleColumnFilters from local storage', () => {
      const filters = [
        { column: 'column1', value: 'value1' },
        { column: 'column2', value: 'value2' }
      ];
      localStorage.setItem('UbsAdminOrdersTableTitleColumnFilters', JSON.stringify(filters));
      expect(service.getUbsAdminOrdersTableTitleColumnFilter()).toEqual(filters);
    });

    it('should return an empty array if UbsAdminOrdersTableTitleColumnFilters is not in local storage', () => {
      expect(service.getUbsAdminOrdersTableTitleColumnFilter().length).toEqual(0);
    });

    it('should set UbsAdminOrdersDateFilters in local storage', () => {
      const filters = { startDate: new Date(2022, 1, 1), endDate: new Date(2022, 1, 31) };
      service.setAdminOrdersDateFilter(filters);
      expect(JSON.parse(localStorage.getItem('UbsAdminOrdersDateFilters'))).toEqual({
        startDate: filters.startDate.toJSON(),
        endDate: filters.endDate.toJSON()
      });
    });

    it('should return the parsed filter if it is set', () => {
      const filter = { startDate: '2022-01-01', endDate: '2022-01-31' };
      localStorage.setItem('UbsAdminOrdersDateFilters', JSON.stringify(filter));
      const result = service.getAdminOrdersDateFilter();
      expect(result).toEqual(filter);
    });

    it('should return null if UbsAdminOrdersDateFilters is not in local storage', () => {
      expect(service.getAdminOrdersDateFilter()).toBeNull();
    });
  });

  describe('finalSumOfOrder', () => {
    it('should set final sum of order in local storage', () => {
      service.setFinalSumOfOrder(123.45);
      expect(JSON.parse(localStorage.getItem('finalSumOfOrder'))).toEqual(123.45);
    });

    it('should get final sum of order from local storage', () => {
      localStorage.setItem('finalSumOfOrder', JSON.stringify(123.45));
      expect(service.getFinalSumOfOrder()).toEqual(123.45);
    });

    it('should return null if final sum of order is not in local storage', () => {
      expect(service.getFinalSumOfOrder()).toBeNull();
    });
  });

  it('should set the event in local storage with the given key', () => {
    const key = 'testKey';
    service.setEventForEdit(key, mockEvent);
    expect(localStorage.getItem(key)).toEqual(JSON.stringify(mockEvent));
  });

  it('should set the current tariff ID in local storage', () => {
    const tariffId = 123;
    service.setTariffId(tariffId);
    expect(localStorage.getItem('currentTariffId')).toEqual(String(tariffId));
  });

  it('should return the current tariff ID from local storage', () => {
    const tariffId = 567;
    localStorage.setItem('currentTariffId', String(tariffId));
    expect(service.getTariffId()).toEqual(tariffId);
  });

  describe('Fact of the day', () => {
    it('should save fact and current time to localStorage', () => {
      spyOn(localStorage, 'setItem');

      service.saveFactToLocalStorage(factMock, currentTime, factKey);

      expect(localStorage.setItem).toHaveBeenCalledWith(factKey, JSON.stringify(factMock));
      expect(localStorage.setItem).toHaveBeenCalledWith('lastFetchTime', currentTime.toString());
    });

    it('should return fact if it exists and is within one day', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === factKey) {
          return JSON.stringify(factMock);
        }
        if (key === 'lastFetchTime') {
          return currentTime.toString();
        }
        return null;
      });

      const result = service.getFactFromLocalStorage(factKey);

      expect(result).toEqual(factMock);
    });

    it('should return null if fact is not present', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      const result = service.getFactFromLocalStorage(factKey);

      expect(result).toBeNull();
    });

    it('should return null if lastFetchTime is not present', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === factKey) {
          return JSON.stringify(factMock);
        }
        if (key === 'lastFetchTime') {
          return null;
        }
        return null;
      });

      const result = service.getFactFromLocalStorage(factKey);

      expect(result).toBeNull();
    });

    it('should return null if more than one day has passed', () => {
      const oldTime = currentTime - service.ONE_DAY_IN_MILLIS - 1;
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === factKey) {
          return JSON.stringify(factMock);
        }
        if (key === 'lastFetchTime') {
          return oldTime.toString();
        }
        return null;
      });

      const result = service.getFactFromLocalStorage(factKey);

      expect(result).toBeNull();
    });

    it('should clear fact and lastFetchTime from localStorage when isHabit is false', () => {
      spyOn(localStorage, 'removeItem');

      service.clearFromLocalStorage(factKey, false);

      expect(localStorage.removeItem).toHaveBeenCalledWith(factKey);
      expect(localStorage.removeItem).toHaveBeenCalledWith('lastFetchTime');
    });

    it('should clear only fact from localStorage when isHabit is true', () => {
      spyOn(localStorage, 'removeItem');

      service.clearFromLocalStorage(factKey, true);

      expect(localStorage.removeItem).toHaveBeenCalledWith(factKey);
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('lastFetchTime');
    });
  });
});
