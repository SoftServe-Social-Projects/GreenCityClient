import { SharedMainModule } from '@shared/shared-main.module';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NewsListListViewComponent } from './news-list-list-view/news-list-list-view.component';
import { NewsListGalleryViewComponent } from 'src/app/shared/news-list-gallery-view/news-list-gallery-view.component';
import { ChangeViewButtonComponent } from './change-view-button/change-view-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewsListComponent } from './news-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { RemainingCountComponent } from '../remaining-count/remaining-count.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Store } from '@ngrx/store';
import { Language } from '../../../../i18n/Language';
import { MatDialog } from '@angular/material/dialog';
import { ChangeEcoNewsFavoriteStatusAction } from 'src/app/store/actions/ecoNews.actions';

describe('NewsListComponent', () => {
  let component: NewsListComponent;
  let fixture: ComponentFixture<NewsListComponent>;

  const ecoNewsServiceMock: EcoNewsService = jasmine.createSpyObj('EcoNewsService', [
    'getAllPresentTags',
    'getNewsListByTags',
    'getEcoNewsListByPage'
  ]);

  ecoNewsServiceMock.getEcoNewsListByPage = () => new Observable();

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', [
    'userIdBehaviourSubject',
    'languageBehaviourSubject',
    'setCurentPage',
    'getCurrentLanguage'
  ]);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('en');
  localStorageServiceMock.getCurrentLanguage = () => 'en' as Language;

  const userOwnAuthServiceMock: UserOwnAuthService = jasmine.createSpyObj('UserOwnAuthService', ['getDataFromLocalStorage']);
  userOwnAuthServiceMock.getDataFromLocalStorage = () => true;
  userOwnAuthServiceMock.credentialDataSubject = new Subject();
  userOwnAuthServiceMock.isLoginUserSubject = new BehaviorSubject(true);

  const newsMock = {
    countComments: 5,
    id: 13578,
    imagePath: null,
    title: '',
    text: '',
    content: '',
    shortInfo: '',
    tags: ['News', 'Events'],
    tagsEn: ['News'],
    tagsUa: ['Новини'],
    creationDate: '2021-11-25T22:32:30.555088+02:00',
    likes: 0,
    source: '',
    author: { id: 312, name: 'taqcTestName' }
  };

  const matDialogRefMock = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(true))
  };

  const matDialogMock = {
    open: jasmine.createSpy('open').and.returnValue(matDialogRefMock)
  };

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  storeMock.select = () => of({ ecoNews: {}, pages: [], pageNumber: 1, error: 'error' });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        NewsListComponent,
        ChangeViewButtonComponent,
        NewsListGalleryViewComponent,
        NewsListListViewComponent,
        RemainingCountComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        SharedMainModule,
        SharedModule,
        InfiniteScrollModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: EcoNewsService, useValue: ecoNewsServiceMock },
        { provide: UserOwnAuthService, useValue: userOwnAuthServiceMock },
        { provide: Store, useValue: storeMock },
        { provide: MatDialog, useValue: matDialogMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    storeMock.dispatch.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add elements to current list if scroll', () => {
    spyOn(component, 'dispatchStore');
    component.onScroll();
    expect(component.dispatchStore).toHaveBeenCalledTimes(0);
  });

  it('should dispatch store action on scroll when elements are present', () => {
    component.elements = [newsMock, { ...newsMock, id: 2 }];

    spyOn(component, 'dispatchStore');
    component.onScroll();
    expect(component.dispatchStore).toHaveBeenCalledWith(false);
    expect(component.dispatchStore).toHaveBeenCalledTimes(1);
  });

  it('should change view', () => {
    component.changeView(true);
    expect(component.view).toBeTruthy();
  });

  it('should check if user logged in', () => {
    let userID = null;

    (component as any).userOwnAuthService.isLoginUserSubject.subscribe((id) => (userID = id));
    expect(userID).toBeDefined();
  });

  it('should filter data', () => {
    spyOn(component, 'getFilterData');
    component.getFilterData(['News']);
    expect(component.getFilterData).toHaveBeenCalledWith(['News']);
  });

  it('should cancel search correctly', () => {
    component.searchNewsControl.setValue('test');
    component.cancelSearch();
    expect(component.searchNewsControl.value).toBe('');
  });

  it('should toggle search state', () => {
    component.isSearchVisible = false;
    component.toggleSearch();
    expect(component.isSearchVisible).toBeTrue();
  });

  it('should change favorite status when user is logged in', () => {
    const event = new MouseEvent('click');
    const data = { ...newsMock, favorite: false };
    component.userId = 1;

    component.changeFavoriteStatus(event, data);

    const expectedAction = ChangeEcoNewsFavoriteStatusAction({
      id: data.id,
      favorite: true,
      isFavoritesPage: component.bookmarkSelected
    });

    expect(storeMock.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should toggle bookmarked news display', () => {
    component.userId = 1;
    component.bookmarkSelected = false;
    component.showSelectedNews();
    expect(component.bookmarkSelected).toBeTrue();
  });
});
