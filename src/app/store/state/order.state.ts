import { IUserOrderInfo } from 'src/app/ubs/ubs-user/ubs-user-orders-list/models/UserOrder.interface';
import { PersonalData, OrderDetails, CourierLocations, Address } from 'src/app/ubs/ubs/models/ubs.interface';
import { CCertificate } from 'src/app/ubs/ubs/models/ubs.model';

export interface IOrderState {
  currentStep: number;
  orderDetails: OrderDetails | null;
  courierLocations: CourierLocations | null;
  UBSCourierId: number | null;
  locationId: number | null;
  pendingLocationId: number | null;
  orderSum: number;
  certificates: CCertificate[];
  certificateUsed: number;
  pointsUsed: number;
  isOrderDetailsLoading: boolean;
  firstFormValid: boolean;
  secondFormValid: boolean;
  existingOrderInfo: IUserOrderInfo | null;
  personalData: PersonalData | null;
  isAddressLoading: boolean;
  addresses: Address[];
  addressId: number | null;
  error?: string | null;
}

export const initialOrderState: IOrderState = {
  currentStep: 0,
  orderDetails: null,
  courierLocations: null,
  UBSCourierId: null,
  locationId: null,
  pendingLocationId: null,
  orderSum: 0,
  certificates: [],
  certificateUsed: 0,
  pointsUsed: 0,
  isOrderDetailsLoading: false,
  existingOrderInfo: null,
  firstFormValid: false,
  secondFormValid: false,
  personalData: null,
  isAddressLoading: false,
  addresses: [],
  addressId: null,
  error: null
};
