import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { IGeneralOrderInfo } from '../../models/ubs-admin.interface';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';
import { LocationService } from '@global-service/location/location.service';
import { SearchAddress, KyivNamesEnum, DistrictsDtos } from 'src/app/ubs/ubs/models/ubs.interface';
import { GoogleAutoService, GooglePlaceResult, GooglePlaceService, GooglePrediction } from 'src/app/ubs/mocks/google-types';
import { Language } from 'src/app/main/i18n/Language';
import { OrderService } from 'src/app/ubs/ubs/services/order.service';

@Component({
  selector: 'app-ubs-admin-address-details',
  templateUrl: './ubs-admin-address-details.component.html',
  styleUrls: ['./ubs-admin-address-details.component.scss']
})
export class UbsAdminAddressDetailsComponent implements OnInit, OnDestroy {
  @Input() addressExportDetailsDto: FormGroup;
  @Input() generalInfo: IGeneralOrderInfo;
  @Input() isEmployeeCanEditOrder: boolean;

  pageOpen: boolean;
  autocompleteService: GoogleAutoService;
  streetPredictionList: GooglePrediction[];
  cityPredictionList: GooglePrediction[];
  housePredictionList: GooglePrediction[];
  placeService: GooglePlaceService;
  currentLanguage: string;
  districts: DistrictsDtos[];
  isStatus = false;
  isHouseSelected = false;

  constructor(
    private localStorageService: LocalStorageService,
    private langService: LanguageService,
    private locationService: LocationService,
    private orderService: OrderService
  ) {}
  private destroy$: Subject<boolean> = new Subject<boolean>();

  ngOnInit(): void {
    this.isStatus = this.generalInfo.orderStatus === OrderStatus.CANCELED;
    if (!this.isEmployeeCanEditOrder) {
      this.addressHouseNumber.disable();
    }
  }

  get addressRegion() {
    return this.addressExportDetailsDto.get('addressRegion');
  }

  get addressRegionEng() {
    return this.addressExportDetailsDto.get('addressRegionEng');
  }

  get addressCity() {
    return this.addressExportDetailsDto.get('addressCity');
  }

  get addressCityEng() {
    return this.addressExportDetailsDto.get('addressCityEng');
  }

  get addressStreet() {
    return this.addressExportDetailsDto.get('addressStreet');
  }

  get addressStreetEng() {
    return this.addressExportDetailsDto.get('addressStreetEng');
  }

  get addressHouseNumber() {
    return this.addressExportDetailsDto.get('addressHouseNumber');
  }

  get addressHouseCorpus() {
    return this.addressExportDetailsDto.get('addressHouseCorpus');
  }

  get addressEntranceNumber() {
    return this.addressExportDetailsDto.get('addressEntranceNumber');
  }

  get addressDistrict() {
    return this.addressExportDetailsDto.get('addressDistrict');
  }

  get addressDistrictEng() {
    return this.addressExportDetailsDto.get('addressDistrictEng');
  }

  get addressComment() {
    return this.addressExportDetailsDto.get('addressComment');
  }

  openDetails(): void {
    this.pageOpen = !this.pageOpen;

    if (this.pageOpen) {
      this.loadData();
    }
  }

  loadData(): void {
    this.currentLanguage = this.localStorageService.getCurrentLanguage();
    this.districts = this.locationService.appendDistrictLabel(this.addressExportDetailsDto.get('addressRegionDistrictList').value);

    this.getLangControl(this.addressRegion, this.addressRegionEng).valueChanges.subscribe(() => {
      this.addressCity.setValue('');
      this.addressCityEng.setValue('');
      this.addressStreet.setValue('');
      this.addressStreetEng.setValue('');
      this.addressHouseNumber.setValue('');
      this.addressHouseCorpus.setValue('');
      this.addressEntranceNumber.setValue('');
      this.addressDistrict.setValue('');
      this.addressDistrictEng.setValue('');
      this.streetPredictionList = null;
      this.cityPredictionList = null;
    });

    this.getLangControl(this.addressCity, this.addressCityEng).valueChanges.subscribe(() => {
      this.addressStreet.setValue('');
      this.addressStreetEng.setValue('');
      this.addressHouseNumber.setValue('');
      this.addressHouseCorpus.setValue('');
      this.addressEntranceNumber.setValue('');
      this.addressDistrict.setValue('');
      this.addressDistrictEng.setValue('');
      this.streetPredictionList = null;
    });

    this.initGoogleAutocompleteServices();
  }

  getDistrictsForCity(): void {
    this.orderService
      .findAllDistricts(this.addressRegion.value, this.addressCity.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe((districts) => {
        this.districts = districts;
      });
  }

  private initGoogleAutocompleteServices(): void {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placeService = new google.maps.places.PlacesService(document.createElement('div'));
  }

  setPredictCities(): void {
    this.cityPredictionList = null;

    if (this.currentLanguage === Language.UA && this.addressCity.value) {
      this.inputCity(`${this.addressRegion.value}, ${this.addressCity.value}`, Language.UK);
    }
    if (this.currentLanguage === Language.EN && this.addressCityEng.value) {
      this.inputCity(`${this.addressRegionEng.value},${this.addressCityEng.value}`, Language.EN);
    }
  }

  inputCity(searchAddress: string, lang: string): void {
    const request = this.locationService.getRequest(searchAddress, lang, '(cities)');
    this.autocompleteService.getPlacePredictions(request, (cityPredictionList) => {
      if (this.addressRegionEng.value === 'Kyiv') {
        this.cityPredictionList = cityPredictionList?.filter((el) => el.place_id === 'ChIJBUVa4U7P1EAR_kYBF9IxSXY');
      } else {
        this.cityPredictionList = cityPredictionList;
      }
    });
  }

  onCitySelected(selectedCity: GooglePrediction): void {
    this.setValueOfCity(selectedCity, this.addressCity, Language.UK);
    this.setValueOfCity(selectedCity, this.addressCityEng, Language.EN);
  }

  setValueOfCity(selectedCity: GooglePrediction, abstractControl: AbstractControl, lang: string): void {
    const request = {
      placeId: selectedCity.place_id,
      language: lang
    };
    this.placeService.getDetails(request, (placeDetails) => {
      abstractControl.setValue(placeDetails.name);
      abstractControl.markAsDirty();
      if (lang === Language.UK) {
        this.getDistrictsForCity();
      }
    });
  }

  setPredictStreets(): void {
    this.streetPredictionList = null;

    if (this.currentLanguage === Language.UA && this.addressStreet.value) {
      this.inputAddress(`${this.addressCity.value}, ${this.addressStreet.value}`, Language.UK);
    }
    if (this.currentLanguage === Language.EN && this.addressStreetEng.value) {
      this.inputAddress(`${this.addressCityEng.value}, ${this.addressStreetEng.value}`, Language.EN);
    }
  }

  inputAddress(searchAddress: string, lang: string): void {
    const request = this.locationService.getRequest(searchAddress, lang, 'address');
    const isKyivRegion = this.addressRegion.value === KyivNamesEnum.KyivRegionUa;
    this.autocompleteService.getPlacePredictions(request, (streetPredictions) => {
      if (!isKyivRegion) {
        this.streetPredictionList = streetPredictions?.filter(
          (el) =>
            (el.structured_formatting.secondary_text.includes(this.addressRegion.value) ||
              el.structured_formatting.secondary_text.includes(this.addressRegionEng.value)) &&
            (el.structured_formatting.secondary_text.includes(this.addressCity.value) ||
              el.structured_formatting.secondary_text.includes(this.addressCityEng.value))
        );
      } else {
        this.streetPredictionList = streetPredictions?.filter(
          (el) =>
            el.structured_formatting.secondary_text.includes(this.addressCity.value) ||
            el.structured_formatting.secondary_text.includes(this.addressCityEng.value)
        );
      }
    });
  }

  onStreetSelected(selectedStreet: GooglePrediction): void {
    this.addressHouseNumber.setValue('');

    this.setValueOfStreet(selectedStreet, this.addressStreet, Language.UK);
    this.setValueOfStreet(selectedStreet, this.addressStreetEng, Language.EN);
  }

  setValueOfStreet(selectedStreet: GooglePrediction, abstractControl: AbstractControl, lang: string): void {
    const request = {
      placeId: selectedStreet.place_id,
      language: lang
    };
    this.placeService.getDetails(request, (placeDetails) => {
      abstractControl.setValue(placeDetails.name);

      if (lang === Language.EN && this.addressDistrictEng) {
        this.setDistrictAuto(placeDetails, this.addressDistrictEng, lang);
      }
      if (lang === Language.UK && this.addressDistrict) {
        this.setDistrictAuto(placeDetails, this.addressDistrict, lang);
      }
    });
  }

  setDistrictAuto(placeDetails: GooglePlaceResult, abstractControl: AbstractControl, language: string): void {
    let currentDistrict = this.locationService.getDistrictAuto(placeDetails, language);

    if (language === Language.EN) {
      currentDistrict = currentDistrict?.split(`'`).join('');
    }

    abstractControl.setValue(currentDistrict);
    abstractControl.markAsDirty();
  }

  onDistrictSelected(): void {
    this.locationService.setDistrictValues(this.addressDistrict, this.addressDistrictEng, this.districts);
  }

  setPredictHouseNumbers(): void {
    this.housePredictionList = null;
    this.isHouseSelected = false;
    const houseValue = this.addressHouseNumber.value.toLowerCase();
    const streetName = this.getLangValue(this.addressStreet.value, this.addressStreetEng.value);
    const cityName = this.getLangValue(this.addressCity.value, this.addressCityEng.value);
    if (cityName && streetName && houseValue) {
      this.addressHouseNumber.setValue(houseValue);
      const searchAddress = this.locationService.getSearchAddress(cityName, streetName, houseValue);
      this.inputHouse(searchAddress, this.getLangValue(Language.UK, Language.EN));
    }
  }

  inputHouse(searchAddress: SearchAddress, lang: string): void {
    this.locationService
      .getFullAddressList(searchAddress, this.autocompleteService, lang)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list: GooglePrediction[]) => {
        this.housePredictionList = list;
      });
  }

  onHouseSelected(): void {
    this.isHouseSelected = true;
  }

  checkHouseInput(): void {
    if (!this.isHouseSelected) {
      this.addressHouseNumber.setValue('');
    }
  }

  public getLangValue(uaValue: string, enValue: string): string {
    return this.langService.getLangValue(uaValue, enValue) as string;
  }

  public getLangControl(uaControl: AbstractControl, enControl: AbstractControl): AbstractControl {
    return this.langService.getLangValue(uaControl, enControl) as AbstractControl;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
