import { Language } from './../../../../../i18n/Language';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';
import { environment } from '@environment/environment';
import { FactOfTheDay } from '@global-user/models/factOfTheDay';

describe('ProfileService', () => {
  const backUserLink = environment.backendUserLink;
  const backLink = environment.backendLink;
  let profileService: ProfileService;
  let httpMock: HttpTestingController;

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', ['userIdBehaviourSubject']);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);

  const languageServiceMock: LanguageService = jasmine.createSpyObj('LanguageService', ['getCurrentLanguage']);
  languageServiceMock.getCurrentLanguage = () => 'en' as Language;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProfileService,
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    });
    profileService = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const service: ProfileService = TestBed.inject(ProfileService);
    expect(service).toBeTruthy();
  });

  it('should set user id', () => {
    let userId = null;
    (profileService as any).localStorageService.userIdBehaviourSubject.subscribe((id) => (userId = id));
    expect(userId).toBe(1111);
  });

  describe('test for method which get facts for today', () => {
    it('should return fact of the day', () => {
      const fact: FactOfTheDay = {
        id: 1,
        factOfTheDayTranslations: [
          {
            languageCode: 'ua',
            content: 'Приклад факту дня'
          },
          {
            languageCode: 'en',
            content: 'Sample fact of the day'
          }
        ]
      };
      profileService.getRandomFactOfTheDay('').subscribe((info) => {
        expect(info.factOfTheDayTranslations[0].content).toBe('Приклад факту дня');
      });

      const req = httpMock.expectOne(`${backLink}fact-of-the-day/random`);
      expect(req.request.method).toBe('GET');
      req.flush(fact);
    });
  });

  describe('test for method which get info about user', () => {
    it('should return user info', () => {
      const userInfo = {
        city: 'Lviv',
        firstName: 'Anton',
        userCredo: 'Eco',
        profilePicturePath: 'somepath',
        rating: 1999,
        showEcoPlace: true,
        showLocation: false,
        showToDoList: true,
        socialNetworks: []
      };

      profileService.getUserInfo().subscribe((info) => {
        expect(info.rating).toBe(1999);
      });

      const req = httpMock.expectOne(`${backUserLink}user/1111/profile/`);
      expect(req.request.method).toBe('GET');
      req.flush(userInfo);
    });
  });

  describe('test for method which get statistics about user profile', () => {
    it('should return user profile statistics', () => {
      const stat = {
        amountHabitsInProgress: 2,
        amountHabitsAcquired: 1,
        amountPublishedNews: 7
      };

      profileService.getUserProfileStatistics().subscribe((info) => {
        expect(info.amountHabitsAcquired).toBe(1);
      });

      const req = httpMock.expectOne(`${backUserLink}user/1111/profileStatistics/`);
      expect(req.request.method).toBe('GET');
      req.flush(stat);
    });
  });

  describe('test for method which get user eco-places', () => {
    it('should return eco-places', () => {
      const places = [
        {
          placeId: 1,
          name: 'string'
        },
        {
          placeId: 2,
          name: 'string2'
        }
      ];

      profileService.getEcoPlaces().subscribe((info) => {
        expect(info.length).toBe(2);
      });

      const req = httpMock.expectOne(`${backLink}favorite_place/`);
      expect(req.request.method).toBe('GET');
      req.flush(places);
    });
  });

  describe('social media recognition test', () => {
    it('should return the default icon when the social network is not provided or invalid', () => {
      expect(profileService.getSocialImage('')).toBe(profileService.icons.defaultIcon);
      expect(profileService.getSocialImage('https://')).toBe(profileService.icons.defaultIcon);
      expect(profileService.getSocialImage('https://someMedia.com')).toBe(profileService.icons.defaultIcon);
      expect(profileService.getSocialImage('https://test?test=twitter')).toBe(profileService.icons.defaultIcon);
      expect(profileService.getSocialImage('https://test?testfacebook')).toBe(profileService.icons.defaultIcon);
      expect(profileService.getSocialImage('https://test?testx')).toBe(profileService.icons.defaultIcon);
      expect(profileService.getSocialImage('https://test?test.com&=youtube')).toBe(profileService.icons.defaultIcon);
      expect(profileService.getSocialImage('https://test/linkedin')).toBe(profileService.icons.defaultIcon);
    });

    it('should return the facebook icon when the url belongs to facebook', () => {
      expect(profileService.getSocialImage('https://facebook.com')).toBe(profileService.socialMedia.facebook);
      expect(profileService.getSocialImage('https://facebook.com/twitter')).toBe(profileService.socialMedia.facebook);
      expect(profileService.getSocialImage('https://facebook.com?test=youtube&val=instagram')).toBe(profileService.socialMedia.facebook);
    });

    it('should return the linkedin icon when the url belongs to linkedin', () => {
      expect(profileService.getSocialImage('https://linkedin.com')).toBe(profileService.socialMedia.linkedin);
      expect(profileService.getSocialImage('https://linkedin.com/twitter')).toBe(profileService.socialMedia.linkedin);
      expect(profileService.getSocialImage('https://linkedin.com?test=youtube&val=instagram')).toBe(profileService.socialMedia.linkedin);
    });

    it('should return the instagram icon when the url belongs to instagram', () => {
      expect(profileService.getSocialImage('https://instagram.com')).toBe(profileService.socialMedia.instagram);
      expect(profileService.getSocialImage('https://instagram.com/twitter')).toBe(profileService.socialMedia.instagram);
      expect(profileService.getSocialImage('https://instagram.com?test=youtube&val=linkedin')).toBe(profileService.socialMedia.instagram);
    });

    it('should return the twitter icon when the url belongs to twitter', () => {
      expect(profileService.getSocialImage('https://twitter.com')).toBe(profileService.socialMedia.twitter);
      expect(profileService.getSocialImage('https://twitter.com/facebook')).toBe(profileService.socialMedia.twitter);
      expect(profileService.getSocialImage('https://twitter.com?test=youtube&val=linkedin')).toBe(profileService.socialMedia.twitter);
      expect(profileService.getSocialImage('https://x.com')).toBe(profileService.socialMedia.twitter);
      expect(profileService.getSocialImage('https://x.com/facebook')).toBe(profileService.socialMedia.twitter);
      expect(profileService.getSocialImage('https://x.com?test=youtube&val=instagram')).toBe(profileService.socialMedia.twitter);
    });

    it('should youtube the instagram icon when the url belongs to youtube', () => {
      expect(profileService.getSocialImage('https://www.youtube.com')).toBe(profileService.socialMedia.youtube);
      expect(profileService.getSocialImage('https://www.youtube.com/twitter')).toBe(profileService.socialMedia.youtube);
      expect(profileService.getSocialImage('https://www.youtube.com?test=instagram&val=linkedin')).toBe(profileService.socialMedia.youtube);
    });
  });
});
