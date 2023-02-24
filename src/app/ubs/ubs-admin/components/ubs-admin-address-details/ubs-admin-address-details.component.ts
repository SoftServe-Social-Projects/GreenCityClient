import { Component, Input, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Locations } from 'src/assets/locations/locations';
import { Location } from '../../models/ubs-admin.interface';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Component({
  selector: 'app-ubs-admin-address-details',
  templateUrl: './ubs-admin-address-details.component.html',
  styleUrls: ['./ubs-admin-address-details.component.scss']
})
export class UbsAdminAddressDetailsComponent implements OnDestroy {
  @Input() addressComment: string;
  @Input() addressExportDetailsDto: FormGroup;
  pageOpen: boolean;
  autocompleteService: google.maps.places.AutocompleteService;
  streetPredictionList: google.maps.places.AutocompletePrediction[];
  cityPredictionList: google.maps.places.AutocompletePrediction[];
  placeService: google.maps.places.PlacesService;
  currentLanguage: string;
  regions: Location[];
  districts: Location[];
  districtsKyiv: Location[];
  isDistrict: boolean;

  languages = {
    en: 'en',
    uk: 'uk'
  };

  constructor(private localStorageService: LocalStorageService, private locations: Locations, private langService: LanguageService) {}
  private destroy$: Subject<boolean> = new Subject<boolean>();

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

  openDetails(): void {
    this.pageOpen = !this.pageOpen;

    if (this.pageOpen) {
      this.loadData();
    }
  }

  loadData(): void {
    this.currentLanguage = this.localStorageService.getCurrentLanguage();
    this.isDistrict = this.addressCity.value === 'Київ' ? true : false;
    this.regions = this.locations.getBigRegions(this.currentLanguage);
    this.districtsKyiv = this.locations.getRegionsKyiv(this.currentLanguage);
    this.districts = this.locations.getRegions(this.currentLanguage);

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

  private initGoogleAutocompleteServices(): void {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placeService = new google.maps.places.PlacesService(document.createElement('div'));
  }

  setRegionValue(event: Event): void {
    const elem = this.regions.find((el) => el.name === (event.target as HTMLSelectElement).value.slice(3));
    const selectedRegionUa = this.locations.getBigRegions('ua').find((el) => el.key === elem.key);
    const selectedRegionEn = this.locations.getBigRegions('en').find((el) => el.key === elem.key);
    this.addressRegion.setValue(selectedRegionUa.name);
    this.addressRegion.markAsDirty();
    this.addressRegionEng.setValue(selectedRegionEn.name);
    this.addressRegionEng.markAsDirty();
  }

  setPredictCities(): void {
    this.cityPredictionList = null;

    if (this.currentLanguage === 'ua' && this.addressCity.value) {
      this.inputCity(`${this.addressRegion.value}, ${this.addressCity.value}`, this.languages.uk);
    }
    if (this.currentLanguage === 'en' && this.addressCityEng.value) {
      this.inputCity(`${this.addressRegionEng.value},${this.addressCityEng.value}`, this.languages.en);
    }
  }

  inputCity(searchAddress: string, lang: string): void {
    const request = {
      input: searchAddress,
      language: lang,
      types: ['(cities)'],
      componentRestrictions: { country: 'ua' }
    };
    this.autocompleteService.getPlacePredictions(request, (cityPredictionList) => {
      if (this.addressRegionEng.value === 'Kyiv') {
        this.cityPredictionList = cityPredictionList?.filter((el) => el.place_id === 'ChIJBUVa4U7P1EAR_kYBF9IxSXY');
      } else {
        this.cityPredictionList = cityPredictionList;
      }
    });
  }

  onCitySelected(selectedCity: google.maps.places.AutocompletePrediction): void {
    this.setValueOfCity(selectedCity, this.addressCity, this.languages.uk);
    this.setValueOfCity(selectedCity, this.addressCityEng, this.languages.en);
  }

  setValueOfCity(selectedCity: google.maps.places.AutocompletePrediction, abstractControl: AbstractControl, lang: string): void {
    const request = {
      placeId: selectedCity.place_id,
      language: lang
    };
    this.placeService.getDetails(request, (placeDetails) => {
      abstractControl.setValue(placeDetails.name);
      abstractControl.markAsDirty();

      if (abstractControl === this.addressCity) {
        this.isDistrict = this.addressCity.value === 'Київ' ? true : false;
      }
    });
  }

  setPredictStreets(): void {
    this.streetPredictionList = null;

    if (this.currentLanguage === 'ua' && this.addressStreet.value) {
      this.inputAddress(`${this.addressCity.value}, ${this.addressStreet.value}`, this.languages.uk);
    }
    if (this.currentLanguage === 'en' && this.addressStreetEng.value) {
      this.inputAddress(`${this.addressCityEng.value}, ${this.addressStreetEng.value}`, this.languages.en);
    }
  }

  inputAddress(searchAddress: string, lang: string): void {
    const request = {
      input: searchAddress,
      language: lang,
      types: ['address'],
      componentRestrictions: { country: 'ua' }
    };
    this.autocompleteService.getPlacePredictions(request, (streetPredictions) => {
      if (!this.isDistrict) {
        this.streetPredictionList = streetPredictions?.filter(
          (el) =>
            (el.structured_formatting.secondary_text.includes('Київська область') ||
              el.structured_formatting.secondary_text.includes('Kyiv Oblast')) &&
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

  onStreetSelected(selectedStreet: google.maps.places.AutocompletePrediction): void {
    this.setValueOfStreet(selectedStreet, this.addressStreet, this.languages.uk);
    this.setValueOfStreet(selectedStreet, this.addressStreetEng, this.languages.en);
  }

  setValueOfStreet(selectedStreet: google.maps.places.AutocompletePrediction, abstractControl: AbstractControl, lang: string): void {
    const request = {
      placeId: selectedStreet.place_id,
      language: lang
    };
    this.placeService.getDetails(request, (placeDetails) => {
      abstractControl.setValue(placeDetails.name);
      abstractControl.markAsDirty();

      if (lang === this.languages.en && this.isDistrict) {
        this.setDistrictAuto(placeDetails, this.addressDistrictEng, lang);
      }
      if (lang === this.languages.uk && this.isDistrict) {
        this.setDistrictAuto(placeDetails, this.addressDistrict, lang);
      }
    });
  }

  setDistrictAuto(placeDetails: google.maps.places.PlaceResult, abstractControl: AbstractControl, language: string): void {
    const searchItem = language === this.languages.en ? 'district' : 'район';
    const getDistrict = placeDetails.address_components.filter((item) => item.long_name.toLowerCase().includes(searchItem))[0];
    if (getDistrict) {
      const currentDistrict = getDistrict.long_name;
      abstractControl.setValue(currentDistrict);
      abstractControl.markAsDirty();
    }
  }

  onDistrictSelected(event: Event): void {
    const districtKey = (event.target as HTMLSelectElement).value.slice(0, 1);
    this.isDistrict ? this.setKyivDistrict(districtKey) : this.setDistrict(districtKey);
  }

  setKyivDistrict(districtKey: string): void {
    const key = Number(districtKey) + 1;
    const selectedDistrict = this.locations.getRegionsKyiv('ua').find((el) => el.key === key);
    const selectedDistricEn = this.locations.getRegionsKyiv('en').find((el) => el.key === key);

    this.addressDistrict.setValue(selectedDistrict.name);
    this.addressDistrict.markAsDirty();
    this.addressDistrictEng.setValue(selectedDistricEn.name);
    this.addressDistrictEng.markAsDirty();
  }

  setDistrict(districtKey: string): void {
    const key = Number(districtKey) + 1;
    const selectedDistrict = this.locations.getRegions('ua').find((el) => el.key === key);
    const selectedDistricEn = this.locations.getRegions('en').find((el) => el.key === key);

    this.addressDistrict.setValue(selectedDistrict.name);
    this.addressDistrict.markAsDirty();
    this.addressDistrictEng.setValue(selectedDistricEn.name);
    this.addressDistrictEng.markAsDirty();
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
