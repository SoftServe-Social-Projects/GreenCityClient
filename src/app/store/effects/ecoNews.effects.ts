import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import {
  GetEcoNewsByTagsAction,
  GetEcoNewsByTagsSuccessAction,
  GetEcoNewsByPageAction,
  GetEcoNewsByPageSuccessAction,
  GetEcoNewsByAuthorAction,
  GetEcoNewsByAuthorSuccessAction,
  EditEcoNewsAction,
  EditEcoNewsSuccessAction,
  CreateEcoNewsAction,
  CreateEcoNewsSuccessAction,
  DeleteEcoNewsSuccessAction,
  DeleteEcoNewsAction,
  ReceivedEcoNewsFailureAction,
  GetEcoNewsAction,
  GetEcoNewsSuccessAction
} from '../actions/ecoNews.actions';
import { EcoNewsDto } from '@eco-news-models/eco-news-dto';
import { CreateEcoNewsService } from '@eco-news-service/create-eco-news.service';
import { NewsDTO } from '@eco-news-models/create-news-interface';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class NewsEffects {
  constructor(
    private actions: Actions,
    private newsService: EcoNewsService,
    private createEcoNewsService: CreateEcoNewsService,
    private router: Router
  ) {}

  getNewsListByTags = createEffect(() =>
    this.actions.pipe(
      ofType(GetEcoNewsByTagsAction),
      mergeMap((actions: { currentPage: number; numberOfNews: number; tagsList: string[]; reset: boolean }) =>
        this.newsService.getNewsListByTags(actions.currentPage, actions.numberOfNews, actions.tagsList).pipe(
          map((ecoNews: EcoNewsDto) => GetEcoNewsByTagsSuccessAction({ ecoNews, reset: actions.reset })),
          catchError((error) => of(ReceivedEcoNewsFailureAction(error)))
        )
      )
    )
  );

  getEcoNewsListByPage = createEffect(() =>
    this.actions.pipe(
      ofType(GetEcoNewsByPageAction),
      mergeMap((actions: { currentPage: number; numberOfNews: number; reset: boolean }) =>
        this.newsService.getEcoNewsListByPage(actions.currentPage, actions.numberOfNews).pipe(
          map((ecoNews: EcoNewsDto) => GetEcoNewsByPageSuccessAction({ ecoNews, reset: actions.reset })),
          catchError((error) => of(ReceivedEcoNewsFailureAction(error)))
        )
      )
    )
  );

  getEcoNews = createEffect(() =>
    this.actions.pipe(
      ofType(GetEcoNewsAction),
      mergeMap((actions: { params: HttpParams; reset: boolean }) =>
        this.newsService.getEcoNewsList(actions.params).pipe(
          map((ecoNews: EcoNewsDto) => GetEcoNewsSuccessAction({ ecoNews, reset: actions.reset })),
          catchError((error) => of(ReceivedEcoNewsFailureAction(error)))
        )
      )
    )
  );

  getEcoNewsListByAutorId = createEffect(() =>
    this.actions.pipe(
      ofType(GetEcoNewsByAuthorAction),
      mergeMap((actions: { authorId: number; currentPage: number; numberOfNews: number; reset: boolean }) =>
        this.newsService.getEcoNewsListByAutorId(actions.authorId, actions.currentPage, actions.numberOfNews).pipe(
          map((ecoNews: EcoNewsDto) => GetEcoNewsByAuthorSuccessAction({ ecoNews, reset: actions.reset })),
          catchError((error) => of(ReceivedEcoNewsFailureAction(error)))
        )
      )
    )
  );

  editNews = createEffect(() =>
    this.actions.pipe(
      ofType(EditEcoNewsAction),
      mergeMap((actions: { form: NewsDTO }) =>
        this.createEcoNewsService.editNews(actions.form).pipe(
          map((editedNews: EcoNewsModel) => EditEcoNewsSuccessAction({ editedNews })),
          catchError((error) => of(ReceivedEcoNewsFailureAction(error)))
        )
      )
    )
  );

  createNews = createEffect(() =>
    this.actions.pipe(
      ofType(CreateEcoNewsAction),
      mergeMap((actions: { value: NewsDTO }) =>
        this.createEcoNewsService.sendFormData(actions.value).pipe(
          map((newEcoNews: EcoNewsModel) => CreateEcoNewsSuccessAction({ newEcoNews })),
          catchError((error) => of(ReceivedEcoNewsFailureAction(error)))
        )
      )
    )
  );

  deleteNews = createEffect(() =>
    this.actions.pipe(
      ofType(DeleteEcoNewsAction),
      mergeMap((actions: { id: number }) =>
        this.newsService.deleteNews(actions.id).pipe(
          map(() => DeleteEcoNewsSuccessAction({ id: actions.id })),
          tap(() => {
            this.router.navigate(['/news']);
          }),
          catchError((error) => of(ReceivedEcoNewsFailureAction(error)))
        )
      )
    )
  );
}
