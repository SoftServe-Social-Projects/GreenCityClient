import { IOrderInfo, IEmployee, IPaymentInfoDto } from '../models/ubs-admin.interface';
import { OrderStatus, PaymnetStatus } from '../../ubs/order-status.enum';
import { limitStatus } from '../components/ubs-admin-tariffs/ubs-tariffs.enum';
import { ADDRESSESMOCK } from 'src/app/ubs/mocks/address-mock';

export const fakeAllPositionsEmployees: Map<string, IEmployee[]> = new Map();
fakeAllPositionsEmployees.set('PositionDto(id=1, name=Менеджер послуги)', [{ id: 1, name: 'Maria Admin' }]);
fakeAllPositionsEmployees.set('PositionDto(id=2, name=Менеджер)', []);
fakeAllPositionsEmployees.set('PositionDto(id=3, name=Логіст)', []);
fakeAllPositionsEmployees.set('PositionDto(id=4, name=Штурман)', []);
fakeAllPositionsEmployees.set('PositionDto(id=5, name=Водій)', []);

export const OrderInfoMockedData: IOrderInfo = {
  generalOrderInfo: {
    id: 1,
    dateFormed: '2022-02-08T15:21:44.85458',
    adminComment: null,
    orderStatus: OrderStatus.FORMED,
    orderStatusName: 'Сформовано',
    orderStatusNameEng: 'Formed',
    orderStatusesDtos: [
      {
        ableActualChange: false,
        key: OrderStatus.FORMED,
        translation: 'Сформовано'
      },
      {
        ableActualChange: false,
        key: OrderStatus.ADJUSTMENT,
        translation: 'Узгодження'
      },
      {
        ableActualChange: false,
        key: OrderStatus.BROUGHT_IT_HIMSELF,
        translation: 'Привезе сам'
      },
      {
        ableActualChange: false,
        key: OrderStatus.CONFIRMED,
        translation: 'Підтверджено'
      },
      {
        ableActualChange: false,
        key: OrderStatus.ON_THE_ROUTE,
        translation: 'На маршруті'
      },
      {
        ableActualChange: true,
        key: OrderStatus.DONE,
        translation: 'Виконано'
      },
      {
        ableActualChange: false,
        key: OrderStatus.NOT_TAKEN_OUT,
        translation: 'Не вивезли'
      },
      {
        ableActualChange: true,
        key: OrderStatus.CANCELED,
        translation: 'Скасовано'
      }
    ],
    orderPaymentStatus: PaymnetStatus.PAID,
    orderPaymentStatusName: 'Оплачено',
    orderPaymentStatusNameEng: 'Paid',
    orderPaymentStatusesDto: [
      {
        key: PaymnetStatus.PAID,
        translation: 'Оплачено'
      }
    ]
  },
  userInfoDto: {
    recipientId: 37,
    customerEmail: 'greencitytest@gmail.com',
    customerName: 'test',
    customerPhoneNumber: '380964521167',
    customerSurName: 'test',
    recipientEmail: 'test@gmail.com',
    recipientName: 'test',
    recipientPhoneNumber: '380964523467',
    recipientSurName: 'test',
    totalUserViolations: 0,
    userViolationForCurrentOrder: 0
  },
  addressExportDetailsDto: {
    addressId: 32,
    addressCity: 'Київ',
    addressCityEng: 'Kyiv',
    addressDistrict: 'Шевченківський',
    addressDistrictEng: 'Shevchenkivskyi',
    addressEntranceNumber: 1,
    addressHouseCorpus: 3,
    addressHouseNumber: 42,
    addressRegion: 'Київська область',
    addressRegionEng: 'Kyiv Oblast',
    addressStreet: 'Січових Стрільців вул',
    addressStreetEng: 'Sichovyh Streltsyv str',
    addressRegionDistrictList: ADDRESSESMOCK.DISTRICTSKYIVMOCK
  },
  addressComment: '',
  amountOfBagsConfirmed: new Map(),
  amountOfBagsExported: new Map(),
  amountOfBagsOrdered: new Map(),
  bags: [
    {
      actual: 0,
      capacity: 120,
      confirmed: 1,
      id: 1,
      name: 'Безпечні відходи',
      planned: 1,
      price: 250
    }
  ],
  courierPricePerPackage: 1,
  courierInfo: {
    courierLimit: limitStatus.limitByAmountOfBag,
    min: 2,
    max: 99
  },
  orderBonusDiscount: 0,
  orderCertificateTotalDiscount: 0,
  orderDiscountedPrice: 900,
  orderExportedDiscountedPrice: 0,
  orderExportedPrice: 0,
  orderFullPrice: 900,
  certificates: [],
  numbersFromShop: [],
  comment: '',
  paymentTableInfoDto: {
    overpayment: 480,
    paidAmount: 250,
    paymentInfoDtos: [
      {
        amount: 200,
        comment: null,
        id: 40,
        imagePath: null,
        paymentId: '436436436',
        receiptLink: '',
        settlementdate: '2022-02-01',
        currentDate: '2022-02-09'
      }
    ],
    unPaidAmount: 650
  },
  exportDetailsDto: {
    allReceivingStations: [],
    dateExport: null,
    receivingStationId: null,
    timeDeliveryFrom: null,
    timeDeliveryTo: null
  },
  employeePositionDtoRequest: {
    allPositionsEmployees: fakeAllPositionsEmployees,
    currentPositionEmployees: new Map(),
    orderId: 1
  },
  writeOffStationSum: 0
};

export const GeneralInfoMock = {
  orderStatus: OrderStatus.DONE,
  adminComment: 'Admin',
  orderPaymentStatus: PaymnetStatus.PAID,
  orderStatusesDtos: [
    { ableActualChange: false, key: OrderStatus.DONE, translation: 'Formed' },
    { ableActualChange: false, key: OrderStatus.ADJUSTMENT, translation: 'Adjustment' },
    { ableActualChange: false, key: OrderStatus.BROUGHT_IT_HIMSELF, translation: 'Brought by himself' },
    { ableActualChange: true, key: OrderStatus.CANCELED, translation: 'Canceled' }
  ]
};

export const activeCouriersMock = [
  {
    courierId: 15,
    courierStatus: 'ACTIVE',
    nameUk: 'ЛЗ тест 3',
    nameEn: 'LZ Test 3',
    createDate: '2023-05-26',
    createdBy: 'UBS ADMIN'
  },
  {
    courierId: 11,
    courierStatus: 'ACTIVE',
    nameUk: 'Тест502',
    nameEn: 'Test502',
    createDate: '2023-05-03',
    createdBy: 'UBS-Admin Admin'
  }
];

export const IPaymentInfoDtoMock: IPaymentInfoDto = {
  id: 1,
  currentDate: '2022-02-09',
  settlementdate: '2022-02-01',
  amount: 200,
  receiptLink: 'Enrollment to the bonus account'
};
