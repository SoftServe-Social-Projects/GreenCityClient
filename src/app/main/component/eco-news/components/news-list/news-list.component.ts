import { Breakpoints } from '../../../../config/breakpoints.constants';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { FilterModel } from '@shared/components/tag-filter/tag-filter.model';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { IEcoNewsState } from 'src/app/store/state/ecoNews.state';
import { GetEcoNewsAction, ChangeEcoNewsFavoriteStatusAction } from 'src/app/store/actions/ecoNews.actions';
import { tagsListEcoNewsData } from '@eco-news-models/eco-news-consts';
import { FormControl, Validators } from '@angular/forms';
import { Patterns } from '@assets/patterns/patterns';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { EcoNewsService } from '@eco-news-service/eco-news.service';

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
  userId: number;
  scroll: boolean;
  numberOfNews: number;
  newsTotal: number;
  elementsArePresent = true;
  tagList: FilterModel[] = tagsListEcoNewsData;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  bookmarkSelected = false;
  hasNext = true;
  loading = false;
  private page = 0;
  noNewsMatch = false;
  isSearchVisible = false;
  searchNewsControl = new FormControl('', [Validators.maxLength(30), Validators.pattern(Patterns.NameInfoPattern)]);
  econews$ = this.store.select((state: IAppState): IEcoNewsState => state.ecoNewsState);
  searchQuery = '';

  private dialogRef: MatDialogRef<unknown>;

  constructor(
    private userOwnAuthService: UserOwnAuthService,
    private localStorageService: LocalStorageService,
    private store: Store,
    private readonly dialog: MatDialog,
    private readonly ecoNewsService: EcoNewsService
  ) {}

  ngOnInit() {
    this.onResize();
    this.setDefaultNumberOfNews(12);
    this.checkUserSingIn();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.scroll = false;
    this.setLocalizedTags();
    this.localStorageService.setCurentPage('previousPage', '/news');

    this.econews$.subscribe((value: IEcoNewsState) => {
      this.page = value.pageNumber;
      if (value.ecoNews) {
        this.elements = [...value.pages];
        const data = value.ecoNews;
        this.hasNext = data.hasNext;
        this.remaining =
          Math.abs(data.totalElements - value.countOfEcoNews) > 0 && value.countOfEcoNews !== 0 ? value.countOfEcoNews : data.totalElements;
        this.elementsArePresent = this.elements.length < data.totalElements;
      }
      this.loading = false;
    });

    this.searchNewsControl.valueChanges.subscribe((value) => {
      this.searchQuery = value.trim();
      this.dispatchStore(true);
    });
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
    if (!this.elements.length) {
      return;
    }
    this.dispatchStore(false);
  }

  changeView(event: boolean): void {
    this.view = event;
  }

  getFilterData(value: Array<string>): void {
    if (this.tagsList !== value) {
      this.tagsList = value;
    }
    this.dispatchStore(true);
  }

  cancelSearch(): void {
    if (this.searchNewsControl.value.trim() === '') {
      this.isSearchVisible = false;
    } else {
      this.searchNewsControl.setValue('');
    }
  }

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
  }

  private checkAuthentication(): Observable<boolean> {
    if (!this.userId) {
      this.openAuthModalWindow('sign-in');
      return this.dialogRef.afterClosed().pipe(
        take(1),
        map((result) => !!result)
      );
    }
    return of(true);
  }

  changeFavoriteStatus(event: Event, data: EcoNewsModel) {
    event.preventDefault();
    event.stopPropagation();

    this.checkAuthentication();

    const action = ChangeEcoNewsFavoriteStatusAction({ id: data.id, favorite: !data.favorite, isFavoritesPage: this.bookmarkSelected });
    this.store.dispatch(action);
  }

  openAuthModalWindow(page: string): void {
    this.dialogRef = this.dialog.open(AuthModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {
        popUpName: page
      }
    });
  }

  showSelectedNews(): void {
    this.checkAuthentication();
    this.bookmarkSelected = !this.bookmarkSelected;
    this.dispatchStore(true);
  }

  dispatchStore(res: boolean): void {
    if (res) {
      this.hasNext = true;
      this.page = 0;
      this.elements = [];
      this.noNewsMatch = false;
      this.newsTotal = 0;
    }

    if (!this.hasNext || this.loading) {
      console.log(this.hasNext, this.loading);
      return;
    }

    this.loading = true;
    const params = this.ecoNewsService.getNewsHttpParams({
      page: this.page,
      size: this.numberOfNews,
      title: this.searchQuery,
      favorite: this.bookmarkSelected,
      userId: this.userId,
      tags: this.tagsList
    });

    const action = GetEcoNewsAction({ params, reset: res });
    this.store.dispatch(action);
  }

  private checkUserSingIn(): void {
    this.userOwnAuthService.credentialDataSubject.subscribe((data) => {
      this.isLoggedIn = data?.userId;
      this.userId = data.userId;
    });
  }

  private setDefaultNumberOfNews(quantity: number): void {
    this.numberOfNews = quantity;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
