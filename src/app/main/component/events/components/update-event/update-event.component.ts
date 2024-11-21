import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../../services/events.service';
import {
  DateInformation,
  EventDatesResponse,
  EventForm,
  EventInformation,
  EventResponse,
  ImagesContainer
} from '../../models/events.interface';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { EventStoreService } from '../../services/event-store.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Component({
  selector: 'app-update-event',
  templateUrl: './update-event.component.html',
  styleUrls: ['./update-event.component.scss']
})
export class UpdateEventComponent implements OnInit {
  isFetching = false;
  eventForm: EventForm;
  isAuthor = true;
  authorId = this.eventStore.getEventAuthorId();
  eventId: number;

  constructor(
    private route: ActivatedRoute,
    private eventStore: EventStoreService,
    private eventService: EventsService,
    private languageService: LanguageService,
    private localStorageService: LocalStorageService,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.eventForm = this.eventStore.getEditorValues();

    const userId = this.localStorageService.getUserId();

    this.route.params.subscribe((params) => {
      const isAuthor = this.authorId === userId;
      this.eventId = params['id'];

      console.log(this.eventForm, this.eventId, this.eventStore.getEventId());
      if (this.eventForm.eventInformation && Number(this.eventId) === this.eventStore.getEventId()) {
        return;
      }

      if (isAuthor || !this.authorId) {
        this.isFetching = true;
        this.eventService.getEventById(this.eventId).subscribe({
          next: (response) => {
            this.eventForm = this._transformResponseToForm(response);
            this.eventStore.setEventId(this.eventId);
            this.eventStore.setEditorValues(this.eventForm);
            this.authorId = response.organizer.id;
            this.isAuthor = this.authorId === userId;
            this.isFetching = false;
            this.cdRef.detectChanges();
          },
          error: (error) => {
            this.isFetching = false;
            this.isAuthor = false;
            this.cdRef.detectChanges();
          }
        });
      } else {
        this.isAuthor = false;
        this.cdRef.detectChanges();
      }
    });
  }

  private _transformResponseToForm(form: EventResponse): EventForm {
    const { title, description, open, dates, titleImage, tags, additionalImages } = form;
    const tagsForm = tags.map((value) => value.nameEn);
    additionalImages.unshift(titleImage);
    const correctImages: ImagesContainer[] = additionalImages.map((value, index) => ({
      file: undefined,
      url: value,
      main: index === 0
    }));
    const eventInformation: EventInformation = {
      title,
      description,
      open,
      duration: dates.length,
      editorText: description,
      tags: tagsForm,
      images: correctImages
    };
    const dateInformation: DateInformation[] = this._transformDatesToForm(form.dates);
    return {
      dateInformation,
      eventInformation
    };
  }

  private _transformDatesToForm(form: EventDatesResponse[]): DateInformation[] {
    let allPlace = true;
    let allLink = true;
    const address = form[0].coordinates?.formattedAddressEn;
    const link = form[0].onlineLink;
    return form.map((value) => {
      const { finishDate, startDate, onlineLink, coordinates } = value;
      const _startDate = new Date(startDate);
      const startHours = _startDate.getHours().toString().padStart(2, '0'); // Get hours and pad with leading zero if needed
      const startMinutes = _startDate.getMinutes().toString().padStart(2, '0');
      const formattedStartTime = `${startHours}:${startMinutes}`;
      _startDate.setHours(0, 0, 0, 0);

      const _endDate = new Date(finishDate);
      const endHours = _endDate.getHours().toString().padStart(2, '0'); // Get hours and pad with leading zero if needed
      const endMinutes = _endDate.getMinutes().toString().padStart(2, '0');
      const formattedEndTime = `${endHours}:${endMinutes}`;
      _startDate.setHours(0, 0, 0, 0);

      const place = this.languageService.getCurrentLanguage() === 'ua' ? coordinates?.formattedAddressUa : coordinates?.formattedAddressEn;

      allPlace = allPlace && address === (coordinates?.formattedAddressEn ?? false);

      allLink &&= link === onlineLink;
      return {
        day: { startTime: formattedStartTime, date: _startDate, endTime: formattedEndTime, allDay: false },
        placeOnline: {
          appliedPlaceForAll: false,
          appliedLinkForAll: false,
          place,
          onlineLink,
          coordinates: { lat: coordinates?.latitude, lng: coordinates?.longitude }
        }
      };
    });
  }
}
