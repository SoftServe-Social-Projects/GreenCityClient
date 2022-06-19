import { Component, Injector, OnDestroy, OnInit } from '@angular/core';

import { quillConfig } from './quillEditorFunc';
import { EventsService } from '../../services/events.service';

import Quill from 'quill';
import 'quill-emoji/dist/quill-emoji.js';
import ImageResize from 'quill-image-resize-module';
import { Place } from '../../../places/models/place';
import { DateEvent, DateFormObj, Dates, EventDTO, EventPageResponceDto, OfflineDto, TagObj } from '../../models/events.interface';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap, takeUntil } from 'rxjs/operators';
import { iif, of, ReplaySubject, Subject } from 'rxjs';
import { DateObj, ItemTime, TagsArray, WeekArray } from '../../models/event-consts';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Component({
  selector: 'app-create-edit-events',
  templateUrl: './create-edit-events.component.html',
  styleUrls: ['./create-edit-events.component.scss']
})
export class CreateEditEventsComponent implements OnInit, OnDestroy {
  public title = '';
  public dates: DateEvent[] = [];
  private imgArray: Array<File> = [];
  public quillModules = {};
  public editorHTML = '';
  public isOpen = true;
  public places: Place[] = [];
  public checkdates: boolean;
  public isPosting = false;
  public contentValid: boolean;
  public checkAfterSend = true;
  private pipe = new DatePipe('en-US');
  public dateArrCount = WeekArray;
  public editMode: boolean;
  public editEvent: EventPageResponceDto;
  public imagesToDelete: string[] = [];
  public imagesForEdit: string[];
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);

  public tags: Array<TagObj>;
  public isTagValid: boolean;

  public titleForm: FormControl;
  public description: FormControl;
  public eventDuration: FormControl;

  public eventFormGroup: FormGroup;
  unsubscribe: Subject<any> = new Subject();

  constructor(
    private eventService: EventsService,
    public router: Router,
    private injector: Injector,
    private localStorageService: LocalStorageService
  ) {
    this.quillModules = quillConfig;
    Quill.register('modules/imageResize', ImageResize);
  }

  ngOnInit(): void {
    this.editMode = this.localStorageService.getEditMode();

    this.tags = TagsArray.reduce((ac, cur) => [...ac, { ...cur }], []);

    this.eventFormGroup = new FormGroup({
      titleForm: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(70)]),
      description: new FormControl('', [Validators.required, Validators.minLength(28), Validators.maxLength(63206)]),
      eventDuration: new FormControl('', [Validators.required, Validators.minLength(2)])
    });

    if (this.editMode) {
      this.editEvent = this.editMode ? this.localStorageService.getEventForEdit() : null;
      this.setEditValue();
    }
  }

  private setEditValue(): void {
    this.eventFormGroup.patchValue({
      titleForm: this.editEvent.title,
      eventDuration: this.dateArrCount[this.editEvent.dates.length - 1],
      description: this.editEvent.description
    });
    this.setDateCount(this.editEvent.dates.length);
    this.imagesForEdit = [this.editEvent.titleImage, ...this.editEvent.additionalImages];
    this.tags.forEach((item) => (item.isActive = this.editEvent.tags.some((name) => name.nameEn === item.nameEn)));
    this.isTagValid = this.tags.some((el) => el.isActive);
    this.isOpen = this.editEvent.open;
  }

  public checkTab(tag: TagObj): void {
    tag.isActive = !tag.isActive;
    this.isTagValid = this.tags.some((el) => el.isActive);
  }

  public checkForm(form: DateFormObj, ind: number): void {
    this.dates[ind].date = form.date;
    this.dates[ind].startDate = form.startTime;
    this.dates[ind].finishDate = form.endTime;
    this.dates[ind].onlineLink = form.onlineLink;
  }

  public checkStatus(event: boolean, ind: number): void {
    this.dates[ind].valid = event;
  }

  public escapeFromCreateEvent(): void {
    this.router.navigate(['/events']);
  }

  public changeToOpen(): void {
    this.isOpen = true;
  }

  public changeToClose(): void {
    this.isOpen = false;
  }

  public setDateCount(value: number): void {
    this.dates = Array(value)
      .fill(null)
      .map(() => ({ ...DateObj }));
  }

  public getImageTosend(imageArr: Array<File>): void {
    this.imgArray = [...imageArr];
  }

  public getImagesToDelete(imagesSrc: Array<string>): void {
    this.imagesToDelete = imagesSrc;
  }

  public setCoordsOnlOff(event: OfflineDto, ind: number): void {
    this.dates[ind].coordinatesDto.latitude = event.latitude;
    this.dates[ind].coordinatesDto.longitude = event.longitude;
  }

  private checkDates(): void {
    this.dates.forEach((item) => {
      item.check = !item.valid;
    });

    this.checkdates = !this.dates.some((element) => !element.valid);
  }

  private getFormattedDate(dateString: Date, hour: number, min: number): string {
    const date = new Date(dateString);
    date.setHours(hour, min);
    return date.toString();
  }

  private createDates(): Array<Dates> {
    return this.dates.reduce((ac, cur) => {
      if (!cur.startDate) {
        cur.startDate = ItemTime.START;
      }
      if (!cur.finishDate) {
        cur.finishDate = ItemTime.END;
      }
      const start = this.getFormattedDate(cur.date, +cur.startDate.split(':')[0], +cur.startDate.split(':')[1]);
      const end = this.getFormattedDate(cur.date, +cur.finishDate.split(':')[0], +cur.finishDate.split(':')[1]);

      const date: Dates = {
        startDate: this.pipe.transform(start, 'yyyy-MM-ddTHH:mm:ssZZZZZ'),
        finishDate: this.pipe.transform(end, 'yyyy-MM-ddTHH:mm:ssZZZZZ'),
        coordinates: {
          latitude: cur.coordinatesDto.latitude,
          longitude: cur.coordinatesDto.longitude
        },
        onlineLink: cur.onlineLink
      };
      ac.push(date);
      return ac;
    }, []);
  }

  public onSubmit(): void {
    this.checkDates();

    let datesDto: Array<Dates>;
    if (this.checkdates) {
      datesDto = this.createDates();
    }
    const tagsArr: Array<string> = this.tags.filter((tag) => tag.isActive).reduce((ac, cur) => [...ac, cur.nameEn], []);

    let sendEventDto: EventDTO = {
      title: this.eventFormGroup.get('titleForm').value,
      description: this.eventFormGroup.get('description').value,
      open: this.isOpen,
      datesLocations: datesDto,
      tags: tagsArr
    };
    if (this.editMode) {
      sendEventDto = {
        ...sendEventDto,
        imagesTodelete: this.imagesToDelete
      };
    }
    const test = true;
    if (this.checkdates && this.eventFormGroup.valid && tagsArr.length && test) {
      this.checkAfterSend = true;
      const formData: FormData = new FormData();
      const stringifiedDataToSend = JSON.stringify(sendEventDto);
      formData.append('addEventDtoRequest', stringifiedDataToSend);
      this.imgArray.forEach((item) => {
        formData.append('images', item);
      });

      this.isPosting = true;
      of(true)
        .pipe(
          switchMap(() => iif(() => this.editMode, this.eventService.editEvent(formData), this.eventService.createEvent(formData))),
          takeUntil(this.unsubscribe)
        )
        .subscribe(() => {
          this.isPosting = false;
          this.escapeFromCreateEvent();
        });
    } else {
      this.eventFormGroup.markAllAsTouched();
      this.checkAfterSend = false;
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
