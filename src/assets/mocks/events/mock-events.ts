import {
  Addresses,
  EventAttender,
  EventForm,
  EventResponse,
  EventResponseDto
} from '../../../app/main/component/events/models/events.interface';
import { HttpParams } from '@angular/common/http';
import { HabitAssignInterface } from '@global-user/components/habit/models/interfaces/habit-assign.interface';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { HabitInterface } from '@global-user/components/habit/models/interfaces/habit.interface';
import { FormBuilder, FormControl } from '@angular/forms';

export const testCases = [
  {
    title: 'Event1',
    selectedLocationFiltersList: ['Online', 'City1'],
    selectedEventTimeStatusFiltersList: ['2024-08-22'],
    selectedStatusFiltersList: ['active'],
    selectedTypeFiltersList: ['tag1'],
    expectedParams: new HttpParams()
      .append('page', '0')
      .append('size', '10')
      .append('title', 'EVENT1')
      .append('type', 'ONLINE')
      .append('cities', 'CITY1')
      .append('time', '2024-08-22')
      .append('statuses', 'ACTIVE')
      .append('tags', 'TAG1')
  },
  {
    title: 'Event2',
    selectedLocationFiltersList: ['City2'],
    selectedEventTimeStatusFiltersList: [],
    selectedStatusFiltersList: [],
    selectedTypeFiltersList: ['tag2', 'tag3'],
    expectedParams: new HttpParams()
      .append('page', '0')
      .append('size', '10')
      .append('title', 'EVENT2')
      .append('cities', 'CITY2')
      .append('tags', 'TAG2,TAG3')
  },
  {
    title: '',
    selectedLocationFiltersList: ['Online'],
    selectedEventTimeStatusFiltersList: [],
    selectedStatusFiltersList: ['inactive'],
    selectedTypeFiltersList: [],
    expectedParams: new HttpParams().append('page', '0').append('size', '10').append('type', 'ONLINE').append('statuses', 'INACTIVE')
  },
  {
    title: '',
    selectedLocationFiltersList: [],
    selectedEventTimeStatusFiltersList: ['2024-08-22'],
    selectedStatusFiltersList: [],
    selectedTypeFiltersList: [],
    expectedParams: new HttpParams().append('page', '0').append('size', '10').append('time', '2024-08-22')
  },
  {
    title: 'Event5',
    selectedLocationFiltersList: ['Online', 'City3'],
    selectedEventTimeStatusFiltersList: [],
    selectedStatusFiltersList: ['active'],
    selectedTypeFiltersList: [],
    expectedParams: new HttpParams()
      .append('page', '0')
      .append('size', '10')
      .append('title', 'EVENT5')
      .append('type', 'ONLINE')
      .append('cities', 'CITY3')
      .append('statuses', 'ACTIVE')
  },
  {
    title: '',
    selectedLocationFiltersList: [],
    selectedEventTimeStatusFiltersList: [],
    selectedStatusFiltersList: [],
    selectedTypeFiltersList: [],
    expectedParams: new HttpParams().append('page', '0').append('size', '10')
  }
];

export const mockParams = new HttpParams().append('page', '0').append('size', '1').append('type', 'ONLINE');

export const mockHttpParams = new HttpParams()
  .append('page', '0')
  .append('size', '10')
  .append('cities', 'City')
  .append('tags', 'Tag')
  .append('time', '2024-08-22')
  .append('statuses', 'CREATED')
  .append('userId', '1')
  .append('type', 'ONLINE');

export const mockHabitAssign: HabitAssignInterface[] = [
  {
    id: 1,
    status: 'CREATED' as HabitStatus,
    createDateTime: new Date('2023-03-20T04:00:00Z'),
    habit: { id: 2 } as HabitInterface,
    complexity: 1,
    enrolled: true,
    userId: 123,
    duration: 30,
    workingDays: 5,
    habitStreak: 10,
    lastEnrollmentDate: new Date(),
    habitStatusCalendarDtoList: [],
    toDoListItems: []
  },
  {
    id: 2,
    status: 'CREATED' as HabitStatus,
    createDateTime: new Date('2023-03-22T04:00:00Z'),
    habit: { id: 4 } as HabitInterface,
    complexity: 1,
    enrolled: true,
    userId: 123,
    duration: 30,
    workingDays: 5,
    habitStreak: 10,
    lastEnrollmentDate: new Date(),
    habitStatusCalendarDtoList: [],
    toDoListItems: []
  }
];

export const mockEvent: EventResponseDto = {
  currentPage: 0,
  first: true,
  hasNext: true,
  hasPrevious: false,
  last: false,
  number: 0,
  page: [
    {
      additionalImages: [],
      creationDate: '2022-05-31',
      dates: [
        {
          coordinates: {
            latitude: 1,
            longitude: 1,
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
          event: null,
          finishDate: '2022-06-29T04:00:00Z',
          id: null,
          onlineLink: 'http',
          startDate: '2022-06-29T04:00:00Z'
        }
      ],
      description: 'description',
      id: 95,
      open: true,
      organizer: {
        id: 12,
        name: 'username',
        organizerRating: 4
      },
      tags: [
        {
          id: 1,
          nameUa: 'Укр тег',
          nameEn: 'Eng Tag'
        }
      ],
      title: 'title',
      titleImage: 'image title',
      isSubscribed: true,
      isFavorite: false,
      likes: 8,
      countComments: 9,
      isRelevant: true,
      isOrganizedByFriend: false,
      eventRate: 0
    }
  ],
  totalElements: 12,
  totalPages: 1
};

export const mockFavouriteEvents: EventResponse[] = [
  {
    additionalImages: [],
    creationDate: '2022-05-31',
    dates: [
      {
        coordinates: {
          latitude: 1,
          longitude: 1,
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
        event: null,
        finishDate: '2022-06-29T04:00:00Z',
        id: null,
        onlineLink: 'http',
        startDate: '2022-06-29T04:00:00Z'
      }
    ],
    description: 'description',
    id: 96,
    open: true,
    organizer: {
      id: 12,
      name: 'username',
      organizerRating: 3
    },
    tags: [
      {
        id: 1,
        nameUa: 'Укр тег',
        nameEn: 'Eng Tag'
      }
    ],
    title: 'title',
    titleImage: 'image title',
    isSubscribed: true,
    isFavorite: true,
    likes: 8,
    countComments: 9,
    isRelevant: true,
    isOrganizedByFriend: false,
    eventRate: 0
  },
  {
    additionalImages: [],
    creationDate: '2022-05-31',
    dates: [
      {
        coordinates: {
          latitude: 1,
          longitude: 1,
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
        event: null,
        finishDate: '2022-06-29T04:00:00Z',
        id: null,
        onlineLink: 'http',
        startDate: '2022-06-29T04:00:00Z'
      }
    ],
    description: 'description',
    id: 14,
    open: true,
    organizer: {
      id: 12,
      name: 'username',
      organizerRating: 3
    },
    tags: [
      {
        id: 1,
        nameUa: 'Укр тег',
        nameEn: 'Eng Tag'
      }
    ],
    title: 'title',
    titleImage: 'image title',
    isSubscribed: true,
    isFavorite: true,
    likes: 8,
    countComments: 9,
    isRelevant: true,
    isOrganizedByFriend: false,
    eventRate: 0
  }
];

export const mockEventResponse: EventResponseDto = {
  currentPage: 0,
  first: true,
  hasNext: true,
  hasPrevious: false,
  last: false,
  number: 0,
  page: [
    {
      id: 1,
      title: 'Sample Event',
      organizer: {
        organizerRating: 4,
        id: 12,
        name: 'Event Organizer'
      },
      creationDate: '2024-08-22T00:00:00Z',
      description: 'A detailed description of the event.',
      dates: [
        {
          onlineLink: 'http://example.com',
          coordinates: {
            countryEn: 'CountryName',
            countryUa: 'НазваКраїни',
            latitude: 50.0,
            longitude: 10.0,
            regionEn: 'RegionName',
            regionUa: 'НазваРегіону',
            houseNumber: '123',
            streetEn: 'Street Name',
            streetUa: 'НазваВулиці',
            formattedAddressEn: 'Street Name, 123, CityName, RegionName, CountryName',
            formattedAddressUa: 'НазваВулиці, 123, Місто, НазваРегіону, НазваКраїни',
            cityEn: 'CityName',
            cityUa: 'Місто'
          },
          startDate: '2024-08-23T10:00:00Z',
          finishDate: '2024-08-23T18:00:00Z',
          id: null,
          event: null
        }
      ],
      tags: [
        {
          id: 1,
          nameUa: 'Тег',
          nameEn: 'Tag'
        }
      ],
      titleImage: 'http://example.com/image.jpg',
      additionalImages: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
      isRelevant: true,
      likes: 123,
      countComments: 45,
      eventRate: 4.5,
      open: true,
      isSubscribed: false,
      isFavorite: true,
      isOrganizedByFriend: false
    }
  ],
  totalElements: 1,
  totalPages: 1
};

export const addressesMock: Array<Addresses> = [
  {
    latitude: 50.4911190426373,
    longitude: 30.38957457031249,
    streetEn: 'Stetsenka Street',
    streetUa: 'вулиця Стеценка',
    houseNumber: '20',
    cityEn: 'Kyiv',
    cityUa: 'Київ',
    regionEn: 'Kyiv',
    regionUa: 'місто Київ',
    countryEn: 'Ukraine',
    countryUa: 'Україна',
    formattedAddressEn: 'Stetsenka St, 20, Kyiv, Ukraine, 02000',
    formattedAddressUa: 'вулиця Стеценка, 20, Київ, Україна, 02000'
  },
  {
    latitude: 49.8555208,
    longitude: 24.0340401,
    streetEn: 'Zavodska Street',
    streetUa: 'вулиця Заводська',
    houseNumber: '31',
    cityEn: 'Lviv',
    cityUa: 'Львів',
    regionEn: 'Lvivska oblast',
    regionUa: 'Львівська область',
    countryEn: 'Ukraine',
    countryUa: 'Україна',
    formattedAddressEn: 'Zavodska St, 31, Lviv, Lvivska oblast, Ukraine, 79000',
    formattedAddressUa: 'вулиця Заводська, 31, Львів, Львівська область, Україна, 79000'
  },
  {
    latitude: 49.7998806,
    longitude: 23.9901827,
    streetEn: 'Ivana Puliuia Street',
    streetUa: 'вулиця Івана Пулюя',
    houseNumber: '31',
    cityEn: 'Lviv',
    cityUa: 'Львів',
    regionEn: 'Lvivska oblast',
    regionUa: 'Львівська область',
    countryEn: 'Ukraine',
    countryUa: 'Україна',
    formattedAddressEn: `Ivana Puliuia St, 38, L'viv, L'vivs'ka oblast, Ukraine, 79000`,
    formattedAddressUa: 'вулиця Івана Пулюя, 38, Львів, Львівська область, Україна, 79000'
  },
  {
    latitude: 49.550731,
    longitude: 25.61935,
    streetEn: 'Stepana Bandery Avenue',
    streetUa: 'проспект Степана Бандери',
    houseNumber: '58',
    cityEn: 'Ternopil',
    cityUa: 'Тернопіль',
    regionEn: `Ternopil's'ka oblas`,
    regionUa: 'Тернопільська область',
    countryEn: 'Ukraine',
    countryUa: 'Україна',
    formattedAddressEn: `Stepana Bandery Ave, 58, Ternopil, Ternopil's'ka oblast, Ukraine, 46000`,
    formattedAddressUa: 'проспект Степана Бандери, 58, Тернопіль, Тернопільська область, Україна, 46000'
  }
];

export const eventMock = {
  additionalImages: [],
  dates: [
    {
      coordinates: {
        addressEn: 'Address',
        addressUa: 'Адрес',
        latitude: 3,
        longitude: 4
      },
      event: 'test',
      finishDate: '2023-02-14',
      id: 1,
      onlineLink: 'https://test',
      startDate: '2023-04-12'
    }
  ],
  description: 'description',
  id: 1,
  open: true,
  organizer: {
    id: 1111,
    name: 'John'
  },
  tags: [{ nameEn: 'Environmental', nameUa: 'Екологічний', id: 1 }],
  title: 'title',
  titleImage: '',
  isSubscribed: true
};

export const eventStateMock = {
  eventState: {},
  eventsList: [],
  visitedPages: [],
  totalPages: 0,
  pageNumber: 0,
  error: null
};

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

const formBuilder = new FormBuilder();

export const MOCK_EVENT_FORM_GROUP = formBuilder.group({
  eventInformation: formBuilder.group({
    title: ['Mock Title', []],
    description: ['Mock description', []],
    open: [true],
    images: [[]],
    duration: [1],
    tags: [['Mock Tag 1', 'Mock Tag 2'], []]
  }),
  dateInformation: formBuilder.array([
    formBuilder.group({
      day: formBuilder.group({
        date: [new Date(), []],
        startTime: ['09:00 AM', []],
        endTime: ['05:00 PM', []],
        allDay: [false],
        minDate: [new Date(), []],
        maxDate: [null, []]
      }),
      placeOnline: formBuilder.group({
        coordinates: new FormControl({ lat: 50.4501, lng: 30.5234 }),
        onlineLink: new FormControl('https://example.com'),
        place: new FormControl('Mock Place Name'),
        appliedLinkForAll: [false],
        appliedPlaceForAll: [true]
      })
    })
  ])
});

export const mockAttendees: EventAttender[] = [{ name: 'Stetsenka Street', imagePath: 'http://example.com/image.jpg' }];
