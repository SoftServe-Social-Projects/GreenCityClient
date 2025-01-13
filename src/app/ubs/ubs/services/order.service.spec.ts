import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@environment/environment';
import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { OrderService } from './order.service';
import { UBSOrderFormService } from './ubs-order-form.service';
import { OrderClientDto } from '../../ubs-user/ubs-user-orders-list/models/OrderClientDto';
import { ResponceOrderFondyModel } from '../../ubs-user/ubs-user-orders-list/models/ResponceOrderFondyModel';
import { DistrictsDtos, KyivNamesEnum } from '../models/ubs.interface';
import { ADDRESSESMOCK } from '../../mocks/address-mock';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

describe('OrderService', () => {
  const bagMock = {
    id: 1,
    name: '',
    capacity: 22,
    price: 33,
    quantity: 44,
    code: '55'
  };

  const personalDataMock = {
    addressComment: 'string',
    email: 'string',
    firstName: 'string',
    id: 0,
    lastName: 'string',
    phoneNumber: 'string'
  };

  const personalData = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    addressComment: '',
    city: '',
    cityEn: '',
    district: '',
    districtEn: '',
    street: '',
    streetEn: '',
    houseCorpus: '',
    entranceNumber: '',
    houseNumber: '',
    longitude: 1,
    latitude: 0,
    senderFirstName: '',
    senderLastName: '',
    senderEmail: '',
    senderPhoneNumber: '',
    isAnotherClient: false
  };
  const orderDetailsMock = {
    bags: [],
    points: 100500
  };
  const certificateMock = {
    creationDate: 'string',
    points: 0,
    certificateStatus: 'string'
  };

  const mockTranslateService = {
    get: jasmine.createSpy('get').and.returnValue('mockTranslation')
  };

  const address = {
    actual: true,
    id: 100500,
    city: '',
    cityEn: '',
    region: '',
    regionEn: '',
    district: '',
    districtEn: '',
    street: '',
    streetEn: '',
    houseCorpus: '',
    entranceNumber: '',
    houseNumber: '',
    coordinates: {
      latitude: 0,
      longitude: 0
    }
  };

  const userOrderMock = new OrderClientDto();

  let service: OrderService;
  let httpMock: HttpTestingController;
  const subjectMock = new Subject<boolean>();
  const ubsOrderServiseMock = {
    orderDetails: null,
    personalData: null
  };

  const storeMock = jasmine.createSpyObj('Store', ['select', 'dispatch']);
  storeMock.select.and.returnValue(of({ order: ubsOrderServiseMock }));

  const baseLink = environment.ubsAdmin.backendUbsAdminLink;

  function httpTest(url, type, response) {
    const req = httpMock.expectOne(`${baseLink}/` + url);
    expect(req.request.method).toBe(type);
    req.flush(response);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        { provide: UBSOrderFormService, useValue: ubsOrderServiseMock },
        { provide: Subject, useValue: subjectMock },
        { provide: Store, useValue: storeMock },
        { provide: TranslateService, useValue: mockTranslateService }
      ],
      imports: [HttpClientTestingModule, StoreModule.forRoot({})]
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(OrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('method getOrders should return order details', () => {
    service.getOrderDetails(1, 25).subscribe((data) => {
      service.stateOrderDetails = null;
      expect(ubsOrderServiseMock.orderDetails).not.toBeNull();
      expect(ubsOrderServiseMock.orderDetails).toEqual(data);
    });
  });

  it('method getPersonalData should return personal data', () => {
    service.getPersonalData().subscribe((data) => {
      expect(ubsOrderServiseMock.personalData).not.toBeNull();
      expect(ubsOrderServiseMock.personalData).toEqual(data);
    });
  });

  it('method processCertificate should return data of certificate', () => {
    service.processCertificate(100500).subscribe((data) => {
      expect(data).toEqual(certificateMock);
    });
    httpTest('certificate/100500', 'GET', certificateMock);
  });
  it('method findAllAddresses should return address list', () => {
    const adressListMock = {
      actual: true,
      id: 1,
      city: '',
      district: '',
      street: '',
      houseCorpus: '',
      entranceNumber: '',
      houseNumber: ''
    };
    service.findAllAddresses().subscribe((data) => {
      expect(data).toEqual(adressListMock);
    });
    httpTest('findAll-order-address', 'GET', adressListMock);
  });

  it('method getLocations should return user location', () => {
    const locationsMock = [{ id: 1, name: 'city', languageCode: 'ua' }];

    service.getLocations(1).subscribe((data) => {
      expect(data).toEqual(locationsMock as any);
    });
    httpTest('locations/1', 'GET', locationsMock);
  });

  it('method getInfoAboutTariff should return user location tariff', () => {
    const tariffMock = { tariff: 'fake tariff' };

    service.getInfoAboutTariff(1, 1).subscribe((data) => {
      expect(data).toEqual(tariffMock as any);
    });
    httpTest('tariffinfo/1?courierId=1', 'GET', tariffMock);
  });

  it('method addAdress should makes post request', () => {
    service.addAdress(address as any).subscribe((data) => {
      expect(data).toEqual(address);
    });
    httpTest('save-order-address', 'POST', address);
  });

  it('method updateAdress should makes post request', () => {
    service.updateAdress(address as any).subscribe((data) => {
      expect(data).toEqual(address);
    });
    httpTest('update-order-address', 'PUT', address);
  });

  it('method deleteAddress should delete address and make post request', () => {
    service.deleteAddress(address).subscribe((data) => {
      expect(data).toEqual(address);
    });
    httpTest('order-addresses/' + address.id, 'DELETE', address);
  });

  it('method addLocation should add location and make post request', () => {
    const location = { locationId: 0 };
    service.addLocation(location).subscribe((data) => {
      expect(data).not.toBeNull();
    });
    httpTest('order/get-locations', 'POST', { status: 200, statusText: 'OK' });
  });

  it('method completedLocation should call subject.next(true)', () => {
    spyOn(subjectMock, 'next');
    service.completedLocation(true);
    subjectMock.next(true);
    subjectMock.subscribe((data) => {
      expect(data).toBeTruthy();
    });
    expect(subjectMock.next).toHaveBeenCalled();
  });

  it('method processOrderFondyFromUserOrderList should retrieve Fondy order information from the API via POST', () => {
    const responceOrderFondyModel: ResponceOrderFondyModel = {
      orderId: 5,
      link: 'https://pay.fondy.eu/merchants/b987e1aa765ebe6d5e76c027acb02cf7ba866d92/default/index.html'
    };
    service.processOrderFondyFromUserOrderList(userOrderMock).subscribe((data) => {
      expect(data).toEqual(responceOrderFondyModel);
    });

    httpTest('client/processOrder', 'POST', responceOrderFondyModel);
  });

  it('method findAllDistricts should return districts based on region and city', () => {
    const regionMock = KyivNamesEnum.KyivRegionEn;
    const cityMock = KyivNamesEnum.KyivEn;
    const districtsMock: DistrictsDtos[] = ADDRESSESMOCK.DISTRICTSKYIVMOCK;

    service.findAllDistricts(regionMock, cityMock).subscribe((districts) => {
      expect(districts.length).toBe(districtsMock.length);
      expect(districts).toEqual(ADDRESSESMOCK.DISTRICTSKYIVMOCKLABLED);
    });

    const req = httpMock.expectOne(`${baseLink}/get-all-districts?city=${cityMock}&region=${encodeURIComponent(regionMock)}`);
    expect(req.request.method).toBe('GET');
    req.flush(districtsMock);
  });

  it('should return locationName when it is in standaloneCities', () => {
    const location = 'Kyiv';
    const region = 'Ukraine';
    const result = service.getLocationName(location, region);
    expect(result).toBe('Kyiv');
  });

  it('should return "locationName, regionName" when locationName is not in standaloneCities', () => {
    const location = 'Lviv';
    const region = 'Ukraine';
    const result = service.getLocationName(location, region);
    expect(result).toBe('Lviv, Ukraine');
  });

  it('should handle object input for location and region', () => {
    const location = { nameUk: 'Львів', nameEn: 'Lviv' };
    const region = { nameUk: 'Україна', nameEn: 'Ukraine' };
    const result = service.getLocationName(location, region);
    expect(result).toBe('Lviv, Ukraine');
  });
});
