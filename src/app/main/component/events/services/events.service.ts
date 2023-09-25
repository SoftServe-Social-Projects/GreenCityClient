import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';
import { environment } from '@environment/environment';
import { EventResponseDto, Coordinates, PagePreviewDTO, DateEvent, EventFilterCriteriaIntarface } from '../models/events.interface';

@Injectable({
  providedIn: 'root'
})
export class EventsService implements OnDestroy {
  public currentForm: PagePreviewDTO;
  private backEnd = environment.backendLink;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  private arePlacesFilledSubject: BehaviorSubject<boolean[]> = new BehaviorSubject<boolean[]>([]);

  constructor(private http: HttpClient) {}

  public setArePlacesFilled(dates: DateEvent[], submit?: boolean, check?: boolean, ind?: number): void {
    const currentValues = this.arePlacesFilledSubject.getValue();
    let newArray;

    switch (true) {
      case submit:
        newArray = dates.map((nextValue) => !(nextValue.coordinatesDto.latitude || nextValue.onlineLink));
        break;
      case check:
        currentValues[ind] = currentValues[ind] === null ? false : !(dates[ind].coordinatesDto.latitude || dates[ind].onlineLink);
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

  public getAddreses(): Observable<any> {
    return this.http.get(`${this.backEnd}events/addresses`);
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

  public setForm(form: PagePreviewDTO): void {
    this.currentForm = form;
  }

  public getForm(): PagePreviewDTO {
    return this.currentForm;
  }

  public createEvent(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.backEnd}events/create`, formData);
  }

  public editEvent(formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.backEnd}events/update`, formData);
  }

  public getEvents(page: number, quantity: number, filter: EventFilterCriteriaIntarface): Observable<any> {
    return this.http.get(
      `${this.backEnd}events?page=${page}&size=${quantity}&cities=${filter.cities}` +
        `&tags=${filter.tags}&eventTime=${filter.eventTime}&statuses=${filter.statuses}`
    );
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
    eventType: string = ''
  ): Observable<EventResponseDto> {
    return this.http.get<EventResponseDto>(
      `${this.backEnd}events/myEvents?eventType=${eventType}&page=${page}&size=${quantity}&` +
        `userLatitude=${userLatitude}&userLongitude=${userLongitude}`
    );
  }

  public addEventToFavourites(eventId: number): Observable<any> {
    return this.http.post<any>(`${this.backEnd}events/addToFavorites/${eventId}`, eventId);
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

  createAdresses(coord: Coordinates | null, lang: string): string {
    if (!coord) {
      return '';
    }
    const divider = `, `;
    return `${coord[`country${lang}`]}${divider}${coord[`city${lang}`]}${divider}${coord[`street${lang}`]}${divider}${coord.houseNumber}`;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
