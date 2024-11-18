import { TestBed } from '@angular/core/testing';
import { LocationService } from './location.service';
import { ADDRESSESMOCK } from 'src/app/ubs/mocks/address-mock';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { of } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Language } from 'src/app/main/i18n/Language';

describe('LocationService', () => {
  let locations;

  const placeDetailsEn = {
    address_components: [{ long_name: 'Name of District' }]
  };

  const mockHousePredictions = [
    { description: 'street , 2, Kyiv, Ukraine', structured_formatting: { main_text: 'street, 2' } },
    { description: 'street , 2A, Kyiv, Ukraine', structured_formatting: { main_text: 'street, 2A' } },
    { description: 'street , 21, Kyiv', structured_formatting: { main_text: 'street, 1' } }
  ];

  const mockAutocompleteService = { getPlacePredictions: (a, b) => {} } as any;
  mockAutocompleteService.getPlacePredictions = () => of(mockHousePredictions, 'OK' as any);

  const languageServiceMock = jasmine.createSpyObj('LanguageService', ['getLangValue']);

  const districtUa = new FormControl();
  const districtEn = new FormControl();

  const mockPlaceDetails = {
    geometry: {
      viewport: {
        getSouthWest: () => ({ lat: 48.5, lng: 33.5 }),
        getNorthEast: () => ({ lat: 50.5, lng: 35.5 })
      }
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: LanguageService, useValue: languageServiceMock }],
      imports: []
    });
    locations = TestBed.inject(LocationService);
  });

  it('should be created', () => {
    expect(locations).toBeTruthy();
  });

  it('should get auto district for en lang', () => {
    const convertedAddress = locations.getDistrictAuto(placeDetailsEn, Language.EN);
    expect(convertedAddress).toBe('Name of district');
    expect(convertedAddress).toContain('district');
  });

  it('should call convFirstLetterToCapital on getDistrictAuto', () => {
    const spy = spyOn(locations, 'convFirstLetterToCapital');
    locations.getDistrictAuto(placeDetailsEn, Language.EN);
    expect(spy).toHaveBeenCalledWith('Name of District');
  });

  it('should get auto district for ua lang', () => {
    const placeDetails = {
      address_components: [{ long_name: 'Київський район' }]
    };
    const convertedAddress = locations.getDistrictAuto(placeDetails, Language.UA);
    expect(convertedAddress).toBe('Київський район');
    expect(convertedAddress).toContain('район');
  });

  it('should get auto district undefined if getDistrict is null', () => {
    const placeDetails = {
      address_components: [{ long_name: 'Назва' }]
    };
    const convertedAddress = locations.getDistrictAuto(placeDetails, Language.UA);
    expect(convertedAddress).toBeUndefined();
  });

  it('should convert value that only first letter will be capital letter', () => {
    const convertedAddress = locations.convFirstLetterToCapital('Name of District');
    expect(convertedAddress).toBe('Name of district');
  });

  it('should call getRequest on getFullAddressList', () => {
    const spy = spyOn(locations, 'getRequest');
    locations.getFullAddressList(ADDRESSESMOCK.SEARCHADDRESS, mockAutocompleteService, Language.EN);
    expect(spy).toHaveBeenCalled();
  });

  it('should return place prediction list on getFullAddressList', () => {
    locations.getFullAddressList(ADDRESSESMOCK.SEARCHADDRESS, mockAutocompleteService, Language.EN).subscribe((predictions) => {
      const result = predictions;
      expect(result[0].description).toBe('street , 2, Kyiv, Ukraine');
      expect(result[0].description).toContain(ADDRESSESMOCK.SEARCHADDRESS.street);
      expect(result[0].description).toContain(ADDRESSESMOCK.SEARCHADDRESS.city);
      expect(result[0].structured_formatting.main_text).toBe('2');
    });
  });

  it('should return search address format value on getSearchAddress', () => {
    const convertedAddress = locations.getSearchAddress('Kyiv', 'street', '2');
    expect(convertedAddress).toEqual(ADDRESSESMOCK.SEARCHADDRESS);
  });

  it('should return city request value on getRequest', () => {
    const cityRequest = locations.getRequest('вулиця Київська, 2 Київ, Україна', Language.UA, '(cities)');
    expect(cityRequest).toEqual(ADDRESSESMOCK.GOOGLEREQUEST);
  });

  it('should set correct district values', () => {
    languageServiceMock.getLangValue.and.returnValue('Holosiivskyi');
    locations.setDistrictValues(districtUa, districtEn, ADDRESSESMOCK.DISTRICTSKYIVMOCK);

    expect(districtUa.value).toEqual('Голосіївський');
    expect(districtEn.value).toEqual('Holosiivskyi');
    expect(districtUa.dirty).toEqual(true);
    expect(districtEn.dirty).toEqual(true);
  });

  it('should append district label for multiple districts', () => {
    const districtsWithLabel = locations.appendDistrictLabel(ADDRESSESMOCK.DISTRICTSKYIVMOCK);

    expect(districtsWithLabel).toEqual([
      { nameUa: 'Голосіївський район', nameEn: 'Holosiivskyi district' },
      { nameUa: 'Дарницький район', nameEn: 'Darnytskyi district' },
      { nameUa: 'Деснянський район', nameEn: 'Desnyan district' }
    ]);
  });

  it('should append district label for empty districts', () => {
    const districtsWithLabel = locations.appendDistrictLabel([]);

    expect(districtsWithLabel).toEqual([]);
  });

  it('should throw an error when geometry or viewport are not defined', () => {
    const undefinedViewportPlaceDetails = { geometry: {} };
    const noGeometryPlaceDetails = {};

    expect(() => locations.getPlaceBounds(undefinedViewportPlaceDetails)).toThrow();
    expect(() => locations.getPlaceBounds(noGeometryPlaceDetails)).toThrow();
  });

  it('should correctly convert the first letter of a string to a capital letter', () => {
    expect(locations.convFirstLetterToCapital('test')).toEqual('Test');
  });

  it('should correctly form a search address', () => {
    const searchAddress = locations.getSearchAddress('Kyiv', 'Street', '1');
    expect(searchAddress).toEqual({
      input: 'Street, 1, Kyiv',
      street: 'Street, 1',
      city: 'Kyiv,'
    });
  });

  it('should correctly form a request', () => {
    const request = locations.getRequest('Test Street, 1, Kyiv', Language.EN, 'address');
    expect(request).toEqual({
      input: 'Test Street, 1, Kyiv',
      language: Language.EN,
      types: ['address'],
      componentRestrictions: { country: 'ua' }
    });
  });

  it('should correctly append district label', () => {
    const districtsWithLabel = locations.appendDistrictLabel(ADDRESSESMOCK.DISTRICTSKYIVMOCK);
    expect(districtsWithLabel[0].nameUa).toEqual('Голосіївський район');
    expect(districtsWithLabel[0].nameEn).toEqual('Holosiivskyi district');
  });
});
