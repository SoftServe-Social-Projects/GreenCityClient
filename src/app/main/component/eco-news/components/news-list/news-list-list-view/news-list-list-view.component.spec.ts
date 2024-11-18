import { Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { NewsListListViewComponent } from './news-list-list-view.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Language } from 'src/app/main/i18n/Language';
import { BehaviorSubject } from 'rxjs';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { FIRSTECONEWS } from 'src/app/main/component/eco-news/mocks/eco-news-mock';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

class MockRenderer {
  addClass(document: string, cssClass: string): boolean {
    return true;
  }
}

describe('NewsListListViewComponent', () => {
  let component: NewsListListViewComponent;
  let fixture: ComponentFixture<NewsListListViewComponent>;
  let router: Router;
  const defaultImagePath =
    'https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg';

  const localStorageServiceMock = jasmine.createSpyObj('localStorageService', ['getCurrentLanguage', 'languageBehaviourSubject']);
  localStorageServiceMock.getCurrentLanguage = () => 'en' as Language;
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('en');

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue']);
  languageServiceMock.getLangValue.and.returnValue(['fakeValue']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule],
      declarations: [NewsListListViewComponent],
      providers: [
        { provide: Renderer2, useClass: MockRenderer },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsListListViewComponent);
    component = fixture.componentInstance;
    component.ecoNewsModel = FIRSTECONEWS;
    router = TestBed.inject(Router);
    component.profileIcons.newsDefaultPictureList = defaultImagePath;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set value from lang service', () => {
    languageServiceMock.getLangValue.and.returnValue(['first tag', 'second tag']);
    component.ngOnInit();
    expect(component.currentLang).toBe('en');
    expect(component.tags).toEqual(['first tag', 'second tag']);
  });

  it('should get default image', () => {
    FIRSTECONEWS.imagePath = ' ';
    component.ecoNewsModel = FIRSTECONEWS;
    component.checkNewsImage();
    expect(component.newsImage).toBe(defaultImagePath);
  });

  it('should navigate to news route', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.ecoNewsModel = {
      id: 123,
      author: { id: 1, name: 'Author Name' },
      content: 'News content',
      countComments: 5,
      creationDate: '2024-02-22',
      imagePath: 'path/to/image',
      likes: 10,
      shortInfo: 'Short info',
      source: 'News source',
      tags: ['tag1', 'tag2'],
      tagsEn: ['tag1', 'tag2'],
      tagsUa: ['tag1', 'tag2'],
      title: 'News Title'
    };

    component.routeToNews();

    expect(navigateSpy).toHaveBeenCalledWith(['/news', 123]);
  });
});
