import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, finalize, map, mergeMap, tap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
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
  GetExistingOrderInfoSuccess,
  CreateAddressFail
} from 'src/app/store/actions/order.actions';
import { OrderService } from 'src/app/ubs/ubs/services/order.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Address, AddressData } from 'src/app/ubs/ubs/models/ubs.interface';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';

@Injectable()
export class OrderEffects {
  constructor(
    private actions: Actions,
    private orderService: OrderService,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackBarComponent
  ) {}

  getOrderDetails = createEffect(() =>
    this.actions.pipe(
      ofType(GetOrderDetails),
      mergeMap((action: { locationId: number; tariffId: number }) =>
        this.orderService.getOrderDetails(action.locationId, action.tariffId).pipe(
          tap((orderDetails) => this.localStorageService.setUBSOrderData(orderDetails)),
          map((orderDetails) => GetOrderDetailsSuccess({ orderDetails })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getExistingOrderDetails = createEffect(() =>
    this.actions.pipe(
      ofType(GetExistingOrderDetails),
      mergeMap((action: { orderId: number }) =>
        this.orderService.getExistingOrderDetails(action.orderId).pipe(
          map((orderDetails) => GetExistingOrderDetailsSuccess({ orderDetails })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getExistingOrderTariff = createEffect(() =>
    this.actions.pipe(
      ofType(GetExistingOrderTariff),
      mergeMap((action: { orderId: number }) =>
        this.orderService.getExistingOrderTariff(action.orderId).pipe(
          tap((locations) => this.localStorageService.setLocations(locations)),
          map((locations) => GetExistingOrderTariffSuccess({ locations })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getExistingOrderInfo = createEffect(() =>
    this.actions.pipe(
      ofType(GetExistingOrderInfo),
      mergeMap((action: { orderId: number }) =>
        this.orderService.getExistingOrderInfo(action.orderId).pipe(
          map((orderInfo) => GetExistingOrderInfoSuccess({ orderInfo })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getCourierLocations = createEffect(() =>
    this.actions.pipe(
      ofType(GetCourierLocations),
      mergeMap((action: { courierId?: number; locationId?: number; forceFetch?: boolean }) =>
        this.orderService.getInfoAboutTariff(action.courierId, action.locationId).pipe(
          map((allLocations) => allLocations.tariffsForLocationDto),
          tap((locations) => this.localStorageService.setLocations(locations)),
          map((locations) => GetCourierLocationsSuccess({ locations })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getAddresses = createEffect(() =>
    this.actions.pipe(
      ofType(GetAddresses),
      mergeMap(() =>
        this.orderService.findAllAddresses().pipe(
          map((response) => GetAddressesSuccess({ locations: response.addressList })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  createAddress = createEffect(() =>
    this.actions.pipe(
      ofType(CreateAddress),
      mergeMap((action: { address: AddressData }) => {
        let isSuccessful = false;
        return this.orderService.addAdress(action.address).pipe(
          map((response) => {
            isSuccessful = !!response;
            return CreateAddressSuccess({ addresses: response.addressList });
          }),
          catchError(() => {
            this.snackBar.openSnackBar('existAddess');
            return of(CreateAddressFail());
          }),
          finalize(() => {
            this.snackBar.openSnackBar(isSuccessful ? 'addedAddress' : 'errorAddress');
          })
        );
      })
    )
  );

  updateAddress = createEffect(() =>
    this.actions.pipe(
      ofType(UpdateAddress),
      tap(() => this.snackBar.openSnackBar('updatedAddress')),
      mergeMap((action: { address: Address }) =>
        this.orderService.updateAdress(action.address).pipe(
          map((response) => UpdateAddressSuccess({ addresses: response.addressList })),
          catchError(() => {
            this.snackBar.openSnackBar('existAddess');
            return EMPTY;
          })
        )
      )
    )
  );

  deleteAddress = createEffect(() =>
    this.actions.pipe(
      ofType(DeleteAddress),
      tap(() => this.snackBar.openSnackBar('deletedAddress')),
      mergeMap((action: { address: Address }) =>
        this.orderService.deleteAddress(action.address).pipe(
          map((response) => DeleteAddressSuccess({ addresses: response.addressList })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getPersonalData = createEffect(() =>
    this.actions.pipe(
      ofType(GetPersonalData),
      mergeMap(() =>
        this.orderService.getPersonalData().pipe(
          map((personalData) => GetPersonalDataSuccess({ personalData })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getUBSCourierId = createEffect(() =>
    this.actions.pipe(
      ofType(GetUbsCourierId),
      mergeMap((action: { name: string }) =>
        this.orderService.getUBSCouriedId(action.name).pipe(
          map((courierId) => GetUbsCourierIdSuccess({ courierId })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getLocationId = createEffect(() =>
    this.actions.pipe(
      ofType(GetLocationId),
      mergeMap((action: { courierId: number }) =>
        this.orderService.getLocationId(action.courierId).pipe(
          map((locationId) => GetLocationIdSuccess({ locationId })),
          catchError(() => EMPTY)
        )
      )
    )
  );
}
