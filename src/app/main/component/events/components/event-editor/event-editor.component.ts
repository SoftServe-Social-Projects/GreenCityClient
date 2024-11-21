import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { EventForm } from '../../models/events.interface';
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
  images = singleNewsImages;
  submitButtonName = 'create-event.publish';
  subscription: Subscription;
  previousPath: string;
  eventForm: FormGroup;
  event: EventForm;
  routedFromProfile: boolean;

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
    this.event = this.formInput || this.eventStoreService.getEditorValues();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.eventStoreService.setEventId(Number(id));
    });

    if (this.isUpdating) {
      this.submitButtonName = 'create-event.save-event';
    }
    this.eventForm = this.eventsService.convertEventToFormEvent(this.event);
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
    const formData = this.eventsService.prepareEventForSubmit(this.eventForm.value, this.eventId, this.isUpdating);
    this.createEvent(formData);
  }

  clear(): void {
    this.eventForm.reset();
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
