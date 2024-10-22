import { userAssignedCardsIcons } from '../../main/image-pathes/profile-icons';
import { Component, Input, ChangeDetectionStrategy, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-news-list-gallery-view',
  templateUrl: './news-list-gallery-view.component.html',
  styleUrls: ['./news-list-gallery-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsListGalleryViewComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() ecoNewsModel: EcoNewsModel;
  @Input() ecoNewsText;
  @ViewChild('ecoNewsText', { static: true }) text;

  profileIcons = userAssignedCardsIcons;
  newsImage: string;
  likeImg = 'assets/events-icons/like.png';
  commentImg = 'assets/events-icons/frame.png';
  tags: Array<string>;
  currentLang: string;
  private destroy: Subject<boolean> = new Subject<boolean>();

  newDate;
  datePipe;

  constructor(
    public translate: TranslateService,
    private localStorageService: LocalStorageService,
    private langService: LanguageService
  ) {}
  ngOnInit() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy)).subscribe((lang: string) => {
      this.currentLang = lang;
      this.tags = this.langService.getLangValue(this.ecoNewsModel.tagsUa, this.ecoNewsModel.tagsEn);
      this.datePipe = new DatePipe(this.currentLang);
      this.newDate = this.datePipe.transform(this.ecoNewsModel.creationDate, 'MMM dd, yyyy');
    });
  }

  checkNewsImage(): string {
    this.newsImage =
      this.ecoNewsModel.imagePath && this.ecoNewsModel.imagePath !== ' '
        ? this.ecoNewsModel.imagePath
        : this.profileIcons.newsDefaultPictureList;
    return this.newsImage;
  }

  ngAfterViewInit() {
    this.text.nativeElement.innerHTML = this.ecoNewsModel.content;
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }
}
