import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  UserViolations,
  IOrderHistory,
  PaymentDetails,
  IPaymentInfoDto,
  FormFieldsName,
  ResponsibleEmployee,
  INotTakenOutReason,
  NotTakenOutReasonImages,
  IOrderInfo,
  IBigOrderTableOrderInfo
} from '../models/ubs-admin.interface';
import { environment } from '@environment/environment';
import { IViolation } from '../models/violation.model';
import { OrderStatus } from '../../ubs/order-status.enum';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private backend: string = environment.ubsAdmin.backendUbsAdminLink;
  private backendLink: string = environment.backendUbsLink;

  readonly districts = [
    'Голосіївський',
    'Дарницький',
    'Деснянський',
    'Дніпровський',
    'Оболонський',
    'Печерський',
    'Подільський',
    'Святошинський',
    'Солом`янський',
    'Шевченківський',
    'Києво-Святошинський'
  ];

  constructor(private http: HttpClient) {}

  filterStatuses(allStatuses: Array<any>, availableStatusesNames: string[]) {
    return availableStatusesNames.map((status) => allStatuses.find((el) => el.key === status));
  }

  getAvailableOrderStatuses(currentOrderStatus: string, statuses: Array<any>) {
    switch (currentOrderStatus) {
      case OrderStatus.FORMED:
        return this.filterStatuses(statuses, [
          OrderStatus.FORMED,
          OrderStatus.ADJUSTMENT,
          OrderStatus.BROUGHT_IT_HIMSELF,
          OrderStatus.CANCELED
        ]);

      case OrderStatus.ADJUSTMENT:
        return this.filterStatuses(statuses, [
          OrderStatus.FORMED,
          OrderStatus.ADJUSTMENT,
          OrderStatus.CONFIRMED,
          OrderStatus.BROUGHT_IT_HIMSELF,
          OrderStatus.CANCELED
        ]);

      case OrderStatus.CONFIRMED:
        return this.filterStatuses(statuses, [
          OrderStatus.FORMED,
          OrderStatus.CONFIRMED,
          OrderStatus.ON_THE_ROUTE,
          OrderStatus.BROUGHT_IT_HIMSELF,
          OrderStatus.CANCELED
        ]);

      case OrderStatus.ON_THE_ROUTE:
        return this.filterStatuses(statuses, [OrderStatus.ON_THE_ROUTE, OrderStatus.DONE, OrderStatus.NOT_TAKEN_OUT, OrderStatus.CANCELED]);

      case OrderStatus.NOT_TAKEN_OUT:
        return this.filterStatuses(statuses, [
          OrderStatus.NOT_TAKEN_OUT,
          OrderStatus.ADJUSTMENT,
          OrderStatus.BROUGHT_IT_HIMSELF,
          OrderStatus.CANCELED
        ]);

      case OrderStatus.DONE:
        return this.filterStatuses(statuses, [OrderStatus.DONE]);

      case OrderStatus.BROUGHT_IT_HIMSELF:
        return this.filterStatuses(statuses, [OrderStatus.BROUGHT_IT_HIMSELF]);

      case OrderStatus.CANCELED:
        return this.filterStatuses(statuses, [OrderStatus.CANCELED]);
    }
  }

  getOrderInfo(orderId: number): Observable<IOrderInfo> {
    return this.http.get<IOrderInfo>(`${this.backend}/management/get-data-for-order/${orderId}`);
  }

  updateOrderInfo(
    orderId: number,
    lang: string,
    data: object,
    images?: NotTakenOutReasonImages[]
  ): Observable<HttpResponse<IBigOrderTableOrderInfo>> {
    const formData: FormData = new FormData();
    formData.append('updateOrderPageAdminDto', JSON.stringify(data));

    if (images?.length) {
      images.forEach((img) => {
        formData.append('images', img.src);
      });
    }

    return this.http.patch<IBigOrderTableOrderInfo>(
      `${this.backend}/management/update-order-page-admin-info/${orderId}?language=${lang}`,
      formData,
      {
        observe: 'response'
      }
    );
  }

  getIsOrderCancelledAfterFormed(orderId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.backend}/management/check-status-transition/formed-to-canceled/${orderId}`);
  }
  isStatusInArray(status: string, statusArray: Array<string>): boolean {
    return statusArray.some((s) => s === status);
  }

  getOrderDetails(orderId: number, lang: string): Observable<any> {
    return this.http.get<any>(`${this.backend}/management/read-order-info/${orderId}?language=${lang}`);
  }

  getOrderSumDetails(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.backend}/management/get-order-sum-detail/871`);
  }

  getUserInfo(orderId: number, lang: string): Observable<any> {
    return this.http.get<any>(`${this.backend}/user-info/${orderId}?lang=${lang}`);
  }

  getUserViolations(userEmail: string): Observable<UserViolations> {
    return this.http.get<UserViolations>(`${this.backend}/management/getUsersViolations?email=${userEmail}`);
  }

  getPaymentInfo(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.backend}/management/getPaymentInfo?orderId=${orderId}`);
  }

  deleteManualPayment(paymentId: number) {
    return this.http.delete(`${this.backend}/management/delete-manual-payment/${paymentId}`);
  }

  readAddressOrder(orderId: number) {
    return this.http.get<any>(`${this.backend}/management/read-address-order/${orderId}`);
  }

  getOrderExportDetails(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.backend}/management/get-order-export-details/${orderId}`);
  }

  getAllReceivingStations(): Observable<any> {
    return this.http.get<any>(`${this.backendLink}/admin/ubs-employee/get-all-receiving-station`);
  }

  getAllResponsiblePersons(positionId: number): Observable<any> {
    return this.http.get<any>(`${this.backend}/management/get-all-employee-by-position/${positionId}`);
  }

  getOrderDetailStatus(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.backend}/management/read-order-detail-status/${orderId}`);
  }

  getOrderHistory(orderId: number, lang: string): Observable<IOrderHistory[]> {
    return this.http.get<IOrderHistory[]>(`${this.backend}/order_history/${orderId}?lang=${lang}`);
  }

  getNotTakenOutReason(historyId: number): Observable<INotTakenOutReason> {
    return this.http.get<INotTakenOutReason>(`${this.backend}/management/get-not-taken-order-reason/${historyId}`);
  }

  updateRecipientsData(postData: any) {
    return this.http.put<any>(`${this.backend}`, postData);
  }

  updateOrdersInfo(lang: string, data: object) {
    return this.http.put(`${this.backend}/management/all-order-page-admin-info?lang=${lang}`, data);
  }

  addPaymentManually(orderId: number, data: PaymentDetails, file?: File): Observable<IPaymentInfoDto> {
    const formData: FormData = new FormData();
    if (file) {
      formData.append('image', file);
    }
    formData.append('manualPaymentDto', JSON.stringify(data));
    return this.http.post<IPaymentInfoDto>(`${this.backend}/management/add-manual-payment/${orderId}`, formData);
  }

  addPaymentBonuses(orderId: number, data: PaymentDetails): Observable<IPaymentInfoDto> {
    return this.http.post<IPaymentInfoDto>(`${this.backend}/management/add-bonuses-user/${orderId}`, data);
  }

  updatePaymentManually(paymentId: number, postData, file): Observable<any> {
    const formData: FormData = new FormData();
    if (file) {
      formData.append('image', file);
    }
    formData.append('manualPaymentDto', JSON.stringify(postData));
    return this.http.put(`${this.backend}/management/update-manual-payment/${paymentId}`, formData);
  }

  getColumnToDisplay() {
    return this.http.get(`${this.backend}/management/getOrdersViewParameters`);
  }

  setColumnToDisplay(columns: string) {
    return this.http.put<any>(`${this.backend}/management/changeOrdersTableView?titles=${columns}`, '');
  }

  addViolationToCurrentOrder(violation) {
    return this.http.post(`${this.backend}/management/addViolationToUser`, violation);
  }

  updateViolationOfCurrentOrder(violation) {
    return this.http.put(`${this.backend}/management/updateViolationToUser`, violation);
  }

  getViolationOfCurrentOrder(orderId): Observable<IViolation> {
    return this.http.get<IViolation>(`${this.backend}/management/violation-details/${orderId}`);
  }

  deleteViolationOfCurrentOrder(orderId) {
    return this.http.delete(`${this.backend}/management/delete-violation-from-order/${orderId}`);
  }

  getOverpaymentMsg(overpayment) {
    let message: string;
    const OVERPAYMENT_MESSAGE = 'order-payment.overpayment';
    const UNDERPAYMENT_MESSAGE = 'order-payment.underpayment';
    if (overpayment > 0) {
      message = OVERPAYMENT_MESSAGE;
    } else if (overpayment < 0) {
      message = UNDERPAYMENT_MESSAGE;
    }
    return message;
  }
  matchProps(prop: string): number {
    switch (prop) {
      case FormFieldsName.CallManager:
        return ResponsibleEmployee.CallManager;
      case FormFieldsName.Driver:
        return ResponsibleEmployee.Driver;
      case FormFieldsName.Logistician:
        return ResponsibleEmployee.Logistician;
      case FormFieldsName.Navigator:
        return ResponsibleEmployee.Navigator;
    }
  }

  getOrderCancelReason(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.backend}/management/get-order-cancellation-reason/${orderId}`);
  }

  saveOrderIdForRefund(orderId: number) {
    return this.http.post(`${this.backend}/management/save-order-for-refund/${orderId}`, orderId, { observe: 'response' });
  }
}
