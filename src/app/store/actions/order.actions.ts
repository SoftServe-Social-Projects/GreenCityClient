import { createAction, props } from '@ngrx/store';
import { IUserOrderInfo } from 'src/app/ubs/ubs-user/ubs-user-orders-list/models/UserOrder.interface';
import { Address, AddressData, CourierLocations, OrderDetails, PersonalData } from 'src/app/ubs/ubs/models/ubs.interface';
import { CCertificate } from 'src/app/ubs/ubs/models/ubs.model';

export enum OrderActions {
  SetCurrentStep = '[Order] Set Current Step',
  SetBags = '[Order] Set Bags',
  SetOrderSum = '[Order] Set Order Sum',
  SetPointsUsed = '[Order] Set Points Used',
  SetCertificates = '[Order] Set Certificates',
  SetCertificateUsed = '[Order] Set Certificate Used',
  SetFirstFormStatus = '[Order] Set First Form Status',
  SetSecondFormStatus = '[Order] Set Second Form Status',
  SetPersonalData = '[Order] Set Personal Data',
  SetAddress = '[Order] Set Address',
  SetAdditionalOrders = '[Order] Set Additional Orders',
  SetOrderComment = '[Order] Set Order Comment',
  AddCertificate = '[Order] Add Certificate',
  RemoveCertificate = '[Order] Remove Certificate',

  GetUbsCourierId = '[Order] Get Ubs Courier Id',
  GetUbsCourierIdSuccess = '[Order] Get Ubs Courier Id Success',

  GetLocationId = '[Order] Get Location Id',
  GetLocationIdSuccess = '[Order] Get Location Id Success',

  GetOrderDetails = '[Order] Get Order Details',
  GetOrderDetailsSuccess = '[Order] Get Order Details Success',

  GetCourierLocations = '[Order] Get Courier Locations',
  GetCourierLocationsSuccess = '[Order] Get Courier Locations Success',

  ChangeCourierLocation = '[Order] Change Courier Location',
  ChangeCourierLocationSuccess = '[Order] Change Courier Location Success',

  GetExistingOrderDetails = '[Order] Get Existing Order Details',
  GetExistingOrderDetailsSuccess = '[Order] Get Existing Order Details Success',

  GetExistingOrderTariff = '[Order] Get Existing Order Tariff',
  GetExistingOrderTariffSuccess = '[Order] Get Existing Order Tariff Success',

  GetExistingOrderInfo = '[Order] Get Existing Order Info',
  GetExistingOrderInfoSuccess = '[Order] Get Existing Order Info Success',

  GetPersonalData = '[Order] Get Personal Data',
  GetPersonalDataSuccess = '[Order] Get Personal Data Success',

  GetAddresses = '[Order] Get User Addresses',
  GetAddressesSuccess = '[Order] Get User Addresses Success',

  CreateAddress = '[Order] Create Address',
  CreateAddressSuccess = '[Order] Create Address Success',
  CreateAddressFail = '[Order] Create Address Fail',

  UpdateAddress = '[Order] Update Address',
  UpdateAddressSuccess = '[Order] Update Address Success',
  UpdateAddressFail = '[Order] Update Address Fail',

  DeleteAddress = '[Order] Delete Address',
  DeleteAddressSuccess = '[Order] Delete Address Success',

  ClearOrderDetails = '[Order] Clear Order Details',
  ClearPersonalData = '[Order] Clear Personal Data',

  ClearOrderData = '[Order] Clear Order Data'
}

export const SetCurrentStep = createAction(OrderActions.SetCurrentStep, props<{ step: number }>());
export const SetBags = createAction(OrderActions.SetBags, props<{ bagId: number; bagValue: number }>());
export const SetOrderSum = createAction(OrderActions.SetOrderSum, props<{ orderSum: number }>());
export const SetPointsUsed = createAction(OrderActions.SetPointsUsed, props<{ pointsUsed: number }>());
export const SetCertificates = createAction(OrderActions.SetCertificates, props<{ certificates: string[] }>());
export const SetCertificateUsed = createAction(OrderActions.SetCertificateUsed, props<{ certificateUsed: number }>());
export const SetFirstFormStatus = createAction(OrderActions.SetFirstFormStatus, props<{ isValid: boolean }>());
export const SetSecondFormStatus = createAction(OrderActions.SetSecondFormStatus, props<{ isValid: boolean }>());
export const SetPersonalData = createAction(OrderActions.SetPersonalData, props<{ personalData: PersonalData }>());
export const SetAdditionalOrders = createAction(OrderActions.SetAdditionalOrders, props<{ orders: string[] }>());
export const SetOrderComment = createAction(OrderActions.SetOrderComment, props<{ comment: string }>());
export const SetAddress = createAction(OrderActions.SetAddress, props<{ address: Address }>());
export const AddCertificate = createAction(OrderActions.AddCertificate, props<{ certificate: CCertificate }>());
export const RemoveCertificate = createAction(OrderActions.RemoveCertificate, props<{ code: string }>());

export const GetUbsCourierId = createAction(OrderActions.GetUbsCourierId, props<{ name: string }>());
export const GetUbsCourierIdSuccess = createAction(OrderActions.GetUbsCourierIdSuccess, props<{ courierId: number }>());

export const GetLocationId = createAction(OrderActions.GetLocationId, props<{ courierId: number }>());
export const GetLocationIdSuccess = createAction(OrderActions.GetLocationIdSuccess, props<{ locationId: number }>());

export const GetOrderDetails = createAction(OrderActions.GetOrderDetails, props<{ locationId: number; tariffId: number }>());
export const GetOrderDetailsSuccess = createAction(OrderActions.GetOrderDetailsSuccess, props<{ orderDetails: OrderDetails }>());

export const GetCourierLocations = createAction(OrderActions.GetCourierLocations, props<{ courierId?: number; locationId?: number }>());
export const GetCourierLocationsSuccess = createAction(OrderActions.GetCourierLocationsSuccess, props<{ locations: CourierLocations }>());

export const ChangeCourierLocation = createAction(OrderActions.ChangeCourierLocation, props<{ courierId: number }>());
export const ChangeCourierLocationSuccess = createAction(
  OrderActions.ChangeCourierLocationSuccess,
  props<{ locations: CourierLocations }>()
);

export const GetPersonalData = createAction(OrderActions.GetPersonalData);
export const GetPersonalDataSuccess = createAction(OrderActions.GetPersonalDataSuccess, props<{ personalData: PersonalData }>());

export const GetExistingOrderDetails = createAction(OrderActions.GetExistingOrderDetails, props<{ orderId: number }>());
export const GetExistingOrderDetailsSuccess = createAction(
  OrderActions.GetExistingOrderDetailsSuccess,
  props<{ orderDetails: OrderDetails }>()
);

export const GetExistingOrderTariff = createAction(OrderActions.GetExistingOrderTariff, props<{ orderId: number }>());
export const GetExistingOrderTariffSuccess = createAction(
  OrderActions.GetExistingOrderTariffSuccess,
  props<{ locations: CourierLocations }>()
);

export const GetExistingOrderInfo = createAction(OrderActions.GetExistingOrderInfo, props<{ orderId: number }>());
export const GetExistingOrderInfoSuccess = createAction(OrderActions.GetExistingOrderInfoSuccess, props<{ orderInfo: IUserOrderInfo }>());

export const GetAddresses = createAction(OrderActions.GetAddresses);
export const GetAddressesSuccess = createAction(OrderActions.GetAddressesSuccess, props<{ locations: Address[] }>());

export const CreateAddress = createAction(OrderActions.CreateAddress, props<{ address: AddressData }>());
export const CreateAddressSuccess = createAction(OrderActions.CreateAddressSuccess, props<{ addresses: Address[] }>());
export const CreateAddressFail = createAction(OrderActions.CreateAddressFail);

export const UpdateAddress = createAction(OrderActions.UpdateAddress, props<{ address: Address }>());
export const UpdateAddressSuccess = createAction(OrderActions.UpdateAddressSuccess, props<{ addresses: Address[] }>());
export const UpdateAddressFail = createAction(OrderActions.CreateAddressFail);

export const DeleteAddress = createAction(OrderActions.DeleteAddress, props<{ address: Address }>());
export const DeleteAddressSuccess = createAction(OrderActions.DeleteAddressSuccess, props<{ addresses: Address[] }>());

export const ClearPersonalData = createAction(OrderActions.ClearPersonalData);
export const ClearOrderDetails = createAction(OrderActions.ClearOrderDetails);

export const ClearOrderData = createAction(OrderActions.ClearOrderData);
