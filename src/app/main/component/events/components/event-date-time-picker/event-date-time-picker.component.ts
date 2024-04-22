import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateForm, DateFormInformation } from '../../models/events.interface';
import { combineLatest, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Patterns } from 'src/assets/patterns/patterns';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { EventsService } from 'src/app/main/component/events/services/events.service';
import { DefaultCoordinates } from '../../models/event-consts';
import { DateAdapter } from '@angular/material/core';
import { GoogleMap } from '@angular/google-maps';
import { GeocoderService } from '@global-service/geocoder/geocoder.service';
import { FormBridgeService } from '../../services/form-bridge.service';
import { dateFormValidator } from './validators/dateFormValidator';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-event-date-time-picker',
  templateUrl: './event-date-time-picker.component.html',
  styleUrls: ['./event-date-time-picker.component.scss'],
  providers: []
})
export class EventDateTimePickerComponent implements OnInit, OnDestroy {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild('placesRef') placesRef: ElementRef;
  public indexStartTime: number;
  public indexEndTime: number;
  public timeArr: Array<string> = [];

  public coordinates: google.maps.LatLngLiteral = {
    lat: DefaultCoordinates.LATITUDE,
    lng: DefaultCoordinates.LONGITUDE
  };
  public isCurrentDay: boolean;
  public onlineLink = '';
  public address: string;
  public autocomplete: google.maps.places.Autocomplete;
  public checkedAllDay = false;
  public isPlace = false;
  public isOnline = false;
  public isAllDayDisabled = false;
  public isPlaceDisabled = false;
  public isLinkDisabled: boolean;
  public isLocationDisabled: boolean;
  public isFirstDay: boolean;
  public readyToApplyLocation: boolean;
  public subscription: Subscription;
  public appliedForAllLocations = false;
  public today: Date = new Date();

  @Input() form: DateFormInformation;
  @Input() dayNumber: number;

  public dateForm: FormGroup<DateForm> = this.fb.nonNullable.group(
    {
      date: [this.today, [Validators.required]],
      startTime: new FormControl('', [Validators.required]),
      endTime: new FormControl('', [Validators.required]),
      coordinates: new FormControl({ lat: 50, lng: 50 }),
      onlineLink: new FormControl('', [Validators.pattern(Patterns.linkPattern)]),
      place: new FormControl(''),
      allDay: [false]
    },
    { validators: dateFormValidator() }
  );

  public isLocationSelected = false;
  public arePlacesFilled: boolean[] = [];
  public mapMarkerCoords: google.maps.LatLngLiteral = { lng: null, lat: null };
  key = crypto.randomUUID();
  public mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    zoom: 8,
    gestureHandling: 'greedy',
    minZoom: 4,
    maxZoom: 20,
    mapId: this.key
  };
  public dateFilterBind = this.dateFilter.bind(this);
  public $startOptions: string[];
  public $endOptions: string[];
  upperTimeLimit = 0;
  lowerTimeLimit: number;
  private componentKey = Symbol('key');
  private regionOptions = {
    types: ['address'],
    componentRestrictions: { country: 'UA' }
  };
  private subscriptions: Subscription[] = [];

  constructor(
    private langService: LanguageService,
    private eventsService: EventsService,
    private adapter: DateAdapter<any>,
    private geocoderService: GeocoderService,
    private bridge: FormBridgeService,
    private fb: FormBuilder
  ) {}

  get startTime() {
    return this.dateForm.get('startTime');
  }

  get endTime() {
    return this.dateForm.get('endTime');
  }

  get date() {
    return this.dateForm.get('date');
  }

  get place() {
    return this.dateForm.get('place');
  }

  initializeForm() {
    if (this.form) {
      this.dateForm.setValue(this.form);
    } else {
      const initialStartTime = this.initialStartTime();
      this.upperTimeLimit = this.timeArr.indexOf(initialStartTime);
      console.log(initialStartTime);
      console.log(this.upperTimeLimit);
      this.lowerTimeLimit = this.timeArr.length;
      this.dateForm.patchValue({
        startTime: initialStartTime,
        date: this.today
      });
      this.today.setHours(0, 0, 0, 0);
      this.bridge.changeDay(this.dayNumber, this.today);
      this.updateTimeIndex(initialStartTime, this.dateForm.get('endTime').value); // Use initialStartTime
    }
  }

  initializeGeocoder() {
    const sub = this.geocoderService.$getGeocoderResult(this.componentKey).subscribe((result: google.maps.GeocoderResult[]) => {
      const address = result[0].formatted_address;
      this.dateForm.patchValue({
        coordinates: this.coordinates,
        place: address
      });
      this.isLocationSelected = true;
      if (this.appliedForAllLocations) {
        this.bridge.setLocationForAll({ address, coords: this.coordinates });
      }
    });
    this.subscriptions.push(sub);
  }

  subscribeToFormChanges() {
    const sub = this.dateForm.valueChanges.subscribe((value) => {
      this.updateTimeIndex(value.startTime, value.endTime);
    });
    const b = combineLatest([this.dateForm.controls.startTime.valueChanges, this.dateForm.controls.endTime.valueChanges])
      .pipe(
        startWith(''),
        map(([startTime, endTime]) => {
          this.updateTimeIndex(startTime, endTime);
          this.$startOptions = this.filterAutoOptions(startTime, this.upperTimeLimit, this.indexEndTime);
          this.$endOptions = this.filterAutoOptions(endTime, this.indexStartTime, this.lowerTimeLimit);
        })
      )
      .subscribe();
    this.subscriptions.push(sub);
    this.subscriptions.push(b);
  }

  setDay(date: Date, n: number) {
    const newDate = new Date(date.getTime()); // Create a copy to avoid modifying the original
    newDate.setDate(newDate.getDate() + n);
    return newDate;
  }

  subscribeToLocationChanges() {
    const sub = this.bridge.$locationUpdate().subscribe((update) => {
      if (update.address) {
        this.isLocationDisabled = true;
        this.dateForm.get('place').disable();
        this.dateForm.patchValue({ coordinates: update.coords, place: update.address });
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnInit(): void {
    this.today = this.setDay(new Date(), this.dayNumber);
    this.fillTimeArray();
    this.initializeGeocoder();
    this.subscribeToFormChanges();
    this.subscribeToFormStatus();
    if (this.dayNumber > 0) {
      this.subscribeToLocationChanges();
    }

    this.langService.getCurrentLangObs().subscribe((lang) => {
      const locale = lang !== 'ua' ? 'en-GB' : 'uk-UA';
      this.adapter.setLocale(locale);
    });

    const isAddressFilledSubscription = this.eventsService.getCheckedPlacesObservable().subscribe((values) => {
      this.arePlacesFilled = values;
    });
    this.subscriptions.push(isAddressFilledSubscription);

    this.initializeForm();
  }

  subscribeToFormStatus() {
    this.bridge.updateDatesFormStatus(false, this.dayNumber);
    const sub = this.dateForm.statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        this.bridge.updateDatesFormStatus(true, this.dayNumber, this.dateForm.getRawValue());
      } else {
        this.bridge.updateDatesFormStatus(false, this.dayNumber);
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.bridge.deleteRecordFromDayMap(this.dayNumber);
  }

  public toggleAllDay(): void {
    this.checkedAllDay = !this.checkedAllDay;
    const startTime = this.dateForm.get('startTime');
    const endTime = this.dateForm.get('endTime');
    [startTime, endTime].forEach((control) => control[this.checkedAllDay ? 'disable' : 'enable']());
    this.dateForm.patchValue({ startTime: this.timeArr[1], endTime: this.timeArr[this.lowerTimeLimit] });
  }

  public toggleForAllLocations(): void {
    this.appliedForAllLocations = !this.appliedForAllLocations;
  }

  public toggleOnline(): void {
    this.isOnline = !this.isOnline;
    this.dateForm.patchValue({ onlineLink: null });
  }

  public toggleLocation(): void {
    this.isPlace = !this.isPlace;
    if (this.isPlace) {
      this.coordinates.lat = DefaultCoordinates.LATITUDE;
      this.coordinates.lng = DefaultCoordinates.LONGITUDE;
      this.isLocationSelected = true;
      setTimeout(() => {
        this.setPlaceAutocomplete();
      }, 0);
    } else {
      if (this.appliedForAllLocations) {
        this.toggleForAllLocations();
      }
      this.coordinates.lat = null;
      this.coordinates.lng = null;
      this.autocomplete.unbindAll();
      this.dateForm.patchValue({
        coordinates: null,
        place: null
      });
      this.isLocationSelected = false;
    }
  }

  public setPlaceAutocomplete(): void {
    this.setCurrentLocation();
    this.autocomplete = new google.maps.places.Autocomplete(this.placesRef.nativeElement, this.regionOptions);
    this.autocomplete.addListener('place_changed', () => {
      const locationName = this.autocomplete.getPlace();
      if (locationName.formatted_address) {
        const lat = locationName.geometry.location.lat();
        const lng = locationName.geometry.location.lng();
        const coords = { lat, lng };
        this.coordinates = coords;
        this.updateMapAndLocation(coords);
        this.dateForm.patchValue({
          place: locationName.formatted_address,
          coordinates: { lat: this.coordinates.lat, lng: this.coordinates.lng }
        });
        this.isLocationSelected = false;
      } else {
        this.isLocationSelected = true;
      }
    });
  }

  public mapClick(event: google.maps.MapMouseEvent): void {
    const coords = event.latLng.toJSON();
    this.updateMapAndLocation(coords);
    this.isLocationSelected = true;
  }

  dateFilter(date: Date | null): boolean {
    if (!date) {
      return false; // Handle invalid dates
    }
    const dateTime = date.getTime();
    let prevDate: Date | undefined;
    for (let i = this.dayNumber - 1; i >= 0 && !prevDate; i--) {
      prevDate = this.bridge.getDayFromMap(i);
    }
    let nextDate: Date | undefined;
    for (let i = this.dayNumber + 1; i <= this.bridge.getDaysLength() && !nextDate; i++) {
      nextDate = this.bridge.getDayFromMap(i);
    }
    if (prevDate && nextDate) {
      return prevDate.getTime() < dateTime && nextDate.getTime() > dateTime;
    }
    if (prevDate && !nextDate) {
      return prevDate.getTime() < dateTime;
    }
    if (!nextDate) {
      return this.today.getTime() <= dateTime;
    }
    if (nextDate) {
      return this.today.getTime() <= dateTime && nextDate.getTime() > dateTime;
    }
  }

  public getLangValue(uaValue: string, enValue: string): string {
    return this.langService.getLangValue(uaValue, enValue) as string;
  }

  public checkDay(): void {
    if (this.dateFilter(this.date.value)) {
      this.bridge.changeDay(this.dayNumber, this.date.value);
      const curDay = new Date().toDateString();
      const selectDay = new Date(this.dateForm.get('date').value).toDateString();
      this.isCurrentDay = curDay === selectDay;
    }
  }

  private filterAutoOptions(value: string, startPosition: number, endPosition: number) {
    console.log('filter', value, startPosition, endPosition);
    const filtered = this.timeArr.slice(startPosition, endPosition).filter((time) => {
      return time.includes(value);
    });
    return filtered.length > 2 ? filtered : this.timeArr.slice(startPosition, endPosition);
  }

  private initialStartTime(): string {
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    if (currentMinute - 20 < 0) {
      return `${currentHour > 9 ? currentHour : '0' + currentHour}:30`;
    }
    const nextHour = currentHour + 1;
    return `${nextHour > 9 ? nextHour : '0' + nextHour}:00`;
  }

  private setCurrentLocation(): void {
    navigator.geolocation.getCurrentPosition(
      (position) => this.handleGeolocationSuccess(position),
      (error) => this.handleGeolocationError(error)
    );
  }

  private handleGeolocationSuccess(position: GeolocationPosition) {
    if (!position.coords) {
      return;
    }

    const latLngLiteral: google.maps.LatLngLiteral = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    this.updateMapAndLocation(latLngLiteral);
    this.readyToApplyLocation = true;
  }

  private handleGeolocationError(error: GeolocationPositionError) {
    console.error(error);
  }

  private updateMapAndLocation(latLngLiteral: google.maps.LatLngLiteral) {
    this.mapMarkerCoords = latLngLiteral;
    this.map.panTo(latLngLiteral);
    this.map.center = latLngLiteral;
    this.coordinates = latLngLiteral;
    this.geocoderService.changeAddress(latLngLiteral, this.componentKey);
  }

  private fillTimeArray(): void {
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
    this.timeArr = timeArr;
  }

  private updateTimeIndex(startTime: string, endTime: string): void {
    console.log('update');
    if (this.timeArr.indexOf(endTime) < 0) {
      this.indexEndTime = this.lowerTimeLimit;
    }
    this.indexEndTime = this.timeArr.indexOf(endTime);

    if (this.timeArr.indexOf(startTime) < 0) {
      this.indexStartTime = this.upperTimeLimit + 1;
    }
    this.indexStartTime = this.timeArr.indexOf(startTime) + 1;
  }
}
