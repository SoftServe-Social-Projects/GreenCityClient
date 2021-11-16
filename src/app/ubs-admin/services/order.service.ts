import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import {
  Bags,
  IOrderDetails,
  IOrderSumDetails,
  IUserInfo,
  PaymentInfo,
  UserViolations,
  IExportDetails,
  IDetailStatus,
  IOrderHistory
} from '../models/ubs-admin.interface';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private backend: string = environment.ubsAdmin.backendUbsAdminLink;
  private backendLink: string = environment.backendUbsLink;
  private selectedOrder;
  private selectedOrderStatus: any = new ReplaySubject<any>(1);

  statusDone = { name: 'DONE', translation: 'order-edit.order-status.done' };
  statusAdjustment = { name: 'ADJUSTMENT', translation: 'order-edit.order-status.adjustment' };
  statusOnTheRoute = { name: 'ON_THE_ROUTE', translation: 'order-edit.order-status.on-the-route' };
  statusNotTakenOut = { name: 'NOT_TAKEN_OUT', translation: 'order-edit.order-status.not-taken-out' };
  statusConfirmed = { name: 'CONFIRMED', translation: 'order-edit.order-status.confirmed' };
  statusFormed = { name: 'FORMED', translation: 'order-edit.order-status.formed' };
  statusBroughtItHimself = { name: 'BROUGHT_IT_HIMSELF', translation: 'order-edit.order-status.brought-it-himself' };
  statusCancelled = { name: 'CANCELLED', translation: 'order-edit.order-status.cancelled' };

  readonly orderStatuses = [
    { name: 'FORMED', translation: 'order-edit.order-status.formed', ableActualChange: false },
    { name: 'ADJUSTMENT', translation: 'order-edit.order-status.adjustment', ableActualChange: false },
    { name: 'BROUGHT_IT_HIMSELF', translation: 'order-edit.order-status.brought-it-himself', ableActualChange: true },
    { name: 'CONFIRMED', translation: 'order-edit.order-status.confirmed', ableActualChange: false },
    { name: 'ON_THE_ROUTE', translation: 'order-edit.order-status.on-the-route', ableActualChange: true },
    { name: 'DONE', translation: 'order-edit.order-status.done', ableActualChange: true },
    { name: 'NOT_TAKEN_OUT', translation: 'order-edit.order-status.not-taken-out', ableActualChange: false },
    { name: 'CANCELLED', translation: 'order-edit.order-status.cancelled', ableActualChange: true }
  ];

  readonly paymentStatuses = [
    { name: 'UNPAID', translation: 'order-edit.payment-status.not-paid' },
    { name: 'PAID', translation: 'order-edit.payment-status.paid' },
    { name: 'HALF_PAID', translation: 'order-edit.payment-status.half-paid' },
    { name: 'PAYMENT_REFUNDED', translation: 'order-edit.payment-status.payment-refunded' }
  ];

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

  getSelectedOrder() {
    return this.selectedOrder;
  }

  setSelectedOrder(order) {
    this.selectedOrder = order;
  }

  getAvailableOrderStatuses(currentOrderStatus: string) {
    switch (currentOrderStatus) {
      case 'FORMED':
        return [this.statusFormed, this.statusAdjustment, this.statusBroughtItHimself, this.statusCancelled];

      case 'ADJUSTMENT':
        return [this.statusFormed, this.statusAdjustment, this.statusConfirmed, this.statusBroughtItHimself, this.statusCancelled];

      case 'CONFIRMED':
        return [this.statusFormed, this.statusConfirmed, this.statusOnTheRoute, this.statusCancelled];

      case 'BROUGHT_IT_HIMSELF':
        return [this.statusBroughtItHimself, this.statusDone, this.statusCancelled];

      case 'ON_THE_ROUTE':
        return [this.statusOnTheRoute, this.statusDone, this.statusNotTakenOut, this.statusCancelled];

      case 'NOT_TAKEN_OUT':
        return [this.statusNotTakenOut, this.statusAdjustment, this.statusCancelled];
    }
  }

  public getOrderInfo(orderId, lang) {
    return this.http.get(`${this.backend}/management/get-data-for-order/${orderId}/${lang}`);
  }

  public getOrderDetails(orderId: number, lang: string): Observable<IOrderDetails> {
    return this.http.get<IOrderDetails>(`${this.backend}/management/read-order-info/${orderId}?language=${lang}`);
  }
  public getOrderSumDetails(orderId: number): Observable<IOrderSumDetails> {
    return this.http.get<IOrderSumDetails>(`${this.backend}/management/get-order-sum-detail/871`);
  }

  public getUserInfo(orderId: number, lang: string): Observable<IUserInfo> {
    return this.http.get<IUserInfo>(`${this.backend}/user-info/${orderId}?lang=${lang}`);
  }

  public getUserViolations(userEmail: string): Observable<UserViolations> {
    return this.http.get<UserViolations>(`${this.backend}/management/getUsersViolations?email=${userEmail}`);
  }

  public getPaymentInfo(orderId: number): Observable<PaymentInfo> {
    return this.http.get<PaymentInfo>(`${this.backend}/management/getPaymentInfo?orderId=${orderId}`);
  }

  public readAddressOrder(orderId: number) {
    return this.http.get<any>(`${this.backend}/management/read-address-order/${orderId}`);
  }

  public getOrderExportDetails(orderId: number): Observable<IExportDetails> {
    return this.http.get<IExportDetails>(`${this.backend}/management/get-order-export-details/${orderId}`);
  }

  public getAllReceivingStations(): Observable<any> {
    return this.http.get<any>(`${this.backendLink}/admin/ubs-employee/get-all-receiving-station`);
  }

  public getAllResponsiblePersons(positionId: number): Observable<any> {
    return this.http.get<any>(`${this.backend}/management/get-all-employee-by-position/${positionId}`);
  }

  public getOrderDetailStatus(orderId: number): Observable<IDetailStatus> {
    return this.http.get<IDetailStatus>(`${this.backend}/management/read-order-detail-status/${orderId}`);
  }

  public getOrderHistory(orderId: number): Observable<IOrderHistory[]> {
    return this.http.get<IOrderHistory[]>(`${this.backend}/order_history/${orderId}`);
  }

  public updateRecipientsData(postData: any) {
    return this.http.put<any>(`${this.backend}`, postData);
  }

  public getSelectedOrderStatus(): Observable<any> {
    return this.selectedOrderStatus.asObservable();
  }

  public setSelectedOrderStatus(statusName) {
    this.selectedOrderStatus.next(this.getOrderObjByName(statusName)[0]);
  }

  private getOrderObjByName(name) {
    return this.orderStatuses.filter((status) => status.name === name);
  }
}
