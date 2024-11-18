import { Injectable } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, concatMap, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { filtersSelector } from 'src/app/store/selectors/big-order-table.selectors';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import {
  IBigOrderTable,
  IBigOrderTableOrderInfo,
  IBigOrderTableParams,
  ILocationDetails,
  IOrdersViewParameters
} from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';
import { AdminTableService } from 'src/app/ubs/ubs-admin/services/admin-table.service';
import { OrderService } from 'src/app/ubs/ubs-admin/services/order.service';
import {
  AddFilterMultiAction,
  AddFiltersAction,
  ChangingOrderData,
  ChangingOrderDataSuccess,
  ClearFilters,
  GetColumns,
  GetColumnsSuccess,
  GetColumnToDisplay,
  GetColumnToDisplaySuccess,
  GetLocationsDetails,
  GetLocationsDetailsSuccess,
  GetTable,
  GetTableSuccess,
  LoadFiltersAction,
  LoadFiltersSuccessAction,
  ReceivedFailure,
  RemoveFilter,
  SaveFiltersAction,
  SetColumnToDisplay,
  SetColumnToDisplaySuccess,
  UpdateOrderInfo,
  UpdateOrderInfoSuccess
} from '../actions/bigOrderTable.actions';

@Injectable()
export class BigOrderTableEffects {
  constructor(
    private actions: Actions,
    private adminTableService: AdminTableService,
    private orderService: OrderService,
    private localStorageService: LocalStorageService,
    private store: Store,
    private snackBar: MatSnackBarComponent
  ) {}

  getColumnToDisplay = createEffect(() => {
    return this.actions.pipe(
      ofType(GetColumnToDisplay),
      mergeMap(() => {
        return this.orderService.getColumnToDisplay().pipe(
          map((ordersViewParameters: IOrdersViewParameters) => GetColumnToDisplaySuccess({ ordersViewParameters })),
          catchError((error) => of(ReceivedFailure(error)))
        );
      })
    );
  });

  setColumnToDisplay = createEffect(() => {
    return this.actions.pipe(
      ofType(SetColumnToDisplay),
      mergeMap((action: { columns: string; titles: string }) => {
        return this.orderService.setColumnToDisplay(action.columns).pipe(
          map(() => SetColumnToDisplaySuccess({ ordersViewParameters: { titles: action.titles } })),
          catchError((error) => of(ReceivedFailure(error)))
        );
      })
    );
  });

  getColumns = createEffect(() => {
    return this.actions.pipe(
      ofType(GetColumns),
      tap(() => this.store.dispatch(LoadFiltersAction())),
      mergeMap(() => {
        return this.adminTableService.getColumns().pipe(
          map((bigOrderTableParams: IBigOrderTableParams) => GetColumnsSuccess({ bigOrderTableParams })),
          catchError((error) => of(ReceivedFailure(error)))
        );
      })
    );
  });

  getTable = createEffect(() => {
    return this.actions.pipe(
      ofType(GetTable),
      withLatestFrom(this.store.pipe(select(filtersSelector))),
      switchMap(([action, filters]) => {
        return this.adminTableService
          .getTable(action.columnName, action.page, action.filter, action.size, action.sortingType, filters)
          .pipe(
            map((bigOrderTable: IBigOrderTable) => GetTableSuccess({ bigOrderTable, reset: action.reset })),
            catchError((error) => of(ReceivedFailure(error)))
          );
      })
    );
  });

  getLocationsDetails = createEffect(() => {
    return this.actions.pipe(
      ofType(GetLocationsDetails),
      mergeMap(() => {
        return this.adminTableService.getLocations().pipe(
          map((locationsDetails: ILocationDetails[]) => GetLocationsDetailsSuccess({ locationsDetails })),
          catchError((error) => of(ReceivedFailure(error)))
        );
      })
    );
  });

  changingOrderData = createEffect(() => {
    return this.actions.pipe(
      ofType(ChangingOrderData),
      mergeMap((action: { orderData: { orderId: number[]; columnName: string; newValue: string }[] }) => {
        return of(...action.orderData).pipe(
          concatMap((orderData) => this.adminTableService.postData(orderData.orderId, orderData.columnName, orderData.newValue)),
          map((_, index) =>
            ChangingOrderDataSuccess({
              orderId: action.orderData[index].orderId,
              columnName: action.orderData[index].columnName,
              newValue: action.orderData[index].newValue
            })
          ),
          catchError((error) => of(ReceivedFailure(error)))
        );
      })
    );
  });

  updateOrderInfo = createEffect(() =>
    this.actions.pipe(
      ofType(UpdateOrderInfo),
      mergeMap((action) =>
        this.orderService.updateOrderInfo(action.orderId, action.currentLanguage, action.updatedOrder, action.notTakenOutReasonImages).pipe(
          map((response) => {
            if (response.body) {
              this.snackBar.openSnackBar('changesSaved');
              return UpdateOrderInfoSuccess({ updatedOrder: response.body as IBigOrderTableOrderInfo });
            } else {
              this.snackBar.openSnackBar('error');
              return ReceivedFailure({ error: 'Failed to update order' });
            }
          }),
          catchError((error) => {
            this.snackBar.openSnackBar('error');
            return of(ReceivedFailure({ error }));
          })
        )
      )
    )
  );

  addFilter = createEffect(
    () =>
      this.actions.pipe(
        ofType(AddFiltersAction, AddFilterMultiAction, RemoveFilter, ClearFilters),
        tap(() => this.store.dispatch(SaveFiltersAction())),
        tap((action) => {
          if (action.fetchTable) {
            this.store.dispatch(GetTable({ page: 0, size: 25, columnName: 'id', sortingType: 'DESC', reset: true }));
          }
        })
      ),
    { dispatch: false }
  );

  loadFilters = createEffect(() => {
    return this.actions.pipe(
      ofType(LoadFiltersAction),
      switchMap(() => {
        const filters = this.localStorageService.getFilters();
        return of(LoadFiltersSuccessAction({ filters }));
      })
    );
  });

  saveFilters = createEffect(
    () =>
      this.actions.pipe(
        ofType(SaveFiltersAction, AddFilterMultiAction, RemoveFilter),
        withLatestFrom(this.store.pipe(select(filtersSelector))),
        tap(([action, data]) => {
          this.localStorageService.setFilters(data);
        })
      ),
    { dispatch: false }
  );
}
