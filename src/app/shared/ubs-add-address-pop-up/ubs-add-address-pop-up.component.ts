import { MatSnackBarComponent } from 'src/app/main/component/errors/mat-snack-bar/mat-snack-bar.component';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { takeUntil, switchMap } from 'rxjs/operators';
import { iif, of, Subject, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { OrderService } from 'src/app/ubs/ubs/services/order.service';
import { Address, SearchAddress, CourierLocations, DistrictsDtos, DistrictEnum } from 'src/app/ubs/ubs/models/ubs.interface';
import { Patterns } from 'src/assets/patterns/patterns';
import { GoogleScript } from 'src/assets/google-script/google-script';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { LocationService } from '@global-service/location/location.service';
import { GoogleAutoService, GooglePlaceResult, GooglePlaceService, GooglePrediction } from 'src/app/ubs/mocks/google-types';
import { Language } from 'src/app/main/i18n/Language';
import { RequiredFromDropdownValidator } from 'src/app/ubs/ubs-user/requiredFromDropDown.validator';

@Component({
  selector: 'app-ubs-add-address-pop-up',
  templateUrl: './ubs-add-address-pop-up.component.html',
  styleUrls: ['./ubs-add-address-pop-up.component.scss']
})
export class UBSAddAddressPopUpComponent implements OnInit, AfterViewInit {
  autocompleteService: GoogleAutoService;
  regionPredictionList: GooglePrediction[];
  streetPredictionList: GooglePrediction[];
  cityPredictionList: GooglePrediction[];
  housePredictionList: GooglePrediction[];
  placeService: GooglePlaceService;
  address: Address;
  formattedAddress: string;
  updatedAddresses: Address[];
  addAddressForm: FormGroup;
  isDisabled = false;
  corpusPattern = Patterns.ubsCorpusPattern;
  housePattern = Patterns.ubsHousePattern;
  entranceNumberPattern = Patterns.ubsEntrNumPattern;
  private destroy: Subject<boolean> = new Subject<boolean>();
  isHouseSelected = false;
  currentLanguage: string;
  public isDeleting: boolean;
  placeId: string;
  locations: CourierLocations;
  regionBounds;
  districtList: DistrictsDtos[];
  errorValueObj = {
    region: false,
    city: false,
    street: false
  };

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    public dialogRef: MatDialogRef<UBSAddAddressPopUpComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      edit: boolean;
      address: Address;
      addFromProfile?: boolean;
    },
    private snackBar: MatSnackBarComponent,
    private localStorageService: LocalStorageService,
    private langService: LanguageService,
    private googleScript: GoogleScript,
    private locationService: LocationService
  ) {}

  get region() {
    return this.addAddressForm.get('region');
  }

  get regionEn() {
    return this.addAddressForm.get('regionEn');
  }

  get district() {
    return this.addAddressForm.get('district');
  }

  get districtEn() {
    return this.addAddressForm.get('districtEn');
  }

  get city() {
    return this.addAddressForm.get('city');
  }

  get cityEn() {
    return this.addAddressForm.get('cityEn');
  }

  get street() {
    return this.addAddressForm.get('street');
  }

  get streetEn() {
    return this.addAddressForm.get('streetEn');
  }

  get houseNumber() {
    return this.addAddressForm.get('houseNumber');
  }

  get houseCorpus() {
    return this.addAddressForm.get('houseCorpus');
  }

  get entranceNumber() {
    return this.addAddressForm.get('entranceNumber');
  }

  get addressComment() {
    return this.addAddressForm.get('addressComment');
  }

  ngOnInit() {
    this.locations = this.localStorageService.getLocations();
    this.currentLanguage = this.localStorageService.getCurrentLanguage();
    const region = this.data.edit ? this.data.address.region : this.locations?.regionDto.nameUk;
    const regionEn = this.data.edit ? this.data.address.regionEn : this.locations?.regionDto.nameEn;

    this.addAddressForm = this.fb.group({
      region: [!this.data.addFromProfile ? region : '', [Validators.required]],
      regionEn: [!this.data.addFromProfile ? regionEn : '', [Validators.required]],
      city: [
        this.data.edit ? this.data.address.city : null,
        [Validators.required, Validators.minLength(1), Validators.maxLength(30), Validators.pattern(Patterns.ubsWithDigitPattern)]
      ],
      cityEn: [
        this.data.edit ? this.data.address.cityEn : null,
        [Validators.required, Validators.minLength(1), Validators.maxLength(30), Validators.pattern(Patterns.ubsWithDigitPattern)]
      ],
      district: [this.data.edit ? this.data.address.district : '', Validators.required],
      districtEn: [this.data.edit ? this.data.address.districtEn : '', Validators.required],
      street: [
        this.data.edit ? this.data.address.street : '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(120), Validators.pattern(Patterns.ubsWithDigitPattern)]
      ],
      streetEn: [
        this.data.edit ? this.data.address.streetEn : '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(120), Validators.pattern(Patterns.ubsWithDigitPattern)]
      ],
      houseNumber: [
        this.data.edit ? this.data.address.houseNumber : '',
        [Validators.required, Validators.maxLength(10), Validators.pattern(this.housePattern)]
      ],
      houseCorpus: [this.data.edit ? this.data.address.houseCorpus : '', [Validators.maxLength(4), Validators.pattern(this.corpusPattern)]],
      entranceNumber: [
        this.data.edit ? this.data.address.entranceNumber : '',
        [Validators.maxLength(2), Validators.pattern(this.entranceNumberPattern)]
      ],
      searchAddress: [''],
      addressComment: [this.data.edit ? this.data.address.addressComment : '', Validators.maxLength(255)],
      coordinates: {
        latitude: this.data.edit ? this.data.address.coordinates.latitude : '',
        longitude: this.data.edit ? this.data.address.coordinates.longitude : ''
      },
      placeId: null,
      id: [this.data.edit ? this.data.address.id : 0],
      actual: true
    });

    if (!this.data.addFromProfile) {
      this.region.disable();
      this.regionEn.disable();
    }

    this.addAddressForm
      .get(this.getLangValue('city', 'cityEn'))
      .valueChanges.pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.addressComment.reset('');
        this.districtEn.reset('');
        this.district.reset('');
        this.entranceNumber.reset('');
        this.houseCorpus.reset('');
        this.houseNumber.reset('');
        this.street.reset('');
        this.streetEn.reset('');
        this.streetPredictionList = null;
        this.cityPredictionList = null;
        this.housePredictionList = null;
        this.placeId = null;
      });

    if (this.data.edit) {
      this.districtList = this.data.address.addressRegionDistrictList.map((district) => {
        return {
          nameUa: `${district.nameUa}${DistrictEnum.UA}`,
          nameEn: `${district.nameEn}${DistrictEnum.EN}`
        };
      });
    } else {
      this.district.disable();
      this.districtEn.disable();
    }
  }

  ngAfterViewInit(): void {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy)).subscribe((lang: string) => {
      this.googleScript.load(lang);
    });
    this.initGoogleAutocompleteServices();
  }

  onRegionSelected(region: any): void {
    this.errorValueObj.region = false;
    this.updateValidInputs('region', 'regionEn');

    this.setTranslation(region.place_id, this.region, Language.UK);
    this.setTranslation(region.place_id, this.regionEn, Language.EN);
  }

  setTranslation(id: string, abstractControl: any, lang: string): void {
    this.placeService = new google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      placeId: id,
      language: lang
    };
    this.placeService.getDetails(request, (placeDetails) => {
      abstractControl.setValue(placeDetails.name);

      this.regionBounds = this.locationService.getPlaceBounds(placeDetails);
    });
  }

  private initGoogleAutocompleteServices(): void {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placeService = new google.maps.places.PlacesService(document.createElement('div'));
  }

  public getLangControl(uaControl: AbstractControl, enControl: AbstractControl): AbstractControl {
    return this.langService.getLangValue(uaControl, enControl) as AbstractControl;
  }

  updateValidInputs(control: string, controlEn: string): void {
    const currentControl = this.addAddressForm.get(this.getLangValue(control, controlEn));

    const validator =
      !this.data.addFromProfile && control !== 'city'
        ? [Validators.required]
        : [Validators.required, RequiredFromDropdownValidator.requiredFromDropdown(this.errorValueObj[control])];

    currentControl.setValidators(validator);
    currentControl.updateValueAndValidity();
    this.addAddressForm.updateValueAndValidity();
  }

  isErrorMessageShown(control: AbstractControl, controlEn: AbstractControl) {
    const currentControl = this.getLangControl(control, controlEn);
    return currentControl.touched && (currentControl.errors?.requiredFromDropdown || currentControl.errors?.required);
  }

  setPredictRegions(): void {
    this.errorValueObj.region = true;
    this.updateValidInputs('region', 'regionEn');

    if (this.currentLanguage === Language.UA && this.region.value) {
      this.inputRegion(this.region.value, Language.UK);
    }

    if (this.currentLanguage === Language.EN && this.regionEn.value) {
      this.inputRegion(this.regionEn.value, Language.EN);
    }
  }

  inputRegion(searchAddress: string, lang: string): void {
    const request = this.locationService.getRequest(searchAddress, lang, 'administrative_area_level_1');

    this.autocompleteService.getPlacePredictions(request, (regionPredictionList) => {
      this.regionPredictionList = regionPredictionList;
    });
  }

  setPredictCities(): void {
    this.errorValueObj.city = true;
    this.updateValidInputs('city', 'cityEn');

    this.cityPredictionList = null;

    if (this.currentLanguage === Language.UA && this.city.value) {
      this.inputCity(`${this.region.value}, місто, ${this.city.value}`, Language.UK);
    }

    if (this.currentLanguage === Language.EN && this.cityEn.value) {
      this.inputCity(`${this.regionEn.value}, City, ${this.cityEn.value}`, Language.EN);
    }
  }

  inputCity(searchAddress: string, lang: string): void {
    const request = {
      input: searchAddress,
      bounds: this.regionBounds,
      types: ['(cities)'],
      componentRestrictions: { country: 'ua' }
    };

    this.autocompleteService.getPlacePredictions(request, (cityPredictionList) => {
      this.cityPredictionList = cityPredictionList;
    });
  }

  onCitySelected(city: GooglePrediction): void {
    this.errorValueObj.city = false;
    this.updateValidInputs('city', 'cityEn');

    this.setValueOfCity(city, this.city, Language.UK);
    this.setValueOfCity(city, this.cityEn, Language.EN);
  }

  setValueOfCity(selectedCity: GooglePrediction, abstractControl: AbstractControl, lang: string): void {
    const request = {
      placeId: selectedCity.place_id,
      language: lang
    };

    this.placeService.getDetails(request, (placeDetails) => {
      abstractControl.setValue(placeDetails.name);

      this.getDistrictsForCity();
    });
  }

  getDistrictsForCity(): void {
    this.orderService
      .findAllDistricts(this.region.value, this.city.value)
      .pipe(takeUntil(this.destroy))
      .subscribe((districts) => {
        this.districtList = districts;

        this.district.enable();
        this.district.markAsTouched();
        this.districtEn.enable();
        this.districtEn.markAsTouched();
      });
  }

  setPredictStreets(): void {
    this.errorValueObj.street = true;
    this.updateValidInputs('street', 'streetEn');

    this.streetPredictionList = null;

    if (this.currentLanguage === Language.UA && this.street.value) {
      this.inputAddress(`${this.city.value}, ${this.street.value}`, Language.UK);
    }

    if (this.currentLanguage === Language.EN && this.streetEn.value) {
      this.inputAddress(`${this.cityEn.value}, ${this.streetEn.value}`, Language.EN);
    }
  }

  inputAddress(searchAddress: string, lang: string): void {
    const request = this.locationService.getRequest(searchAddress, lang, 'address');
    this.autocompleteService.getPlacePredictions(request, (streetPredictions) => {
      this.streetPredictionList = streetPredictions?.filter(
        (el) =>
          el.structured_formatting.secondary_text.includes(this.city.value) ||
          el.structured_formatting.secondary_text.includes(this.cityEn.value)
      );
    });
  }

  filterPredictions(predictions: any[]): any[] {
    return predictions?.filter(
      (el) =>
        el.structured_formatting.secondary_text.includes(this.region.value) ||
        el.structured_formatting.secondary_text.includes(this.regionEn.value) ||
        el.structured_formatting.secondary_text.includes(this.cityEn.value) ||
        el.structured_formatting.secondary_text.includes(this.city.value)
    );
  }

  onStreetSelected(street: GooglePrediction): void {
    this.errorValueObj.street = false;
    this.updateValidInputs('street', 'streetEn');

    this.houseNumber.reset('');
    this.housePredictionList = null;
    this.placeId = null;
    this.setValueOfStreet(street, this.street, Language.UK);
    this.setValueOfStreet(street, this.streetEn, Language.EN);
  }

  setValueOfStreet(selectedStreet: GooglePrediction, abstractControl: AbstractControl, lang: string): void {
    const request = {
      placeId: selectedStreet.place_id,
      language: lang
    };
    this.placeService.getDetails(request, (placeDetails) => {
      abstractControl.setValue(placeDetails.name);

      if (lang === Language.EN) {
        this.formattedAddress = placeDetails.formatted_address;
      }
      if (lang === Language.EN) {
        this.setDistrictAuto(placeDetails, this.districtEn, lang);
      }
      if (lang === Language.UK) {
        this.setDistrictAuto(placeDetails, this.district, lang);
      }
    });
  }

  onDistrictSelected() {
    this.locationService.setDistrictValues(this.district, this.districtEn, this.districtList);
  }

  setDistrictAuto(placeDetails: GooglePlaceResult, abstractControl: AbstractControl, language: string): void {
    let currentDistrict = this.locationService.getDistrictAuto(placeDetails, language);

    if (language === Language.EN) {
      currentDistrict = currentDistrict?.split(`'`).join('');
    }

    abstractControl.setValue(currentDistrict);
    abstractControl.markAsDirty();
  }

  setPredictHouseNumbers(): void {
    this.housePredictionList = null;
    this.isHouseSelected = false;
    const houseValue = this.houseNumber.value;
    if (this.cityEn.value && this.streetEn.value && houseValue) {
      const streetName = this.getLangValue(this.street.value, this.streetEn.value);
      const cityName = this.getLangValue(this.city.value, this.cityEn.value);
      this.houseNumber.setValue(houseValue);
      const searchAddress = this.locationService.getSearchAddress(cityName, streetName, houseValue);
      this.inputHouse(searchAddress, this.getLangValue(Language.UK, Language.EN));
    }
  }

  inputHouse(searchAddress: SearchAddress, lang: string): void {
    this.locationService
      .getFullAddressList(searchAddress, this.autocompleteService, lang)
      .pipe(takeUntil(this.destroy))
      .subscribe((list: GooglePrediction[]) => {
        this.housePredictionList = list;
      });
  }

  onHouseSelected(address: GooglePrediction): void {
    this.addAddressForm.get('searchAddress').setValue(address.description);
    this.placeId = address.place_id;
    this.isHouseSelected = true;
  }

  checkHouseInput(): void {
    if (!this.isHouseSelected) {
      this.houseNumber.setValue('');
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public deleteAddress(): void {
    this.isDeleting = true;
    this.isDisabled = true;
    this.orderService
      .deleteAddress(this.addAddressForm.value)
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.dialogRef.close('Deleted');
        this.isDisabled = false;
        this.isDeleting = false;
      });
  }

  addAdress(): void {
    this.addAddressForm.value.region = this.region.value;
    this.addAddressForm.value.regionEn = this.regionEn.value;
    this.addAddressForm.value.placeId = this.placeId;
    this.isDisabled = true;

    const streetUaValue = this.getLangValue(this.street.value, this.streetEn.value);
    const streetEnValue = this.getLangValue(this.streetEn.value, this.street.value);

    const addressData = {
      addressComment: this.addressComment.value,
      districtEn: this.districtEn.value,
      district: this.district.value,
      entranceNumber: this.entranceNumber.value,
      houseCorpus: this.houseCorpus.value,
      houseNumber: this.houseNumber.value,
      regionEn: this.addAddressForm.value.regionEn,
      region: this.addAddressForm.value.region,
      searchAddress: this.addAddressForm.value.searchAddress,
      placeId: this.placeId || '',
      street: streetUaValue || streetEnValue,
      streetEn: streetEnValue || streetUaValue,
      city: this.city.value,
      cityEn: this.cityEn.value
    };

    of(true)
      .pipe(
        takeUntil(this.destroy),
        switchMap(() =>
          iif(() => this.data.edit, this.orderService.updateAdress(this.addAddressForm.value), this.orderService.addAdress(addressData))
        )
      )
      .subscribe(
        (list: { addressList: Address[] }) => {
          this.orderService.setCurrentAddress(this.addAddressForm.value);

          this.updatedAddresses = list.addressList;
          this.dialogRef.close('Added');
          this.isDisabled = false;
        },
        (error) => {
          this.snackBar.openSnackBar('existAddress');
          this.dialogRef.close();
          this.isDisabled = false;
          return throwError(error);
        }
      );
    this.snackBar.openSnackBar('addedAddress');
  }

  isSubmitBtnDisabled(): boolean {
    let isValueExistsInDistricts = false;

    if (this.district.value && this.districtEn.value) {
      isValueExistsInDistricts = this.districtList?.some(
        (district) => district.nameUa === this.district.value || district.nameEn === this.districtEn.value
      );
    }

    this.isHouseSelected = !!this.houseNumber.value;
    const isFormInvalidFromProfile = !this.addAddressForm.valid && this.data.addFromProfile;

    return isFormInvalidFromProfile || this.isDisabled || !this.isHouseSelected || !isValueExistsInDistricts;
  }

  public getLangValue(uaValue, enValue): string {
    return this.langService.getLangValue(uaValue, enValue) as string;
  }
}
