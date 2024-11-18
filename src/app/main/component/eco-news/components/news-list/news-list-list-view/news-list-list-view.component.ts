import { userAssignedCardsIcons } from 'src/app/main/image-pathes/profile-icons';
import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewChecked,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnInit,
  OnDestroy
} from '@angular/core';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { TranslateService } from '@ngx-translate/core';
import { possibleDescHeight } from './breakpoints';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-news-list-list-view',
  templateUrl: './news-list-list-view.component.html',
  styleUrls: ['./news-list-list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsListListViewComponent implements AfterViewChecked, AfterViewInit, OnInit, OnDestroy {
  @Input() ecoNewsModel: EcoNewsModel;
  @Input() ecoNewsText: string;
  @ViewChild('ecoNewsText', { static: true }) text: ElementRef;
  @ViewChild('titleHeight', { static: true }) titleHeight: ElementRef;
  @ViewChild('textHeight', { static: true }) textHeight: ElementRef;

  private smallHeight = 'smallHeight';
  private bigHeight = 'bigHeight';
  profileIcons = userAssignedCardsIcons;
  newsImage: string;
  tags: Array<string>;
  currentLang: string;
  private destroy: Subject<boolean> = new Subject<boolean>();

  newDate;
  datePipe;

  constructor(
    public router: Router,
    private renderer: Renderer2,
    public translate: TranslateService,
    public localStorageService: LocalStorageService,
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

  ngAfterViewChecked() {
    this.checkHeightOfTittle();
  }

  ngAfterViewInit() {
    this.text.nativeElement.innerHTML = this.ecoNewsModel.content;
  }

  // the idea is to get the height of the header and based on it visualize the Description and Header by adding specific class names
  // another problem is that the line height and container height are different for different devices
  checkHeightOfTittle(): void {
    const titleHeightOfElement = this.titleHeight.nativeElement.offsetHeight;
    const descClass = this.getHeightOfDesc(titleHeightOfElement);

    this.renderer.addClass(this.textHeight.nativeElement, descClass);
  }

  checkNewsImage(): string {
    this.newsImage =
      this.ecoNewsModel.imagePath && this.ecoNewsModel.imagePath !== ' '
        ? this.ecoNewsModel.imagePath
        : this.profileIcons.newsDefaultPictureList;
    return this.newsImage;
  }

  routeToNews(): void {
    this.router.navigate(['/news', this.ecoNewsModel.id]);
  }

  private getHeightOfDesc(titleHeight: number): string {
    return possibleDescHeight[titleHeight];
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }
}
