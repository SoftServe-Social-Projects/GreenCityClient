import { FormControl } from '@angular/forms';
import { Moment } from 'moment';

type FormControllers<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

export interface FormEmitter<T> {
  key: any;
  form: T | undefined;
  valid: boolean;
  sharedKey: number;
  formKey: string;
}

export type FormCollectionEmitter<T> = Omit<FormEmitter<T>, 'sharedKey' | 'formKey'>;

export interface DateTime {
  date: Date;
  startTime: string;
  endTime: string;
  allDay: boolean;
}

export interface DateTimeForm {
  date: Moment;
  startTime: string;
  endTime: string;
  allDay: boolean;
}
export type DateTimeGroup = FormControllers<DateTime>;

export interface PlaceOnline {
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  onlineLink: string;
  place: string;
  appliedLinkForAll: boolean;
  appliedPlaceForAll: boolean;
}

export type PlaceOnlineGroup = FormControllers<PlaceOnline>;
export type DateInformation = { day: DateTime; placeOnline: PlaceOnline; pastDate?: boolean };

export interface ImagesContainer {
  file: File;
  url: string;
  main: boolean;
}

export interface EventInformation {
  title: string;
  duration: number;
  description: string;
  open: boolean;
  tags: string[];
  editorText: string;
  images: ImagesContainer[];
}

export interface EventAttender {
  name: string;
  imagePath: string;
}

export type EventInformationGroup = FormControllers<EventInformation>;

export type EventForm = { dateInformation: DateInformation[]; eventInformation: EventInformation };

export interface EventDTO {
  title: string;
  description: string;
  open: boolean;
  datesLocations: Array<Dates>;
  tags: Array<string>;
  imagesToDelete?: Array<string>;
  additionalImages?: Array<string>;
  id?: number;
  organizer?: {
    id: number;
    name: string;
  };
  titleImage?: string;
}

export interface Dates {
  startDate: string;
  finishDate: string;
  coordinates?: {
    cityUa?: 'cityUa';
    cityEn?: 'cityEn';
    addressEn?: string;
    addressUa?: string;
    latitude: number;
    longitude: number;
  } | null;
  onlineLink?: string;
  id?: number;
}

export interface Coords {
  coords: { lat: number; lng: number };
  placeId: number;
}

export interface MapMarker {
  location: {
    lat: number;
    lng: number;
  };
  animation: string;
}

export interface EventResponseDto {
  currentPage: number;
  first: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  last: boolean;
  number: number;
  page: Array<EventResponse>;
  totalElements: number;
  totalPages: number;
}

export interface OrganizerInfo {
  organizerRating: number;
  id: number;
  name: string;
}

export interface LocationResponse {
  countryEn: string;
  countryUa: string;
  latitude: number;
  longitude: number;
  regionEn: string;
  regionUa: string;
  houseNumber: string | null;
  streetEn: string | null;
  streetUa: string | null;
  formattedAddressEn: string;
  formattedAddressUa: string;
  cityEn: string;
  cityUa: string;
}

export interface EventDatesResponse {
  onlineLink: null | string;
  coordinates: LocationResponse | null;
  startDate: string;
  finishDate: string;
  id: null;
  event: null;
}

export interface EventResponse {
  id: number;
  title: string;
  organizer: OrganizerInfo;
  creationDate: string;
  description: string;
  dates: EventDatesResponse[];
  tags: { nameUa: string; id: number; nameEn: string }[];
  titleImage: string;
  additionalImages: string[];
  isRelevant: boolean;
  likes: number;
  countComments: number;
  eventRate: number;
  open: boolean;
  isSubscribed: boolean;
  isFavorite: boolean;
  isOrganizedByFriend: boolean;
}

export type EventListResponse = Omit<EventResponse, 'additionalImages' | 'description'>;

export interface TagDto {
  id: number;
  nameUa: string;
  nameEn: string;
}

export interface TagObj {
  nameUa: string;
  nameEn: string;
  isActive: boolean;
}

export interface PagePreviewDTO {
  title: string;
  description: string;
  eventDuration: number;
  open: boolean;
  isRelevant?: boolean;
  id?: number;
  likes?: number;
  editorText: string;
  organizer?: OrganizerInfo;
  dates: Dates[];
  tags: any;
  imgArray: any[];
  imgArrayToPreview: any[];
  location: string;
}

export interface EventFilterCriteriaInterface {
  eventTime: Array<string>;
  cities: Array<string>;
  statuses: Array<string>;
  tags: Array<string>;
}

export interface Addresses {
  cityEn: string;
  cityUa: string;
  countryEn: string;
  countryUa: string;
  formattedAddressEn: string;
  formattedAddressUa: string;
  houseNumber: string;
  latitude: number;
  longitude: number;
  regionEn: string;
  regionUa: string;
  streetEn: string;
  streetUa: string;
}

export interface FilterItem {
  type: string;
  nameUa: string;
  nameEn: string;
}
