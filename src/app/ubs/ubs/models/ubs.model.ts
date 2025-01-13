import { CertificateStatus } from 'src/app/ubs/ubs/certificate-status.enum';
import { Address, AddressData, ICertificateResponse } from './ubs.interface';
import { Language } from 'src/app/main/i18n/Language';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { Subject } from 'rxjs';
import { Coordinates } from '@global-user/models/edit-profile.model';

export class CCertificate {
  get code(): string {
    return this._code;
  }

  get points(): number {
    return this.isValid() ? this._points : 0;
  }

  get dateOfUse(): string {
    return this.certificateDateTreat(this._dateOfUse) ?? '';
  }

  get expirationDate(): string {
    return this.certificateDateTreat(this._expirationDate) ?? '';
  }

  constructor(
    private _code: string,
    private _certificateStatus: CertificateStatus,
    private _points: number,
    private _dateOfUse?: string | null,
    private _expirationDate?: string
  ) {}

  public static ofResponse(response: ICertificateResponse) {
    return new CCertificate(
      response.code,
      response.certificateStatus as CertificateStatus,
      response.points,
      response.dateOfUse,
      response.expirationDate
    );
  }

  public static ofError(code: string) {
    return new CCertificate(code, CertificateStatus.FAILED, 0);
  }

  public isValid(): boolean {
    return this.checkStatus(CertificateStatus.ACTIVE, CertificateStatus.NEW);
  }

  public isNotValid(): boolean {
    return this.checkStatus(CertificateStatus.EXPIRED, CertificateStatus.USED, CertificateStatus.FAILED);
  }

  public isUsed(): boolean {
    return this.checkStatus(CertificateStatus.USED);
  }

  public isExpired(): boolean {
    return this.checkStatus(CertificateStatus.EXPIRED);
  }

  public isFailed(): boolean {
    return this.checkStatus(CertificateStatus.FAILED);
  }

  private checkStatus(...statuses: CertificateStatus[]): boolean {
    return statuses.includes(this._certificateStatus);
  }

  private certificateDateTreat(date: string): string {
    return date?.split('-').reverse().join('.');
  }
}

export class CAddressData {
  private regionEn: string;
  private region: string;
  private city: string;
  private cityEn: string;
  private street: string;
  private streetEn: string;
  private districtEn: string;
  private district: string;
  private houseNumber: string;
  private entranceNumber: string;
  private houseCorpus: string;
  private placeId: string;
  private addressComment = '';
  private coordinates: google.maps.LatLng | Coordinates;

  private readonly placeIdChange: Subject<string> = new Subject();
  private readonly addressChange: Subject<AddressData> = new Subject();

  constructor(private readonly languageService: LanguageService) {}

  initAddressData(address: Address): void {
    this.region = address.region;
    this.regionEn = address.regionEn;
    this.city = address.city;
    this.cityEn = address.cityEn;
    this.street = address.street;
    this.streetEn = address.streetEn;
    this.district = address.district;
    this.districtEn = address.districtEn;
    this.houseNumber = address.houseNumber;
    this.entranceNumber = address.entranceNumber;
    this.houseCorpus = address.houseCorpus;
    this.placeId = address.placeId;
    this.coordinates = address.coordinates;
    this.addressComment = address.addressComment;
  }

  setCoordinates(coordinates: google.maps.LatLng, opts?: { fetch: boolean }): void {
    this.coordinates = coordinates;
    if (!opts?.fetch) {
      return;
    }

    this.fetchAddress(coordinates);
  }

  getRegion(): string {
    return this.languageService.getCurrentLanguage() === Language.EN ? this.regionEn : this.region;
  }

  async setRegion(place_id: string): Promise<void> {
    try {
      await this.setProperties('region', place_id, 'administrative_area_level_1');
      this.resetPlaceId();
    } catch (error) {
      console.error('Error during setting region:', error);
    }
  }

  setRegionWithTranslation(region: string, regionEn: string): void {
    this.region = region;
    this.regionEn = regionEn;
    this.resetPlaceId();
  }

  resetRegion(): void {
    this.region = '';
    this.regionEn = '';
    this.resetPlaceId();
  }

  getCity(): string {
    return this.languageService.getCurrentLanguage() === Language.EN ? this.cityEn : this.city;
  }

  async setCity(place_id: string): Promise<void> {
    try {
      await this.setProperties('city', place_id, 'locality');
      this.setRegion(place_id);
      this.resetPlaceId();
    } catch (error) {
      console.error('Error during setting city:', error);
    }
  }

  resetCity(): void {
    this.city = '';
    this.cityEn = '';
    this.resetPlaceId();
  }

  getStreet(): string {
    return this.languageService.getCurrentLanguage() === Language.EN ? this.streetEn : this.street;
  }

  async setStreet(place_id: string): Promise<void> {
    try {
      this.placeId = place_id;
      await this.setProperties('street', place_id, 'route');
      await this.setDistrict(place_id);
    } catch (error) {
      console.error('Error during setting street:', error);
    }
  }

  resetStreet(): void {
    this.street = '';
    this.streetEn = '';
    this.resetPlaceId();
  }

  getDistrict(): string {
    return this.languageService.getLangValue(this.district, this.districtEn);
  }

  async setDistrict(place_id: string): Promise<void> {
    try {
      this.resetDistrict();
      await this.setProperties('district', place_id, 'sublocality', 'administrative_area_level_2');
    } catch (error) {
      console.error('Error during setting district:', error);
    }
  }

  setCustomDistrict(district: string, districtEn: string): void {
    this.district = district;
    this.districtEn = districtEn;
  }

  setDistrictFromCity() {
    this.district = this.city;
    this.districtEn = this.cityEn;
    this.addressChange.next(this.getValues());
  }

  resetDistrict(): void {
    this.district = '';
    this.districtEn = '';
  }

  setHouseNumber(value: any) {
    this.houseNumber = value;
    this.addressChange.next(this.getValues());
  }

  resetHouseInfo() {
    this.houseNumber = '';
    this.houseCorpus = '';
    this.entranceNumber = '';
  }

  setHouseCorpus(value: any) {
    this.houseCorpus = value;
  }

  setEntranceNumber(value: any) {
    this.entranceNumber = value;
  }

  setAddressComment(comment: string) {
    this.addressComment = comment;
  }

  getPlaceIdChange(): Subject<string> {
    return this.placeIdChange;
  }

  getAddressChange(): Subject<AddressData> {
    return this.addressChange;
  }

  getValues(): AddressData {
    return {
      regionEn: this.regionEn,
      region: this.region,
      city: this.city,
      cityEn: this.cityEn,
      street: this.street,
      streetEn: this.streetEn,
      districtEn: this.districtEn,
      district: this.district,
      houseNumber: this.houseNumber,
      entranceNumber: this.entranceNumber,
      houseCorpus: this.houseCorpus,
      addressComment: this.addressComment,
      placeId: this.placeId,
      /* eslint-disable indent */
      coordinates: this.coordinates
        ? {
            latitude: this.coordinates instanceof google.maps.LatLng ? this.coordinates.lat() : this.coordinates.latitude,
            longitude: this.coordinates instanceof google.maps.LatLng ? this.coordinates.lng() : this.coordinates.longitude
          }
        : { latitude: 0, longitude: 0 }
      /* eslint-enable indent */
    };
  }

  isValid(): boolean {
    const data = this.getValues();
    delete data.addressComment;
    delete data.houseCorpus;
    delete data.entranceNumber;
    delete data.placeId;

    const values = Object.values(data);
    return values.every((value) => value);
  }

  private resetPlaceId() {
    this.placeId = '';
    this.placeIdChange.next(this.placeId);
  }

  async getAddressPlaceId(coordinates: google.maps.LatLng): Promise<string> {
    return new google.maps.Geocoder()
      .geocode({ location: coordinates })
      .then((response) => {
        const place_id = response.results[0]?.place_id;
        return place_id || '';
      })
      .catch((error) => {
        console.error('Geocoding failed:', error);
        return '';
      });
  }

  //Tries to fetch address by selected coordinates
  private async fetchAddress(coordinates: google.maps.LatLng): Promise<void> {
    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ location: coordinates });

      const place_id = response.results[0]?.place_id;
      if (place_id) {
        await this.setCity(place_id);
        await this.setRegion(place_id);
        await this.setStreet(place_id);

        this.setHouseNumber(this.findValue(response.results[0], 'street_number')?.long_name ?? '');

        this.placeId = place_id;
        this.placeIdChange.next(this.placeId);
      }
    } catch (error) {
      console.error('Error during address fetching:', error);
    }
  }

  //Translates values to achieve consistent view of address in different languages
  private async setProperties(propertyName: string, place_id: string, ...googleLocalityType: string[]): Promise<void> {
    try {
      await this.translateProperty(propertyName, place_id, Language.UK, ...googleLocalityType);
      await this.translateProperty(propertyName + 'En', place_id, Language.EN, ...googleLocalityType);
      this.addressChange.next(this.getValues());
    } catch (error) {
      console.error('Error during setting properties:', error);
    }
  }

  //Translates address component by placeId to required language
  private async translateProperty(
    propertyName: string,
    placeId: string,
    language: Language,
    ...googleLocalityType: string[]
  ): Promise<void> {
    const response = await new google.maps.Geocoder().geocode({ placeId, language });
    this[propertyName] = this.findValue(response.results[0], ...googleLocalityType)?.long_name ?? '';
  }

  //Find required address component in google response by it's type
  //For example 'route' is a street name, 'street_number' is a house number
  private findValue(response: google.maps.GeocoderResult, ...types: string[]): google.maps.GeocoderAddressComponent {
    for (const type of types) {
      const value = response.address_components.find((component) => component.types.some((t) => type === t));

      if (value) {
        return value;
      }
    }

    return null;
  }
}
