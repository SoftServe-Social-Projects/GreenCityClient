import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from '@environment/environment';
import {
  Addresses,
  EventAttender,
  EventFilterCriteriaInterface,
  EventForm,
  EventResponse,
  EventResponseDto,
  LocationResponse,
  PagePreviewDTO
} from '../models/events.interface';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService implements OnDestroy {
  currentForm: PagePreviewDTO | EventResponse;
  private eventPreview: PagePreviewDTO;
  private event: EventForm;
  private backEnd = environment.backendLink;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  private divider = `, `;
  private isFromCreateEvent: boolean;
  private eventId: number;

  constructor(
    private http: HttpClient,
    private langService: LanguageService
  ) {}

  setEvent(event: EventForm): void {
    this.event = event;
    this.eventPreview = this.convertEventToPreview(event);
  }

  setEventId(id: number) {
    this.eventId = id;
  }

  getEventId(): number {
    return this.eventId;
  }

  setIsFromCreateEvent(value: boolean): void {
    this.isFromCreateEvent = value;
  }

  getIsFromCreateEvent(): boolean {
    return this.isFromCreateEvent;
  }
  private convertEventToPreview(event: EventForm): PagePreviewDTO {
    const { eventInformation, dateInformation } = event;

    return {
      title: eventInformation.title,
      description: eventInformation.description,
      eventDuration: eventInformation.duration,
      open: eventInformation.open,
      editorText: eventInformation.editorText,
      dates: dateInformation.map((dateInfo) => {
        const startDate = new Date(dateInfo.day.date);
        startDate.setHours(parseInt(dateInfo.day.startTime.split(':')[0], 10), parseInt(dateInfo.day.startTime.split(':')[1], 10));

        const finishDate = new Date(dateInfo.day.date);
        finishDate.setHours(parseInt(dateInfo.day.endTime.split(':')[0], 10), parseInt(dateInfo.day.endTime.split(':')[1], 10));

        return {
          startDate: startDate.toISOString(),
          finishDate: finishDate.toISOString(),
          onlineLink: dateInfo.placeOnline.onlineLink,
          place: dateInfo.placeOnline.place,
          /* eslint-disable indent */
          coordinates: dateInfo.placeOnline.coordinates
            ? {
                latitude: dateInfo.placeOnline.coordinates.lat,
                longitude: dateInfo.placeOnline.coordinates.lng
              }
            : undefined
          /* eslint-enable indent */
        };
      }),
      tags: eventInformation.tags,
      imgArray: eventInformation.images.map((image) => image.url),
      imgArrayToPreview: eventInformation.images.filter((image) => image.main).map((image) => image.url),
      location: dateInformation
        .map((dateInfo) => dateInfo.placeOnline.place)
        .filter((place) => place)
        .join(', ')
    };
  }
  getEventPreview(event: EventForm): PagePreviewDTO {
    return this.convertEventToPreview(event);
  }
  getEvent(): EventForm {
    return this.event;
  }
  getAddresses(): Observable<Addresses[]> {
    return this.http.get<Addresses[]>(`${this.backEnd}events/addresses`);
  }

  getImageAsFile(img: string): Observable<Blob> {
    return this.http.get(img, { responseType: 'blob' });
  }

  setForm(form: PagePreviewDTO | EventResponse): void {
    this.currentForm = form;
  }

  getForm(): PagePreviewDTO | EventResponse {
    return this.eventPreview;
  }

  createEvent(formData: FormData): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.backEnd}events`, formData);
  }

  editEvent(formData: FormData, eventId: number): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${this.backEnd}events/${eventId}`, formData);
  }

  getEvents(requestParams: HttpParams): Observable<EventResponseDto> {
    return this.http.get<EventResponseDto>(`${this.backEnd}events`, { params: requestParams });
  }

  addEventToFavourites(eventId: number): Observable<void> {
    return this.http.post<void>(`${this.backEnd}events/${eventId}/favorites`, eventId);
  }

  removeEventFromFavourites(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.backEnd}events/${eventId}/favorites`);
  }

  getUserFavoriteEvents(page: number, quantity: number, userId: number): Observable<EventResponseDto> {
    return this.http.get<EventResponseDto>(`${this.backEnd}events?page=${page}&size=${quantity}&statuses=SAVED&user-id=${userId}`);
  }

  getEventById(eventId: number): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.backEnd}events/${eventId}`);
  }

  getIsLikedByUser(eventId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.backEnd}events/${eventId}/likes`);
  }

  postToggleLike(eventId: number): Observable<any> {
    return this.http.post(`${this.backEnd}events/${eventId}/like`, {});
  }

  deleteEvent(eventId: number): Observable<any> {
    return this.http.delete(`${this.backEnd}events/${eventId}`);
  }

  rateEvent(eventId: number, grade: number): Observable<any> {
    return this.http.post<any>(`${this.backEnd}events/${eventId}/rating/${grade}`, null);
  }

  addAttender(eventId: number): Observable<any> {
    return this.http.post<any>(`${this.backEnd}events/${eventId}/attenders`, { observe: 'response' });
  }

  removeAttender(eventId: number): Observable<any> {
    return this.http.delete<any>(`${this.backEnd}events/${eventId}/attenders`);
  }

  getAllAttendees(eventId: number): Observable<EventAttender[]> {
    return this.http.get<EventAttender[]>(`${this.backEnd}events/${eventId}/attenders`);
  }

  getFormattedAddress(coordinates: LocationResponse): string {
    return this.langService.getLangValue(
      coordinates?.streetUa ? this.createAddresses(coordinates, 'Ua') : coordinates?.formattedAddressUa,
      coordinates?.streetEn ? this.createAddresses(coordinates, 'En') : coordinates?.formattedAddressEn
    );
  }

  getFormattedAddressEventsList(coordinates: LocationResponse): string {
    return this.langService.getLangValue(
      coordinates.streetUa
        ? this.createEventsListAddresses(coordinates, 'Ua')
        : coordinates.formattedAddressUa?.split(', ').slice(0, 2).reverse().join(', ') || '',
      coordinates.streetEn
        ? this.createEventsListAddresses(coordinates, 'En')
        : coordinates.formattedAddressEn?.split(', ').slice(0, 2).reverse().join(', ') || ''
    );
  }

  createAddresses(location: LocationResponse | null, lang: string): string {
    if (!location) {
      return '';
    }
    return [location[`country${lang}`], location[`city${lang}`], location[`street${lang}`], location.houseNumber].join(this.divider);
  }

  createEventsListAddresses(location: LocationResponse | null, lang: string): string {
    if (!location) {
      return '';
    }
    return [location[`city${lang}`], location[`street${lang}`], location.houseNumber].join(this.divider);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
