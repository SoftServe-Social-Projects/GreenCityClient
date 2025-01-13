import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import {
  Address,
  AddressData,
  AllLocationsDtos,
  CourierLocations,
  ActiveCourierDto,
  DistrictEnum,
  ICertificateResponse,
  OrderDetails,
  DistrictsDtos,
  IProcessOrderResponse,
  Order,
  AllActiveLocationsDtosResponse,
  KyivNamesEnum
} from '../models/ubs.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environment/environment';
import { UBSOrderFormService } from './ubs-order-form.service';
import { OrderClientDto } from 'src/app/ubs/ubs-user/ubs-user-orders-list/models/OrderClientDto';
import { ResponceOrderFondyModel } from '@ubs/ubs-user/ubs-user-orders-list/models/ResponceOrderFondyModel';
import { Store } from '@ngrx/store';
import { ClearOrderDetails, ClearPersonalData } from 'src/app/store/actions/order.actions';
import { IUserOrderInfo } from 'src/app/ubs/ubs-user/ubs-user-orders-list/models/UserOrder.interface';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly url = environment.ubsAdmin.backendUbsAdminLink;
  private readonly standaloneCities = [KyivNamesEnum.KyivEn.toString(), KyivNamesEnum.KyivUa.toString()];
  locationSubject = new Subject();
  locationSub = new Subject();
  currentAddress = new Subject();
  stateOrderDetails: OrderDetails;

  constructor(
    private readonly http: HttpClient,
    private readonly shareFormService: UBSOrderFormService,
    private readonly localStorageService: LocalStorageService,
    private readonly langService: LanguageService,
    private readonly store: Store
  ) {}

  getOrderDetails(locationId: number, tariffId: number): Observable<OrderDetails> {
    const params = new HttpParams().set('locationId', locationId.toString()).set('tariffId', tariffId.toString());

    return this.http.get<OrderDetails>(`${this.url}/order-details-for-tariff`, { params });
  }

  getUBSCouriedId(name: string): Observable<number> {
    return this.getAllActiveCouriers().pipe(
      map((couriers) => couriers.find((courier) => courier.nameEn === name || courier.nameUk === name).courierId)
    );
  }

  getLocationId(courierId: number): Observable<number> {
    const locationId = this.localStorageService.getLocationId();

    return locationId
      ? of(locationId)
      : this.getLocations(courierId, false).pipe(map((allLocations) => allLocations[0].locations[0].locationId));
  }

  getLocationName(location: { nameUk: string; nameEn: string } | string, region: { nameUk: string; nameEn: string } | string): string {
    const locationName = this.getName(location);
    const regionName = this.getName(region);

    return this.standaloneCities.includes(locationName) ? locationName : `${locationName}, ${regionName}`;
  }

  private getName(input: { nameUk: string; nameEn: string } | string): string {
    return typeof input === 'string' ? input : this.langService.getLangValue(input.nameUk, input.nameEn);
  }

  getExistingOrderDetails(orderId: number): Observable<OrderDetails> {
    return this.http.get<OrderDetails>(`${this.url}/details-for-existing-order/${orderId}`);
  }

  getExistingOrderTariff(orderId: number): Observable<CourierLocations> {
    return this.http.get<CourierLocations>(`${this.url}/orders/${orderId}/tariff`);
  }

  getExistingOrderInfo(orderId: number): Observable<IUserOrderInfo> {
    return this.http.get<IUserOrderInfo>(`${this.url}/client/user-order/${orderId}`);
  }

  setLocationData(obj) {
    this.locationSub.next(obj);
  }

  setCurrentAddress(obj) {
    this.currentAddress.next(obj);
  }

  getPersonalData(): Observable<any> {
    const ubsPersonalData = this.localStorageService.getUbsPersonalData();
    return ubsPersonalData ? of(ubsPersonalData) : this.http.get(`${this.url}/personal-data`);
  }

  processNewOrder(order: Order): Observable<IProcessOrderResponse> {
    return this.http.post<IProcessOrderResponse>(`${this.url}/processOrder`, order);
  }

  processExistingOrder(order: Order, orderId: number): Observable<IProcessOrderResponse> {
    return this.http.post<IProcessOrderResponse>(`${this.url}/processOrder/${orderId}`, order);
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
    return this.http
      .get<DistrictsDtos[]>(`${this.url}/get-all-districts?city=${encodeURIComponent(city)}&region=${encodeURIComponent(region)}`)
      .pipe(
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

  setActualAddress(adressId: number): Observable<any> {
    return this.http.patch(`${this.url}/makeAddressActual/${adressId}`, null);
  }

  getUbsOrderStatus(): Observable<any> {
    const fondyOrderId = this.localStorageService.getUbsPaymentOrderId();
    if (fondyOrderId) {
      return this.getFondyStatus(fondyOrderId);
    }
    return throwError(new Error('There is no OrderId!'));
  }

  getFondyStatus(orderId: string): Observable<any> {
    return this.http.get(`${this.url}/getFondyStatus/${orderId}`);
  }

  getLocations(courierId: number, changeLoc?: boolean): Observable<AllActiveLocationsDtosResponse> {
    const changeLocAttr = changeLoc ? '?changeLoc=changeLocation' : '';

    return this.http.get<AllActiveLocationsDtosResponse>(`${this.url}/locations/${courierId}${changeLocAttr}`);
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

  processOrderFondyFromUserOrderList(order: OrderClientDto): Observable<ResponceOrderFondyModel> {
    return this.http.post<ResponceOrderFondyModel>(`${this.url}/client/processOrder`, order);
  }

  cancelUBSwithoutSaving(): void {
    this.shareFormService.isDataSaved = true;
    this.shareFormService.orderDetails = null;
    this.shareFormService.personalData = null;
    this.localStorageService.removeUbsPaymentOrderId();
    this.cleanOrderState();
  }

  cleanOrderState(): void {
    this.store.dispatch(ClearOrderDetails());
    this.store.dispatch(ClearPersonalData());
  }

  cleanPrevOrderState(): void {
    this.cleanOrderState();
    localStorage.removeItem('UBSExistingOrderId');
    this.localStorageService.removeUbsPaymentOrderId();
  }
}
