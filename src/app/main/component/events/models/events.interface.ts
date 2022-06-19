export interface EventDTO {
  title: string;
  description: string;
  open: boolean;
  datesLocations: Array<Dates>;
  tags: Array<string>;
  imagesTodelete?: Array<string>;
}

export interface Dates {
  startDate: string;
  finishDate: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  onlineLink: string;
}

export interface DateEvent {
  date: Date;
  startDate: string;
  finishDate: string;
  coordinatesDto: {
    latitude: number;
    longitude: number;
  };
  onlineLink: string;
  valid: boolean;
  check: boolean;
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

export interface EventImage {
  src: string;
  label: string;
  isLabel: boolean;
}

export interface EventResponseDto {
  currentPage: number;
  first: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  last: boolean;
  number: number;
  page: Array<EventPageResponceDto>;
  totalElements: number;
  totalPages: number;
}

export interface EventPageResponceDto {
  additionalImages: Array<string>;
  dates: Array<DateEventResponceDto>;
  description: any;
  id: number;
  open: boolean;
  organizer: {
    id: number;
    name: string;
  };
  tags: Array<TagDto>;
  title: string;
  titleImage: string;
}

export interface TagDto {
  id: number;
  nameUa: string;
  nameEn: string;
}
export interface DateEventResponceDto {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  event: string;
  finishDate: string;
  id: number;
  onlineLink: string;
  startDate: string;
}

export interface OfflineDto {
  latitude: number;
  longitude: number;
}

export interface TagObj {
  nameUa: string;
  nameEn: string;
  isActive: boolean;
}

export interface DateFormObj {
  date: Date;
  endTime?: string;
  onlineLink?: string;
  place: string;
  startTime?: string;
}

export interface PaginationInterface {
  itemsPerPage: number;
  currentPage: number;
  totalItems: number;
}
