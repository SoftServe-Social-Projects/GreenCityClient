import { Language } from '../../i18n/Language';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { EventResponse, PagePreviewDTO } from '../../component/events/models/events.interface';
import { Address, CourierLocations, OrderDetails } from 'src/app/ubs/ubs/models/ubs.interface';
import { IFilters } from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';
import { FactOfTheDay } from '@global-user/models/factOfTheDay';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  languageSubject: Subject<string> = new Subject<string>();
  firstNameBehaviourSubject: BehaviorSubject<string>;
  languageBehaviourSubject: BehaviorSubject<string>;
  accessTokenBehaviourSubject: BehaviorSubject<string>;
  ubsRegBehaviourSubject: BehaviorSubject<boolean>;
  ubsRedirectionBehaviourSubject: BehaviorSubject<number>;
  userIdBehaviourSubject: BehaviorSubject<number>;
  private readonly USER_ID = 'userId';
  private readonly ACCESS_TOKEN = 'accessToken';
  private readonly REFRESH_TOKEN = 'refreshToken';
  private readonly NAME = 'name';
  private readonly PREVIOUS_PAGE = 'previousPage';
  private readonly CAN_USER_EDIT_EVENT = 'canUserEdit';
  private readonly EDIT_EVENT = 'editEvent';
  private readonly ORDER_TO_REDIRECT = 'orderIdToRedirect';
  private readonly HABITS_GALLERY_VIEW = 'habitsGalleryView';
  readonly ONE_DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

  constructor() {
    this.firstNameBehaviourSubject = new BehaviorSubject<string>(this.getName());
    this.languageBehaviourSubject = new BehaviorSubject<string>(this.getCurrentLanguage());
    this.accessTokenBehaviourSubject = new BehaviorSubject<string>(this.getAccessToken());
    this.ubsRegBehaviourSubject = new BehaviorSubject<boolean>(this.getUbsRegistration());
    this.ubsRedirectionBehaviourSubject = new BehaviorSubject<number>(this.getOrderIdToRedirect());
    this.userIdBehaviourSubject = new BehaviorSubject<number>(this.getUserId());
  }

  setHabitsGalleryView(value: boolean): void {
    localStorage.setItem(this.HABITS_GALLERY_VIEW, JSON.stringify(value));
  }

  getHabitsGalleryView(): boolean | null {
    return JSON.parse(localStorage.getItem(this.HABITS_GALLERY_VIEW));
  }

  getAccessToken(): string {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  setEditMode(key: string, permision: boolean) {
    localStorage.setItem(key, `${permision}`);
  }

  getEditMode(): boolean {
    return localStorage.getItem(this.CAN_USER_EDIT_EVENT) === 'true';
  }

  setEventForEdit(key: string, event: EventResponse | PagePreviewDTO) {
    localStorage.setItem(key, JSON.stringify(event));
  }

  getEventForEdit() {
    return JSON.parse(localStorage.getItem(this.EDIT_EVENT));
  }

  getRefreshToken(): string {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  getUserId(): number {
    return Number.parseInt(localStorage.getItem(this.USER_ID), 10);
  }

  getPreviousPage(): string {
    return localStorage.getItem(this.PREVIOUS_PAGE);
  }

  setCurentPage(key: string, pageName: string) {
    localStorage.setItem(key, pageName);
  }

  setAccessToken(accessToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN, accessToken);
    this.removeUbsRegistration();
    this.accessTokenBehaviourSubject.next(accessToken);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN, refreshToken);
  }

  setUserId(userId: number): void {
    localStorage.setItem(this.USER_ID, String(userId));
    this.userIdBehaviourSubject.next(this.getUserId());
  }

  setFirstName(name: string): void {
    localStorage.setItem(this.NAME, name);
    this.firstNameBehaviourSubject.next(name);
  }

  getFirstName(): string {
    return localStorage.getItem(this.NAME);
  }

  setFirstSignIn(): void {
    localStorage.setItem('firstSignIn', 'true');
  }

  unsetFirstSignIn(): void {
    localStorage.setItem('firstSignIn', 'false');
  }

  getFirstSighIn(): boolean {
    return localStorage.getItem('firstSignIn') === 'true';
  }

  setCurrentLanguage(language: Language): void {
    localStorage.setItem('language', language);
    this.languageSubject.next(language);
    this.languageBehaviourSubject.next(language);
  }

  getCurrentLanguage(): Language {
    return localStorage.getItem('language') as Language;
  }

  clear(): void {
    const currentLanguage: Language = this.getCurrentLanguage();
    localStorage.clear();
    this.setCurrentLanguage(currentLanguage);
    this.firstNameBehaviourSubject.next(null);
    this.userIdBehaviourSubject.next(null);
  }

  setUbsRegistration(value: boolean): void {
    if (!localStorage.getItem(this.USER_ID)) {
      this.ubsRegBehaviourSubject.next(value);
      localStorage.setItem('callUbsRegWindow', `${value}`);
    }
  }

  getUbsRegistration(): boolean {
    return localStorage.getItem('callUbsRegWindow') === 'true';
  }

  removeUbsRegistration(): void {
    localStorage.removeItem('callUbsRegWindow');
  }

  setUbsOrderData(personalData: string, orderData: string) {
    localStorage.setItem('UBSpersonalData', personalData);
    localStorage.setItem('UBSorderData', orderData);
  }

  setUBSOrderData(orderData: OrderDetails) {
    localStorage.setItem('UBSorderData', JSON.stringify(orderData));
  }

  setUbsOrderDataBeforeRedirect(personalData: string, orderData: string, anotherClientData: string, UBSExistingOrderId: string) {
    localStorage.setItem('UBSpersonalData', personalData);
    localStorage.setItem('UBSorderData', orderData);
    localStorage.setItem('anotherClient', anotherClientData);
    localStorage.setItem('UBSExistingOrderId', UBSExistingOrderId);
  }

  removeanotherClientData(): void {
    localStorage.removeItem('anotherClient');
  }

  setLocationId(currentLocationId: number) {
    localStorage.setItem('currentLocationId', String(currentLocationId));
  }

  setLocations(locations: CourierLocations) {
    localStorage.setItem('locations', JSON.stringify(locations));
  }

  setOrderWithoutPayment(value: boolean): void {
    localStorage.setItem('saveOrderWithoutPayment', String(value));
  }

  getOrderWithoutPayment(): any {
    return localStorage.getItem('saveOrderWithoutPayment') === 'undefined'
      ? false
      : JSON.parse(localStorage.getItem('saveOrderWithoutPayment'));
  }

  setUbsOrderId(orderId: string | number): void {
    localStorage.setItem('UbsOrderId', String(orderId));
  }

  getUbsOrderId(): any {
    return localStorage.getItem('UbsOrderId') === 'undefined' ? false : JSON.parse(localStorage.getItem('UbsOrderId'));
  }

  removeUbsOrderId() {
    localStorage.removeItem('UbsOrderId');
  }

  setUbsPaymentOrderId(orderId: string | number) {
    localStorage.setItem('UbsPaymentOrderId', String(orderId));
  }

  setUbsBonusesOrderId(orderId: string | number) {
    localStorage.setItem('UbsBonusesOrderId', String(orderId));
  }

  getUbsBonusesOrderId(): any {
    return localStorage.getItem('UbsBonusesOrderId') === 'undefined' ? false : JSON.parse(localStorage.getItem('UbsBonusesOrderId'));
  }

  getUbsPaymentOrderId(): any {
    return localStorage.getItem('UbsPaymentOrderId') === 'undefined' ? false : JSON.parse(localStorage.getItem('UbsPaymentOrderId'));
  }

  removeUbsPaymentOrderId() {
    localStorage.removeItem('UbsPaymentOrderId');
  }

  removeOrderWithoutPayment(): void {
    localStorage.removeItem('saveOrderWithoutPayment');
  }

  removeUBSExistingOrderId() {
    localStorage.removeItem('UBSExistingOrderId');
  }

  setUserPagePayment(state: boolean): unknown {
    return localStorage.setItem('IsUserPagePayment', String(state));
  }

  getUserPagePayment(): string {
    return localStorage.getItem('IsUserPagePayment');
  }

  removeUserPagePayment(): void {
    localStorage.removeItem('IsUserPagePayment');
  }

  clearPaymentInfo(): void {
    this.removeUbsPaymentOrderId();
    this.removeUserPagePayment();
  }

  removeUbsOrderData() {
    localStorage.removeItem('UBSpersonalData');
    localStorage.removeItem('UBSorderData');
    localStorage.removeItem('currentLocationId');
    localStorage.removeItem('locations');
    localStorage.removeItem('addressId');
    localStorage.removeItem('anotherClient');
  }

  removeUbsOrderAndPersonalData(): void {
    localStorage.removeItem('UBSpersonalData');
    localStorage.removeItem('UBSorderData');
  }

  getUbsPersonalData(): any {
    return localStorage.getItem('UBSpersonalData') === 'undefined' ? false : JSON.parse(localStorage.getItem('UBSpersonalData'));
  }

  getUbsOrderData(): OrderDetails {
    return localStorage.getItem('UBSorderData') === 'undefined' ? false : JSON.parse(localStorage.getItem('UBSorderData'));
  }

  getLocationId(): number | false {
    return localStorage.getItem('currentLocationId') === null ? false : JSON.parse(localStorage.getItem('currentLocationId'));
  }

  getExistingOrderId(): string {
    return localStorage.getItem('UBSExistingOrderId');
  }

  setCustomer(customer) {
    return localStorage.setItem('currentCustomer', JSON.stringify(customer));
  }

  getCustomer() {
    return JSON.parse(localStorage.getItem('currentCustomer'));
  }

  removeCurrentCustomer(): void {
    localStorage.removeItem('currentCustomer');
  }

  setOrderIdToRedirect(orderId: number): void {
    localStorage.setItem(this.ORDER_TO_REDIRECT, String(orderId));
    this.ubsRedirectionBehaviourSubject.next(orderId);
  }

  getOrderIdToRedirect(): number {
    return Number.parseInt(localStorage.getItem(this.ORDER_TO_REDIRECT), 10);
  }

  setUbsAdminOrdersTableTitleColumnFilter(filters): void {
    if (filters.length) {
      const serialized = JSON.stringify(filters);
      window.localStorage.setItem('UbsAdminOrdersTableTitleColumnFilters', serialized);
    } else {
      window.localStorage.removeItem('UbsAdminOrdersTableTitleColumnFilters');
    }
  }

  getFilters(): IFilters | null {
    return JSON.parse(window.localStorage.getItem('filters'));
  }

  setFilters(filters: IFilters): void {
    window.localStorage.setItem('filters', JSON.stringify(filters));
  }

  getUbsAdminOrdersTableTitleColumnFilter() {
    return JSON.parse(window.localStorage.getItem('UbsAdminOrdersTableTitleColumnFilters')) || [];
  }

  removeAdminOrderFilters(): void {
    window.localStorage.removeItem('UbsAdminOrdersTableTitleColumnFilters');
  }

  setAdminOrdersDateFilter(filters): void {
    if (filters) {
      const serialized = JSON.stringify(filters);
      window.localStorage.setItem('UbsAdminOrdersDateFilters', serialized);
    }
  }

  getAdminOrdersDateFilter() {
    return JSON.parse(window.localStorage.getItem('UbsAdminOrdersDateFilters'));
  }

  removeAdminOrderDateFilters(): void {
    window.localStorage.removeItem('UbsAdminOrdersDateFilters');
  }

  setFinalSumOfOrder(value): void {
    localStorage.setItem('finalSumOfOrder', JSON.stringify(value));
  }

  getFinalSumOfOrder(): number {
    return JSON.parse(localStorage.getItem('finalSumOfOrder'));
  }

  setTariffId(currentTariffId: number): void {
    localStorage.setItem('currentTariffId', String(currentTariffId));
  }

  getTariffId(): number {
    return JSON.parse(localStorage.getItem('currentTariffId'));
  }

  setAddressId(addressId: number): void {
    localStorage.setItem('addressId', String(addressId));
  }

  getAddressId(): number {
    return JSON.parse(localStorage.getItem('addressId'));
  }

  setAddresses(addresses: Address[]) {
    localStorage.setItem('addresses', JSON.stringify(addresses));
  }

  getCurrentLocationId(): number {
    return JSON.parse(localStorage.getItem('currentLocationId'));
  }

  getLocations(): CourierLocations {
    return JSON.parse(localStorage.getItem('locations'));
  }

  getIsAnotherClient(): boolean {
    return JSON.parse(localStorage.getItem('anotherClient'));
  }

  setIsAnotherClient(value: boolean) {
    localStorage.setItem('anotherClient', String(value));
  }

  removeIsAnotherClient(): void {
    localStorage.removeItem('anotherClient');
  }

  private getName(): string {
    return localStorage.getItem(this.NAME);
  }

  saveFactToLocalStorage(fact: FactOfTheDay, currentTime: number, factKey: string): void {
    localStorage.setItem(factKey, JSON.stringify(fact));
    localStorage.setItem('lastFetchTime', currentTime.toString());
  }

  getFactFromLocalStorage(factKey: string): FactOfTheDay | null {
    const savedFact = localStorage.getItem(factKey);
    const lastFetchTime = localStorage.getItem('lastFetchTime');
    const currentTime = Date.now();

    const isFactPresent = !!savedFact;
    const isLastFetchTimePresent = !!lastFetchTime;
    const isWithinOneDay = currentTime - Number(lastFetchTime) < this.ONE_DAY_IN_MILLIS;

    if (isFactPresent && isLastFetchTimePresent && isWithinOneDay) {
      return JSON.parse(savedFact);
    }

    return null;
  }

  clearFromLocalStorage(factKey: string, isHabit: boolean = false): void {
    localStorage.removeItem(factKey);
    !isHabit && localStorage.removeItem('lastFetchTime');
  }
}
