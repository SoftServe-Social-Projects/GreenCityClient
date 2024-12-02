import { DistrictsDtos } from '../../ubs/models/ubs.interface';

export interface Employees {
  page: Page[];
  currentPage: number;
  totalElements: number;
  totalPages: number;
}

export interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
  sort: Sort;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}
export interface Page {
  email: string;
  employeePositions: EmployeePositions[];
  firstName: string;
  id: number;
  image: string;
  lastName: string;
  phoneNumber: string;
  expanded?: boolean;
  tariffs: Tariff[];
  employeeStatus?: string;
}

export interface EmployeePositions {
  id: number;
  name: string;
  nameEn: string;
}

export interface Tariff {
  id: number;
  region: TariffItem;
  locationsDtos: TariffItem[];
  courier: TariffItem;
  hasChat: boolean;
  selected?: boolean;
}

export interface TariffItem {
  id: number;
  nameEn: string;
  nameUk: string;
}

export interface SelectedItem {
  nameEn: string;
  nameUa: string;
}

export interface InitialData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  imageURL: string;
  employeePositionsIds: number[];
}

export interface ReceivingStations {
  id: number;
  name: string;
}

export interface TariffForEmployee {
  id: number;
  region: TariffForEmployeeItem;
  location: TariffForEmployeeItem[];
  courier: TariffForEmployeeItem;
  selected?: boolean;
  hasChat?: boolean;
  locations: any[];
}
export interface TariffForEmployeeItem {
  en: string;
  ua: string;
}

export interface EmployeeDataToSend {
  employeeDto: EmployeeDto;
  tariffs: { tariffId: number; hasChat: boolean }[];
}

export interface EmployeeDataResponse {
  employeeDto: EmployeeDto;
  tariffs: { tariffId: number; hasChat: boolean }[];
}

export interface EmployeeDto {
  firstName: string;
  id?: number;
  image: string | ArrayBuffer;
  lastName: string;
  phoneNumber: string;
  employeePositions: EmployeePositions[];
}

export interface IOrderInfo {
  generalOrderInfo: IGeneralOrderInfo;
  userInfoDto: IUserInfo;
  addressExportDetailsDto: IAddressExportDetails;
  addressComment: string;
  amountOfBagsConfirmed: Map<string, number>;
  amountOfBagsExported: Map<string, number>;
  amountOfBagsOrdered: Map<string, number>;
  bags: IBags[];
  courierPricePerPackage: number;
  courierInfo: ICourierInfo;
  orderBonusDiscount: number;
  orderCertificateTotalDiscount: number;
  orderDiscountedPrice: number;
  orderExportedDiscountedPrice: number;
  orderExportedPrice: number;
  orderFullPrice: number;
  certificates: string[];
  numbersFromShop: string[];
  comment: string;
  extend?: boolean;
  paymentTableInfoDto: IPaymentInfo;
  exportDetailsDto: IExportDetails;
  employeePositionDtoRequest: IResponsiblePersons;
  writeOffStationSum: number;
  updateResponsibleEmployeeDto?: IEmployeePositions[];
}

export interface IEmployeePositions {
  positionId: number;
  employeeId: number;
}

export interface ICourierInfo {
  courierLimit: 'LIMIT_BY_AMOUNT_OF_BAG' | 'LIMIT_BY_SUM_OF_ORDER';
  min: number;
  max: number;
}

export interface IOrderDetails {
  bags: IBags[];
  courierInfo: ICourierInfo;
  bonuses: number;
  certificateDiscount: number;
  paidAmount: number;
  courierPricePerPackage: number;
}

export interface IBags {
  capacity: number;
  id: number;
  name: string;
  price: number;
  planned?: number;
  confirmed?: number;
  actual?: number;
}

export interface IGeneralOrderInfo {
  id: number;
  dateFormed: string;
  adminComment: string;
  orderStatus: string;
  orderStatusName: string;
  orderStatusNameEng: string;
  orderStatusesDtos: IOrderStatusesDtos[];
  orderPaymentStatus: string;
  orderPaymentStatusName: string;
  orderPaymentStatusNameEng: string;
  orderPaymentStatusesDto: IOrderPaymentStatusesDto[];
}

export interface IOrderStatusesDtos {
  ableActualChange: boolean;
  key: string;
  translation?: string;
  ua?: string;
  eng?: string;
}

export interface IOrderPaymentStatusesDto {
  key: string;
  translation?: string;
  ua?: string;
  eng?: string;
}

export interface IPaymentStatus {
  key?: string;
  ua?: string;
  eng?: string;
}

export interface IUserInfo {
  recipientId: number;
  customerEmail: string;
  customerName: string;
  customerPhoneNumber: string;
  customerSurName: string;
  recipientEmail: string;
  recipientName: string;
  recipientPhoneNumber: string;
  recipientSurName: string;
  totalUserViolations: number;
  userViolationForCurrentOrder: number;
}

export interface IAddressExportDetails {
  addressId: number;
  addressCity: string;
  addressCityEng: string;
  addressDistrict: string;
  addressDistrictEng: string;
  addressEntranceNumber: number;
  addressHouseCorpus: number;
  addressHouseNumber: number;
  addressRegion: string;
  addressRegionEng: string;
  addressStreet: string;
  addressStreetEng: string;
  addressRegionDistrictList: DistrictsDtos[];
}

export interface IPaymentInfo {
  overpayment: number;
  paidAmount: number;
  paymentInfoDtos: IPaymentInfoDto[];
  unPaidAmount: number;
}

export interface PaymentDetails {
  amount: number;
  settlementdate: string;
  paymentId?: string;
  receiptLink: string;
  imagePath?: string;
}

export interface IPaymentInfoDto extends PaymentDetails {
  id: number;
  comment?: string;
  currentDate: string;
}

export interface IReceivingStation {
  createDate: string;
  createdBy: string;
  id: number;
  name: string;
}

export interface IExportDetails {
  allReceivingStations: IReceivingStation[];
  dateExport: any;
  timeDeliveryFrom: string;
  timeDeliveryTo: string;
  receivingStationId: number;
}

export interface IEmployee {
  name: string;
  id: number;
}

export interface IUpdateResponsibleEmployee {
  employeeId: number;
  positionId: number;
}

export interface IUpdateExportDetails {
  receivingStationId: number;
  dateExport: string;
  timeDeliveryFrom: string;
  timeDeliveryTo: string;
}

export interface IResponsiblePersons {
  allPositionsEmployees: Map<string, IEmployee[]>;
  currentPositionEmployees: Map<string, string>;
  orderId: number;
}

export interface IOrderHistory {
  authorName: string;
  eventDate: string;
  eventName: string;
  id: number;
  status?: string;
  result?: string;
}

export interface INotTakenOutReason {
  description: 'string';
  images: ['string'];
}

export interface IOrderStatusInfo {
  key: string;
  ableActualChange: boolean;
  translation?: string;
  ua?: string;
  eng?: string;
}

export interface UserViolations {
  violationsAmount: number;
  violationsDescription: object;
}

export interface UserProfile {
  addressDto: Address[];
  recipientEmail: string;
  alternateEmail: string;
  recipientName: string;
  recipientPhone: string;
  recipientSurname: string;
  hasPassword: boolean;
  telegramIsNotify?: boolean;
  viberIsNotify?: boolean;
  botList?: SocialLink[];
}

export interface SocialLink {
  link: string;
  type: string;
}

export interface Address {
  actual: boolean;
  city: string;
  cityEn: string;
  coordinates: {
    latitude?: number;
    longitude?: number;
  };
  region: string;
  regionEn: string;
  district: string;
  districtEn: string;
  entranceNumber: string;
  houseCorpus: string;
  houseNumber: string;
  addressRegionDistrictList?: any;
  isKyiv?: boolean;
  isNotKyivRegion?: boolean;
  id: number;
  placeId: string;
  searchAddress?: string;
  isHouseSelected?: boolean;
  street: string;
  streetEn: string;
}

export interface DialogData {
  button: 'add' | 'update';
}

export interface CreateCertificate {
  code: string;
  monthCount: number;
  initialPointsValue: number;
  points?: number;
}

export interface IFilteredColumn {
  key: string;
  en: string;
  ua: string;
  values: Array<IFilteredColumnValue>;
}

export interface IFilteredColumnValue {
  key?: string;
  en?: string;
  ua?: string;
  filtered?: boolean;
}

export interface IDateFilters {
  orderDateFrom: string;
  orderDateTo: string;
  orderDateCheck: boolean;
  dateOfExportFrom: string;
  dateOfExportTo: string;
  dateOfExportCheck: boolean;
  paymentDateFrom: string;
  paymentDateTo: string;
  paymentDateCheck: boolean;
}

export interface IBigOrderTableOrderInfo {
  id: number;
  orderStatus: string;
  orderPaymentStatus: string;
  orderDate: string;
  paymentDate: string;
  clientName: string;
  phoneNumber: string;
  email: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  violationsAmount: number;
  region: string;
  city: string;
  district: string;
  address: string;
  commentToAddressForClient: string;
  bagsAmount: number;
  totalOrderSum: number;
  orderCertificateCode: string;
  orderCertificatePoints: string;
  amountDue: number;
  commentForOrderByClient: string;
  payment: string;
  dateOfExport: string;
  timeOfExport: string;
  idOrderFromShop: string;
  receivingStation: ReceivingStations[];
  responsibleLogicMan: string;
  responsibleDriver: string;
  responsibleCaller: string;
  responsibleNavigator: string;
  commentsForOrder: string;
  isBlocked: boolean;
  blockedBy: string;
}

export interface IBigOrderTable {
  content: IBigOrderTableOrderInfo[];
  empty: string;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}

export interface IColumnBelonging {
  key: string;
  ua: string;
  en: string;
  filtered?: boolean;
}

export interface IColumnDTO {
  checked: [];
  columnBelonging: string;
  editType: string;
  filtered: boolean;
  index: number;
  sticky: boolean;
  titleForSorting: string;
  visible: boolean;
  weight: number;
  title: IColumnBelonging;
}

export interface IOrderSearchCriteria {
  city: string;
  deliveryDateFrom: string;
  deliveryDateTo: string;
  districts: string;
  orderDateFrom: string;
  orderDateTo: string;
  orderPaymentStatus: string;
  orderStatus: string;
  paymentDateFrom: string;
  paymentDateTo: string;
  receivingStation: string;
  region: string;
  responsibleCallerId: string;
  responsibleDriverId: string;
  responsibleLogicManId: string;
  responsibleNavigatorId: string;
  search: string;
}

export interface IBigOrderTablePage {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
}

export interface IBigOrderTableParams {
  columnBelongingList: IColumnBelonging[];
  columnDTOList: IColumnDTO[];
  orderSearchCriteria: IOrderSearchCriteria;
  page: IBigOrderTablePage;
}

export interface IOrdersViewParameters {
  titles: string;
}

export interface IResponsiblePersonsData {
  translate: string;
  formControlName: string;
  responsiblePersonsArray: string[];
}

export interface IDataForPopUp {
  arrayData: IColumnBelonging[];
  title: string;
}

export interface Location {
  name: string;
  key: number;
}

export enum ResponsibleEmployee {
  CallManager = 2,
  Logistician,
  Navigator,
  Driver
}

export enum FormFieldsName {
  CallManager = 'responsibleCaller',
  Logistician = 'responsibleLogicMan',
  Navigator = 'responsibleNavigator',
  Driver = 'responsibleDriver',
  TimeDeliveryFrom = 'timeDeliveryFrom',
  TimeDeliveryTo = 'timeDeliveryTo',
  ReceivingStation = 'receivingStation'
}

export enum ordersStatuses {
  NotTakenOutUA = 'Не вивезли',
  NotTakenOutEN = 'Not taken out',
  CancelUA = 'Скасовано',
  CancelEN = 'Canceled'
}

export interface AdminSideBarMenu {
  link: string;
  name: string;
  routerLink: string;
}

export enum employeePositionsName {
  ServiceManager = 'Менеджер послуги',
  CallManager = 'Менеджер',
  Logistician = 'Логіст',
  Navigator = 'Штурман',
  Driver = 'Водій',
  SuperAdmin = 'Супер адмін',
  Admin = 'Адмін'
}

export enum EnablingSeeAuthorities {
  orders = 'SEE_BIG_ORDER_TABLE',
  customers = 'SEE_CLIENTS_PAGE',
  certificates = 'SEE_CERTIFICATES',
  employees = 'SEE_EMPLOYEES_PAGE',
  tariffs = 'SEE_TARIFFS',
  notifications = 'SEE_MESSAGES_PAGE'
}

export enum abilityCreateAuthorities {
  certificates = 'CREATE_NEW_CERTIFICATE',
  notifications = 'CREATE_NEW_MESSAGE'
}

export enum abilityAddAuthorities {
  location = 'CREATE_NEW_LOCATION',
  courier = 'CREATE_NEW_COURIER',
  station = 'CREATE_NEW_STATION',
  pricingCard = 'CREATE_PRICING_CARD'
}

export enum abilityEditAuthorities {
  orders = 'EDIT_ORDER',
  certificates = 'EDIT_CERTIFICATE',
  notifications = 'EDIT_MESSAGE',
  location = 'EDIT_LOCATION',
  courier = 'EDIT_COURIER',
  station = 'EDIT_STATION',
  pricingCard = 'EDIT_DELETE_DEACTIVATE_PRICING_CARD',
  controlService = 'CONTROL_SERVICE'
}

export enum abilityDelAuthorities {
  notifications = 'DELETE_MESSAGE',
  activateDeactivate = 'EDIT_DELETE_DEACTIVATE_PRICING_CARD'
}

export enum SideMenuElementsNames {
  orders = 'ubs-sidebar.orders',
  customers = 'ubs-sidebar.customers',
  certificates = 'ubs-sidebar.certificates',
  employees = 'ubs-sidebar.employees',
  tariffs = 'ubs-sidebar.tariffs',
  notifications = 'ubs-sidebar.notifications'
}

export interface EmployeePositionsAuthorities {
  authorities: string[];
  positionId: number[];
}

export interface NotTakenOutReasonImages {
  name: string;
  src: string;
  file: File;
}
