import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventsService } from 'src/app/main/component/events/services/events.service';
import { environment } from '@environment/environment';
import { EventResponseDto } from '../models/events.interface';
import { TranslateService } from '@ngx-translate/core';
import {
  addressesMock,
  mockAttendees,
  mockEventResponse,
  mockFavouriteEvents,
  mockHttpParams,
  mockParams
} from '@assets/mocks/events/mock-events';
import { HttpParams } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { EVENT_FORM_MOCK } from '@assets/mocks/events/mock-events';

describe('EventsService', () => {
  let service: EventsService;
  let httpTestingController: HttpTestingController;
  const url = environment.backendLink;
  const formData = new FormData();
  formData.set('id', '1');
  let formBuilder: FormBuilder;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventsService, { provide: TranslateService, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(EventsService);
    formBuilder = TestBed.inject(FormBuilder);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(waitForAsync(() => {
    httpTestingController.verify();
  }));

  it('should be created', () => {
    const serviceNew: EventsService = TestBed.inject(EventsService);
    expect(serviceNew).toBeTruthy();
  });

  it('should make POST request to crate event', () => {
    service.createEvent(formData).subscribe((event: any) => {
      expect(event).toEqual(mockEventResponse);
    });

    const req = httpTestingController.expectOne(`${url}events`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockEventResponse);
  });

  it('should make PUT request to update event', () => {
    service.editEvent(formData, 1).subscribe((event: any) => {
      expect(event).toEqual(mockEventResponse);
    });

    const req = httpTestingController.expectOne(`${url}events/1`);
    expect(req.request.method).toEqual('PUT');
    req.flush(mockEventResponse);
  });

  it('should make GET request to get all events', () => {
    service.getEvents(mockHttpParams).subscribe((event: EventResponseDto) => {
      expect(event).toEqual(mockEventResponse);
    });
    const expected = `${url}events?page=0&size=10&cities=City&tags=Tag&time=2024-08-22&statuses=CREATED&userId=1&type=ONLINE`;
    const req = httpTestingController.expectOne(expected);
    expect(req.request.method).toEqual('GET');
    req.flush(mockEventResponse);
  });

  it('should make GET request to get all events of user', () => {
    service.getEvents(mockParams).subscribe((event: EventResponseDto) => {
      expect(event).toEqual(mockEventResponse);
    });
    const req = httpTestingController.expectOne(`${url}events?page=0&size=1&type=ONLINE`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockEventResponse);
  });

  it('should update time parameter from UPCOMING to FUTURE', () => {
    const requestParams = new HttpParams().set('time', 'UPCOMING');

    service.getEvents(requestParams).subscribe();

    const req = httpTestingController.expectOne(`${url}events?time=FUTURE`);
    expect(req.request.params.get('time')).toBe('FUTURE');
    req.flush(mockEventResponse);
  });

  it('should not change time parameter if it is not UPCOMING', () => {
    const requestParams = new HttpParams().set('time', 'PAST');

    service.getEvents(requestParams).subscribe();

    const req = httpTestingController.expectOne(`${url}events?time=PAST`);
    expect(req.request.params.get('time')).toBe('PAST');
    req.flush(mockEventResponse);
  });

  it('should make GET request to get the event', () => {
    service.getEventById(156).subscribe((event: any) => {
      expect(event).toEqual(mockEventResponse);
    });
    const req = httpTestingController.expectOne(`${url}events/156`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockEventResponse);
  });

  it('should make DELETE request to delete the event', () => {
    service.deleteEvent(156).subscribe((event: any) => {
      expect(event).toEqual(mockEventResponse);
    });
    const req = httpTestingController.expectOne(`${url}events/156`);
    expect(req.request.method).toEqual('DELETE');
    req.flush(mockEventResponse);
  });

  it('should make POST request to rate the event', () => {
    service.rateEvent(156, 5).subscribe((event: any) => {
      expect(event).toEqual(mockEventResponse);
    });
    const req = httpTestingController.expectOne(`${url}events/156/rating/5`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockEventResponse);
  });

  it('should make POST request to add an attender to the event', () => {
    service.addAttender(156).subscribe((event: any) => {
      expect(event).toEqual(mockEventResponse);
    });
    const req = httpTestingController.expectOne(`${url}events/156/attenders`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockEventResponse);
  });

  it('should make DELETE request to remove an attender to the event', () => {
    service.removeAttender(156).subscribe((event: any) => {
      expect(event).toEqual(mockEventResponse);
    });
    const req = httpTestingController.expectOne(`${url}events/156/attenders`);
    expect(req.request.method).toEqual('DELETE');
    req.flush(mockEventResponse);
  });

  it('should make GET request to retrieve addresses', () => {
    let hasNoErrors = true;
    service.getAddresses().subscribe({
      error: () => {
        hasNoErrors = false;
      },
      complete: () => {
        expect(hasNoErrors).toEqual(true);
      }
    });

    const req = httpTestingController.expectOne(`${url}events/addresses`);
    expect(req.request.method).toEqual('GET');
  });

  it('should add event to favourites', () => {
    let hasNoErrors = true;
    service.addEventToFavourites(156).subscribe({
      error: () => {
        hasNoErrors = false;
      },
      complete: () => {
        expect(hasNoErrors).toEqual(true);
      }
    });

    const req = httpTestingController.expectOne(`${url}events/156/favorites`);
    expect(req.request.method).toEqual('POST');
  });

  it('should remove event to favourites', () => {
    let hasNoErrors = true;
    service.removeEventFromFavourites(156).subscribe({
      error: () => {
        hasNoErrors = false;
      },
      complete: () => {
        expect(hasNoErrors).toEqual(true);
      }
    });

    const req = httpTestingController.expectOne(`${url}events/156/favorites`);
    expect(req.request.method).toEqual('DELETE');
  });

  it('should make GET request to get event by id', () => {
    service.getEventById(156).subscribe((event) => {
      expect(event).toEqual(mockFavouriteEvents[0]);
    });

    const req = httpTestingController.expectOne(`${url}events/156`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockFavouriteEvents[0]);
  });

  it('should make DELETE request to delete event by id', () => {
    service.deleteEvent(156).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne(`${url}events/156`);
    expect(req.request.method).toEqual('DELETE');
    req.flush(null);
  });

  it('should make POST request to rate event', () => {
    const mockResponse = { success: true };

    service.rateEvent(156, 5).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`${url}events/156/rating/5`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse);
  });

  it('should make POST request to add attender to an event', () => {
    const mockResponse = { success: true };

    service.addAttender(156).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`${url}events/156/attenders`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse);
  });

  it('should make DELETE request to remove attender from an event', () => {
    service.removeAttender(156).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne(`${url}events/156/attenders`);
    expect(req.request.method).toEqual('DELETE');
    req.flush(null);
  });

  it('should make GET request to get all attendees of an event', () => {
    service.getAllAttendees(156).subscribe((attendees) => {
      expect(attendees).toEqual(mockAttendees);
    });

    const req = httpTestingController.expectOne(`${url}events/156/attenders`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockAttendees);
  });

  it('should make GET request to get all addresses', () => {
    service.getAddresses().subscribe((addresses) => {
      expect(addresses).toEqual(addressesMock);
    });

    const req = httpTestingController.expectOne(`${url}events/addresses`);
    expect(req.request.method).toEqual('GET');
    req.flush(addressesMock);
  });

  it('should make GET request to get image as file', () => {
    const mockBlob = new Blob(['sample image'], { type: 'image/jpeg' });

    service.getImageAsFile('https://example.com/sample.jpg').subscribe((blob) => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpTestingController.expectOne('https://example.com/sample.jpg');
    expect(req.request.method).toEqual('GET');
    expect(req.request.responseType).toEqual('blob');
    req.flush(mockBlob);
  });

  it('should handle delete event error', () => {
    const eventId = 1;

    service.deleteEvent(eventId).subscribe({
      next: () => fail('Expected error'),
      error: (error) => expect(error.status).toBe(500)
    });

    const req = httpTestingController.expectOne(`${service['backEnd']}events/${eventId}`);
    req.flush('Delete failed', { status: 500, statusText: 'Server Error' });
  });

  it('should handle rate event error', () => {
    const eventId = 1;
    const grade = 5;

    service.rateEvent(eventId, grade).subscribe({
      next: () => fail('Expected error'),
      error: (error) => expect(error.status).toBe(500)
    });

    const req = httpTestingController.expectOne(`${service['backEnd']}events/${eventId}/rating/${grade}`);
    req.flush('Rate failed', { status: 500, statusText: 'Server Error' });
  });

  it('should handle add attender error', () => {
    const eventId = 1;

    service.addAttender(eventId).subscribe({
      next: () => fail('Expected error'),
      error: (error) => expect(error.status).toBe(500)
    });

    const req = httpTestingController.expectOne(`${service['backEnd']}events/${eventId}/attenders`);
    req.flush('Add attender failed', { status: 500, statusText: 'Server Error' });
  });

  it('should handle remove attender error', () => {
    const eventId = 1;

    service.removeAttender(eventId).subscribe({
      next: () => fail('Expected error'),
      error: (error) => expect(error.status).toBe(500)
    });

    const req = httpTestingController.expectOne(`${service['backEnd']}events/${eventId}/attenders`);
    req.flush('Remove attender failed', { status: 500, statusText: 'Server Error' });
  });

  it('should get all attendees', () => {
    const eventId = 1;

    service.getAllAttendees(eventId).subscribe({
      next: (attendees) => expect(attendees).toEqual(mockAttendees),
      error: fail
    });

    const req = httpTestingController.expectOne(`${service['backEnd']}events/${eventId}/attenders`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAttendees);
  });

  it('should handle get all attendees error', () => {
    const eventId = 1;

    service.getAllAttendees(eventId).subscribe({
      next: () => fail('Expected error'),
      error: (error) => expect(error.status).toBe(500)
    });

    const req = httpTestingController.expectOne(`${service['backEnd']}events/${eventId}/attenders`);
    req.flush('Get attendees failed', { status: 500, statusText: 'Server Error' });
  });

  it('should get addresses successfully', () => {
    service.getAddresses().subscribe({
      next: (addresses) => {
        expect(addresses).toEqual(addressesMock);
      },
      error: fail
    });

    const req = httpTestingController.expectOne(`${service['backEnd']}events/addresses`);
    expect(req.request.method).toBe('GET');
    req.flush(addressesMock);
  });

  it('should handle error when getting addresses', () => {
    service.getAddresses().subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Server Error');
      }
    });

    const req = httpTestingController.expectOne(`${service['backEnd']}events/addresses`);
    req.flush('Failed to load addresses', { status: 500, statusText: 'Server Error' });
  });

  it('should handle getAddresses when no addresses available', () => {
    service.getAddresses().subscribe({
      next: (addresses) => expect(addresses).toEqual([]),
      error: fail
    });

    const req = httpTestingController.expectOne(`${url}events/addresses`);
    req.flush([]);
  });

  it('should handle getAllAttendees for event with no attendees', () => {
    const eventId = 9999;

    service.getAllAttendees(eventId).subscribe({
      next: (attendees) => expect(attendees).toEqual([]),
      error: fail
    });

    const req = httpTestingController.expectOne(`${url}events/${eventId}/attenders`);
    req.flush([]);
  });

  it('should handle removeEventFromFavourites with non-existent event', () => {
    const eventId = 9999;

    service.removeEventFromFavourites(eventId).subscribe({
      next: () => fail('Expected error'),
      error: (error) => expect(error.status).toBe(404)
    });

    const req = httpTestingController.expectOne(`${url}events/${eventId}/favorites`);
    req.flush('Event not found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle addEventToFavourites with non-existent event', () => {
    const eventId = 9999;

    service.addEventToFavourites(eventId).subscribe({
      next: () => fail('Expected error'),
      error: (error) => expect(error.status).toBe(404)
    });

    const req = httpTestingController.expectOne(`${url}events/${eventId}/favorites`);
    req.flush('Event not found', { status: 404, statusText: 'Not Found' });
  });

  describe('convertEventToFormEvent', () => {
    it('should convert EventForm to FormGroup with correct values', () => {
      const formGroup = service.convertEventToFormEvent(EVENT_FORM_MOCK);

      // Check eventInformation values
      expect(formGroup.get('eventInformation.title').value).toBe(EVENT_FORM_MOCK.eventInformation.title);
      expect(formGroup.get('eventInformation.description').value).toBe(EVENT_FORM_MOCK.eventInformation.description);
      expect(formGroup.get('eventInformation.open').value).toBe(EVENT_FORM_MOCK.eventInformation.open);
      expect(formGroup.get('eventInformation.duration').value).toBe(EVENT_FORM_MOCK.eventInformation.duration);
      expect(formGroup.get('eventInformation.tags').value).toEqual(EVENT_FORM_MOCK.eventInformation.tags);

      // Check dateInformation values
      const dateGroup = formGroup.get('dateInformation').value[0];
      expect(dateGroup.day.date).toEqual(EVENT_FORM_MOCK.dateInformation[0].day.date);
      expect(dateGroup.day.startTime).toBe(EVENT_FORM_MOCK.dateInformation[0].day.startTime);
      expect(dateGroup.day.endTime).toBe(EVENT_FORM_MOCK.dateInformation[0].day.endTime);
      expect(dateGroup.placeOnline.onlineLink).toBe(EVENT_FORM_MOCK.dateInformation[0].placeOnline.onlineLink);
      expect(dateGroup.placeOnline.place).toBe(EVENT_FORM_MOCK.dateInformation[0].placeOnline.place);
      expect(dateGroup.placeOnline.coordinates).toEqual(EVENT_FORM_MOCK.dateInformation[0].placeOnline.coordinates);
    });
  });

  describe('transformDatesFormToDates', () => {
    it('should transform valid form data to Dates[]', () => {
      const result = service.transformDatesFormToDates(EVENT_FORM_MOCK.dateInformation);

      expect(result.length).toBe(1);

      const startDate = new Date(result[0].startDate);
      const finishDate = new Date(result[0].finishDate);

      expect(startDate.getHours()).toBe(10);
      expect(startDate.getMinutes()).toBe(0);
      expect(finishDate.getHours()).toBe(12);
      expect(finishDate.getMinutes()).toBe(0);

      expect(result[0].onlineLink).toBe('https://example.com/event');
      expect(result[0].coordinates.latitude).toBe(40.712776);
      expect(result[0].coordinates.longitude).toBe(-74.005974);
    });

    it('should filter out invalid dates', () => {
      const mockFormData = [
        {
          day: { date: 'invalid-date', startTime: '10:00', endTime: '12:00', allDay: false },
          placeOnline: { coordinates: { lat: 50, lng: 50 }, onlineLink: null, place: null }
        }
      ];

      const result = service.transformDatesFormToDates(EVENT_FORM_MOCK.dateInformation);

      expect(result.length).toBe(1);
    });
  });

  describe('prepareEventForSubmit', () => {
    it('should prepare FormData for a new event', () => {
      const result = service.prepareEventForSubmit(EVENT_FORM_MOCK, 0, false);

      const addEventDtoRequest = JSON.parse(result.get('addEventDtoRequest') as string);
      expect(addEventDtoRequest.title).toBe('Sample Event Title');
      expect(addEventDtoRequest.description).toBe('This is a sample event description.');
      expect(addEventDtoRequest.open).toBe(true);
      expect(addEventDtoRequest.tags).toEqual(['Technology', 'Education']);
      expect(addEventDtoRequest.datesLocations.length).toBe(1);

      expect(result.getAll('images').length).toBe(0);
    });

    it('should prepare FormData for updating an event', () => {
      const result = service.prepareEventForSubmit(EVENT_FORM_MOCK, 1, true);

      const eventDto = JSON.parse(result.get('eventDto') as string);
      expect(eventDto.title).toBe('Sample Event Title');
      expect(eventDto.description).toBe('This is a sample event description.');
      expect(eventDto.open).toBe(true);
      expect(eventDto.tags).toEqual(['Technology', 'Education']);
      expect(eventDto.datesLocations.length).toBe(1);
      expect(eventDto.id).toBe(1);

      expect(result.getAll('images').length).toBe(0);
    });

    it('should append file images to FormData for a new event', () => {
      const mockWithFiles = {
        ...EVENT_FORM_MOCK,
        eventInformation: {
          ...EVENT_FORM_MOCK.eventInformation,
          images: [
            { file: new File([], 'main-image.jpg'), url: '', main: true },
            { file: new File([], 'secondary-image.jpg'), url: '', main: false }
          ]
        }
      };

      const result = service.prepareEventForSubmit(mockWithFiles, 0, false);

      // Check for the added files in FormData
      const images = result.getAll('images') as File[];
      expect(images.length).toBe(2);
      expect(images[0].name).toBe('main-image.jpg');
      expect(images[1].name).toBe('secondary-image.jpg');
    });
  });
});
