import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OrderService } from 'src/app/ubs/ubs-admin/services/order.service';
import { environment } from '@environment/environment';
import { OrderStatus, PaymnetStatus } from '../../ubs/order-status.enum';
import { IOrderInfo } from '../models/ubs-admin.interface';

describe('OrderService', () => {
  let httpMock: HttpTestingController;
  let service: OrderService;
  const urlMock = environment.ubsAdmin.backendUbsAdminLink;
  const urlMainMock = environment.backendUbsLink;
  const userMock = {
    customerName: 'YuraBoiko',
    customerPhoneNumber: '974498935',
    customerEmail: 'yur13boj9@gmail.com',
    recipientName: 'Yura Boiko',
    recipientPhoneNumber: '+380974498935',
    recipientEmail: 'yur13boj9@gmail.com',
    totalUserViolations: 0,
    userViolationForCurrentOrder: 0,
    violations: {
      violationsAmount: 0,
      violationsDescription: {}
    }
  };

  const mockOrderInfo: IOrderInfo = {
    generalOrderInfo: {
      id: 1,
      blocked: false,
      dateFormed: '2024-11-01',
      adminComment: 'Admin comment example',
      orderStatus: 'CONFIRMED',
      orderStatusName: 'Confirmed',
      orderStatusNameEng: 'Confirmed',
      orderStatusesDtos: [
        {
          ableActualChange: true,
          key: 'CONFIRMED',
          translation: 'Confirmed'
        }
      ],
      orderPaymentStatus: 'PAID',
      orderPaymentStatusName: 'Paid',
      orderPaymentStatusNameEng: 'Paid',
      orderPaymentStatusesDto: [
        {
          key: 'PAID',
          translation: 'Paid'
        }
      ]
    },
    userInfoDto: {
      recipientId: 123,
      customerEmail: 'customer@example.com',
      customerName: 'John',
      customerPhoneNumber: '+1234567890',
      customerSurName: 'Doe',
      recipientEmail: 'recipient@example.com',
      recipientName: 'Jane',
      recipientPhoneNumber: '+0987654321',
      recipientSurName: 'Doe',
      totalUserViolations: 0,
      userViolationForCurrentOrder: 0
    },
    addressExportDetailsDto: {
      actual: true,
      city: 'Kyiv',
      cityEn: 'Kyiv',
      coordinates: { latitude: 50.45, longitude: 30.52 },
      region: 'Kyiv Region',
      regionEn: 'Kyiv Region',
      district: 'Shevchenkivskyi',
      districtEn: 'Shevchenkivskyi',
      entranceNumber: '5',
      houseCorpus: 'A',
      houseNumber: '10',
      id: 1,
      placeId: 'place123',
      street: 'Main Street',
      streetEn: 'Main Street'
    },
    addressComment: 'Please leave at the door.',
    amountOfBagsConfirmed: new Map([['plastic', 2]]),
    amountOfBagsExported: new Map([['plastic', 1]]),
    amountOfBagsOrdered: new Map([['plastic', 3]]),
    bags: [
      {
        capacity: 10,
        id: 1,
        name: 'Plastic Bag',
        nameEng: 'Plastic Bag',
        price: 5,
        confirmed: 2,
        actual: 1
      }
    ],
    courierPricePerPackage: 2.5,
    courierInfo: {
      courierLimit: 'LIMIT_BY_AMOUNT_OF_BAG',
      min: 1,
      max: 10
    },
    orderBonusDiscount: 5,
    orderCertificateTotalDiscount: 10,
    orderDiscountedPrice: 85,
    orderExportedDiscountedPrice: 75,
    orderExportedPrice: 90,
    orderFullPrice: 100,
    certificates: ['CERT123'],
    numbersFromShop: ['#1234', '#5678'],
    comment: 'Urgent delivery, please!',
    paymentTableInfoDto: {
      overpayment: 0,
      paidAmount: 90,
      paymentInfoDtos: [
        {
          id: 1,
          comment: 'Paid in full',
          currentDate: '2024-11-01',
          amount: 90,
          settlementdate: '2024-11-01',
          receiptLink: 'https://example.com/receipt/123'
        }
      ],
      unPaidAmount: 0
    },
    exportDetailsDto: {
      allReceivingStations: [
        {
          createDate: '2024-01-01',
          createdBy: 'admin',
          id: 1,
          name: 'Station A'
        }
      ],
      dateExport: '2024-11-02',
      timeDeliveryFrom: '10:00',
      timeDeliveryTo: '12:00',
      receivingStationId: 1
    },
    employeePositionDtoRequest: {
      allPositionsEmployees: new Map([['manager', [{ id: 1, name: 'Alice', position: 'Manager' }]]]),
      currentPositionEmployees: new Map([['manager', 'Alice']]),
      orderId: 1
    },
    writeOffStationSum: 0,
    updateResponsibleEmployeeDto: [{ positionId: 1, employeeId: 1 }],
    isOrderCancelledAfterFormed: false
  };

  const recipient = {
    recipientEmail: 'fake',
    recipientId: 0,
    recipientName: 'fake',
    recipientPhoneNumber: 'fake',
    recipientSurName: 'fake'
  };

  const address = {
    comment: 'fake',
    district: 'fake',
    entranceNumber: 'fake',
    houseCorpus: 'fake',
    houseNumber: 'fake',
    street: 'fake'
  };

  const arr = [
    { key: OrderStatus.FORMED },
    { key: OrderStatus.ADJUSTMENT },
    { key: OrderStatus.BROUGHT_IT_HIMSELF },
    { key: OrderStatus.CANCELED },
    { key: OrderStatus.CONFIRMED },
    { key: OrderStatus.ON_THE_ROUTE },
    { key: OrderStatus.DONE },
    { key: OrderStatus.NOT_TAKEN_OUT }
  ];

  const exportMock = {
    allReceivingStations: ['Lviv'],
    exportedDate: '02-11-21',
    exportedTime: '10:14',
    receivingStation: 'Lviv'
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return details of order', () => {
    service.getOrderDetails(2464, 'en').subscribe((data) => {
      expect(data.bagId).toBeTruthy();
    });
    const req = httpMock.expectOne(`${urlMock}/management/read-order-info/2464?language=en`);
    expect(req.request.method).toBe('GET');
  });

  it('should return details of order sum', () => {
    service.getOrderSumDetails(2464).subscribe((data) => {
      expect(data.sumAmount).toBeTruthy();
    });
    const req = httpMock.expectOne(`${urlMock}/management/get-order-sum-detail/871`);
    expect(req.request.method).toBe('GET');
  });

  it('should return user info', () => {
    service.getUserInfo(2270, 'en').subscribe((data) => {
      expect(data).toBe(userMock);
    });
    const req = httpMock.expectOne(`${urlMock}/user-info/2270?lang=en`);
    expect(req.request.method).toBe('GET');
    req.flush(userMock);
  });

  it('should return user violations', () => {
    service.getUserViolations('yur13boj9@gmail.com').subscribe((data) => {
      expect(data).toBe(userMock.violations);
    });
    const req = httpMock.expectOne(`${urlMock}/management/getUsersViolations?email=yur13boj9@gmail.com`);
    expect(req.request.method).toBe('GET');
    req.flush(userMock.violations);
  });

  it('should return payment info', () => {
    service.getPaymentInfo(2270).subscribe((data) => {
      expect(data).toBe({ paidAmount: 0, paymentInfoDtos: [], unPaidAmount: 0 });
    });
    const req = httpMock.expectOne(`${urlMock}/management/getPaymentInfo?orderId=2270`);
    expect(req.request.method).toBe('GET');
  });

  it('should return order address', () => {
    service.readAddressOrder(2270).subscribe((data) => {
      expect(data).toBe(address);
    });
    const req = httpMock.expectOne(`${urlMock}/management/read-address-order/2270`);
    expect(req.request.method).toBe('GET');
    req.flush(address);
  });

  it('should return order export details', () => {
    service.getOrderExportDetails(2270).subscribe((data) => {
      expect(data).toBe(exportMock);
    });
    const req = httpMock.expectOne(`${urlMock}/management/get-order-export-details/2270`);
    expect(req.request.method).toBe('GET');
    req.flush(exportMock);
  });

  it('should return all receiving stations', () => {
    service.getAllReceivingStations().subscribe((data) => {
      expect(data).toBe(exportMock.allReceivingStations);
    });
    const req = httpMock.expectOne(`${urlMainMock}/admin/ubs-employee/get-all-receiving-station`);
    expect(req.request.method).toBe('GET');
    req.flush(exportMock.allReceivingStations);
  });

  it('should return all responsible persons', () => {
    service.getAllResponsiblePersons(0).subscribe((data) => {
      expect(data).toBeDefined();
    });
    const req = httpMock.expectOne(`${urlMock}/management/get-all-employee-by-position/0`);
    expect(req.request.method).toBe('GET');
  });

  it('should return order details status', () => {
    service.getOrderDetailStatus(2500).subscribe((data) => {
      expect(data.orderStatus).toBe(OrderStatus.FORMED);
      expect(data.paymentStatus).toBe(PaymnetStatus.UNPAID);
    });
    const req = httpMock.expectOne(`${urlMock}/management/read-order-detail-status/2500`);
    expect(req.request.method).toBe('GET');
  });

  it('should update recipients data', () => {
    service.updateRecipientsData(2500).subscribe((data) => {
      expect(data).toBe(recipient);
    });
    const req = httpMock.expectOne(`${urlMock}`);
    expect(req.request.method).toBe('PUT');
  });

  it('should get column', () => {
    service.getColumnToDisplay().subscribe((data) => {
      expect(data).toEqual({ titles: 'fake' });
    });
    const req = httpMock.expectOne(`${urlMock}/management/getOrdersViewParameters`);
    expect(req.request.method).toBe('GET');
    req.flush({ titles: 'fake' });
  });

  it('should set column to display', () => {
    service.setColumnToDisplay('fake').subscribe((data) => {
      expect(data).toEqual({ titles: 'fake' });
    });
    const req = httpMock.expectOne(`${urlMock}/management/changeOrdersTableView?titles=fake`);
    expect(req.request.method).toBe('PUT');
    req.flush({ titles: 'fake' });
  });

  it('should get overpayment message about overpayment', () => {
    const msg = service.getOverpaymentMsg(1);
    expect(msg).toBe('order-payment.overpayment');
  });

  it('should get overpayment message about underpayment', () => {
    const msg = service.getOverpaymentMsg(-1);
    expect(msg).toBe('order-payment.underpayment');
  });

  it('should return order history', () => {
    service.getOrderHistory(1, 'ua').subscribe((data) => {
      expect(data).toBe([]);
    });
    const req = httpMock.expectOne(`${urlMock}/order_history/1?lang=ua`);
    expect(req.request.method).toBe('GET');
  });

  it('should return info about order', () => {
    service.getOrderInfo(1).subscribe((data) => {
      expect(data).toBe(mockOrderInfo);
    });
    const req = httpMock.expectOne(`${urlMock}/management/get-data-for-order/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrderInfo);
  });

  it('should filter statuses', () => {
    const res = service.filterStatuses(arr, [
      OrderStatus.FORMED,
      OrderStatus.ADJUSTMENT,
      OrderStatus.BROUGHT_IT_HIMSELF,
      OrderStatus.CANCELED
    ]);
    expect(res).toEqual([
      { key: OrderStatus.FORMED },
      { key: OrderStatus.ADJUSTMENT },
      { key: OrderStatus.BROUGHT_IT_HIMSELF },
      { key: OrderStatus.CANCELED }
    ]);
  });

  it('should return available statuses for order status FORMED', () => {
    const res = service.getAvailableOrderStatuses(OrderStatus.FORMED, arr);
    expect(res).toEqual([
      { key: OrderStatus.FORMED },
      { key: OrderStatus.ADJUSTMENT },
      { key: OrderStatus.BROUGHT_IT_HIMSELF },
      { key: OrderStatus.CANCELED }
    ]);
  });

  it('should return available statuses for order status ADJUSTMENT', () => {
    const res = service.getAvailableOrderStatuses(OrderStatus.ADJUSTMENT, arr);
    expect(res).toEqual([
      { key: OrderStatus.FORMED },
      { key: OrderStatus.ADJUSTMENT },
      { key: OrderStatus.CONFIRMED },
      { key: OrderStatus.BROUGHT_IT_HIMSELF },
      { key: OrderStatus.CANCELED }
    ]);
  });

  it('should return available statuses for order status CONFIRMED', () => {
    const res = service.getAvailableOrderStatuses(OrderStatus.CONFIRMED, arr);
    expect(res).toEqual([
      { key: OrderStatus.FORMED },
      { key: OrderStatus.CONFIRMED },
      { key: OrderStatus.ON_THE_ROUTE },
      { key: OrderStatus.BROUGHT_IT_HIMSELF },
      { key: OrderStatus.CANCELED }
    ]);
  });

  it('should return available statuses for order status BROUGHT_IT_HIMSELF', () => {
    const res = service.getAvailableOrderStatuses(OrderStatus.BROUGHT_IT_HIMSELF, arr);
    expect(res).toEqual([{ key: OrderStatus.BROUGHT_IT_HIMSELF }]);
  });

  it('should return available statuses for order status ON_THE_ROUTE', () => {
    const res = service.getAvailableOrderStatuses(OrderStatus.ON_THE_ROUTE, arr);
    expect(res).toEqual([
      { key: OrderStatus.ON_THE_ROUTE },
      { key: OrderStatus.DONE },
      { key: OrderStatus.NOT_TAKEN_OUT },
      { key: OrderStatus.CANCELED }
    ]);
  });

  it('should return available statuses for order status DONE', () => {
    const res = service.getAvailableOrderStatuses(OrderStatus.DONE, arr);
    expect(res).toEqual([{ key: OrderStatus.DONE }]);
  });

  it('should return available statuses for order status CANCELED', () => {
    const res = service.getAvailableOrderStatuses(OrderStatus.CANCELED, arr);
    expect(res).toEqual([{ key: OrderStatus.CANCELED }]);
  });

  it('should return red arrow up when form is required', () => {
    const result = service.getArrowImageSrc(true, false, false, false);
    expect(result).toEqual({
      imgUrl: 'assets/img/ubs-admin-orders/red_arrow_up.svg',
      imgAlt: 'Red arrow pointing up'
    });
  });

  it('should return arrow up when page is not open and valid or uneditable', () => {
    const result = service.getArrowImageSrc(false, false, true, false);
    expect(result).toEqual({
      imgUrl: 'assets/img/ubs-admin-orders/arrow_up.svg',
      imgAlt: 'Arrow pointing up'
    });

    const resultUneditable = service.getArrowImageSrc(false, false, false, true);
    expect(resultUneditable).toEqual({
      imgUrl: 'assets/img/ubs-admin-orders/arrow_up.svg',
      imgAlt: 'Arrow pointing up'
    });
  });

  it('should return arrow down when page is open and valid or uneditable', () => {
    const result = service.getArrowImageSrc(false, true, true, false);
    expect(result).toEqual({
      imgUrl: 'assets/img/ubs-admin-orders/arrow_down.svg',
      imgAlt: 'Arrow pointing down'
    });

    const resultUneditable = service.getArrowImageSrc(false, true, false, true);
    expect(resultUneditable).toEqual({
      imgUrl: 'assets/img/ubs-admin-orders/arrow_down.svg',
      imgAlt: 'Arrow pointing down'
    });
  });

  it('should return red arrow down when page is open, not valid, and not uneditable', () => {
    const result = service.getArrowImageSrc(false, true, false, false);
    expect(result).toEqual({
      imgUrl: 'assets/img/ubs-admin-orders/red_arrow_down.svg',
      imgAlt: 'Red arrow pointing down'
    });
  });

  it('should return no image for undefined conditions', () => {
    const result = service.getArrowImageSrc(false, false, false, false);
    expect(result).toEqual({
      imgUrl: '',
      imgAlt: 'No Image'
    });
  });
});
