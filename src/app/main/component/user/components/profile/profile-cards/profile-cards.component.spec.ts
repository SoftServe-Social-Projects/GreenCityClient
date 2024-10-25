import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ProfileService } from '@global-user/components/profile/profile-service/profile.service';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfileCardsComponent } from '@global-user/components';
import { FactOfTheDay } from '@global-user/models/factOfTheDay';
import { ProfileStatistics } from '@global-user/models/profile-statistiscs';
import { TranslateModule } from '@ngx-translate/core';

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
  const factOfTheDayMock: FactOfTheDay = { id: 1, content: 'Hello' };
  const profileStatisticsMock: ProfileStatistics = {
    amountHabitsInProgress: 1,
    amountHabitsAcquired: 0,
    amountPublishedNews: 0,
    amountOrganizedAndAttendedEvents: 0
  };

  beforeEach(waitForAsync(() => {
    profileServiceMock = jasmine.createSpyObj('ProfileService', [
      'getRandomFactOfTheDay',
      'getUserProfileStatistics',
      'getFactsOfTheDayByTags'
    ]);

    profileServiceMock.getRandomFactOfTheDay.and.returnValue(of(factOfTheDayMock));
    profileServiceMock.getUserProfileStatistics.and.returnValue(of(profileStatisticsMock));
    profileServiceMock.getFactsOfTheDayByTags.and.returnValue(of(factOfTheDayMock));

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
        { provide: LocalStorageService, useValue: localStorageServiceMock }
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
    const mockFact = { content: 'Test Fact' } as FactOfTheDay;
    const mockHabitFact = { content: 'Habit Fact' } as FactOfTheDay;

    localStorageServiceMock.getFactFromLocalStorage.and.callFake((key) => {
      return key === component.factKey ? mockFact : mockHabitFact;
    });

    component.loadFactsFromLocalStorage();

    expect(component.factOfTheDay).toEqual(mockFact);
    expect(component.habitFactOfTheDay).toEqual(mockHabitFact);
    expect(localStorageServiceMock.getFactFromLocalStorage).toHaveBeenCalledWith(component.factKey);
    expect(localStorageServiceMock.getFactFromLocalStorage).toHaveBeenCalledWith(component.habitFactKey);
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
