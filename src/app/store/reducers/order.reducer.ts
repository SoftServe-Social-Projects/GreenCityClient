import { initialOrderState } from '../state/order.state';
import {
  ClearPersonalData,
  ClearOrderDetails,
  SetBags,
  GetOrderDetailsSuccess,
  GetCourierLocationsSuccess,
  ChangeCourierLocationSuccess,
  GetUbsCourierIdSuccess,
  GetLocationIdSuccess,
  GetCourierLocations,
  SetOrderSum,
  AddCertificate,
  RemoveCertificate,
  SetPointsUsed,
  SetFirstFormStatus,
  GetAddressesSuccess,
  GetPersonalDataSuccess,
  SetPersonalData,
  SetCertificateUsed,
  SetAdditionalOrders,
  SetOrderComment,
  GetOrderDetails,
  UpdateAddressSuccess,
  GetExistingOrderDetailsSuccess,
  GetExistingOrderDetails,
  GetExistingOrderTariffSuccess,
  CreateAddressSuccess,
  CreateAddressFail,
  DeleteAddressSuccess,
  GetExistingOrderInfoSuccess,
  ClearOrderData,
  SetCertificates,
  SetAddress,
  UpdateAddress,
  DeleteAddress,
  CreateAddress,
  SetSecondFormStatus,
  SetCurrentStep
} from '../actions/order.actions';
import { createReducer, on } from '@ngrx/store';

export const orderReducer = createReducer(
  initialOrderState,
  on(SetCurrentStep, (state, action) => ({
    ...state,
    currentStep: action.step
  })),
  on(SetBags, (state, action) => {
    const newBagVal = state.orderDetails.bags.map((item) => ({
      ...item,
      quantity: item.id === action.bagId ? action.bagValue : item.quantity
    }));
    return {
      ...state,
      orderDetails: {
        ...state.orderDetails,
        bags: newBagVal
      }
    };
  }),
  on(ClearPersonalData, (state) => {
    return {
      ...state,
      personalData: null
    };
  }),
  on(ClearOrderDetails, (state) => {
    return {
      ...state,
      orderDetails: null
    };
  }),
  on(GetOrderDetails, (state) => {
    return {
      ...state,
      isOrderDetailsLoading: true
    };
  }),
  on(GetOrderDetailsSuccess, (state, action) => {
    return {
      ...state,
      orderDetails: {
        ...action.orderDetails,
        bags: action.orderDetails.bags ? [...action.orderDetails.bags].sort((a, b) => b.capacity - a.capacity) : []
      },
      isOrderDetailsLoading: false
    };
  }),
  on(GetExistingOrderDetails, (state) => {
    return {
      ...state,
      isOrderDetailsLoading: true
    };
  }),
  on(GetExistingOrderDetailsSuccess, (state, action) => {
    return {
      ...state,
      orderDetails: {
        ...action.orderDetails,
        bags: action.orderDetails.bags ? [...action.orderDetails.bags].sort((a, b) => b.capacity - a.capacity) : []
      },
      isOrderDetailsLoading: false
    };
  }),
  on(GetExistingOrderTariffSuccess, (state, action) => {
    return {
      ...state,
      locationId: action.locations.locationsDtosList[0].locationId,
      courierLocations: action.locations
    };
  }),
  on(GetExistingOrderInfoSuccess, (state, action) => {
    return {
      ...state,
      existingOrderInfo: action.orderInfo
    };
  }),
  on(GetCourierLocations, (state, action) => {
    return {
      ...state,
      pendingLocationId: action.locationId
    };
  }),
  on(GetCourierLocationsSuccess, (state, action) => {
    return {
      ...state,
      locationId: state.pendingLocationId,
      courierLocations: action.locations
    };
  }),
  on(GetAddressesSuccess, (state, action) => {
    return {
      ...state,
      addressId: null,
      addresses: action.locations
    };
  }),
  on(CreateAddress, (state, action) => {
    return {
      ...state,
      isAddressLoading: true
    };
  }),
  on(CreateAddressSuccess, (state, action) => {
    return {
      ...state,
      addressId: null,
      addresses: action.addresses,
      isAddressLoading: false
    };
  }),
  on(CreateAddressFail, (state) => {
    return {
      ...state,
      isAddressLoading: false
    };
  }),
  on(UpdateAddress, (state, action) => {
    return {
      ...state,
      isAddressLoading: true
    };
  }),
  on(UpdateAddressSuccess, (state, action) => {
    return {
      ...state,
      addressId: null,
      addresses: action.addresses,
      isAddressLoading: false
    };
  }),
  on(DeleteAddress, (state, action) => {
    return {
      ...state,
      isAddressLoading: true
    };
  }),
  on(DeleteAddressSuccess, (state, action) => {
    return {
      ...state,
      addressId: null,
      addresses: action.addresses,
      isAddressLoading: false
    };
  }),
  on(GetPersonalDataSuccess, (state, action) => {
    return {
      ...state,
      personalData: action.personalData
    };
  }),
  on(ChangeCourierLocationSuccess, (state, action) => {
    return {
      ...state,
      courierLocations: action.locations
    };
  }),
  on(GetUbsCourierIdSuccess, (state, action) => {
    return {
      ...state,
      UBSCourierId: action.courierId,
      certificates: [],
      certificateUsed: 0,
      pointsUsed: 0
    };
  }),
  on(GetLocationIdSuccess, (state, action) => {
    return {
      ...state,
      locationId: action.locationId
    };
  }),
  on(SetOrderSum, (state, action) => {
    return {
      ...state,
      orderSum: action.orderSum
    };
  }),
  on(SetPointsUsed, (state, action) => {
    return {
      ...state,
      pointsUsed: action.pointsUsed
    };
  }),
  on(SetCertificateUsed, (state, action) => {
    return {
      ...state,
      certificateUsed: action.certificateUsed
    };
  }),
  on(SetCertificates, (state, action) => {
    return {
      ...state,
      orderDetails: { ...state.orderDetails, certificates: action.certificates }
    };
  }),
  on(SetFirstFormStatus, (state, action) => ({
    ...state,
    firstFormValid: action.isValid
  })),
  on(SetSecondFormStatus, (state, action) => ({
    ...state,
    secondFormValid: action.isValid
  })),
  on(SetPersonalData, (state, action) => {
    return {
      ...state,
      personalData: {
        ...state.personalData,
        ...action.personalData
      }
    };
  }),
  on(SetAdditionalOrders, (state, action) => {
    return {
      ...state,
      orderDetails: { ...state.orderDetails, additionalOrders: action.orders }
    };
  }),
  on(SetOrderComment, (state, action) => {
    return {
      ...state,
      orderDetails: { ...state.orderDetails, orderComment: action.comment }
    };
  }),
  on(SetAddress, (state, action) => {
    return {
      ...state,
      addressId: action.address?.id ?? null,
      personalData: {
        ...state.personalData,
        city: action.address?.city ?? '',
        cityEn: action.address?.cityEn ?? '',
        district: action.address?.district ?? '',
        districtEn: action.address?.districtEn ?? '',
        street: action.address?.street ?? '',
        streetEn: action.address?.streetEn ?? '',
        region: action.address?.region ?? '',
        regionEn: action.address?.regionEn ?? '',
        houseCorpus: action.address?.houseCorpus ?? '',
        houseNumber: action.address?.houseNumber ?? '',
        entranceNumber: action.address?.entranceNumber ?? null,
        longitude: action.address?.coordinates.longitude ?? null,
        latitude: action.address?.coordinates.latitude ?? null
      }
    };
  }),
  on(AddCertificate, (state, action) => {
    return {
      ...state,
      certificates: [...state.certificates, action.certificate]
    };
  }),
  on(RemoveCertificate, (state, action) => {
    return {
      ...state,
      certificates: state.certificates.filter((cert) => cert.code !== action.code)
    };
  }),
  on(ClearOrderData, () => initialOrderState)
);
