import { Breakpoints } from '../../../../config/breakpoints.constants';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { FilterModel } from '@shared/components/tag-filter/tag-filter.model';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { IEcoNewsState } from 'src/app/store/state/ecoNews.state';
import { GetEcoNewsByTagsAction, GetEcoNewsByPageAction, GetEcoNewsAction } from 'src/app/store/actions/ecoNews.actions';
import { tagsListEcoNewsData } from '@eco-news-models/eco-news-consts';
import { FormControl, Validators } from '@angular/forms';
import { Patterns } from '@assets/patterns/patterns';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { HttpParams } from '@angular/common/http';

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
  isLoading = false;
  private page = 0;
  noNewsMatch = false;
  searchToggle = false;
  private isRequestInFlight = false;
  searchNewsControl = new FormControl('', [Validators.maxLength(30), Validators.pattern(Patterns.NameInfoPattern)]);
  econews$ = this.store.select((state: IAppState): IEcoNewsState => state.ecoNewsState);
  searchQuery: string;

  private destroy: Subject<boolean> = new Subject<boolean>();
  private dialogRef: MatDialogRef<unknown>;

  constructor(
    private ecoNewsService: EcoNewsService,
    private userOwnAuthService: UserOwnAuthService,
    private snackBar: MatSnackBarComponent,
    private localStorageService: LocalStorageService,
    private store: Store,
    private dialog: MatDialog
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
    this.dispatchStore(true);
  }

  cancelSearch(): void {
    this.searchNewsControl.value.trim() === '' ? (this.searchToggle = false) : this.searchNewsControl.setValue('');
  }

  search(): void {
    this.searchToggle = !this.searchToggle;
  }

  changeFavoriteStatus(event: MouseEvent, data: EcoNewsModel) {
    event.preventDefault();
    event.stopPropagation();

    let isRegistered = !!this.userId;
    let isFavorite = data.favorite;

    if (!isRegistered) {
      this.openAuthModalWindow('sign-in');
      this.dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => {
          isRegistered = !!result;
          if (isRegistered) {
            this.changeFavoriteStatus(event, data);
          }
        });
    } else {
      isFavorite = !isFavorite;
      if (isFavorite) {
        this.ecoNewsService
          .addNewsToFavourites(data.id)
          .pipe(takeUntil(this.destroy))
          .subscribe({
            next: () => {
              isFavorite = true;
            },
            error: () => {
              this.snackBar.openSnackBar('error');
              isFavorite = false;
            }
          });
      } else {
        this.ecoNewsService
          .removeNewsFromFavourites(data.id)
          .pipe(takeUntil(this.destroy))
          .subscribe({
            next: () => {
              isFavorite = false;
            },
            error: () => {
              this.snackBar.openSnackBar('error');
              isFavorite = true;
            }
          });
      }
    }
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
    this.bookmarkSelected = !this.bookmarkSelected;
    this.dispatchStore(true);
  }

  private cleanNewsList(): void {
    this.isLoading = true;
    this.hasNext = true;
    this.page = 0;
    this.elements = [];
    this.noNewsMatch = false;
    this.newsTotal = 0;
  }

  dispatchStore(res: boolean): void {
    if (res) {
      this.cleanNewsList();
    }

    if (!this.hasNext || this.isRequestInFlight) {
      return;
    }

    this.isRequestInFlight = true;
    const params = this.getNewsHttpParams();

    const action = GetEcoNewsAction({ params, reset: res });
    this.store.dispatch(action);

    this.page++;
    this.isRequestInFlight = false;
  }

  private getNewsHttpParams(): HttpParams {
    let params = new HttpParams().set('page', this.page.toString()).set('size', this.numberOfNews.toString());

    const optionalParams = [
      this.appendIfNotEmpty('user-id', this.userId?.toString()),
      this.appendIfNotEmpty('title', this.searchQuery),
      this.appendIfNotEmpty('tags', this.tagsList),
      this.bookmarkSelected ? { key: 'favorite', value: this.bookmarkSelected ? 'true' : '' } : null
    ];

    optionalParams.forEach((param) => {
      if (param) {
        params = params.append(param.key, param.value);
      }
    });

    const serializedParams = params.toString();
    return new HttpParams({ fromString: serializedParams });
  }

  private appendIfNotEmpty(key: string, value: string | string[]): { key: string; value: string } | null {
    const formattedValue = Array.isArray(value) ? value.join(',') : value;
    return formattedValue && formattedValue.trim() ? { key, value: formattedValue.toUpperCase() } : null;
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
    this.destroy.next(true);
    this.destroy.complete();
  }
}
