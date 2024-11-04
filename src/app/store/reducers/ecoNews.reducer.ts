import { createReducer, on } from '@ngrx/store';
import {
  GetEcoNewsByAuthorSuccessAction,
  CreateEcoNewsSuccessAction,
  EditEcoNewsSuccessAction,
  DeleteEcoNewsSuccessAction,
  ReceivedEcoNewsFailureAction,
  GetEcoNewsSuccessAction,
  ChangeEcoNewsFavoriteStatusSuccessAction
} from '../actions/ecoNews.actions';
import { initialNewsState } from '../state/ecoNews.state';

export const EcoNewsReducer = createReducer(
  initialNewsState,
  on(GetEcoNewsSuccessAction, (state, action) => {
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
    let prevAuthorNews = state.authorNews;
    let prevNumber = state.authorNewsPage;
    if (action.reset) {
      prevAuthorNews = [];
      prevNumber = 0;
    }
    return {
      ...state,
      authorNews: [...prevAuthorNews, ...action.ecoNews.page],
      ecoNewsByAuthor: { ...action.ecoNews },
      authorNewsPage: prevNumber + 1
    };
  }),

  on(EditEcoNewsSuccessAction, (state, action) => ({
    ...state,
    pages: state.pages.map((val) => {
      if (val && val.id === +action.editedNews.id) {
        return action.editedNews;
      }
      return val;
    }),
    authorNews: state.authorNews.map((value) => {
      if (value && value.id === +action.editedNews.id) {
        return action.editedNews;
      }
      return value;
    }),
    countOfEcoNews: action.editedNews.countOfEcoNews
  })),

  on(CreateEcoNewsSuccessAction, (state, action) => ({
    ...state,
    pages: [action.newEcoNews, ...state.pages],
    authorNews: [action.newEcoNews, ...state.authorNews],
    countOfEcoNews: action.newEcoNews.countOfEcoNews
  })),

  on(DeleteEcoNewsSuccessAction, (state, action) => {
    const updatedPages = state.pages?.filter((newsPage) => newsPage.id !== +action.id);
    const updatedAuthorNews = state.authorNews?.filter((authorNews) => authorNews.id !== +action.id);
    const totalElements = state.ecoNewsByAuthor.totalElements;
    const totalElem = totalElements > 0 ? totalElements - 1 : totalElements;
    const updatedEcoNewsByAuthorPage = state.ecoNewsByAuthor.page?.filter((newsPage) => newsPage.id !== +action.id);
    return {
      ...state,
      pages: updatedPages || state.pages,
      authorNews: updatedAuthorNews || state.authorNews,
      ecoNewsByAuthor: {
        ...state.ecoNewsByAuthor,
        totalElements: totalElem,
        page: updatedEcoNewsByAuthorPage || state.ecoNewsByAuthor.page
      }
    };
  }),

  on(ReceivedEcoNewsFailureAction, (state, action) => ({
    ...state,
    error: action.error
  })),

  on(ChangeEcoNewsFavoriteStatusSuccessAction, (state, action) => {
    const updateFavoriteStatus = (newsArray: any[]) => {
      if (action.isFavoritesPage) {
        return newsArray.filter((news) => news.id !== action.id);
      } else {
        return newsArray.map((news) => (news.id === action.id ? { ...news, favorite: action.favorite } : news));
      }
    };
    const totalElements = state.ecoNews.totalElements;
    const newTotal = action.isFavoritesPage ? totalElements - 1 : totalElements;

    return {
      ...state,
      pages: updateFavoriteStatus(state.pages),
      authorNews: updateFavoriteStatus(state.authorNews),
      ecoNews: {
        ...state.ecoNews,
        totalElements: newTotal
      }
    };
  })
);
