import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { environment } from '@environment/environment';
import {
  Addresses,
  Coordinates,
  DateEvent,
  EventFilterCriteriaInterface,
  EventPageResponseDto,
  EventResponseDto,
  PagePreviewDTO
} from '../models/events.interface';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { DatePipe } from '@angular/common';
import { TimeFront } from '../models/event-consts';

@Injectable({
  providedIn: 'root'
})
export class EventsService implements OnDestroy {
  public currentForm: PagePreviewDTO | EventPageResponseDto;
  public backFromPreview: boolean;
  public submitFromPreview: boolean;
  private backEnd = environment.backendLink;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  private arePlacesFilledSubject: BehaviorSubject<boolean[]> = new BehaviorSubject<boolean[]>([]);
  private divider = `, `;
  private pipe = new DatePipe('en-US');
  private datesForm: any[] = [];

  constructor(
    private http: HttpClient,
    private langService: LanguageService
  ) {}

  public setDatesForm(value: any[]) {
    this.datesForm = value;
  }

  public getDatesForm() {
    return this.datesForm;
  }

  public setArePlacesFilled(dates: DateEvent[], submit?: boolean, check?: boolean, ind?: number): void {
    const currentValues = this.arePlacesFilledSubject.getValue();
    let newArray;

    switch (true) {
      case submit:
        newArray = dates.map((nextValue) => !(nextValue.coordinates?.latitude || nextValue.onlineLink));
        break;
      case check:
        currentValues[ind] = currentValues[ind] === null ? false : !(dates[ind].coordinates?.latitude || dates[ind].onlineLink);
        this.arePlacesFilledSubject.next(currentValues);
        return;
      case currentValues.some((el) => el === true):
        newArray = currentValues.slice(0, dates.length);
        newArray = newArray.concat(Array(dates.length - newArray.length).fill(null));
        break;
      default:
        newArray = dates.length && !submit ? Array(dates.length).fill(false) : currentValues;
    }

    this.arePlacesFilledSubject.next(newArray);
  }

  public getAddresses(): Observable<Addresses[]> {
    return this.http.get<Addresses[]>(`${this.backEnd}events/addresses`);
  }

  public setBackFromPreview(val: boolean): void {
    this.backFromPreview = val;
  }

  public getBackFromPreview(): boolean {
    return this.backFromPreview;
  }

  public setSubmitFromPreview(val: boolean): void {
    this.submitFromPreview = val;
  }

  public getSubmitFromPreview(): boolean {
    return this.submitFromPreview;
  }

  public setInitialValueForPlaces(): void {
    this.arePlacesFilledSubject.next([]);
  }

  public getCheckedPlacesObservable(): Observable<boolean[]> {
    return this.arePlacesFilledSubject.asObservable();
  }

  public getImageAsFile(img: string): Observable<Blob> {
    return this.http.get(img, { responseType: 'blob' });
  }

  public formatDate(dateString: Date, hour: string, min: string): string {
    const date = new Date(dateString);
    date.setHours(Number(hour), Number(min));
    return date.toString();
  }

  public transformDate(date: DateEvent, typeDate: string): string {
    return this.pipe.transform(
      this.formatDate(date.date, date[typeDate].split(TimeFront.DIVIDER)[0], date[typeDate].split(TimeFront.DIVIDER)[1]),
      'yyyy-MM-ddTHH:mm:ssZZZZZ'
    );
  }

  public setForm(form: PagePreviewDTO | EventPageResponseDto): void {
    this.currentForm = form;
  }

  public getForm(): PagePreviewDTO | EventPageResponseDto {
    return this.currentForm;
  }

  public createEvent(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.backEnd}events/create`, formData);
  }

  public editEvent(formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.backEnd}events/update`, formData);
  }

  public getEvents(
    page: number,
    quantity: number,
    filter: EventFilterCriteriaInterface,
    searchTitle?: string
  ): Observable<EventResponseDto> {
    let requestParams = new HttpParams();
    requestParams = requestParams.append('page', page.toString());
    requestParams = requestParams.append('size', quantity.toString());
    requestParams = requestParams.append('cities', filter.cities.toString());
    requestParams = requestParams.append('tags', filter.tags.toString());
    requestParams = requestParams.append('eventTime', filter.eventTime.toString());
    requestParams = requestParams.append('statuses', filter.statuses.toString());
    if (searchTitle) {
      requestParams = requestParams.append('title', searchTitle);
    }
    return this.http.get<EventResponseDto>(`${this.backEnd}events`, { params: requestParams });
  }

  public getSubscribedEvents(page: number, quantity: number): Observable<EventResponseDto> {
    return this.http.get<EventResponseDto>(`${this.backEnd}events/myEvents?page=${page}&size=${quantity}`);
  }

  public getCreatedEvents(page: number, quantity: number): Observable<EventResponseDto> {
    return this.http.get<EventResponseDto>(`${this.backEnd}events/myEvents/createdEvents?page=${page}&size=${quantity}`);
  }

  public getAllUserEvents(
    page: number,
    quantity: number,
    userLatitude: number,
    userLongitude: number,
    eventType = ''
  ): Observable<EventResponseDto> {
    return this.http.get<EventResponseDto>(
      `${this.backEnd}events/myEvents?eventType=${eventType}&page=${page}&size=${quantity}&` +
        `userLatitude=${userLatitude}&userLongitude=${userLongitude}`
    );
  }

  public addEventToFavourites(eventId: number): Observable<void> {
    return this.http.post<void>(`${this.backEnd}events/addToFavorites/${eventId}`, eventId);
  }

  public removeEventFromFavourites(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.backEnd}events/removeFromFavorites/${eventId}`);
  }

  public getUserFavoriteEvents(page: number, quantity: number): Observable<EventResponseDto> {
    return this.http.get<EventResponseDto>(`${this.backEnd}events/getAllFavoriteEvents?page=${page}&size=${quantity}`);
  }

  public getEventById(id: number): Observable<any> {
    return this.http.get(`${this.backEnd}events/event/${id}`);
  }

  public deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.backEnd}events/delete/${id}`);
  }

  public rateEvent(id: number, grade: number): Observable<any> {
    return this.http.post<any>(`${this.backEnd}events/rateEvent/${id}/${grade}`, null);
  }

  public addAttender(id: number): Observable<any> {
    return this.http.post<any>(`${this.backEnd}events/addAttender/${id}`, { observe: 'response' });
  }

  public removeAttender(id: number): Observable<any> {
    return this.http.delete<any>(`${this.backEnd}events/removeAttender/${id}`);
  }

  public getAllAttendees(id: number): Observable<any> {
    return this.http.get<any>(`${this.backEnd}events/getAllSubscribers/${id}`);
  }

  public getFormattedAddress(coordinates: Coordinates): string {
    return this.getLangValue(
      coordinates?.streetUa ? this.createAddresses(coordinates, 'Ua') : coordinates?.formattedAddressUa,
      coordinates?.streetEn ? this.createAddresses(coordinates, 'En') : coordinates?.formattedAddressEn
    );
  }

  public getFormattedAddressEventsList(coordinates: Coordinates): string {
    return this.getLangValue(
      coordinates.streetUa
        ? this.createEventsListAddresses(coordinates, 'Ua')
        : coordinates.formattedAddressUa.split(', ').slice(0, 2).reverse().join(', '),
      coordinates.streetEn
        ? this.createEventsListAddresses(coordinates, 'En')
        : coordinates.formattedAddressEn.split(', ').slice(0, 2).reverse().join(', ')
    );
  }

  public getLangValue(uaValue: string, enValue: string): string {
    return this.langService.getLangValue(uaValue, enValue) as string;
  }

  public createAddresses(coord: Coordinates | null, lang: string): string {
    if (!coord) {
      return '';
    }
    const parts = [coord[`country${lang}`], coord[`city${lang}`], coord[`street${lang}`], coord.houseNumber];
    return parts.join(this.divider);
  }

  public createEventsListAddresses(coord: Coordinates | null, lang: string): string {
    if (!coord) {
      return '';
    }
    const addressParts = [coord[`city${lang}`], coord[`street${lang}`], coord.houseNumber];
    return addressParts.join(this.divider);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
