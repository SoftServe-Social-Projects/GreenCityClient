import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import {
  CreateAddress,
  CreateAddressSuccess,
  DeleteAddress,
  DeleteAddressSuccess,
  GetCourierLocations,
  GetCourierLocationsSuccess,
  GetExistingOrderDetails,
  GetExistingOrderDetailsSuccess,
  GetLocationId,
  GetLocationIdSuccess,
  GetOrderDetails,
  GetOrderDetailsSuccess,
  GetPersonalData,
  GetPersonalDataSuccess,
  GetExistingOrderTariff,
  GetExistingOrderTariffSuccess,
  GetUbsCourierId,
  GetUbsCourierIdSuccess,
  GetAddresses,
  GetAddressesSuccess,
  UpdateAddress,
  UpdateAddressSuccess,
  GetExistingOrderInfo,
  GetExistingOrderInfoSuccess
} from 'src/app/store/actions/order.actions';
import { OrderService } from 'src/app/ubs/ubs/services/order.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Address, AddressData } from 'src/app/ubs/ubs/models/ubs.interface';

@Injectable()
export class OrderEffects {
  constructor(private actions: Actions, private orderService: OrderService, private localStorageService: LocalStorageService) {}

  getOrderDetails = createEffect(() => {
    return this.actions.pipe(
      ofType(GetOrderDetails),
      mergeMap((action: { locationId: number; tariffId: number }) => {
        return this.orderService.getOrderDetails(action.locationId, action.tariffId).pipe(
          tap((orderDetails) => this.localStorageService.setUBSOrderData(orderDetails)),
          map((orderDetails) => GetOrderDetailsSuccess({ orderDetails })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  getExistingOrderDetails = createEffect(() => {
    return this.actions.pipe(
      ofType(GetExistingOrderDetails),
      mergeMap((action: { orderId: number }) => {
        return this.orderService.getExistingOrderDetails(action.orderId).pipe(
          map((orderDetails) => GetExistingOrderDetailsSuccess({ orderDetails })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  getExistingOrderTariff = createEffect(() => {
    return this.actions.pipe(
      ofType(GetExistingOrderTariff),
      mergeMap((action: { orderId: number }) => {
        return this.orderService.getExistingOrderTariff(action.orderId).pipe(
          tap((locations) => this.localStorageService.setLocations(locations)),
          map((locations) => GetExistingOrderTariffSuccess({ locations })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  getExistingOrderInfo = createEffect(() => {
    return this.actions.pipe(
      ofType(GetExistingOrderInfo),
      mergeMap((action: { orderId: number }) => {
        return this.orderService.getExistingOrderInfo(action.orderId).pipe(
          map((orderInfo) => GetExistingOrderInfoSuccess({ orderInfo })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  getCourierLocations = createEffect(() => {
    return this.actions.pipe(
      ofType(GetCourierLocations),
      mergeMap((action: { courierId?: number; locationId?: number; forceFetch?: boolean }) => {
        return this.orderService.getInfoAboutTariff(action.courierId || 1, action.locationId).pipe(
          map((allLocations) => allLocations.tariffsForLocationDto),
          tap((locations) => this.localStorageService.setLocations(locations)),
          map((locations) => GetCourierLocationsSuccess({ locations })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  getAddresses = createEffect(() => {
    return this.actions.pipe(
      ofType(GetAddresses),
      mergeMap(() => {
        return this.orderService.findAllAddresses().pipe(
          map((response) => GetAddressesSuccess({ locations: response.addressList })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  createAddress = createEffect(() => {
    return this.actions.pipe(
      ofType(CreateAddress),
      mergeMap((action: { address: AddressData }) => {
        return this.orderService.addAdress(action.address).pipe(
          map((response) => CreateAddressSuccess({ addresses: response.addressList })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  updateAddress = createEffect(() => {
    return this.actions.pipe(
      ofType(UpdateAddress),
      mergeMap((action: { address: Address }) => {
        return this.orderService.updateAdress(action.address).pipe(
          map((response) => UpdateAddressSuccess({ addresses: response.addressList })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  deleteAddress = createEffect(() => {
    return this.actions.pipe(
      ofType(DeleteAddress),
      mergeMap((action: { address: Address }) => {
        return this.orderService.deleteAddress(action.address).pipe(
          map((response) => DeleteAddressSuccess({ addresses: response.addressList })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  getPersonalData = createEffect(() => {
    return this.actions.pipe(
      ofType(GetPersonalData),
      mergeMap(() => {
        return this.orderService.getPersonalData().pipe(
          map((personalData) => GetPersonalDataSuccess({ personalData })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  getUBSCourierId = createEffect(() => {
    return this.actions.pipe(
      ofType(GetUbsCourierId),
      mergeMap((action: { name: string }) => {
        return this.orderService.getUBSCouriedId(action.name).pipe(
          map((courierId) => GetUbsCourierIdSuccess({ courierId })),
          catchError(() => EMPTY)
        );
      })
    );
  });

  getLocationId = createEffect(() => {
    return this.actions.pipe(
      ofType(GetLocationId),
      mergeMap((action: { courierId: number }) => {
        return this.orderService.getLocationId(action.courierId).pipe(
          map((locationId) => GetLocationIdSuccess({ locationId })),
          catchError(() => EMPTY)
        );
      })
    );
  });
}
