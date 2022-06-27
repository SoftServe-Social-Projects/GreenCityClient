import { EventResponseDto } from 'src/app/main/component/events/models/events.interface';

export interface IEcoEventsState {
  eventState: EventResponseDto;
  eventsList: any[];
  visitedPages: number[];
  totalPages: number;
  pageNumber: number;

  error: string | null;
}

export const initialEventsState: IEcoEventsState = {
  eventState: null,
  eventsList: [],
  visitedPages: [],
  totalPages: 0,
  pageNumber: 0,
  error: null
};
