export interface IUserOrderInfo {
  additionalOrders: any;
  address: IAddressExportDetails;
  amountBeforePayment: number;
  bags: IBags[];
  bonuses: number;
  certificate: ICertificate[];
  dateForm: string;
  datePaid: string;
  extend?: boolean;
  id: number;
  orderComment: string;
  orderFullPrice: number;
  orderStatus: string;
  orderStatusEng: string;
  paidAmount: number;
  paymentStatus: string;
  paymentStatusEng: string;
  sender: IUserInfo;
}

export interface IUserInfo {
  senderEmail: string;
  senderName: string;
  senderPhone: string;
  senderSurname: string;
}

export interface IAddressExportDetails {
  addressCity: string;
  addressCityEng: string;
  addressComment: string;
  addressDistinct: string;
  addressDistinctEng: string;
  addressRegion: string;
  addressRegionEng: string;
  addressStreet: string;
  addressStreetEng: string;
  entranceNumber: string;
  houseCorpus: string;
  houseNumber: string;
}

export interface IBags {
  capacity: number;
  count: number;
  price: number;
  service: string;
  totalPrice: number;
}

export interface ICertificate {
  certificateStatus: string;
  code: string;
  creationDate: string;
  points: number;
}

export enum CheckPaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  HALFPAID = 'Half paid'
}

export enum CheckOrderStatus {
  DONE = 'Done',
  CANCELED = 'Canceled',
  CONFIRMED = 'Confirmed',
  FORMED = 'Formed',
  ADJUSTMENT = 'Adjustment'
}

export interface IUserOrdersInfo {
  currentPage: number;
  page: IUserOrderInfo[];
  totalElements: number;
  totalPages: number;
}
