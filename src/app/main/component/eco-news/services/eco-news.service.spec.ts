import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { BehaviorSubject } from 'rxjs';
import { environment } from '@environment/environment';
import { EcoNewsService } from './eco-news.service';
import { HttpParams } from '@angular/common/http';

describe('EcoNewsService', () => {
  let service: EcoNewsService;
  let httpTestingController: HttpTestingController;
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

  const newsDtoMock = {
    page: [newsMock],
    totalElements: 5,
    currentPage: 0,
    totalPages: 1,
    hasNext: true
  };

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', ['languageBehaviourSubject']);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('en');

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EcoNewsService, { provide: LocalStorageService, useValue: localStorageServiceMock }]
    })
  );

  beforeEach(() => {
    service = TestBed.inject(EcoNewsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return eco news list by current page', () => {
    service.getEcoNewsListByPage(0, 5).subscribe((data) => {
      expect(data).toEqual(newsDtoMock);
    });

    const req = httpTestingController.expectOne(`${environment.backendLink}eco-news?page=0&size=5`);
    expect(req.request.method).toEqual('GET');
    req.flush(newsDtoMock);
  });

  it('should return news list by id', () => {
    service.getEcoNewsById(13578).subscribe((data) => {
      expect(data).toBeDefined();
    });

    const req = httpTestingController.expectOne(`${environment.backendLink}eco-news/13578?lang=en`);
    expect(req.request.method).toEqual('GET');
  });

  it('should return recomended news list', () => {
    service.getRecommendedNews(13578).subscribe((data) => {
      expect(data).toBeDefined();
    });

    const req = httpTestingController.expectOne(`${environment.backendLink}eco-news/13578/recommended`);
    expect(req.request.method).toEqual('GET');
  });

  it('should post toggle Like', () => {
    service.postToggleLike(13578).subscribe((data) => {
      newsMock.likes = 1;
      expect(data).toBe(newsMock);
    });

    const req = httpTestingController.expectOne(`${environment.backendLink}eco-news/13578/likes`);
    expect(req.request.method).toEqual('POST');
    req.flush(newsMock);
  });

  it('should get from isLikedByUser', () => {
    const isLikedByUser = true;
    service.getIsLikedByUser(13578, 1).subscribe((data) => {
      newsMock.likes = 1;
      expect(data).toBe(isLikedByUser);
    });

    const req = httpTestingController.expectOne(`${environment.backendLink}eco-news/13578/likes/1`);
    expect(req.request.method).toEqual('GET');
    req.flush(isLikedByUser);
  });

  it('should get eco news list with custom parameters', () => {
    const params = new HttpParams().set('page', '0').set('size', '5');
    service.getEcoNewsList(params).subscribe((data) => {
      expect(data).toEqual(newsDtoMock);
    });

    const req = httpTestingController.expectOne(`${environment.backendLink}eco-news?page=0&size=5`);
    expect(req.request.method).toEqual('GET');
    req.flush(newsDtoMock);
  });

  it('should get eco news list by author ID', () => {
    const authorId = 123;
    service.getEcoNewsListByAuthorId(authorId, 0, 5).subscribe((data) => {
      expect(data).toBeDefined();
    });

    const req = httpTestingController.expectOne(`${environment.backendLink}eco-news?author-id=${authorId}&page=0&size=5`);
    expect(req.request.method).toEqual('GET');
  });

  it('should delete a news item', () => {
    const newsId = 13578;
    service.deleteNews(newsId).subscribe((data) => {
      expect(data).toBeDefined();
    });

    const req = httpTestingController.expectOne(`${environment.backendLink}eco-news/${newsId}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
  });

  it('should add news to favorites', () => {
    const newsId = 13578;
    service.addNewsToFavorites(newsId).subscribe((data) => {
      expect(data).toBeDefined();
    });

    const req = httpTestingController.expectOne(`${environment.backendLink}eco-news/${newsId}/favorites`);
    expect(req.request.method).toEqual('POST');
    req.flush({});
  });

  it('should remove news from favorites', () => {
    const newsId = 13578;
    service.removeNewsFromFavorites(newsId).subscribe((data) => {
      expect(data).toBeDefined();
    });

    const req = httpTestingController.expectOne(`${environment.backendLink}eco-news/${newsId}/favorites`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
  });
});
