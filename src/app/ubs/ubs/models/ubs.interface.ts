import { Coordinates } from '@global-user/models/edit-profile.model';

export interface Bag {
  id: number;
  name?: string;
  nameEng?: string;
  capacity?: number;
  price?: number;
  quantity?: number;
  code?: string;
  limitedIncluded?: boolean;
}

export enum PaymentSystem {
  MONOBANK = 'MONOBANK',
  WAY_FOR_PAY = 'WAY_FOR_PAY'
}

export interface Order {
  additionalOrders: Array<string>;
  addressId: number;
  bags: OrderBag[];
  certificates: Array<string>;
  locationId: number;
  orderComment: string;
  personalData: PersonalData;
  pointsToUse: number;
  shouldBePaid: boolean;
  paymentSystem: PaymentSystem;
}

export interface OrderBag {
  amount: number;
  id: number;
}

export interface OrderDetails {
  bags?: Bag[];
  points: number;
  pointsToUse?: number;
  certificates?: any;
  additionalOrders?: any;
  orderComment?: string;
  certificatesSum?: number;
  pointsSum?: number;
  total?: number;
  finalSum?: number;
  minAmountOfBigBags?: number;
}

export interface IProcessOrderResponse {
  orderId: number;
  link: string | null;
}

export interface ICertificateResponse {
  points: number;
  certificateStatus: string;
  creationDate?: string;
  dateOfUse?: string;
  expirationDate?: string;
  code?: string;
}

export interface PersonalData {
  id?: number;
  ubsUserId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addressComment: string;
  city: string;
  cityEn: string;
  district: string;
  districtEn: string;
  street?: string;
  streetEn?: string;
  region?: string;
  regionEn?: string;
  houseCorpus?: string;
  entranceNumber?: string;
  houseNumber?: string;
  longitude?: number;
  latitude?: number;
  isAnotherClient: boolean;
  senderEmail: string;
  senderFirstName: string;
  senderLastName: string;
  senderPhoneNumber: string;
}

export interface Address {
  id?: number;
  city: string;
  cityEn: string;
  district: string;
  districtEn: string;
  region: string;
  regionEn: string;
  entranceNumber: string;
  street: string;
  streetEn: string;
  houseCorpus: string;
  houseNumber: string;
  addressComment?: string;
  actual: boolean;
  addressRegionDistrictList?: DistrictsDtos[];
  searchAddress?: string;
  coordinates: {
    latitude?: number;
    longitude?: number;
  };
  display?: boolean;
  placeId?: string;
}

export interface AddressData {
  regionEn: string;
  region: string;
  city: string;
  cityEn: string;
  street: string;
  streetEn: string;
  districtEn: string;
  district: string;
  houseNumber: string;
  entranceNumber: string;
  houseCorpus: string;
  addressComment: string;
  placeId: string;
  coordinates: Coordinates;
}

export interface CourierTranslationDtos {
  languageCode: string;
  limitDescription: string;
  name: string;
}

export interface LocationTranslation {
  region: number;
  locationName: string;
  languageCode: string;
}

export interface LocationsName {
  locationId: number;
  locationName: string;
}

export interface LocationsDtosList {
  locationId: number;
  nameEn: string;
  nameUk: string;
}

export interface CourierTranslation {
  languageCode: string;
  name: string;
}
export interface CourierLocations {
  courierLimit: 'LIMIT_BY_AMOUNT_OF_BAG' | 'LIMIT_BY_SUM_OF_ORDER';
  courierStatus: string;
  tariffInfoId: number;
  locationsDtosList: LocationsDtosList[];
  courierTranslationDtos: CourierTranslation[];
  regionDto: {
    nameEn: string;
    nameUk: string;
    regionId: number;
  };
  min: number;
  max: number;
}

export interface DistrictsDtos {
  nameUa: string;
  nameEn: string;
}

export type CourierLimit = 'LIMIT_BY_AMOUNT_OF_BAG' | 'LIMIT_BY_SUM_OF_ORDER';

export interface CourierDto {
  courierId: number;
  courierStatus: string;
  nameEn: string;
  nameUk: string;
  createDate: string;
  createdBy: string;
}

export interface TariffInfoDto {
  tariffInfoId: number;
  min: number;
  max: number;
  courierLimit: CourierLimit;
  courierDto: CourierDto;
  limitDescription: string;
}

export interface LocationWithTariffInfoDto {
  locationId: number;
  nameEn: string;
  nameUk: string;
  tariffInfoDto: TariffInfoDto;
}

export interface ActiveRegionDto {
  locations: LocationWithTariffInfoDto[];
  nameEn: string;
  nameUk: string;
  regionId: number;
}

export interface AllActiveLocationsDtosResponse {
  allActiveLocationsDtos: ActiveRegionDto[] | null;
  orderIsPresent: boolean;
}

export interface ActiveLocations {
  locationId: number;
  nameEn: string;
  nameUk: string;
}

export interface ActiveLocationsDtos {
  locations: ActiveLocations[];
  nameEn: string;
  nameUk: string;
  regionId: number;
}

export interface AllLocationsDtos {
  allActiveLocationsDtos: ActiveLocationsDtos[] | null;
  tariffsForLocationDto: CourierLocations | null;
  orderIsPresent: boolean;
}

export interface SearchAddress {
  input: string;
  street: string;
  city: string;
}

export interface ActiveCourierDto {
  courierId: number;
  courierStatus: string;
  nameUk: string;
  nameEn: string;
  createDate: string;
  createdBy: string;
}

export enum KyivNamesEnum {
  KyivRegionUa = 'Київська область',
  KyivRegionEn = 'Kyiv oblast',
  KyivCityUa = 'місто Київ',
  KyivUa = 'Київ',
  KyivEn = 'Kyiv'
}

export enum DistrictEnum {
  UA = ' район',
  EN = ' district'
}
