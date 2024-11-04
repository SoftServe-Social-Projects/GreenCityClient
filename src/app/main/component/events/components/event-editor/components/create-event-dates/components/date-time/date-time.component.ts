import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { IMask } from 'angular-imask';
import * as _moment from 'moment';
import 'moment/locale/uk';
import { LanguageService } from '../../../../../../../../i18n/language.service';
import { MomentDateAdapter } from './moment-date-adapter';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MMM DD, YYYY'
  },
  display: {
    dateInput: 'MMM DD, YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class DateTimeComponent implements OnInit, AfterViewInit {
  @Input() daysForm: FormArray;
  @Input() dayNumber: number;
  @Input() dayFormGroup: AbstractControl;
  dayForm: FormGroup;
  startOptionsArr: string[];
  endOptionsArr: string[];
  dateFormat: string;
  private prevStartLength: number;
  private prevEndLength: number;
  private _timeArr: string[] = [];
  private _upperTimeLimit = 0;
  private prevTimeValue: Array<string>;
  private initialStartTime: string;
  timeMask = {
    mask: 'HH:MM',
    blocks: {
      HH: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 23,
        maxLength: 2
      },
      MM: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 59,
        maxLength: 2
      }
    }
  };

  @ViewChild('dateRef') dateRef: ElementRef;
  @ViewChild('startTimeRef') startTimeRef: ElementRef;
  @ViewChild('endTimeRef') endTimeRef: ElementRef;

  mask = IMask.InputMask<any>;
  constructor(
    private ls: LanguageService,
    private adapter: DateAdapter<any>
  ) {}

  get date() {
    return this.dayForm.get('date');
  }

  get startTime() {
    return this.dayForm.get('startTime');
  }

  get endTime() {
    return this.dayForm.get('endTime');
  }

  get allDay() {
    return this.dayForm.get('allDay');
  }

  get minDate() {
    return this.dayForm.get('minDate').value;
  }

  get maxDate() {
    return this.dayForm.get('maxDate').value;
  }
  ngOnInit() {
    const moment = _moment;
    moment.locale('uk');
    this.dayForm = this.dayFormGroup.get('day') as FormGroup;
    this._fillTimeArray();
    this.initialStartTime = this._initialStartTime();
    this._upperTimeLimit = this._timeArr.indexOf(this.initialStartTime);
    this._setArrTime();
    this.ls.getCurrentLangObs().subscribe((lang) => {
      const locale = lang !== 'ua' ? 'en-GB' : 'uk-UA';
      this.dateFormat = lang !== 'ua' ? 'MMDDYYYY' : 'DDMMYYYY';
      this.adapter.setLocale(locale);
    });
    this.date.valueChanges.subscribe(() => {
      this._updateNeighboringDates();
    });
    this.startTime.valueChanges.subscribe((value: string) => {
      this._handleTimeChange(value, 'start');
    });

    this.endTime.valueChanges.subscribe((value: string) => {
      this._handleTimeChange(value, 'end');
    });

    // Subscribe to date value changes
    this.date.valueChanges.subscribe((newDate) => {
      this._updateNeighboringDates();
      this.date.setErrors(this.getDateErrors(newDate));
    });
  }

  ngAfterViewInit() {
    // TODO
    // IMask(this.dateRef.nativeElement, this.dateMask);
    IMask(this.startTimeRef.nativeElement, this.timeMask);
    IMask(this.endTimeRef.nativeElement, this.timeMask);
  }

  getDateErrors(date: _moment.Moment | null) {
    if (!date) {
      return { dateIncorrect: true };
    }

    if (date.isBefore(_moment(), 'day')) {
      return { dateInPast: true };
    }

    return null;
  }

  private _updateNeighboringDates(): void {
    if (this.dayNumber > 0) {
      const prevFormGroup = this.daysForm.at(this.dayNumber - 1) as FormGroup;
      const prevDayComponent = prevFormGroup.get('day');
      if (prevDayComponent) {
        prevDayComponent.patchValue({
          maxDate: new Date(this.date.value._d.getTime() - 24 * 60 * 60 * 1000)
        });
      }
    }

    if (this.dayNumber < this.daysForm.length - 1) {
      const nextFormGroup = this.daysForm.at(this.dayNumber + 1) as FormGroup;
      const nextDayComponent = nextFormGroup.get('day');
      if (nextDayComponent) {
        nextDayComponent.patchValue({
          minDate: new Date(this.date.value._d.getTime() + 24 * 60 * 60 * 1000)
        });
      }
    }
  }

  toggleAllDay(): void {
    if (this.allDay.value) {
      this.prevTimeValue = [this.startTime.value, this.endTime.value];
      this.startTime.setValue(this.startOptionsArr[0]);
      this.endTime.setValue(this.endOptionsArr[this.endOptionsArr.length - 1]);
    } else {
      this.startTime.setValue(this.prevTimeValue[0]);
      this.endTime.setValue(this.prevTimeValue[1]);
    }
  }

  private _fillTimeArray(): void {
    const timeArr = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Pad hours and minutes with leading zeros for consistent formatting
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        timeArr.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    timeArr.push('23:59');
    this._timeArr = timeArr;
  }

  private _handleTimeChange(value: string, type: 'start' | 'end'): void {
    if (Number(value[value.length - 1]) || value[2] === ':') {
      const initialStartTime = Number(this.initialStartTime.replace(':', ''));
      const numberValue = Number(value.replace(':', ''));
      const startTime = this.startTime.value ? Number(this.startTime.value.replace(':', '')) : null;
      const endTime = this.endTime.value ? Number(this.endTime.value.replace(':', '')) : null;
      if (value.length === 2 && !value.includes(':') && value.length >= (type === 'start' ? this.prevStartLength : this.prevEndLength)) {
        value += ':';
        const control = type === 'start' ? this.startTime : this.endTime;
        control.setValue(value, { emitEvent: false });
      }

      if (type === 'start') {
        this.prevStartLength = value.length;
      } else {
        this.prevEndLength = value.length;
      }

      if (value.length === 5) {
        if (type === 'start') {
          if (numberValue >= initialStartTime && (endTime === null || numberValue < endTime)) {
            this.endOptionsArr = this._timeArr.slice(this._timeArr.indexOf(value) + 1);
          } else {
            this.startTime.setValue('', { emitEvent: false });
          }
        } else {
          if (numberValue > initialStartTime && (startTime === null || numberValue > startTime)) {
            this.startOptionsArr = this._timeArr.slice(this._timeArr.indexOf(this.initialStartTime), this._timeArr.indexOf(value));
          } else {
            this.endTime.setValue('', { emitEvent: false });
          }
        }
      } else {
        if (type === 'start') {
          this.startOptionsArr = this._timeArr.filter((option) => {
            const optionTime = Number(option.replace(':', ''));
            return (option.startsWith(value) || !startTime) && optionTime >= initialStartTime && (!endTime || optionTime < endTime);
          });
        } else {
          this.endOptionsArr = this._timeArr.filter((option) => {
            const optionTime = Number(option.replace(':', ''));
            return (option.startsWith(value) || !endTime) && optionTime >= initialStartTime && (!startTime || optionTime > startTime);
          });
        }
      }

      if (!startTime && !endTime) {
        this._setArrTime();
      }
    }
  }
  private _setArrTime(): void {
    this.startOptionsArr = this._timeArr.slice(this._upperTimeLimit, this._timeArr.length - 1);
    this.endOptionsArr = this._timeArr.slice(this._upperTimeLimit + 1);
  }

  private _initialStartTime(): string {
    const today = new Date();
    if (this.dayForm.value.date.getDate() === today.getDate()) {
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      if (currentMinute - 20 < 0) {
        return `${currentHour > 9 ? currentHour : '0' + currentHour}:30`;
      }
      const nextHour = currentHour + 1;
      return `${nextHour > 9 ? nextHour : '0' + nextHour}:00`;
    } else {
      return '00:00';
    }
  }
}
