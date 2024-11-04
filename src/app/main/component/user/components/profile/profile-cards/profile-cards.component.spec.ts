import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { BehaviorSubject, of } from 'rxjs';
import { ProfileService } from '@global-user/components/profile/profile-service/profile.service';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfileCardsComponent } from '@global-user/components';
import { FactOfTheDay } from '@global-user/models/factOfTheDay';
import { ProfileStatistics } from '@global-user/models/profile-statistiscs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/main/i18n/language.service';

describe('ProfileCardsComponent', () => {
  let component: ProfileCardsComponent;
  let fixture: ComponentFixture<ProfileCardsComponent>;
  let profileServiceMock: jasmine.SpyObj<ProfileService>;
  let localStorageServiceMock: jasmine.SpyObj<LocalStorageService>;
  let languageSubject: BehaviorSubject<string>;

  const mockProfileStats = {
    amountHabitsInProgress: 2,
    amountHabitsAcquired: 0,
    amountPublishedNews: 0,
    amountOrganizedAndAttendedEvents: 0
  };

  const profileStatisticsMock: ProfileStatistics = {
    amountHabitsInProgress: 1,
    amountHabitsAcquired: 0,
    amountPublishedNews: 0,
    amountOrganizedAndAttendedEvents: 0
  };

  const factOfTheDayMock: FactOfTheDay = {
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

  const languageServiceMock = {
    getCurrentLanguage: jasmine.createSpy('getCurrentLanguage').and.returnValue('en'),
    getCurrentLangObs: jasmine.createSpy('getCurrentLangObs').and.returnValue(of('en'))
  };

  beforeEach(waitForAsync(() => {
    profileServiceMock = jasmine.createSpyObj('ProfileService', ['getRandomFactOfTheDay', 'getUserProfileStatistics']);

    profileServiceMock.getRandomFactOfTheDay.and.returnValue(of(factOfTheDayMock));
    profileServiceMock.getUserProfileStatistics.and.returnValue(of(profileStatisticsMock));

    localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', [
      'getFactFromLocalStorage',
      'clearFromLocalStorage',
      'saveFactToLocalStorage'
    ]);

    languageSubject = new BehaviorSubject<string>('ua');
    localStorageServiceMock.languageBehaviourSubject = languageSubject;

    TestBed.configureTestingModule({
      declarations: [ProfileCardsComponent],
      imports: [HttpClientModule, TranslateModule.forRoot()],
      providers: [
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileCardsComponent);
    component = fixture.componentInstance;
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load facts from local storage', () => {
    const mockFact: FactOfTheDay = {
      id: 1,
      factOfTheDayTranslations: [{ content: 'Test Fact', languageCode: 'en' }]
    };

    const mockHabitFact: FactOfTheDay = {
      id: 2,
      factOfTheDayTranslations: [{ content: 'Habit Fact', languageCode: 'en' }]
    };

    localStorageServiceMock.getFactFromLocalStorage.and.callFake((key: string) => {
      return key === component.factKey ? mockFact : mockHabitFact;
    });

    component.loadFactsFromLocalStorage();

    expect(localStorageServiceMock.getFactFromLocalStorage).toHaveBeenCalledWith(component.factKey);
    expect(localStorageServiceMock.getFactFromLocalStorage).toHaveBeenCalledWith(component.habitFactKey);
  });

  it('should return the content for the current language from local storage', () => {
    const factKey = 'factOfTheDay';
    const mockFact: FactOfTheDay = {
      id: 19,
      factOfTheDayTranslations: [
        { content: 'Test Fact in English', languageCode: 'en' },
        { content: 'Факт українською', languageCode: 'ua' }
      ]
    };

    const currentLang = 'ua';

    localStorageServiceMock.getFactFromLocalStorage.and.returnValue(mockFact);
    languageServiceMock.getCurrentLanguage.and.returnValue(currentLang);

    const result = component.getFactContentByLanguage(factKey);

    expect(localStorageServiceMock.getFactFromLocalStorage).toHaveBeenCalledWith(factKey);
    expect(languageServiceMock.getCurrentLanguage).toHaveBeenCalled();
    expect(result).toEqual('Факт українською');
  });

  it('should check and update facts', () => {
    profileServiceMock.getUserProfileStatistics.and.returnValue(of(mockProfileStats));
    spyOn(component, 'isMoreThanOneDayPassed').and.returnValue(true);
    spyOn(component, 'clearFacts');
    spyOn(component, 'updateFacts');

    component.checkAndUpdateFacts();

    expect(profileServiceMock.getUserProfileStatistics).toHaveBeenCalled();
    expect(component.clearFacts).toHaveBeenCalled();
    expect(component.updateFacts).toHaveBeenCalledWith(jasmine.any(Number), true);
  });

  it('should not clear facts if less than one day has passed', () => {
    profileServiceMock.getUserProfileStatistics.and.returnValue(of(mockProfileStats));
    spyOn(component, 'isMoreThanOneDayPassed').and.returnValue(false);
    spyOn(component, 'clearFacts');

    component.checkAndUpdateFacts();

    expect(component.clearFacts).not.toHaveBeenCalled();
  });

  it('should return true if lastHabitFetchTime is null', () => {
    const currentTime = Date.now();
    const oneDay = localStorageServiceMock.ONE_DAY_IN_MILLIS;

    const result = component.isMoreThanOneDayPassed(null, currentTime, oneDay);

    expect(result).toBeTrue();
  });
});
