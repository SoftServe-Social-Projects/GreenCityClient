import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CreateEventDatesComponent } from './create-event-dates.component';
import { DateTimeComponent } from './components/date-time/date-time.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PlaceOnlineComponent } from './components/place-online/place-online.component';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, FormArray, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { DefaultCoordinates } from 'src/app/main/component/events/models/event-consts';

describe('CreateEventDatesComponent', () => {
  let component: CreateEventDatesComponent;
  let fixture: ComponentFixture<CreateEventDatesComponent>;
  let fb: FormBuilder;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEventDatesComponent, DateTimeComponent, PlaceOnlineComponent],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        BrowserAnimationsModule,
        MatInputModule
      ],
      providers: [FormBuilder]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEventDatesComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.eventDateForm = fb.array([
      fb.group({
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
      })
    ]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
