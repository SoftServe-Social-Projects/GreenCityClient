import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from '@environment/environment';
import { DefaultCoordinates } from '../models/event-consts';

import {
  Addresses,
  DateInformation,
  Dates,
  EventAttender,
  EventDTO,
  EventForm,
  EventResponse,
  EventResponseDto,
  LocationResponse,
  PagePreviewDTO
} from '../models/events.interface';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class EventsService implements OnDestroy {
  currentForm: PagePreviewDTO | EventResponse;
  private backEnd = environment.backendLink;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  private divider = `, `;
  private isFromCreateEvent: boolean;

  constructor(
    private http: HttpClient,
    private langService: LanguageService,
    private fb: FormBuilder
  ) {}

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

  convertEventToFormEvent(event: EventForm): FormGroup {
    const information = event?.eventInformation;
    const date = event?.dateInformation ?? [];

    return this.fb.group({
      eventInformation: this.fb.group({
        title: [information?.title ?? '', [Validators.required, Validators.maxLength(70)]],
        description: [information?.description ?? '', [Validators.required, Validators.minLength(20)]],
        open: [information?.open ?? true, Validators.required],
        images: [information?.images ?? []],
        duration: [information?.duration ?? 1, Validators.required],
        tags: [information?.tags ?? [], [Validators.required, Validators.minLength(1)]]
      }),

      dateInformation: this.fb.array(date.length > 0 ? date.map((date) => this.createDateFormGroup(date)) : [this.createDateFormGroup()])
    });
  }

  private createDateFormGroup(date?: any): FormGroup {
    return this.fb.group({
      day: this.fb.group({
        date: [date?.day.date ? new Date(date.day.date) : new Date(), [Validators.required]],
        startTime: [date?.day.startTime ?? '', Validators.required],
        endTime: [date?.day.endTime ?? '', Validators.required],
        allDay: [date?.day.allDay ?? false],
        minDate: [date?.day.minDate ? new Date(date.minDate) : new Date()],
        maxDate: [date?.day.maxDate ? new Date(date.maxDate) : '']
      }),
      placeOnline: this.fb.group({
        coordinates: new FormControl(
          date?.placeOnline.coordinates ?? { lat: DefaultCoordinates.LATITUDE, lng: DefaultCoordinates.LONGITUDE }
        ),
        onlineLink: new FormControl(date?.placeOnline.onlineLink ?? ''),
        place: new FormControl(date?.placeOnline.place ?? ''),
        appliedLinkForAll: [date?.placeOnline.appliedLinkForAll ?? false],
        appliedPlaceForAll: [date?.placeOnline.appliedPlaceForAll ?? false]
      })
    });
  }

  transformDatesFormToDates(form: DateInformation[]): Dates[] {
    return form
      .map((value) => {
        const { date, endTime, startTime } = value.day;
        const { onlineLink, place, coordinates } = value.placeOnline;

        const dateObject = new Date(date);

        if (isNaN(dateObject.getTime())) {
          return;
        }

        let [hours, minutes] = startTime.split(':');
        dateObject.setHours(parseInt(hours, 10));
        dateObject.setMinutes(parseInt(minutes, 10));
        const startDate = dateObject.toISOString();

        [hours, minutes] = endTime.split(':');
        dateObject.setHours(parseInt(hours, 10));
        dateObject.setMinutes(parseInt(minutes, 10));
        const finishDate = dateObject.toISOString();

        const dates: Dates = {
          startDate,
          finishDate,
          id: undefined
        };
        if (onlineLink) {
          dates.onlineLink = onlineLink;
        }
        if (place) {
          dates.coordinates = {
            latitude: coordinates.lat,
            longitude: coordinates.lng
          };
        }
        return dates;
      })
      .filter(Boolean);
  }

  prepareEventForSubmit(eventForm: EventForm, eventId: number, isUpdating: boolean) {
    const { eventInformation, dateInformation } = eventForm;
    const { open, tags, description, title, images } = eventInformation;
    const dates: Dates[] = this.transformDatesFormToDates(dateInformation);
    let sendEventDto: EventDTO = {
      title,
      description: description,
      open,
      tags,
      datesLocations: dates
    };

    if (isUpdating) {
      const currentImages = (eventForm?.eventInformation?.images || []).filter((value) => !value.file).map((value) => value.url);
      sendEventDto = {
        ...sendEventDto,
        additionalImages: currentImages.slice(1),
        id: eventId,
        titleImage: currentImages[0]
      };
    }
    const formData: FormData = new FormData();
    const stringifyDataToSend = JSON.stringify(sendEventDto);
    const dtoName = isUpdating ? 'eventDto' : 'addEventDtoRequest';

    formData.append(dtoName, stringifyDataToSend);

    images.forEach((item) => {
      if (item.file) {
        formData.append('images', item.file);
      }
    });

    return formData;
  }

  getEventPreview(event: EventForm): PagePreviewDTO {
    return this.convertEventToPreview(event);
  }

  getAddresses(): Observable<Addresses[]> {
    return this.http.get<Addresses[]>(`${this.backEnd}events/addresses`);
  }

  getImageAsFile(img: string): Observable<Blob> {
    return this.http.get(img, { responseType: 'blob' });
  }

  createEvent(formData: FormData): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.backEnd}events`, formData);
  }

  editEvent(formData: FormData, eventId: number): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${this.backEnd}events/${eventId}`, formData);
  }

  getEvents(requestParams: HttpParams): Observable<EventResponseDto> {
    if (requestParams.has('time') && requestParams.get('time') === 'UPCOMING') {
      requestParams = requestParams.set('time', 'FUTURE');
    }
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
