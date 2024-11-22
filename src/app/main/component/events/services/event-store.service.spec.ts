import { TestBed } from '@angular/core/testing';
import { EventStoreService } from './event-store.service';
import { EventForm, EventListResponse } from '../models/events.interface';
import { EVENT_FORM_MOCK, EVENT_MOCK } from '../mocks/events-mocks';

describe('EventStoreService', () => {
  let service: EventStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventStoreService]
    });
    service = TestBed.inject(EventStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get eventId', () => {
    service.setEventId(123);
    expect(service.getEventId()).toBe(123);
  });

  it('should set and get editorValues', () => {
    const editorValues: EventForm = EVENT_FORM_MOCK;

    service.setEditorValues(editorValues);
    expect(service.getEditorValues()).toEqual(editorValues);

    service.setEditorValues(null);
    expect(service.getEditorValues()).toEqual({
      eventInformation: undefined,
      dateInformation: undefined
    });
  });

  it('should set and get eventAuthorId', () => {
    service.setEventAuthorId(456);
    expect(service.getEventAuthorId()).toBe(456);
  });

  it('should set eventAuthorId through setEventListResponse', () => {
    const eventListResponse: EventListResponse = EVENT_MOCK;

    service.setEventListResponse(eventListResponse);
    expect(service.getEventAuthorId()).toBe(EVENT_MOCK.organizer.id);
  });
});
