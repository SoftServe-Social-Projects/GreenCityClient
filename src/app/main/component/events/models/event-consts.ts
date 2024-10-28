import { FilterItem } from './events.interface';

export const ICONS = {
  socials: {
    plus: 'assets/img/events/plus.svg',
    twitter: 'assets/img/events/twitter.svg',
    linkedin: 'assets/img/events/linkedin.svg',
    facebook: 'assets/img/events/facebook.svg'
  },
  clock: 'assets/img/events/clock.svg',
  location: 'assets/img/events/location.svg',
  link: 'assets/img/events/link.svg',
  lock: {
    open: 'assets/img/events/lock.svg',
    closed: 'assets/img/events/lock-closed.svg'
  },
  user: 'assets/img/events/user.svg',
  ellipsis: 'assets/img/events/ellipsis.svg',
  arrowLeft: 'assets/img/icon/econews/arrow_left.svg'
};

export const ROLES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  USER: 'USER',
  ORGANIZER: 'ORGANIZER',
  ADMIN: 'ADMIN'
};

export const timeStatusFiltersData: FilterItem[] = [
  { type: 'eventTimeStatus', nameEn: 'Upcoming', nameUa: 'Майбутні' },
  { type: 'eventTimeStatus', nameEn: 'Past', nameUa: 'Завершені' }
];

export enum DefaultCoordinates {
  LATITUDE = 50.4501,
  LONGITUDE = 30.5234
}

export const statusFiltersData: FilterItem[] = [
  { type: 'status', nameEn: 'Open', nameUa: 'Відкритa' },
  { type: 'status', nameEn: 'Closed', nameUa: 'Закритa' },
  { type: 'status', nameEn: 'Joined', nameUa: 'Вже доєднані' },
  { type: 'status', nameEn: 'Created', nameUa: 'Створенa' },
  { type: 'status', nameEn: 'Saved', nameUa: 'Збережена' }
];

export const typeFiltersData: FilterItem[] = [
  { type: 'type', nameEn: 'Economic', nameUa: 'Економічний' },
  { type: 'type', nameEn: 'Social', nameUa: 'Соціальний' },
  { type: 'type', nameEn: 'Environmental', nameUa: 'Екологічний' }
];

export const DateObj = {
  date: null,
  startDate: '',
  finishDate: '',
  coordinates: {
    latitude: null,
    longitude: null
  },
  onlineLink: '',
  valid: false,
  check: false
};

export const WeekArray = [
  { nameEn: '1 day', nameUa: '1 день' },
  { nameEn: '2 days', nameUa: '2 дні' },
  { nameEn: '3 days', nameUa: '3 дні' },
  { nameEn: '4 days', nameUa: '4 дні' },
  { nameEn: '5 days', nameUa: '5 днів' },
  { nameEn: '6 days', nameUa: '6 днів' },
  { nameEn: '7 days', nameUa: '7 днів' }
];

export const EventFilterCriteria = {
  eventTime: [],
  cities: [],
  statuses: [],
  tags: []
};

export const EVENT_LOCALE = {
  durationDays: [
    { en: '1 day', ua: '1 день' },
    { en: '2 days', ua: '2 дні' },
    { en: '3 days', ua: '3 дні' },
    { en: '4 days', ua: '4 дні' },
    { en: '5 days', ua: '5 днів' },
    { en: '6 days', ua: '6 днів' },
    { en: '7 days', ua: '7 днів' }
  ],
  titleError: {
    ua: 'Введіть заголовок до 70 символів включно',
    en: 'Enter a title up to and including 70 characters'
  },
  quillError: {
    ua: 'Недостатньо символів. Залишилось:',
    en: 'Not enough characters. Left:'
  },
  quillMaxExceeded: {
    ua: 'Максимальна довжина символів більше ніж',
    en: 'The maximum character length is greater than'
  },
  quillValid: {
    ua: 'Кількість символів:',
    en: 'Number of characters:'
  },
  quillDefault: {
    ua: '',
    en: ''
  },
  eventTypeOptions: [
    { en: 'Closed', ua: 'Закрита' },
    { en: 'Open', ua: 'Відкрита' }
  ],
  initiativeTags: [
    { en: 'Economic', ua: 'Економічний' },
    { en: 'Social', ua: 'Соціальний' },
    { en: 'Environmental', ua: 'Екологічний' }
  ],
  dateError: {
    en: 'Past date',
    ua: 'Минула дата'
  }
};

export type EventLocaleKeys = keyof typeof EVENT_LOCALE;
