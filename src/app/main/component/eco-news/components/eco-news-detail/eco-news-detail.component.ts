import { singleNewsImages } from '../../../../image-pathes/single-news-images';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { take, takeUntil } from 'rxjs/operators';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogPopUpComponent } from 'src/app/shared/dialog-pop-up/dialog-pop-up.component';
import { Store } from '@ngrx/store';
import { DeleteEcoNewsAction } from 'src/app/store/actions/ecoNews.actions';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { MetaService } from 'src/app/shared/services/meta/meta.service';

@Component({
  selector: 'app-eco-news-detail',
  templateUrl: './eco-news-detail.component.html',
  styleUrls: ['./eco-news-detail.component.scss']
})
export class EcoNewsDetailComponent implements OnInit, OnDestroy {
  newsItem: EcoNewsModel;
  images = singleNewsImages;
  userId: number;
  isLiked: boolean;
  tags: Array<string>;
  currentLang: string;
  likesType = {
    like: 'assets/img/comments/like.png',
    liked: 'assets/img/comments/liked.png'
  };

  newsId: number;
  private newsImage: string;
  private destroy: Subject<boolean> = new Subject<boolean>();

  backRoute: string;
  routedFromProfile: boolean;
  private deleteDialogData = {
    popupTitle: 'homepage.eco-news.news-delete-popup.delete-title',
    popupConfirm: 'homepage.eco-news.news-delete-popup.delete-yes',
    popupCancel: 'homepage.eco-news.news-delete-popup.delete-no',
    style: 'red'
  };
  private isPosting: boolean;

  constructor(
    private route: ActivatedRoute,
    private ecoNewsService: EcoNewsService,
    private localStorageService: LocalStorageService,
    private langService: LanguageService,
    private snackBar: MatSnackBarComponent,
    private dialog: MatDialog,
    private store: Store,
    private readonly router: Router,
    private readonly metaService: MetaService
  ) {}

  ngOnInit() {
    this.getUserId();
    this.setNewsId();
    if (this.userId) {
      this.getIsLiked();
    }
    if (this.newsId) {
      this.getEcoNewsById(this.newsId);
    }
    this.routedFromProfile = this.localStorageService.getPreviousPage() === '/profile';
    this.backRoute = this.localStorageService.getPreviousPage();
    this.currentLang = this.localStorageService.getCurrentLanguage();
    this.localStorageService.languageSubject.pipe(takeUntil(this.destroy)).subscribe((lang: string) => {
      this.currentLang = lang;
      this.tags = this.getAllTags();
    });
  }

  getEcoNewsById(id: number): void {
    this.ecoNewsService.getEcoNewsById(id).subscribe({
      next: (res: EcoNewsModel) => {
        if (res) {
          this.newsItem = res;
          this.tags = this.getAllTags();
          this.metaService.setMeta('oneNewsArticle', { title: res.title });
        } else {
          this.snackBar.openSnackBar('errorNotFound');
          this.router.navigate(['/news']);
        }
      },
      error: () => {
        this.snackBar.openSnackBar('errorNotFound');
        this.router.navigate(['/news']);
      }
    });
  }

  getAllTags(): Array<string> {
    const tagsUa = this.newsItem?.tagsUa || [];
    const tags = this.newsItem?.tags || [];
    return this.langService.getLangValue(tagsUa, tags);
  }

  checkNewsImage(): string {
    this.newsImage = this.newsItem.imagePath && this.newsItem.imagePath !== ' ' ? this.newsItem.imagePath : this.images.largeImage;
    return this.newsImage;
  }

  getUserId(): void {
    this.localStorageService.userIdBehaviourSubject.subscribe((id) => (this.userId = id));
  }

  onSocialShareLinkClick(type: string): void {
    const data = this.shareLinks();
    window.open(data[type](), '_blank');
  }

  onLikeNews(): void {
    const updatedLikes = this.isLiked ? this.newsItem.likes - 1 : this.newsItem.likes + 1;
    this.isLiked = !this.isLiked;
    this.postToggleLike(updatedLikes);
  }

  private postToggleLike(updatedLikes: number): void {
    let isPermit = false;
    this.ecoNewsService
      .postToggleLike(this.newsId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          isPermit = true;
          this.newsItem.likes = updatedLikes;
        },
        complete: () => {
          if (!isPermit) {
            this.snackBar.openSnackBar('errorLiked');
            this.isLiked = !this.isLiked;
          }
        }
      });
  }

  private shareLinks() {
    const currentPage: string = window.location.href.replace('#', '%23');
    return {
      fb: () => `https://www.facebook.com/sharer/sharer.php?u=${currentPage}`,
      linkedin: () => `https://www.linkedin.com/sharing/share-offsite/?url=${currentPage}`,
      twitter: () => `https://twitter.com/share?url=${currentPage}&text=${this.newsItem.title}&hashtags=${this.tags.join(',')}`
    };
  }

  private setNewsId(): void {
    this.newsId = this.route.snapshot.params.id;
  }

  private getIsLiked(): void {
    this.ecoNewsService
      .getIsLikedByUser(this.newsId, this.userId)
      .pipe(take(1))
      .subscribe((val: boolean) => {
        this.isLiked = val;
      });
  }

  deleteNews(): void {
    const matDialogRef = this.dialog.open(DialogPopUpComponent, {
      data: this.deleteDialogData,
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: '',
      width: '300px'
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res) {
          this.store.dispatch(DeleteEcoNewsAction({ id: this.newsId }));
          this.isPosting = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
