import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import {
  Address,
  AddressData,
  AllLocationsDtos,
  CourierLocations,
  ActiveCourierDto,
  DistrictEnum,
  PersonalData
} from '../models/ubs.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ICertificateResponse, OrderDetails, DistrictsDtos } from '../models/ubs.interface';
import { environment } from '@environment/environment.js';
import { Order } from '../models/ubs.model';
import { UBSOrderFormService } from './ubs-order-form.service';
import { OrderClientDto } from 'src/app/ubs/ubs-user/ubs-user-orders-list/models/OrderClientDto';
import { ResponceOrderFondyModel } from '../../ubs-user/ubs-user-orders-list/models/ResponceOrderFondyModel';
import { IAppState } from 'src/app/store/state/app.state';
import { Store } from '@ngrx/store';
import { UpdateOrderData, UpdatePersonalData } from 'src/app/store/actions/order.actions';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly orderSubject = new BehaviorSubject<Order>({} as Order);
  private url = environment.ubsAdmin.backendUbsAdminLink;
  locationSubject = new Subject();
  locationSub = new Subject();
  currentAddress = new Subject();
  stateOrderDetails: OrderDetails;
  statePersonalData: PersonalData;

  constructor(
    private http: HttpClient,
    private shareFormService: UBSOrderFormService,
    private localStorageService: LocalStorageService,
    private store: Store
  ) {}

  getOrders(locationId?: number, tariffId?: number): Observable<any> {
    const ubsOrderData = this.localStorageService.getUbsOrderData();
    if (ubsOrderData) {
      const observable = new Observable((observer) => observer.next(ubsOrderData));
      return observable.pipe(tap((orderDetails) => (this.shareFormService.orderDetails = orderDetails)));
    } else {
      this.store
        .select((state: IAppState): OrderDetails => state.order.orderDetails)
        .subscribe((stateOrderDetails: OrderDetails) => {
          this.stateOrderDetails = stateOrderDetails;
        });
      if (this.stateOrderDetails) {
        const savedOrderDetails = { ...this.stateOrderDetails };
        const stateBags = this.stateOrderDetails.bags?.map((bag) => ({
          ...bag,
          quantity: Number(bag.quantity)
        }));
        savedOrderDetails.bags = stateBags;
        const observable = new Observable((observer) => observer.next(savedOrderDetails));
        return observable.pipe(tap((orderDetails: OrderDetails) => (this.shareFormService.orderDetails = orderDetails)));
      } else {
        const param1 = locationId ? `?locationId=${locationId}` : '';
        const param2 = tariffId ? `tariffId=${tariffId}` : '';

        return this.http
          .get<OrderDetails>(`${this.url}/order-details-for-tariff${param1}&${param2}`)
          .pipe(tap((orderDetails) => (this.shareFormService.orderDetails = orderDetails)));
      }
    }
  }

  getExistingOrder(userId: number): Observable<OrderDetails> {
    return this.http.get<OrderDetails>(`${this.url}/details-for-existing-order/${userId}`);
  }

  setLocationData(obj) {
    this.locationSub.next(obj);
  }

  setCurrentAddress(obj) {
    this.currentAddress.next(obj);
  }

  getPersonalData(): Observable<any> {
    const ubsPersonalData = this.localStorageService.getUbsPersonalData();
    if (ubsPersonalData) {
      const observable = new Observable((observer) => observer.next(ubsPersonalData));
      return observable.pipe(tap((personalData) => (this.shareFormService.personalData = personalData)));
    } else {
      this.store
        .select((state: IAppState): PersonalData => state.order.personalData)
        .subscribe((statePersonalData: PersonalData) => {
          this.statePersonalData = statePersonalData;
        });
      if (this.statePersonalData) {
        const savedPersonalData = { ...this.statePersonalData };
        const observable = new Observable((observer) => observer.next(savedPersonalData));
        return observable.pipe(tap((personalData) => (this.shareFormService.personalData = personalData)));
      } else {
        return this.http.get(`${this.url}/personal-data`).pipe(tap((personalData) => (this.shareFormService.personalData = personalData)));
      }
    }
  }

  getTariffForExistingOrder(orderId: number): Observable<CourierLocations> {
    return this.http.get<CourierLocations>(`${this.url}/orders/${orderId}/tariff`);
  }

  processOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.url}/processOrder`, order, { responseType: 'text' as 'json' });
  }

  processExistingOrder(order: Order, orderId: number): Observable<Order> {
    return this.http.post<Order>(`${this.url}/processOrder/${orderId}`, order, { responseType: 'text' as 'json' });
  }

  processCertificate(certificate): Observable<ICertificateResponse> {
    return this.http.get<ICertificateResponse>(`${this.url}/certificate/${certificate}`);
  }

  addAdress(adress: AddressData): Observable<any> {
    return this.http.post<{ addressList: Address[] }>(`${this.url}/save-order-address`, adress);
  }

  updateAdress(adress: Address): Observable<any> {
    return this.http.put<{ addressList: Address[] }>(`${this.url}/update-order-address`, adress);
  }

  deleteAddress(address: Address): Observable<any> {
    return this.http.delete<{ addressList: Address[] }>(`${this.url}/order-addresses/${address.id}`);
  }

  findAllAddresses(): Observable<any> {
    return this.http.get<{ addressList: Address[] }>(`${this.url}/findAll-order-address`);
  }

  findAllDistricts(region: string, city: string): Observable<DistrictsDtos[]> {
    return this.http.get<DistrictsDtos[]>(`${this.url}/get-all-districts?city=${city}&region=${region}`).pipe(
      map((districts) => {
        if (districts.length > 1) {
          return districts.map((item) => ({
            nameUa: item.nameUa + DistrictEnum.UA,
            nameEn: item.nameEn + DistrictEnum.EN
          }));
        } else {
          return districts.map((item) => ({
            nameUa: item.nameUa,
            nameEn: item.nameEn
          }));
        }
      })
    );
  }

  setOrder(order: Order) {
    this.orderSubject.next(order);
  }

  setActualAddress(adressId: number): Observable<any> {
    return this.http.patch(`${this.url}/makeAddressActual/${adressId}`, null);
  }

  changeShouldBePaid(shouldBePaid: boolean) {
    const order = this.orderSubject.getValue();
    order.shouldBePaid = shouldBePaid;
    this.setOrder(order);
  }

  getOrderUrl(): Observable<any> {
    return this.processOrder(this.orderSubject.getValue());
  }

  getExistingOrderUrl(orderId: number): Observable<any> {
    return this.processExistingOrder(this.orderSubject.getValue(), orderId);
  }

  getUbsOrderStatus(): Observable<any> {
    const fondyOrderId = this.localStorageService.getUbsFondyOrderId();
    if (fondyOrderId) {
      return this.getFondyStatus(fondyOrderId);
    }
    return throwError(new Error('There is no OrderId!'));
  }

  getFondyStatus(orderId: string): Observable<any> {
    return this.http.get(`${this.url}/getFondyStatus/${orderId}`);
  }

  getLocations(courierId: number, changeLoc?: boolean): Observable<AllLocationsDtos> {
    const changeLocAttr = changeLoc ? '?changeLoc=changeLocation' : '';

    return this.http.get<AllLocationsDtos>(`${this.url}/locations/${courierId}${changeLocAttr}`);
  }

  getAllActiveCouriers(): Observable<ActiveCourierDto[]> {
    return this.http.get<ActiveCourierDto[]>(`${this.url}/getAllActiveCouriers`);
  }

  getInfoAboutTariff(courierId: number, locationId: number): Observable<AllLocationsDtos> {
    return this.http.get<AllLocationsDtos>(`${this.url}/tariffinfo/${locationId}?courierId=${courierId}`);
  }

  addLocation(location): Observable<any> {
    return this.http.post(`${this.url}/order/get-locations`, location);
  }

  completedLocation(completed: boolean) {
    this.locationSubject.next(completed);
  }

  getOrderFromNotification(orderId: number) {
    return this.http.get(`${this.url}/client/get-data-for-order-surcharge/${orderId}`);
  }

  processOrderFondyFromUserOrderList(order: OrderClientDto): Observable<ResponceOrderFondyModel> {
    return this.http.post<ResponceOrderFondyModel>(`${this.url}/client/processOrderFondy`, order);
  }

  cancelUBSwithoutSaving(): void {
    this.shareFormService.isDataSaved = true;
    this.shareFormService.orderDetails = null;
    this.shareFormService.personalData = null;
    this.localStorageService.removeUbsFondyOrderId();
    this.shareFormService.saveDataOnLocalStorage();
  }

  saveOrderData(): void {
    this.localStorageService.setOrderWithoutPayment(true);
  }

  cleanOrderState(): void {
    this.store.dispatch(UpdateOrderData({ orderDetails: null }));
    this.store.dispatch(UpdatePersonalData({ personalData: null }));
  }

  cleanPrevOrderState(): void {
    this.cleanOrderState();
    localStorage.removeItem('UBSExistingOrderId');
    this.localStorageService.removeUbsFondyOrderId();
  }
}
