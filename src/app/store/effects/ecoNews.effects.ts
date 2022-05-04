import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';

import { EMPTY } from 'rxjs';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import {
  GetEcoNewsByTagsAction,
  GetEcoNewsByTagsSuccessAction,
  GetEcoNewsByPageAction,
  GetEcoNewsByPageSuccessAction,
  GetEcoNewsByAuthorAction,
  GetEcoNewsByAuthorSuccessAction
} from '../actions/ecoNews.actions';
import { EcoNewsDto } from '@eco-news-models/eco-news-dto';
import { CreateEcoNewsService } from '@eco-news-service/create-eco-news.service';

@Injectable()
export class NewsEffects {
  constructor(private actions: Actions, private newsService: EcoNewsService, private createEcoNewsService: CreateEcoNewsService) {}

  getNewsListByTags = createEffect(() => {
    return this.actions.pipe(
      ofType(GetEcoNewsByTagsAction),
      mergeMap((actions: { currentPage: number; numberOfNews: number; tagsList: string[]; reset: boolean }) => {
        return this.newsService.getNewsListByTags(actions.currentPage, actions.numberOfNews, actions.tagsList).pipe(
          map(
            (ecoNews: EcoNewsDto) => GetEcoNewsByTagsSuccessAction({ ecoNews, reset: actions.reset }),
            catchError(() => EMPTY)
          )
        );
      })
    );
  });

  getEcoNewsListByPage = createEffect(() => {
    return this.actions.pipe(
      ofType(GetEcoNewsByPageAction),
      mergeMap((actions: { currentPage: number; numberOfNews: number; reset: boolean }) => {
        return this.newsService.getEcoNewsListByPage(actions.currentPage, actions.numberOfNews).pipe(
          map(
            (ecoNews: EcoNewsDto) => GetEcoNewsByPageSuccessAction({ ecoNews, reset: actions.reset }),
            catchError(() => EMPTY)
          )
        );
      })
    );
  });

  getEcoNewsListByAutorId = createEffect(() => {
    return this.actions.pipe(
      ofType(GetEcoNewsByAuthorAction),
      mergeMap((actions: { currentPage: number; numberOfNews: number; reset: boolean }) => {
        return this.newsService.getEcoNewsListByAutorId(actions.currentPage, actions.numberOfNews).pipe(
          map(
            (ecoNews: EcoNewsDto) => GetEcoNewsByAuthorSuccessAction({ ecoNews, reset: actions.reset }),
            catchError(() => EMPTY)
          )
        );
      })
    );
  });
}
