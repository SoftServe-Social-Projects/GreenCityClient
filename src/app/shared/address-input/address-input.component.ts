import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Coordinates } from '@global-user/models/edit-profile.model';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { emptyOrValid } from 'src/app/shared/validators/empthy-or-valid.validator';
import { addressesSelector } from 'src/app/store/selectors/order.selectors';
import { GooglePrediction } from 'src/app/ubs/mocks/google-types';
import { Address, CourierLocations, DistrictEnum, DistrictsDtos } from 'src/app/ubs/ubs/models/ubs.interface';
import { CAddressData } from 'src/app/ubs/ubs/models/ubs.model';
import { addressAlreadyExistsValidator } from 'src/app/ubs/ubs/validators/address-olready-exists-validator';
import { Patterns } from 'src/assets/patterns/patterns';
import { AddressService } from '../services/address/address.service';

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: AddressInputComponent
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: AddressInputComponent
    }
  ]
})
export class AddressInputComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor, Validator {
  @Input() edit: boolean;
  @Input() address: Address;
  @Input() addFromProfile: boolean;
  @Input() isShowCommentInput = true;
  @Input() isFromAdminPage: boolean;

  addressForm: FormGroup;
  currentLanguage: string;
  locations: CourierLocations;
  addressData: CAddressData;
  addressCoords: google.maps.LatLng;
  isTouched = false;
  isShowMap = false;
  districtChanged = false;
  districtsForKyiv = [];
  isKyiv = false;

  mapOptions: google.maps.MapOptions = {
    center: { lat: 49.8397, lng: 24.0297 },
    zoom: 8,
    minZoom: 4,
    maxZoom: 20
  };

  private buildingPattern = Patterns.numericAndAlphabetic;
  private $destroy: Subject<void> = new Subject();

  autocompleteRegionRequest = {
    input: '',
    types: ['administrative_area_level_1'],
    componentRestrictions: { country: 'ua' }
  };

  autocompleteCityRequest = {
    input: '',
    types: ['(cities)'],
    componentRestrictions: { country: 'ua' }
  };

  autocompleteStreetRequest = {
    input: '',
    types: ['address'],
    componentRestrictions: { country: 'ua' }
  };

  get region(): FormControl {
    return this.addressForm.get('region') as FormControl;
  }

  get district(): FormControl {
    return this.addressForm.get('district') as FormControl;
  }

  get city(): FormControl {
    return this.addressForm.get('city') as FormControl;
  }

  get street(): FormControl {
    return this.addressForm.get('street') as FormControl;
  }

  get houseNumber(): FormControl {
    return this.addressForm.get('houseNumber') as FormControl;
  }

  get houseCorpus(): FormControl {
    return this.addressForm.get('houseCorpus') as FormControl;
  }

  get entranceNumber(): FormControl {
    return this.addressForm.get('entranceNumber') as FormControl;
  }

  get addressComment(): FormControl {
    return this.addressForm.get('addressComment') as FormControl;
  }

  get placeId(): FormControl {
    return this.addressForm.get('placeId') as FormControl;
  }

  onChange = (address) => {
    console.log(address);
  };
  onTouched = () => {};

  constructor(
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    public langService: LanguageService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private addressService: AddressService
  ) {}

  validate(control: AbstractControl): ValidationErrors {
    console.log('data: ', this.addressData);
    console.log('is valid: ', this.addressData.isValid());
    return (this.addressForm.valid && this.addressData.isValid()) || this.addressForm.pristine ? null : { incorrectAddress: true };
  }

  writeValue(obj: any): void {}

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.addressForm.disable() : this.addressForm.enable();
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  markAsTouched(): void {
    if (!this.isTouched) {
      this.onTouched();
      this.isTouched = true;
    }
  }

  ngOnInit(): void {
    this.addressData = new CAddressData(this.langService);
    this.locations = this.localStorageService.getLocations();
    this.currentLanguage = this.localStorageService.getCurrentLanguage();
    this.initForm();
    this.initListeners();
  }

  ngAfterViewInit(): void {
    if (!this.edit) {
      this.region.value ? this.city.enable() : this.city.disable();
      this.street.disable();
      this.houseNumber.disable();
      this.houseCorpus.disable();
      this.entranceNumber.disable();
      this.district.disable();
    } else {
      this.district.disable();
      if (this.city.value === 'Kyiv' || this.city.value === 'Київ') {
        this.getDistricts();
        // this.districtChanged = false;
        this.isKyiv = true;
        this.district.enable();
      } else {
        this.isKyiv = false;
      }
    }
    if (this.isFromAdminPage) {
      this.addressComment.disable();
      this.region.disable();
    }
    this.cdr.detectChanges();
  }

  initListeners(): void {
    this.addressData
      .getPlaceIdChange()
      .pipe(takeUntil(this.$destroy))
      .subscribe((placeId: string) => {
        this.placeId.setValue(placeId);

        this.onChange(this.addressData.getValues());
      });

    this.addressData
      .getAddressChange()
      .pipe(takeUntil(this.$destroy))
      .subscribe((addressData) => {
        const region = this.currentLanguage === 'ua' ? addressData.region : addressData.regionEn;
        const city = this.currentLanguage === 'ua' ? addressData.city : addressData.cityEn;
        const street = this.currentLanguage === 'ua' ? addressData.street : addressData.streetEn;

        this.onRegionValueSet(region);
        this.onCityValueSet(city);
        this.onStreetValueSet(street);
        this.district.setValue(this.langService.getLangValue(addressData.district, addressData.districtEn));
        this.houseNumber.setValue(addressData.houseNumber);

        this.onChange(this.addressData.getValues());
        this.cdr.detectChanges();
      });
  }

  initForm(): void {
    if (this.address?.id || this.locations?.regionDto) {
      this.setInitialValues();
    }

    const region = this.addressData.getRegion(this.langService.getCurrentLanguage());

    this.addressForm = this.fb.group({
      region: [region ?? '', Validators.required],
      city: [this.addressData.getCity() ?? '', Validators.required],
      street: [this.addressData.getStreet() ?? '', Validators.required],
      district: [this.addressData.getDistrict() ?? '', Validators.required],
      houseNumber: [this.address?.houseNumber ?? '', [Validators.required, Validators.pattern(this.buildingPattern)]],
      houseCorpus: [this.address?.houseCorpus ?? '', emptyOrValid([Validators.maxLength(4), Validators.pattern(this.buildingPattern)])],
      entranceNumber: [
        this.address?.entranceNumber ?? '',
        emptyOrValid([Validators.maxLength(2), Validators.pattern(this.buildingPattern)])
      ],
      placeId: [this.address?.placeId ?? ''],
      addressComment: [this.address?.addressComment ?? '']
    });

    if (!this.edit) {
      region ? this.city.enable() : this.city.disable();
      this.street.disable();
      this.houseNumber.disable();
      this.district.disable();
    }

    this.initFormValidators();

    this.onChange(this.addressData.getValues());
  }

  setInitialValues() {
    this.edit
      ? this.addressData.initAddressData(this.address)
      : this.addressData.setRegionWithTranslation(this.locations.regionDto.nameUk, this.locations.regionDto.nameEn);
  }

  initFormValidators(): void {
    this.store.pipe(select(addressesSelector), takeUntil(this.$destroy)).subscribe((addresses) => {
      if (addresses?.length >= 0) {
        this.addressForm.setValidators(addressAlreadyExistsValidator(addresses, this.localStorageService.getCurrentLanguage()));
        this.addressForm.updateValueAndValidity();
      }
    });
  }

  onUseUserLocation(isUseUserLocation: boolean) {
    this.isShowMap = isUseUserLocation;

    if (isUseUserLocation) {
      this.setCurrentLocation();
    } else {
      this.resetCity();
      this.resetStreet();
      this.resetDistricts();
      this.resetHouseInfo();
    }
  }

  onRegionSelected(region: GooglePrediction): void {
    if (region) {
      this.addressData.setRegion(region.place_id);
    }

    this.resetCity();
    this.resetStreet();
    this.resetDistricts();
    this.resetHouseInfo();

    this.onRegionValueSet(region?.structured_formatting.main_text ?? '');
  }

  onCitySelected(city: GooglePrediction): void {
    if (city) {
      this.city.patchValue(city?.structured_formatting.main_text ?? '');
      this.addressData.setCity(city.place_id);
    }

    if (this.city.value === 'Kyiv' || this.city.value === 'Київ') {
      this.getDistricts();
      // this.districtChanged = false;
      this.isKyiv = true;
    } else {
      this.isKyiv = false;
    }

    this.resetStreet();
    this.resetDistricts();
    this.resetHouseInfo();

    this.onCityValueSet(city?.structured_formatting.main_text ?? '');
  }

  onStreetSelected(street: GooglePrediction): void {
    if (street) {
      this.placeId.setValue(street.place_id);
      this.addressData.setStreet(street.place_id);
      this.isKyiv && this.district.enable();
      this.districtChanged = false;
    } else {
      this.addressData.resetStreet();
      this.district.reset();
    }

    this.resetHouseInfo();

    this.onStreetValueSet(street?.structured_formatting.main_text ?? '');
  }

  onCoordinatesSelected(coordinates: Coordinates) {
    this.addressData.setCoordinates(new google.maps.LatLng(coordinates.latitude, coordinates.longitude));
    this.OnChangeAndTouched();
  }

  onDistrictSelected(): void {
    this.addressData.setDistrict(this.district.value);
    this.onChange(this.addressData.getValues());
  }

  getDistricts() {
    this.addressService.getKyivDistricts().subscribe((districts) => {
      this.districtsForKyiv = districts;
    });
  }

  onHouseNumberChange(): void {
    this.addressData.setHouseNumber(this.houseNumber.value);
    this.OnChangeAndTouched();

    if (!this.district.value) {
      this.addressData.setDistrictFromCity();
    }
  }

  // TODO: REFACTOR IT
  onDistrictChange(district: string, districtEn?: string): void {
    this.districtChanged = true;
    if (this.isKyiv && districtEn) {
      this.addressData.setCustomDistrict(district, districtEn);
    } else {
      this.addressData.setCustomDistrict(district, district);
    }

    this.OnChangeAndTouched();
  }

  onHouseCorpusChange(): void {
    this.addressData.setHouseCorpus(this.houseCorpus.value);
    this.OnChangeAndTouched();
  }

  onEntranceNumberChange(): void {
    this.addressData.setEntranceNumber(this.entranceNumber.value);
    this.OnChangeAndTouched();
  }

  onCommentChange(): void {
    this.addressData.setAddressComment(this.addressComment.value);
    this.OnChangeAndTouched();
  }

  onMapClick($event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) {
    this.addressCoords = $event.latLng;

    this.addressData.setCoordinates(new google.maps.LatLng(this.addressCoords), { fetch: true });
  }

  isErrorMessageShown(control: AbstractControl): boolean {
    return control.touched && control.invalid;
  }

  districtComparator(option: DistrictsDtos, value: DistrictsDtos): boolean {
    return option?.nameUa === value?.nameUa;
  }

  getCityPrefix(): string {
    const cityValue = this.langService.getLangValue('місто', 'city');
    return `${this.region.value}, ${cityValue}, `;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private onRegionValueSet(value: string): void {
    if (value) {
      this.region.patchValue(value);
      this.city.enable();
    } else {
      this.region.patchValue('');
      this.addressData.resetRegion();

      this.city.disable();
      this.street.disable();
      this.houseNumber.disable();
    }

    this.OnChangeAndTouched();
  }

  private onCityValueSet(value: string) {
    if (value) {
      this.city.patchValue(value);

      this.street.enable();
    } else {
      this.city.patchValue('');
      this.addressData.resetCity();

      this.street.disable();
      this.houseNumber.disable();
    }

    this.OnChangeAndTouched();
  }

  private onStreetValueSet(value: string): void {
    if (value) {
      this.street.patchValue(value);

      this.houseNumber.enable();
      this.houseCorpus.enable();
      this.entranceNumber.enable();
    } else {
      this.street.patchValue('');

      this.houseNumber.disable();
      this.houseCorpus.disable();
      this.entranceNumber.disable();
    }

    this.OnChangeAndTouched();
  }

  private resetHouseInfo(): void {
    this.houseNumber.reset();
    this.houseCorpus.reset();
    this.entranceNumber.reset();
    this.addressData.resetHouseInfo();
  }

  private resetDistricts(): void {
    this.district.reset();
    this.addressData.resetDistrict();
    this.district.disable();
  }

  private resetStreet(): void {
    this.street.reset();
    this.addressData.resetStreet();
  }

  private resetCity(): void {
    this.city.reset();
    this.addressData.resetCity();
  }

  private OnChangeAndTouched(): void {
    if (this.isFromAdminPage) {
      this.addressComment.disable();
      this.region.disable();
    }
    this.onChange(this.addressData.getValues());
    this.markAsTouched();
  }

  //Set users current location
  private setCurrentLocation(): void {
    navigator.geolocation.getCurrentPosition(
      (position) => this.handleGeolocationSuccess(position),
      (error) => console.error(error)
    );
  }

  private handleGeolocationSuccess(position: GeolocationPosition): void {
    this.addressCoords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    this.addressData.setCoordinates(this.addressCoords);
  }
}
