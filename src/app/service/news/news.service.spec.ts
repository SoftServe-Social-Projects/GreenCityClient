import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NewsService } from './news.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../i18n/language.service';
import { NewsDto } from '@home-models/NewsDto';
import { latestNewsLink } from 'src/app/links';

fdescribe('NewsService', () => {
  let httpTestingController: HttpTestingController;
  let service: NewsService;

  const languageServiceMock = jasmine.createSpyObj('LanguageService', ['getCurrentLanguage']);
  languageServiceMock.getCurrentLanguage = () => 'en';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NewsService, { provide: LanguageService, useValue: languageServiceMock }],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()]
    }),
      (httpTestingController = TestBed.get(HttpTestingController));
    service = TestBed.get(NewsService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get data', () => {
    service.loadLatestNews().subscribe((data) => {
      expect(data[0]).toEqual(jasmine.any(NewsDto));
    });

    const req = httpTestingController.expectOne(`${latestNewsLink}?language=${languageServiceMock.getCurrentLanguage()}`);

    expect(req.cancelled).toBeFalsy();
    expect(req.request.responseType).toEqual('json');
    expect(req.request.method).toEqual('GET');
  });
});
