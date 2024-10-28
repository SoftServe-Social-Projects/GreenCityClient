import { TestBed } from '@angular/core/testing';
import { MetaService } from './meta.service';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { of, Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

describe('MetaService', () => {
  let service: MetaService;
  let titleService: Title;
  let metaService: Meta;
  let translateService: TranslateService;
  let routerEvents$: Subject<any>;

  beforeEach(() => {
    const mockTitleService = { setTitle: jasmine.createSpy('setTitle') };
    const mockMetaService = { updateTag: jasmine.createSpy('updateTag') };
    const mockTranslateService = {
      get: jasmine.createSpy('get').and.callFake((key: string) => {
        const mockTranslations = {
          'meta.home.title': 'Mock Home Title',
          'meta.home.description': 'Mock Home Description',
          'meta.default.title': 'Default Title',
          'meta.default.description': 'Default Description',
          'meta.userProfile.title': 'Mock User Profile Title',
          'meta.userProfile.description': 'Mock User Profile Description'
        };
        return of(mockTranslations[key]);
      }),
      use: jasmine.createSpy('use')
    };
    const mockLanguageService = {
      getCurrentLangObs: jasmine.createSpy('getCurrentLangObs').and.returnValue(of('en'))
    };
    routerEvents$ = new Subject();
    const mockRouter = {
      events: routerEvents$.asObservable(),
      url: '/ubs-user/profile',
      parseUrl: jasmine.createSpy('parseUrl').and.returnValue({
        root: { children: { primary: { segments: [{ path: 'ubs-user' }, { path: 'profile' }] } } }
      })
    };

    TestBed.configureTestingModule({
      providers: [
        MetaService,
        { provide: Title, useValue: mockTitleService },
        { provide: Meta, useValue: mockMetaService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(MetaService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    translateService = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set meta tags for a specific pageKey', () => {
    service.setMeta('home');
    expect(translateService.get).toHaveBeenCalledWith('meta.home.title');
    expect(translateService.get).toHaveBeenCalledWith('meta.home.description');
    expect(titleService.setTitle).toHaveBeenCalledWith('Mock Home Title');
    expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Mock Home Description' });
  });

  it('should update language when language changes', () => {
    service.setMeta('home'); // Set initial meta
    expect(translateService.use).toHaveBeenCalledWith('en');

    service.setMeta('home');
    expect(translateService.get).toHaveBeenCalledWith('meta.home.title');
    expect(translateService.get).toHaveBeenCalledWith('meta.home.description');
    expect(titleService.setTitle).toHaveBeenCalledWith('Mock Home Title');
    expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Mock Home Description' });
  });

  it('should reset meta tags when calling resetMeta()', () => {
    service.resetMeta();
    expect(translateService.get).toHaveBeenCalledWith('meta.default.title');
    expect(translateService.get).toHaveBeenCalledWith('meta.default.description');
    expect(titleService.setTitle).toHaveBeenCalledWith('Default Title');
    expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Default Description' });
  });

  it('should set meta on route change', () => {
    service.setMetaOnRouteChange();

    routerEvents$.next(new NavigationEnd(1, '/ubs-user/profile', '/ubs-user/profile'));

    expect(translateService.get).toHaveBeenCalledWith('meta.userProfile.title');
    expect(translateService.get).toHaveBeenCalledWith('meta.userProfile.description');

    expect(titleService.setTitle).toHaveBeenCalledWith('Mock User Profile Title');
    expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Mock User Profile Description' });
  });

  it('should replace placeholders in meta strings', () => {
    const stringWithPlaceholders = 'Welcome, {{name}}!';
    const data = { name: 'John' };

    const result = service['replacePlaceholders'](stringWithPlaceholders, data);
    expect(result).toBe('Welcome, John!');
  });

  it('should not replace placeholders if data is missing', () => {
    const stringWithPlaceholders = 'Welcome, {{name}}!';
    const data = {};

    const result = service['replacePlaceholders'](stringWithPlaceholders, data);
    expect(result).toBe('Welcome, {{name}}!');
  });
});
