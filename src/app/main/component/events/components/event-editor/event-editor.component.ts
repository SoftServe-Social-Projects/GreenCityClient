import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { FormBaseComponent } from '@shared/components/form-base/form-base.component';
import Quill from 'quill';
import 'quill-emoji/dist/quill-emoji.js';
import ImageResize from 'quill-image-resize-module';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DialogPopUpComponent } from 'src/app/shared/dialog-pop-up/dialog-pop-up.component';
import { CreateEcoEventAction, EditEcoEventAction, EventsActions } from 'src/app/store/actions/ecoEvents.actions';
import { singleNewsImages } from 'src/app/main/image-pathes/single-news-images';
import { Place } from '../../../places/models/place';
import { DefaultCoordinates } from '../../models/event-consts';
import { DateInformation, Dates, EventDTO, EventForm, EventResponse, LocationResponse, TagObj } from '../../models/events.interface';
import { EventsService } from '../../services/events.service';
import { quillConfig } from './quillEditorFunc';
import { EventStoreService } from '../../services/event-store.service';

@Component({
  selector: 'app-event-editor',
  templateUrl: './event-editor.component.html',
  styleUrls: ['./event-editor.component.scss']
})
export class EventEditorComponent extends FormBaseComponent implements OnInit {
  @Input() isUpdating: boolean;
  @Input() cancelChanges: boolean;
  @Input({ required: true }) eventId: number;
  quillModules = {};
  places: Place[] = [];
  isPosting = false;
  editEvent: EventResponse;
  tags: Array<TagObj>;
  isImageSizeError: boolean;
  isImageTypeError = false;
  images = singleNewsImages;
  currentLang: string;
  submitButtonName = 'create-event.publish';
  subscription: Subscription;
  imgArray: Array<File> = [];
  userId: number;
  previousPath: string;
  eventForm: FormGroup;
  event: EventForm;
  popupConfig = {
    hasBackdrop: true,
    closeOnNavigation: true,
    disableClose: true,
    panelClass: 'popup-dialog-container',
    data: {
      popupTitle: 'homepage.events.events-popup.title',
      popupSubtitle: 'homepage.events.events-popup.subtitle',
      popupConfirm: 'homepage.events.events-popup.confirm',
      popupCancel: 'homepage.events.events-popup.cancel'
    }
  };
  routedFromProfile: boolean;
  private _savedFormValues: EventForm;

  locationLink: string;
  locationCoordinates: LocationResponse;
  place: string;
  imagesList: string[] = [];
  isActive: boolean;
  currentDate = new Date();
  rate: number;
  likesType = {
    like: 'assets/img/comments/like.png',
    liked: 'assets/img/comments/liked.png'
  };
  deleteDialogData = {
    popupTitle: 'homepage.events.delete-title-admin',
    popupConfirm: 'homepage.events.delete-yes',
    popupCancel: 'homepage.events.delete-no',
    style: 'green'
  };
  mapDialogData: any;
  address = 'Should be address';
  organizerName: string;
  isLiked: boolean;
  googleMapLink: string;

  constructor(
    public dialog: MatDialog,
    public router: Router,
    private readonly route: ActivatedRoute,
    private fb: FormBuilder,
    public localStorageService: LocalStorageService,
    private actionsSubj: ActionsSubject,
    private store: Store,
    private snackBar: MatSnackBarComponent,
    public dialogRef: MatDialogRef<DialogPopUpComponent>,
    private eventsService: EventsService,
    private eventStoreService: EventStoreService,
    private readonly cdRef: ChangeDetectorRef
  ) {
    super(router, dialog);
    this.quillModules = quillConfig;
    Quill.register('modules/imageResize', ImageResize);
  }

  @Input() formInput: EventForm;

  get eventInformation(): FormGroup {
    return this.eventForm.get('eventInformation') as FormGroup;
  }

  get eventDateForm(): FormArray {
    return this.eventForm.get('dateInformation') as FormArray;
  }

  ngOnInit(): void {
    this.event = this.formInput ?? this.eventStoreService.getEditorValues();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.eventsService.setEventId(Number(id));
    });

    if (this.isUpdating) {
      this.submitButtonName = 'create-event.save-event';
    }
    this.createFormEvent();
    this.routedFromProfile = this.localStorageService.getPreviousPage() === '/profile';
    this.previousPath = this.localStorageService.getPreviousPage() || '/events';
    this.eventForm
      .get('eventInformation')
      .get('duration')
      .valueChanges.subscribe((numberDays: number) => {
        const currentLength = this.eventDateForm.length;

        if (currentLength > numberDays) {
          for (let i = currentLength - 1; i >= numberDays; i--) {
            this.eventDateForm.removeAt(i, { emitEvent: false });
          }
        } else {
          for (let i = currentLength; i < numberDays; i++) {
            const previousDay = this.eventDateForm.at(i - 1);
            const previousDate = previousDay ? new Date(previousDay.value.day.date) : new Date();

            const nextDate = new Date(previousDate.getTime() + 24 * 60 * 60 * 1000);

            this.eventDateForm.push(
              this.fb.group({
                day: this.fb.group({
                  date: [nextDate, Validators.required],
                  startTime: ['', Validators.required],
                  endTime: ['', Validators.required],
                  allDay: [false],
                  minDate: [nextDate],
                  maxDate: [null]
                }),
                placeOnline: this.fb.group({
                  coordinates: this.fb.group({
                    lat: [DefaultCoordinates.LATITUDE],
                    lng: [DefaultCoordinates.LONGITUDE]
                  }),
                  onlineLink: [''],
                  place: [''],
                  appliedLinkForAll: [false],
                  appliedPlaceForAll: [false]
                })
              })
            );
          }
        }

        this._updateDateRanges();
      });
  }

  private _updateDateRanges(): void {
    this.eventDateForm.controls.forEach((dayGroup, index) => {
      const dayFormGroup = dayGroup.get('day') as FormGroup;
      const currentDay = new Date(dayFormGroup.get('date').value);
      /* eslint-disable indent */
      const prevDate =
        index > 0
          ? new Date(
              this.eventDateForm
                .at(index - 1)
                .get('day')
                .get('date').value
            )
          : null;
      /* eslint-disable indent */
      const nextDate = index < this.eventDateForm.length - 1 ? new Date(this.eventDateForm.at(index).get('day').get('date').value) : null;

      dayFormGroup.get('minDate').setValue(prevDate ? new Date(prevDate.getTime() + 24 * 60 * 60 * 1000) : currentDay);
      dayFormGroup.get('maxDate').setValue(nextDate ? nextDate : null);
    });
  }

  private createFormEvent(): void {
    const information = this.event?.eventInformation;
    const date = this.event?.dateInformation ?? [];

    this.eventForm = this.fb.group({
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

  onPreview() {
    const currentRoute = this.router.url;
    this.cdRef.detectChanges();

    if (currentRoute.includes('create-event')) {
      this.eventsService.setIsFromCreateEvent(true);
    } else {
      this.eventsService.setIsFromCreateEvent(false);
    }

    this.eventStoreService.setEditorValues(this.eventForm.value);
    this.router.navigate(['events', 'preview']);
  }

  submitEvent(): void {
    const { eventInformation, dateInformation } = this.eventForm.value;
    const { open, tags, description, title, images } = eventInformation;
    const dates: Dates[] = this.transformDatesFormToDates(dateInformation);
    let sendEventDto: EventDTO = {
      title,
      description: description,
      open,
      tags,
      datesLocations: dates
    };

    if (this.isUpdating) {
      if (!this.eventId) {
        const urlSegments = this.router.url.split('/');
        this.eventId = Number(urlSegments[urlSegments.length - 1]);
      }
      const currentImages = (this._savedFormValues?.eventInformation?.images || [])
        .filter((value) => !value.file)
        .map((value) => value.url);
      sendEventDto = {
        ...sendEventDto,
        additionalImages: currentImages.slice(1),
        id: this.eventId,
        titleImage: currentImages[0]
      };
    }
    const formData: FormData = new FormData();
    const stringifyDataToSend = JSON.stringify(sendEventDto);
    const dtoName = this.isUpdating ? 'eventDto' : 'addEventDtoRequest';

    formData.append(dtoName, stringifyDataToSend);

    images.forEach((item) => {
      if (item.file) {
        formData.append('images', item.file);
      }
    });

    this.createEvent(formData);
  }

  clear(): void {
    this.eventForm.reset();
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

  escapeFromCreateEvent(): void {
    this.router.navigate(['/events']);
    this.eventSuccessfullyAdded();
  }

  private eventSuccessfullyAdded(): void {
    if (this.isUpdating) {
      this.snackBar.openSnackBar('updatedEvent');
    }
    if (!this.isUpdating) {
      this.snackBar.openSnackBar('addedEvent');
    }
  }

  private createEvent(sendData: FormData) {
    this.isPosting = true;
    this.isUpdating
      ? this.store.dispatch(EditEcoEventAction({ data: sendData, id: this.eventId }))
      : this.store.dispatch(CreateEcoEventAction({ data: sendData }));

    this.actionsSubj.pipe(ofType(EventsActions.CreateEcoEventSuccess, EventsActions.EditEcoEventSuccess), take(1)).subscribe(() => {
      this.isPosting = false;
      this.eventsService.setForm(null);
      this.escapeFromCreateEvent();
    });
  }
}
