import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GoogleAutoRequest, GoogleAutoService, GooglePlaceResult, GooglePrediction } from 'src/app/ubs/mocks/google-types';
import { SearchAddress, DistrictsDtos, DistrictEnum } from 'src/app/ubs/ubs/models/ubs.interface';
import { Language } from 'src/app/main/i18n/Language';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private langService: LanguageService) {}

  getDistrictAuto(placeDetails: GooglePlaceResult, language: string): string {
    let currentDistrict;
    const searchItem = language === Language.EN ? 'district' : 'район';
    const getDistrict = placeDetails.address_components.filter((item) => item.long_name.toLowerCase().includes(searchItem))[0];
    if (getDistrict) {
      currentDistrict = this.convFirstLetterToCapital(getDistrict.long_name);
      return currentDistrict;
    }
  }

  convFirstLetterToCapital(value: string): string {
    const lowerCaseVal = value.toLocaleLowerCase();
    const converted = lowerCaseVal.charAt(0).toUpperCase() + lowerCaseVal.slice(1);
    return converted;
  }

  getSearchAddress(cityName: string, streetName: string, houseValue: string): SearchAddress {
    const searchAddress = {
      input: `${streetName}, ${houseValue}, ${cityName}`,
      street: `${streetName}, ${houseValue}`,
      city: `${cityName},`
    };
    return searchAddress;
  }

  getRequest(searchAddress: string, lang: string, types: 'address' | '(cities)' | 'administrative_area_level_1'): GoogleAutoRequest {
    const request = {
      input: searchAddress,
      language: lang,
      types: [types],
      componentRestrictions: { country: 'ua' }
    };
    return request;
  }

  getPlaceBounds(placeDetails: GooglePlaceResult): any {
    const l = placeDetails.geometry.viewport.getSouthWest();
    const x = placeDetails.geometry.viewport.getNorthEast();

    return new google.maps.LatLngBounds(l, x);
  }

  getFullAddressList(searchAddress: SearchAddress, autocompleteService: GoogleAutoService, lang: string): Observable<GooglePrediction[]> {
    const request = this.getRequest(searchAddress.input, lang, 'address');
    return new Observable((observer) => {
      autocompleteService.getPlacePredictions(request, (housePredictions) => {
        const predictionList = housePredictions?.filter(
          (el) => el.description.includes(searchAddress.street) && el.description.includes(searchAddress.city)
        );
        if (predictionList || predictionList?.length) {
          predictionList.forEach(
            (address) => (address.structured_formatting.main_text = [...address.structured_formatting.main_text.split(',')][1].trim())
          );
        }
        observer.next(predictionList);
        observer.complete();
      });
    });
  }

  setDistrictValues(districtUa: AbstractControl, districtEn: AbstractControl, districts: DistrictsDtos[]): void {
    const selectedDistrict = this.langService.getLangValue(districtUa.value, districtEn.value);

    const correspondingDistrict =
      districts.find((d) => d.nameEn === selectedDistrict) || districts.find((d) => d.nameUa === selectedDistrict);

    districtUa.setValue(correspondingDistrict.nameUa);
    districtUa.markAsDirty();
    districtEn.setValue(correspondingDistrict.nameEn);
    districtEn.markAsDirty();
  }

  appendDistrictLabel(districtList: DistrictsDtos[]): DistrictsDtos[] | [] {
    if (!districtList || districtList.length === 1) {
      return districtList || [];
    }

    return districtList.map((district) => {
      const districtWithLabel = {
        nameUa: `${district.nameUa}${DistrictEnum.UA}`,
        nameEn: `${district.nameEn}${DistrictEnum.EN}`
      };
      return districtWithLabel;
    });
  }
}
