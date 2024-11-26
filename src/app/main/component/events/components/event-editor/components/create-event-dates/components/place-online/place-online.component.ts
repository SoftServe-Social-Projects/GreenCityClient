import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { GoogleScript } from '@assets/google-script/google-script';
import { Patterns } from '@assets/patterns/patterns';
import { GeocoderService } from '@global-service/geocoder/geocoder.service';
import { Subject, takeUntil } from 'rxjs';
import { PlaceOnlineGroup } from 'src/app/main/component/events/models/events.interface';

@Component({
  selector: 'app-place-online',
  templateUrl: './place-online.component.html',
  styleUrls: ['./place-online.component.scss'],
  providers: []
})
export class PlaceOnlineComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild('placesRef') placesRef: ElementRef;

  isPlaceSelected: boolean;
  isOnline: boolean;
  isPlaceDisabled: boolean;
  isRenderingMap: boolean;
  isLinkDisabled: boolean;
  mapMarkerCoords: google.maps.LatLngLiteral;
  @Input() daysForm: FormArray;
  @Input() dayNumber: number;
  @Input() dayFormGroup: AbstractControl;
  @Input() formDisabled: boolean;
  formGroup: FormGroup<PlaceOnlineGroup>;
  mapOptions: google.maps.MapOptions;

  private _autocomplete: google.maps.places.Autocomplete;
  private _regionOptions: google.maps.places.AutocompleteOptions = {
    types: ['address'],
    componentRestrictions: { country: 'UA' }
  };
  private _lastLocation: { coordinates: google.maps.LatLngLiteral; place: string } = {
    coordinates: null,
    place: ''
  };
  private _key = Symbol('placeKey');
  private $destroy: Subject<boolean> = new Subject();
  constructor(
    private geocoderService: GeocoderService,
    private cdr: ChangeDetectorRef,
    private googleScript: GoogleScript
  ) {}

  get coordinates() {
    return this.formGroup.controls.coordinates;
  }

  get link() {
    return this.formGroup.controls.onlineLink;
  }

  get place() {
    return this.formGroup.controls.place;
  }

  get appliedLinkForAll() {
    return this.formGroup.controls.appliedLinkForAll;
  }

  get appliedPlaceForAll() {
    return this.formGroup.controls.appliedPlaceForAll;
  }

  toggleForAllLink() {
    const isApplied = !this.appliedLinkForAll.value;
    this.applyLinkToAllDays(isApplied ? this.link.value : '', isApplied);
    this.appliedLinkForAll.setValue(isApplied);
  }

  toggleForAllLocations(): void {
    const isApplied = !this.appliedPlaceForAll.value;
    this.applyLocationToAllDays(
      isApplied ? this.coordinates.value : { lat: null, lng: null },
      isApplied ? this.place.value : '',
      isApplied
    );
    this.appliedPlaceForAll.setValue(isApplied);
  }

  ngOnInit(): void {
    this.formGroup = this.dayFormGroup.get('placeOnline') as FormGroup;
    this.isOnline = !!this.link.value;
    this.isPlaceSelected = !!this.place.value;
    this.mapOptions = {
      center: this.coordinates.value,
      zoom: 8,
      gestureHandling: 'greedy',
      minZoom: 4,
      maxZoom: 20
    };
    this.mapMarkerCoords = this.coordinates.value;

    if (this.dayNumber !== 0) {
      const firstDay = this.daysForm.value[0].placeOnline;
      this.applyInitialSettings(firstDay);
      this.subscribeToFormChanges();
    }
    this.googleScript.$isRenderingMap.pipe(takeUntil(this.$destroy)).subscribe((value: boolean) => {
      setTimeout(() => {
        this.isRenderingMap = value;
      }, 1000);
    });
    this.daysForm.controls[0].get('placeOnline').valueChanges.subscribe((value) => {
      if (this.appliedPlaceForAll.value) {
        this.applyLocationToAllDays(value.coordinates, value.place, true);
      }
      if (this.appliedLinkForAll.value) {
        this.applyLinkToAllDays(value.onlineLink, true);
      }
    });
  }

  applyInitialSettings(firstDay: any): void {
    this.isOnline = firstDay.appliedLinkForAll;
    this.isLinkDisabled = firstDay.appliedLinkForAll;
    this.link[firstDay.appliedLinkForAll ? 'disable' : 'enable']();

    this.isPlaceDisabled = firstDay.appliedPlaceForAll;
    this.isPlaceSelected = firstDay.appliedPlaceForAll;
    this.place[firstDay.appliedPlaceForAll ? 'disable' : 'enable']();

    if (firstDay.appliedLinkForAll) {
      this.formGroup.patchValue({
        appliedLinkForAll: true,
        onlineLink: firstDay.onlineLink
      });
    }

    if (firstDay.appliedPlaceForAll) {
      this.formGroup.patchValue({
        appliedPlaceForAll: true,
        coordinates: firstDay.coordinates,
        place: firstDay.place
      });
    }
  }

  subscribeToFormChanges(): void {
    this.appliedLinkForAll.valueChanges.subscribe((data) => {
      this.isOnline = data;
      this.isLinkDisabled = data;
      this.link[data ? 'disable' : 'enable']();
    });

    this.appliedPlaceForAll.valueChanges.subscribe((data) => {
      this.isPlaceDisabled = data;
      this.isPlaceSelected = data;
      this.place[data ? 'disable' : 'enable']();
    });
  }

  applyLocationToAllDays(coordinates: google.maps.LatLngLiteral, place: string, is: boolean): void {
    this.daysForm.controls.slice(1).forEach((control) => {
      control.get('placeOnline').patchValue({ coordinates, place, appliedPlaceForAll: is });
      control.get('placeOnline').updateValueAndValidity();
    });
  }

  applyLinkToAllDays(link: string, is: boolean): void {
    this.daysForm.controls.slice(1).forEach((control) => {
      control.get('placeOnline').patchValue({ onlineLink: link, appliedLinkForAll: is });
      control.get('placeOnline').updateValueAndValidity();
    });
  }

  toggleOnline(): void {
    this.isOnline = !this.isOnline;
    if (this.isOnline) {
      this.link.setValidators([Validators.required, Validators.pattern(Patterns.linkPattern)]);
      this.link.updateValueAndValidity();
    } else {
      this.link.clearValidators();
      this.formGroup.patchValue({ onlineLink: '' });
    }
  }

  toggleLocation(): void {
    this.isPlaceSelected = !this.isPlaceSelected;

    if (this._lastLocation.place) {
      this.formGroup.patchValue({
        coordinates: this._lastLocation.coordinates,
        place: this._lastLocation.place
      });
      setTimeout(() => {
        this.updateMap(this.coordinates.value);
      }, 0);
    } else {
      this._setCurrentLocation();
    }

    if (this.isPlaceSelected) {
      this.formGroup.controls.place.setValidators(Validators.required);
      setTimeout(() => {
        this._setPlaceAutocomplete();
      }, 0);
    } else {
      this.formGroup.controls.place.clearValidators();
      if (this.appliedPlaceForAll) {
        this.toggleForAllLocations();
      }
      this._autocomplete.unbindAll();
      this.formGroup.patchValue({
        coordinates: null,
        place: ''
      });
    }
  }

  mapClick(event: google.maps.MapMouseEvent): void {
    const coords = event.latLng.toJSON();
    this.updateMapAndLocation(coords);
  }

  private _setPlaceAutocomplete(): void {
    this._autocomplete = new google.maps.places.Autocomplete(this.placesRef.nativeElement, this._regionOptions);
    this._autocomplete.addListener('place_changed', () => {
      const locationName = this._autocomplete.getPlace();
      if (locationName.formatted_address) {
        const lat = locationName.geometry.location.lat();
        const lng = locationName.geometry.location.lng();
        const coords = { lat, lng };
        this.updateMapAndLocation(coords);
        this.formGroup.patchValue({
          place: locationName.formatted_address,
          coordinates: { lat: coords.lat, lng: coords.lng }
        });
      }
    });
  }

  private _setCurrentLocation(): void {
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
  }

  private handleGeolocationError(error: GeolocationPositionError) {
    console.error(error);
  }

  private updateMap(latLngLiteral: google.maps.LatLngLiteral) {
    this.mapMarkerCoords = latLngLiteral;
    this.map.panTo(latLngLiteral);
    this.map.center = latLngLiteral;
  }

  private updateMapAndLocation(latLngLiteral: google.maps.LatLngLiteral) {
    this.mapMarkerCoords = latLngLiteral;
    this.map.panTo(latLngLiteral);
    this.map.center = latLngLiteral;
    this.geocoderService.changeAddress(latLngLiteral).subscribe((result: google.maps.GeocoderResult) => {
      const address = result.formatted_address;
      this.formGroup.patchValue({
        coordinates: latLngLiteral,
        place: address
      });
      this._lastLocation = { coordinates: latLngLiteral, place: address };
    });
  }
}
