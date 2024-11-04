import { EcoNewsDto } from '@eco-news-models/eco-news-dto';
import { createAction, props } from '@ngrx/store';

import { NewsDTO } from '@eco-news-models/create-news-interface';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { HttpParams } from '@angular/common/http';

export enum NewsActions {
  GetEcoNewsByTags = '[News] Get news by tags',
  GetEcoNewsByTagsSuccess = '[News] Get news by tags Success',
  GetEcoNewsByPage = '[News] Get news by page',
  GetEcoNewsByPageSuccess = '[News] Get news by page Success',

  GetEcoNews = '[News] Get news',
  GetEcoNewsSuccess = '[News] Get news Success',

  GetEcoNewsByAuthor = '[News] Get news by author',
  GetEcoNewsByAuthorSuccess = '[News] Get news by author Success',

  EditEcoNews = '[News] Edit news',
  EditEcoNewsSuccess = '[News] Edit news Success',

  CreateEcoNews = '[News] Create news',
  CreateEcoNewsSuccess = '[News] Create news Success',

  DeleteEcoNews = '[News] Delete news',
  DeleteEcoNewsSuccess = '[News] Delete news Success',

  ReceivedEcoNewsFailure = '[News] Received Failure',

  ChangeEcoNewsFavoriteStatus = '[News] Change favorite status',
  ChangeEcoNewsFavoriteStatusSuccess = '[News] Change favorite status success'
}

export const GetEcoNewsAction = createAction(NewsActions.GetEcoNews, props<{ params: HttpParams; reset: boolean }>());

export const GetEcoNewsSuccessAction = createAction(NewsActions.GetEcoNewsSuccess, props<{ ecoNews: EcoNewsDto; reset: boolean }>());

export const GetEcoNewsByAuthorAction = createAction(
  NewsActions.GetEcoNewsByAuthor,
  props<{ authorId: number; currentPage: number; numberOfNews: number; reset: boolean }>()
);

export const GetEcoNewsByAuthorSuccessAction = createAction(
  NewsActions.GetEcoNewsByAuthorSuccess,
  props<{ ecoNews: EcoNewsDto; reset: boolean }>()
);

export const EditEcoNewsAction = createAction(NewsActions.EditEcoNews, props<{ form: NewsDTO }>());
export const EditEcoNewsSuccessAction = createAction(NewsActions.EditEcoNewsSuccess, props<{ editedNews: EcoNewsModel }>());

export const CreateEcoNewsAction = createAction(NewsActions.CreateEcoNews, props<{ value: NewsDTO }>());
export const CreateEcoNewsSuccessAction = createAction(NewsActions.CreateEcoNewsSuccess, props<{ newEcoNews: EcoNewsModel }>());

export const DeleteEcoNewsAction = createAction(NewsActions.DeleteEcoNews, props<{ id: number }>());
export const DeleteEcoNewsSuccessAction = createAction(NewsActions.DeleteEcoNewsSuccess, props<{ id: number }>());

export const ReceivedEcoNewsFailureAction = createAction(NewsActions.ReceivedEcoNewsFailure, props<{ error: string | null }>());

export const ChangeEcoNewsFavoriteStatusAction = createAction(
  NewsActions.ChangeEcoNewsFavoriteStatus,
  props<{ id: number; favorite: boolean; isFavoritesPage: boolean }>()
);

export const ChangeEcoNewsFavoriteStatusSuccessAction = createAction(
  NewsActions.ChangeEcoNewsFavoriteStatusSuccess,
  props<{ id: number; favorite: boolean; isFavoritesPage: boolean }>()
);
