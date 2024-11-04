import { Breakpoints } from 'src/app/main/config/breakpoints.constants';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { FilterModel } from '@shared/components/tag-filter/tag-filter.model';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { IEcoNewsState } from 'src/app/store/state/ecoNews.state';
import { GetEcoNewsByTagsAction, GetEcoNewsByPageAction } from 'src/app/store/actions/ecoNews.actions';
import { Router } from '@angular/router';
import { tagsListEcoNewsData } from '@eco-news-models/eco-news-consts';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit, OnDestroy {
  view: boolean;
  gallery: boolean;
  tagsList: Array<string> = [];
  elements: EcoNewsModel[];
  remaining = 0;
  windowSize: number;
  isLoggedIn: boolean;
  private currentPage: number;
  scroll: boolean;
  numberOfNews: number;
  elementsArePresent = true;
  tagList: FilterModel[] = tagsListEcoNewsData;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);

  hasNext = true;

  econews$ = this.store.select((state: IAppState): IEcoNewsState => state.ecoNewsState);

  constructor(
    private ecoNewsService: EcoNewsService,
    private userOwnAuthService: UserOwnAuthService,
    private snackBar: MatSnackBarComponent,
    private localStorageService: LocalStorageService,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit() {
    this.onResize();
    this.setDefaultNumberOfNews(12);
    this.checkUserSingIn();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.scroll = false;
    this.setLocalizedTags();

    this.dispatchStore(false);

    this.econews$.subscribe((value: IEcoNewsState) => {
      this.currentPage = value.pageNumber;
      if (value.ecoNews) {
        this.elements = [...value.pages];
        const data = value.ecoNews;
        this.hasNext = data.hasNext;
        this.remaining =
          Math.abs(data.totalElements - value.countOfEcoNews) > 0 && value.countOfEcoNews !== 0 ? value.countOfEcoNews : data.totalElements;
        this.elementsArePresent = this.elements.length < data.totalElements;
      }
    });
    this.localStorageService.setCurentPage('previousPage', '/news');
  }

  private setLocalizedTags(): void {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$));
  }

  onResize(): void {
    this.getSessionStorageView();
    this.windowSize = window.innerWidth;
    const isGalleryView = !!this.gallery;
    this.view = this.windowSize > Breakpoints.tabletLow ? true : isGalleryView;
  }

  private getSessionStorageView(): void {
    const view = sessionStorage.getItem('viewGallery');
    if (view) {
      this.gallery = JSON.parse(view);
    }
  }

  onScroll(): void {
    this.scroll = true;
    this.dispatchStore(false);
  }

  changeView(event: boolean): void {
    this.view = event;
  }

  getFilterData(value: Array<string>): void {
    if (this.tagsList !== value) {
      this.tagsList = value;
    }
    this.hasNext = true;
    this.currentPage = 0;
    this.dispatchStore(true);
  }

  dispatchStore(res: boolean): void {
    if (!this.hasNext || this.currentPage === undefined) {
      return;
    }

    const action = this.tagsList.length
      ? GetEcoNewsByTagsAction({ currentPage: this.currentPage, numberOfNews: this.numberOfNews, tagsList: this.tagsList, reset: res })
      : GetEcoNewsByPageAction({ currentPage: this.currentPage, numberOfNews: this.numberOfNews, reset: res });

    this.store.dispatch(action);
  }

  private checkUserSingIn(): void {
    this.userOwnAuthService.credentialDataSubject.subscribe((data) => (this.isLoggedIn = data?.userId));
  }

  private setDefaultNumberOfNews(quantity: number): void {
    this.numberOfNews = quantity;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
