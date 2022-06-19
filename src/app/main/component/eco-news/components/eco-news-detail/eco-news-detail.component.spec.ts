import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EcoNewsDetailComponent } from './eco-news-detail.component';
import { EcoNewsWidgetComponent } from './eco-news-widget/eco-news-widget.component';
import { NewsListGalleryViewComponent } from '..';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform, Sanitizer } from '@angular/core';
import { DateLocalisationPipe } from '@pipe/date-localisation-pipe/date-localisation.pipe';

import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { SafeHtmlPipe } from '@pipe/safe-html-pipe/safe-html.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Language } from '../../../../i18n/Language';

@Pipe({ name: 'translate' })
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('EcoNewsDetailComponent', () => {
  let component: EcoNewsDetailComponent;
  let fixture: ComponentFixture<EcoNewsDetailComponent>;
  let httpMock: HttpTestingController;
  let route: ActivatedRoute;
  const defaultImagePath =
    'https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg';
  const mockEcoNewsModel: EcoNewsModel = {
    id: 3,
    imagePath: defaultImagePath,
    title: 'test title',
    content: 'some description',
    author: {
      id: 777,
      name: 'John Snow'
    },
    tags: ['Events', 'Education'],
    tagsEn: ['Events', 'Education'],
    tagsUa: ['Події', 'Освіта'],
    creationDate: '2020-06-16T18:08:00.604Z',
    likes: 0,
    countComments: 2,
    shortInfo: 'info',
    source: null
  };

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  storeMock.select = () => of({ pages: [mockEcoNewsModel], autorNews: [{ id: 4 }] });
  const sanitaizerMock = jasmine.createSpyObj('sanitaizer', ['bypassSecurityTrustHtml']);
  const fakeElement = document.createElement('div') as SafeHtml;
  sanitaizerMock.bypassSecurityTrustHtml.and.returnValue(fakeElement);
  const backLink = jasmine.createSpyObj('localStorageService', ['getCurrentLanguage', 'getPreviousPage']);
  backLink.getCurrentLanguage = () => 'en' as Language;
  backLink.getPreviousPage = () => '/news';
  backLink.userIdBehaviourSubject = of(3);
  backLink.languageSubject = of('en');
  const ecoNewsServ = jasmine.createSpyObj('ecoNewsService', ['postToggleLike', 'getIsLikedByUser']);
  ecoNewsServ.postToggleLike.and.returnValue(of({}));
  ecoNewsServ.getIsLikedByUser.and.returnValue(of(true));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EcoNewsDetailComponent,
        EcoNewsWidgetComponent,
        NewsListGalleryViewComponent,
        TranslatePipeMock,
        DateLocalisationPipe,
        SafeHtmlPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: EcoNewsService, useValue: ecoNewsServ },
        Sanitizer,
        { provide: DomSanitizer, useValue: sanitaizerMock },
        { provide: LocalStorageService, useValue: backLink }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    route = TestBed.inject(ActivatedRoute);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcoNewsDetailComponent);
    component = fixture.componentInstance;
    spyOn(component, 'getAllTags').and.returnValue(['Events', 'Education']);
    fixture.detectChanges();
    component.backRoute = '/news';
    component.newsItem = mockEcoNewsModel;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should init three method and call isLiked', () => {
    (component as any).newsId = 3;

    spyOn(component as any, 'setNewsId');
    spyOn(component as any, 'getIsLiked');
    spyOn(component as any, 'canUserEditNews');
    component.userId = 3;
    component.ngOnInit();
    component.ecoNewById$.subscribe((item: any) => {
      expect(component.newsItem).toEqual(mockEcoNewsModel as any);
    });
    expect((component as any).getIsLiked).toHaveBeenCalledTimes(1);
    expect((component as any).setNewsId).toHaveBeenCalledTimes(1);
    expect((component as any).canUserEditNews).toHaveBeenCalledTimes(1);
  });

  it('ngOnInit should init two method', () => {
    (component as any).newsId = 3;
    spyOn((component as any).localStorageService, 'getPreviousPage').and.returnValue('/news');

    spyOn(component as any, 'setNewsId');
    spyOn(component as any, 'getIsLiked');
    spyOn(component as any, 'canUserEditNews');
    component.userId = null;
    component.ngOnInit();
    component.ecoNewById$.subscribe((item: any) => {
      expect(component.newsItem).toEqual(mockEcoNewsModel);
    });
    expect((component as any).getIsLiked).toHaveBeenCalledTimes(0);
    expect((component as any).setNewsId).toHaveBeenCalledTimes(1);
    expect((component as any).canUserEditNews).toHaveBeenCalledTimes(1);
  });

  it('checkNewsImage should return existing image src', () => {
    component.newsItem.imagePath = defaultImagePath;
    const imagePath = component.checkNewsImage();
    expect(imagePath).toEqual(defaultImagePath);
  });

  it('checkNewsImage should return default image src', () => {
    component.newsItem = mockEcoNewsModel;
    component.newsItem.imagePath = ' ';
    const imagePath = component.checkNewsImage();
    expect(imagePath).toEqual('assets/img/icon/econews/news-default-large.png');
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
    component.newsItem = mockEcoNewsModel;
    const spy = spyOn(window, 'open');
    component.onSocialShareLinkClick('twitter');
    expect(spy).toHaveBeenCalledWith(
      `https://twitter.com/share?url=${window.location.href}&text=${mockEcoNewsModel.title}&hashtags=${mockEcoNewsModel.tags.join(',')}`,
      '_blank'
    );
  });
});
