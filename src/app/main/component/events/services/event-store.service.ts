import { Injectable, OnDestroy } from '@angular/core';
import { EventForm, EventListResponse } from '../models/events.interface';

@Injectable()
export class EventStoreService implements OnDestroy {
  private state: { eventId: number; eventListResponse: EventListResponse; eventAuthorId: number; editorValues: EventForm } = {
    eventId: undefined,
    editorValues: { eventInformation: undefined, dateInformation: undefined },
    eventAuthorId: undefined,
    eventListResponse: undefined
  };

  constructor() {}

  setEventId(id: number) {
    this.state.eventId = id;
  }

  getEventId() {
    return this.state.eventId;
  }

  setEditorValues(value: EventForm) {
    this.state.editorValues = value;
  }

  getEditorValues(): EventForm {
    return this.state.editorValues;
  }

  setEventListResponse(response: EventListResponse) {
    const { id, organizer } = response;
    this.setEventId(id);
    this.setEventAuthorId(organizer.id);
  }

  setEventAuthorId(id: number) {
    this.state.eventAuthorId = id;
  }

  getEventAuthorId(): number {
    return this.state.eventAuthorId;
  }

  ngOnDestroy() {
    this.state = null;
  }
}
