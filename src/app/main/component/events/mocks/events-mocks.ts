import { EventForm, EventResponse } from '../models/events.interface';

export const EVENT_MOCK: EventResponse = {
  description: 'tralalalal',
  additionalImages: [],
  creationDate: '2022-05-31',
  tags: [
    { id: 1, nameUa: 'Соціальний', nameEn: 'Social' },
    { id: 13, nameUa: 'Екологічний', nameEn: 'Environmental' },
    { id: 14, nameUa: 'Економічний', nameEn: 'Economic' }
  ],
  dates: [
    {
      coordinates: {
        latitude: 0,
        longitude: 0,
        cityEn: 'Lviv',
        cityUa: 'Львів',
        countryEn: 'Ukraine',
        countryUa: 'Україна',
        houseNumber: '55',
        regionEn: 'Lvivska oblast',
        regionUa: 'Львівська область',
        streetEn: 'Svobody Ave',
        streetUa: 'Свободи',
        formattedAddressEn: 'Свободи, 55, Львів, Львівська область, Україна',
        formattedAddressUa: 'Svobody Ave, 55, Lviv, Lvivska oblast, Ukraine'
      },
      id: null,
      event: null,
      startDate: '2022-05-31T00:00:00+03:00',
      finishDate: '2022-05-31T23:59:00+03:00',
      onlineLink: null
    }
  ],
  id: 307,
  organizer: { organizerRating: 0, id: 5, name: 'Mykola Kovalushun' },
  title: 'dddddddd',
  titleImage: 'https://-fc27f19b10e0apl',
  isSubscribed: true,
  isFavorite: false,
  isRelevant: true,
  open: true,
  likes: 5,
  countComments: 7,
  isOrganizedByFriend: false,
  eventRate: 0
};

export const EVENT_FORM_MOCK: EventForm = {
  eventInformation: {
    title: 'Sample Event Title',
    duration: 120,
    description: 'This is a sample event description.',
    open: true,
    tags: ['Technology', 'Education'],
    editorText: 'Detailed editor text for the event.',
    images: []
  },
  dateInformation: [
    {
      day: {
        date: new Date('2024-11-30'),
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        allDay: false
      },
      placeOnline: {
        coordinates: {
          lat: 40.712776,
          lng: -74.005974
        },
        onlineLink: 'https://example.com/event',
        place: 'Sample Place',
        appliedLinkForAll: true,
        appliedPlaceForAll: false
      },
      pastDate: false
    }
  ]
};
