import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EcoNewsDetailComponent } from './eco-news-detail.component';
import { EcoNewsWidgetComponent } from './eco-news-widget/eco-news-widget.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform, Sanitizer } from '@angular/core';
import { DateLocalisationPipe } from '@pipe/date-localisation-pipe/date-localisation.pipe';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import { SafeHtmlPipe } from '@pipe/safe-html-pipe/safe-html.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Language } from '../../../../i18n/Language';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { FIRSTECONEWS } from '../../mocks/eco-news-mock';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { singleNewsImages } from '../../../../image-pathes/single-news-images';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { MetaService } from 'src/app/shared/services/meta/meta.service';

@Pipe({ name: 'translate' })
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('EcoNewsDetailComponent', () => {
  let component: EcoNewsDetailComponent;
  let fixture: ComponentFixture<EcoNewsDetailComponent>;
  let route: ActivatedRoute;

  const defaultImagePath =
    'https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg';

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  storeMock.select = () => of({ pages: [FIRSTECONEWS], authorNews: [{ id: 4 }] });
  const sanitaizerMock = jasmine.createSpyObj('sanitaizer', ['bypassSecurityTrustHtml']);
  const fakeElement = document.createElement('div') as SafeHtml;
  sanitaizerMock.bypassSecurityTrustHtml.and.returnValue(fakeElement);

  const backLink = jasmine.createSpyObj('localStorageService', ['getCurrentLanguage', 'getPreviousPage']);
  backLink.getCurrentLanguage = () => 'en' as Language;
  backLink.getPreviousPage = () => '/profile';
  backLink.userIdBehaviourSubject = new BehaviorSubject(4);
  backLink.languageSubject = of('ua');

  const ecoNewsServ = jasmine.createSpyObj('ecoNewsService', ['getEcoNewsById', 'postToggleLike', 'getIsLikedByUser']);
  ecoNewsServ.getEcoNewsById.and.returnValue(of(FIRSTECONEWS));
  ecoNewsServ.postToggleLike.and.returnValue(of({}));
  ecoNewsServ.getIsLikedByUser.and.returnValue(of(true));

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue']);
  languageServiceMock.getLangValue.and.returnValue(['Events', 'Education']);
  const metaServiceMock = jasmine.createSpyObj('MetaService', ['setMeta']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EcoNewsDetailComponent, EcoNewsWidgetComponent, TranslatePipeMock, DateLocalisationPipe, SafeHtmlPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule, HttpClientTestingModule, TranslateModule.forRoot(), MatDialogModule],
      providers: [
        MatDialog,
        { provide: Store, useValue: storeMock },
        { provide: EcoNewsService, useValue: ecoNewsServ },
        Sanitizer,
        { provide: DomSanitizer, useValue: sanitaizerMock },
        { provide: LocalStorageService, useValue: backLink },
        { provide: LanguageService, useValue: languageServiceMock },
        { provide: MatSnackBarComponent, useValue: { openSnackBar: jasmine.createSpy('openSnackBar') } },
        { provide: MetaService, useValue: metaServiceMock }
      ]
    }).compileComponents();

    route = TestBed.inject(ActivatedRoute);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcoNewsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.backRoute = '/news';
    component.newsItem = { ...FIRSTECONEWS, likes: 1 };
    component.newsId = 3;
    (component as any).newsImage = ' ';
    component.tags = component.getAllTags();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit newsId null should not call getEcoNewsById method', () => {
    const spy = spyOn(component, 'getEcoNewsById');

    component.newsId = null;
    component.ngOnInit();
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('getEcoNewsById should get newsItem by id', () => {
    component.newsItem = null;
    component.getEcoNewsById(component.newsId);
    expect(component.newsItem).toEqual(FIRSTECONEWS);
  });

  it('should set backRoute', () => {
    component.backRoute = backLink.getPreviousPage();
    expect(component.backRoute).toEqual('/profile');
  });

  it('getAllTags should return array of tags', () => {
    component.currentLang = 'en';
    languageServiceMock.getLangValue.and.returnValue(['Events', 'Education']);
    component.newsItem.tags = ['Events', 'Education'];
    expect(component.getAllTags()).toEqual(['Events', 'Education']);
  });

  it('getAllTags should return array of ua tags', () => {
    languageServiceMock.getLangValue.and.returnValue(['Події', 'Освіта']);
    component.newsItem.tagsUa = ['Події', 'Освіта'];
    expect(component.getAllTags()).toEqual(['Події', 'Освіта']);
  });

  it('should return all tags from news item', () => {
    const tagsUa = ['Події', 'Освіта'];
    const tags = ['Events', 'Education'];
    component.newsItem = FIRSTECONEWS;
    component.getAllTags();
    expect(languageServiceMock.getLangValue).toHaveBeenCalledWith(tagsUa, tags);
  });

  it('should set newsImage if we have imagePath to default image', () => {
    component.newsItem.imagePath = defaultImagePath;
    component.checkNewsImage();
    expect((component as any).newsImage).toBe(defaultImagePath);
  });

  it('should set newsImage if imagePath not exist to default image', () => {
    component.newsItem.imagePath = ' ';
    (component as any).images.largeImage = 'assets/img/icon/econews/news-default-large.png';
    component.checkNewsImage();
    expect((component as any).newsImage).toBe('assets/img/icon/econews/news-default-large.png');
  });

  it('checkNewsImage should return news image src', () => {
    component.newsItem.imagePath = defaultImagePath;
    expect(component.checkNewsImage()).toBe((component as any).newsImage);
  });

  it('should return FB social share link and call open method', () => {
    const spy = spyOn(window, 'open');
    component.onSocialShareLinkClick('fb');
    expect(spy).toHaveBeenCalledWith(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank');
  });

  it('should return linkedin social share link and call open method', () => {
    const spy = spyOn(window, 'open');
    component.onSocialShareLinkClick('linkedin');
    expect(spy).toHaveBeenCalledWith(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank');
  });

  it('should return twitter social share link and call open method', () => {
    const spy = spyOn(window, 'open');
    component.onSocialShareLinkClick('twitter');
    expect(spy).toHaveBeenCalledWith(
      `https://twitter.com/share?url=${window.location.href}&text=${FIRSTECONEWS.title}&hashtags=${component.tags.join(',')}`,
      '_blank'
    );
  });

  it('should retrieve news by ID and set tags', () => {
    const id = 3;
    component.getEcoNewsById(id);

    expect(ecoNewsServ.getEcoNewsById).toHaveBeenCalledWith(id);
    expect(component.newsItem).toEqual(FIRSTECONEWS);
  });

  it('should return imagePath if it is not empty', () => {
    const imagePath = 'https://example.com/image.jpg';
    component.newsItem.imagePath = imagePath;
    const result = component.checkNewsImage();
    expect(result).toBe(imagePath);
  });

  it('should call getEcoNewsById and set newsItem correctly', () => {
    const newsId = 123;
    component.getEcoNewsById(newsId);
    expect(ecoNewsServ.getEcoNewsById).toHaveBeenCalledWith(newsId);
    expect(component.newsItem).toEqual(FIRSTECONEWS);
  });

  it('should return correct image path from checkNewsImage', () => {
    component.newsItem.imagePath = 'image-path.jpg';
    const result = component.checkNewsImage();
    expect(result).toBe('image-path.jpg');
  });

  it('should return default image path when image path is empty', () => {
    component.newsItem.imagePath = ' ';
    component.images = singleNewsImages;
    const result = component.checkNewsImage();
    expect(result).toBe('assets/img/icon/econews/news-default-large.png');
  });
});
