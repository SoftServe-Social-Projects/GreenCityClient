import { createReducer, on } from '@ngrx/store';
import {
  GetEcoNewsByPageSuccessAction,
  GetEcoNewsByTagsSuccessAction,
  GetEcoNewsByAuthorSuccessAction,
  CreateEcoNewsSuccessAction,
  EditEcoNewsSuccessAction
} from '../actions/ecoNews.actions';
import { initialNewsState } from '../state/ecoNews.state';

export const EcoNewsReducer = createReducer(
  initialNewsState,
  on(GetEcoNewsByPageSuccessAction, GetEcoNewsByTagsSuccessAction, (state, action) => {
    let prevLocations = state.pages;
    let prevNumber = state.pageNumber;
    if (action.reset) {
      prevLocations = [];
      prevNumber = 0;
    }
    return {
      ...state,
      pages: [...prevLocations, ...action.ecoNews.page],
      ecoNews: { ...action.ecoNews },
      pageNumber: prevNumber + 1
    };
  }),
  on(GetEcoNewsByAuthorSuccessAction, (state, action) => {
    let prevAuthorNews = state.autorNews;
    let prevNumber = state.authorNewsPage;
    if (action.reset) {
      prevAuthorNews = [];
      prevNumber = 0;
    }
    return {
      ...state,
      autorNews: [...prevAuthorNews, ...action.ecoNews.page],
      ecoNewsByAuthor: { ...action.ecoNews },
      authorNewsPage: prevNumber + 1
    };
  }),

  on(EditEcoNewsSuccessAction, (state, action) => {
    return {
      ...state,
      pages: state.pages.map((val) => {
        if (val && val.id === +action.editedNews.id) {
          return action.editedNews;
        }
        return val;
      }),
      autorNews: state.autorNews.map((value) => {
        if (value && value.id === +action.editedNews.id) {
          return action.editedNews;
        }
        return value;
      }),
      countOfEcoNews: action.editedNews.countOfEcoNews
    };
  }),

  on(CreateEcoNewsSuccessAction, (state, action) => {
    return {
      ...state,
      pages: [action.newEcoNews, ...state.pages],
      autorNews: [action.newEcoNews, ...state.autorNews],
      countOfEcoNews: action.newEcoNews.countOfEcoNews
    };
  })
);
