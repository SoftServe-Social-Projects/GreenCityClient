import { TestBed } from '@angular/core/testing';
import { EventsService } from 'src/app/main/component/events/services/events.service';
import { of, throwError } from 'rxjs';
import { mockFavouriteEvents } from '@assets/mocks/events/mock-events';
import { Actions } from '@ngrx/effects';
import { EventsEffects } from 'src/app/store/effects/ecoEvents.effects';
import {
  AddAttenderEcoEventsByIdAction,
  AddAttenderEventsByIdSuccessAction,
  CreateEcoEventAction,
  CreateEcoEventSuccessAction,
  DeleteEcoEventAction,
  DeleteEcoEventSuccessAction,
  EditEcoEventAction,
  EditEcoEventSuccessAction,
  RateEcoEventsByIdAction,
  RateEcoEventsByIdSuccessAction,
  ReceivedFailureAction,
  RemoveAttenderEcoEventsByIdAction,
  RemoveAttenderEventsByIdSuccessAction
} from 'src/app/store/actions/ecoEvents.actions';
import { StoreModule } from '@ngrx/store';

describe('EventsService', () => {
  let actions$: Actions;
  let effects: EventsEffects;
  let eventsService: jasmine.SpyObj<EventsService>;
  const eventMock = mockFavouriteEvents[0];

  beforeEach(() => {
    const eventsServiceSpy = jasmine.createSpyObj('EventsService', [
      'createEvent',
      'editEvent',
      'deleteEvent',
      'rateEvent',
      'addAttender',
      'removeAttender'
    ]);
    actions$ = of();
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [
        EventsEffects,
        EventsService,
        { provide: Actions, useValue: actions$ },
        { provide: EventsService, useValue: eventsServiceSpy }
      ]
    });
  });

  beforeEach(() => {
    effects = TestBed.inject(EventsEffects);
    eventsService = TestBed.inject(EventsService) as jasmine.SpyObj<EventsService>;
  });

  it('createEvent should dispatch CreateEcoEventSuccessAction on success', () => {
    const formData = new FormData();
    const action = CreateEcoEventAction({ data: formData });
    const completion = CreateEcoEventSuccessAction({ event: eventMock });

    actions$ = of(action);
    eventsService.createEvent.and.returnValue(of(eventMock));

    effects.createEvent.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('createEvent should dispatch ReceivedFailureAction on failure', () => {
    const formData = new FormData();
    const error = 'Error';
    const action = CreateEcoEventAction({ data: formData });
    const completion = ReceivedFailureAction({ error });

    actions$ = of(action);
    eventsService.createEvent.and.returnValue(throwError(() => error));

    effects.createEvent.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('editEvent should dispatch EditEcoEventSuccessAction on success', () => {
    const formData = new FormData();
    const action = EditEcoEventAction({ data: formData, id: 1 });
    const completion = EditEcoEventSuccessAction({ event: eventMock });

    actions$ = of(action);
    eventsService.editEvent.and.returnValue(of(eventMock));

    effects.editEvent.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('editEvent should dispatch ReceivedFailureAction on failure', () => {
    const formData = new FormData();
    const error = 'Error';
    const action = EditEcoEventAction({ data: formData, id: 1 });
    const completion = ReceivedFailureAction({ error });

    actions$ = of(action);
    eventsService.editEvent.and.returnValue(throwError(() => error));

    effects.editEvent.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('deleteEvent should dispatch DeleteEcoEventSuccessAction on success', () => {
    const id = 1;
    const action = DeleteEcoEventAction({ id });
    const completion = DeleteEcoEventSuccessAction({ id });

    actions$ = of(action);
    eventsService.deleteEvent.and.returnValue(of(true));

    effects.deleteEvent.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('deleteEvent should dispatch ReceivedFailureAction on failure', () => {
    const id = 1;
    const error = 'Error';
    const action = DeleteEcoEventAction({ id });
    const completion = ReceivedFailureAction({ error });

    actions$ = of(action);
    eventsService.deleteEvent.and.returnValue(throwError(() => error));

    effects.deleteEvent.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('rateEvent should dispatch RateEcoEventsByIdSuccessAction on success', () => {
    const id = 1;
    const grade = 5;
    const action = RateEcoEventsByIdAction({ id, grade });
    const completion = RateEcoEventsByIdSuccessAction({ id, grade });

    actions$ = of(action);
    eventsService.rateEvent.and.returnValue(of(true));

    effects.rateEvent.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('rateEvent should dispatch ReceivedFailureAction on failure', () => {
    const id = 1;
    const grade = 5;
    const error = 'Error';
    const action = RateEcoEventsByIdAction({ id, grade });
    const completion = ReceivedFailureAction({ error });

    actions$ = of(action);
    eventsService.rateEvent.and.returnValue(throwError(() => error));

    effects.rateEvent.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('AddAttender should dispatch AddAttenderEventsByIdSuccessAction on success', () => {
    const id = 1;
    const action = AddAttenderEcoEventsByIdAction({ id });
    const completion = AddAttenderEventsByIdSuccessAction({ id });

    actions$ = of(action);
    eventsService.addAttender.and.returnValue(of(true));

    effects.AddAttender.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('AddAttender should dispatch ReceivedFailureAction on failure', () => {
    const id = 1;
    const error = 'Error';
    const action = AddAttenderEcoEventsByIdAction({ id });
    const completion = ReceivedFailureAction({ error });

    actions$ = of(action);
    eventsService.addAttender.and.returnValue(throwError(() => error));

    effects.AddAttender.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('RemoveAttender should dispatch RemoveAttenderEventsByIdSuccessAction on success', () => {
    const id = 1;
    const action = RemoveAttenderEcoEventsByIdAction({ id });
    const completion = RemoveAttenderEventsByIdSuccessAction({ id });

    actions$ = of(action);
    eventsService.removeAttender.and.returnValue(of(true));

    effects.RemoveAttender.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });

  it('RemoveAttender should dispatch ReceivedFailureAction on failure', () => {
    const id = 1;
    const error = 'Error';
    const action = RemoveAttenderEcoEventsByIdAction({ id });
    const completion = ReceivedFailureAction({ error });

    actions$ = of(action);
    eventsService.removeAttender.and.returnValue(throwError(() => error));
    effects.RemoveAttender.subscribe((result) => {
      expect(result).toEqual(completion);
    });
  });
});
