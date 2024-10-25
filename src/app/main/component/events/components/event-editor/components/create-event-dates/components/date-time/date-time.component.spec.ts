import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { DateTimeComponent } from './date-time.component';
import { DefaultCoordinates } from 'src/app/main/component/events/models/event-consts';
import * as _moment from 'moment';

describe('DateTimeComponent', () => {
  let component: DateTimeComponent;
  let fixture: ComponentFixture<DateTimeComponent>;
  let fb: FormBuilder;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DateTimeComponent],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatInputModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateTimeComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    const dayFormGroup: FormGroup = fb.group({
      day: fb.group({
        date: [new Date()],
        startTime: [''],
        endTime: [''],
        allDay: [false],
        minDate: [new Date()],
        maxDate: ['']
      }),
      placeOnline: fb.group({
        coordinates: fb.group({
          lat: [DefaultCoordinates.LATITUDE],
          lng: [DefaultCoordinates.LONGITUDE]
        }),
        onlineLink: [''],
        place: [''],
        appliedLinkForAll: [false],
        appliedPlaceForAll: [false]
      })
    });

    component.dayNumber = 1;
    component.daysForm = fb.array([dayFormGroup]);
    component.dayFormGroup = dayFormGroup;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return { dateIncorrect: true } when date is null', () => {
    const result = component.getDateErrors(null);
    expect(result).toEqual({ dateIncorrect: true });
  });

  it('should return { dateInPast: true } when date is in the past', () => {
    const pastDate = _moment().subtract(1, 'days'); // Create a past date
    const result = component.getDateErrors(pastDate);
    expect(result).toEqual({ dateInPast: true });
  });

  it('should return null when date is in the future', () => {
    const futureDate = _moment().add(1, 'days'); // Create a future date
    const result = component.getDateErrors(futureDate);
    expect(result).toBeNull(); // Expect no errors
  });

  it('should return null when date is today', () => {
    const today = _moment(); // Create today's date
    const result = component.getDateErrors(today);
    expect(result).toBeNull(); // Expect no errors
  });
});
