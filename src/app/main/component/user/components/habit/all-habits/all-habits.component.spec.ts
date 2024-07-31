import { SharedMainModule } from '@shared/shared-main.module';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { RouterTestingModule } from '@angular/router/testing';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HabitsListViewComponent } from './components/habits-list-view/habits-list-view.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { AllHabitsComponent } from './all-habits.component';
import { HabitService } from '@global-service/habit/habit.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter, Injectable } from '@angular/core';
import { ProfileService } from '@global-user/components/profile/profile-service/profile.service';
import { Language } from '../../../../../i18n/Language';
import { HABITLIST } from '../mocks/habit-mock';
import { CUSTOMHABIT, DEFAULTHABIT, HABITSASSIGNEDLIST } from '../mocks/habit-assigned-mock';
import { FIRSTTAGITEM, SECONDTAGITEM, TAGLIST } from '../mocks/tags-list-mock';
import { EditProfileModel } from '@global-user/models/edit-profile.model';
import { HabitsFiltersList } from '@global-user/components/habit/models/habits-filters-list';
import { FilterOptions, FilterSelect } from '../../../../../interface/filter-select.interface';

@Injectable()
class TranslationServiceStub {
  public onLangChange = new EventEmitter<any>();
  public onTranslationChange = new EventEmitter<any>();
  public onDefaultLangChange = new EventEmitter<any>();
  public addLangs(langs: string[]) {}
  public getLangs() {
    return 'en-us';
  }
  public getBrowserLang() {
    return '';
  }
  public getBrowserCultureLang() {
    return '';
  }
  public use(lang: string) {
    return '';
  }
  public get(key: any): any {
    return of(key);
  }
  public setDefaultLang() {
    return true;
  }
}

describe('AllHabitsComponent', () => {
  let component: AllHabitsComponent;
  let fixture: ComponentFixture<AllHabitsComponent>;
  const defaultImagePath =
    'https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg';

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', [
    'userIdBehaviourSubject',
    'languageBehaviourSubject',
    'getCurrentLanguage',
    'getHabitsGalleryView',
    'setHabitsGalleryView',
    'getUserId'
  ]);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('en');
  localStorageServiceMock.getCurrentLanguage = () => 'en' as Language;
  localStorageServiceMock.getUserId = () => 1;

  const assignHabitServiceMock: HabitAssignService = jasmine.createSpyObj('HabitAssignService', ['getAssignedHabits']);
  assignHabitServiceMock.getAssignedHabits = () => of(HABITSASSIGNEDLIST);

  const habitServiceMock: HabitService = jasmine.createSpyObj('HabitService', ['getAllHabits', 'getHabitsByFilters', 'getAllTags']);
  habitServiceMock.getAllHabits = () => of(HABITLIST);
  habitServiceMock.getHabitsByFilters = () => of(HABITLIST);
  habitServiceMock.getAllTags = () => of(TAGLIST);

  const userData = {
    userLocationDto: {
      cityUa: 'string'
    },
    name: 'string',
    userCredo: 'string',
    profilePicturePath: defaultImagePath,
    rating: null,
    showEcoPlace: true,
    showLocation: true,
    showShoppingList: true,
    socialNetworks: [{ id: 1, url: defaultImagePath }]
  } as EditProfileModel;

  const profileServiceMock: ProfileService = jasmine.createSpyObj('ProfileService', ['getUserInfo']);
  profileServiceMock.getUserInfo = () => of(userData);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AllHabitsComponent, HabitsListViewComponent],
      imports: [TranslateModule.forRoot(), SharedMainModule, InfiniteScrollModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: HabitService, useValue: habitServiceMock },
        { provide: HabitAssignService, useValue: assignHabitServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: TranslateService, useClass: TranslationServiceStub },
        { provide: ProfileService, useValue: profileServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllHabitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call methods OnInit', () => {
    const spy1 = spyOn(component, 'onResize');
    const spy2 = spyOn(component, 'checkHabitsView');
    const spy3 = spyOn(component as any, 'getAllHabitsTags');
    component.ngOnInit();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });

  it('should get Habits tags list on getAllHabitsTags', () => {
    component.tagList = [];
    (component as any).getAllHabitsTags();
    expect(component.tagList).toEqual([FIRSTTAGITEM, SECONDTAGITEM]);
  });

  it('onDisplayModeChange() setting false value', () => {
    component.onDisplayModeChange(false);
    expect(localStorageServiceMock.setHabitsGalleryView).toHaveBeenCalledWith(false);
    expect(component.galleryView).toEqual(false);
  });

  it('onDisplayModeChange() setting true value', () => {
    component.onDisplayModeChange(true);
    expect(localStorageServiceMock.setHabitsGalleryView).toHaveBeenCalledWith(true);
    expect(component.galleryView).toEqual(true);
  });

  it('checkHabitsView() getting false value', () => {
    localStorageServiceMock.getHabitsGalleryView = () => false;
    component.checkHabitsView();
    expect(component.galleryView).toEqual(false);
  });

  it('checkHabitsView() getting true value', () => {
    localStorageServiceMock.getHabitsGalleryView = () => true;
    component.checkHabitsView();
    expect(component.galleryView).toEqual(true);
  });

  it('should call method setHabitsList on getAllHabits', () => {
    const spy = spyOn(component as any, 'setHabitsList');
    (component as any).getAllHabits(0, 6);
    expect(spy).toHaveBeenCalledWith(0, HABITLIST);
  });

  it('should call method setHabitsList on getHabitsByFilters', () => {
    const spy = spyOn(component as any, 'setHabitsList');
    (component as any).getHabitsByFilters(0, 6, ['tag']);
    expect(spy).toHaveBeenCalledWith(0, HABITLIST);
  });

  it('should set values on setHabitsList', () => {
    const page = 0;
    (component as any).setHabitsList(page, HABITLIST);
    expect(component.isFetching).toBeFalsy();
    expect(component.habitsList).toEqual([DEFAULTHABIT, CUSTOMHABIT]);
    expect((component as any).totalPages).toBe(2);
    expect((component as any).currentPage).toBe(1);
    expect((component as any).isAllPages).toBeFalsy();
  });

  it('should set Habits List on setHabitsList when page is 1', () => {
    component.habitsList = HABITLIST.page;
    const result = [...component.habitsList, ...HABITLIST.page];
    (component as any).setHabitsList(1, HABITLIST);
    expect(component.habitsList).toEqual(result);
  });

  it('should not call method checkIfAssigned on setHabitsList if totalElements is zero', () => {
    HABITLIST.totalElements = 0;
    const spy = spyOn(component, 'checkIfAssigned');
    (component as any).setHabitsList(0, HABITLIST);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should set isFetching false and dont call methods onScroll if isAllPages is true', () => {
    (component as any).isAllPages = true;
    const spy1 = spyOn(component as any, 'getAllHabits');
    const spy2 = spyOn(component as any, 'getHabitsByFilters');
    component.onScroll();
    expect(component.isFetching).toBeFalsy();
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });

  it('should set isFetching true and call method getAllHabits on onScroll', () => {
    (component as any).isAllPages = false;
    component.activeFilters = [];
    const spy1 = spyOn(component as any, 'getAllHabits');
    const spy2 = spyOn(component as any, 'getHabitsByFilters');
    component.onScroll();
    expect(component.isFetching).toBeTruthy();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });

  it('should call method getHabitsByFilters on onScroll', () => {
    (component as any).isAllPages = false;
    component.activeFilters = ['tags'];
    const spy1 = spyOn(component as any, 'getHabitsByFilters');
    const spy2 = spyOn(component as any, 'getAllHabits');
    component.onScroll();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });

  it('should navigate to create habit page', () => {
    const routerSpy = spyOn((component as any).router, 'navigate');
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      if (key === 'userId') {
        return '1';
      }
    });
    component.goToCreateHabit();
    expect(routerSpy).toHaveBeenCalledWith(['profile/1/create-habit']);
  });

  it('should navigate to create habit', () => {
    const navigateSpy = spyOn(component.router, 'navigate');
    localStorage.setItem('userId', '123');
    component.goToCreateHabit();
    expect(navigateSpy).toHaveBeenCalledWith(['profile/123/create-habit']);
  });

  it('should reset filters', () => {
    component.filtersList = HabitsFiltersList;
    spyOn(component.cleanFilters, 'next');
    component.resetFilters();
    expect(component.filtersList.every((filter) => !filter.isAllSelected)).toBeTrue();
    expect(component.cleanFilters.next).toHaveBeenCalled();
  });

  it('should reset filters', () => {
    const cleanFiltersSpy = spyOn(component.cleanFilters, 'next');
    component.resetFilters();
    component.filtersList.forEach((filter: FilterSelect) => {
      expect(filter.isAllSelected).toBeFalse();
      filter.options.forEach((option: FilterOptions) => expect(option.isActive).toBeFalse());
    });
    expect(cleanFiltersSpy).toHaveBeenCalled();
  });

  it('should set filters', () => {
    const getHabitsByFiltersSpy = spyOn(component as any, 'getHabitsByFilters');
    const getAllHabitsSpy = spyOn(component as any, 'getAllHabits');
    const filterChange: FilterSelect = {
      name: 'test',
      title: 'Test Title',
      selectAllOption: 'All',
      isAllSelected: false,
      options: [
        { value: '1', isActive: true },
        { value: '2', isActive: false }
      ]
    };
    (component as any).filtersList = [filterChange];
    component.setFilters(filterChange);
    expect(component.activeFilters).toContain('test=1');
    expect(getHabitsByFiltersSpy).toHaveBeenCalledWith(0, (component as any).pageSize, component.activeFilters);
    expect(getAllHabitsSpy).not.toHaveBeenCalled();
  });

  it('should reset filters', () => {
    const getAllHabitsSpy = spyOn(component as any, 'getAllHabits');
    const cleanFiltersSpy = spyOn(component.cleanFilters, 'next');
    component.resetFilters();
    component.filtersList.forEach((filter: FilterSelect) => {
      expect(filter.isAllSelected).toBeFalse();
      filter.options.forEach((option: FilterOptions) => expect(option.isActive).toBeFalse());
    });
    expect(getAllHabitsSpy).toHaveBeenCalledWith(0, (component as any).pageSize);
    expect(cleanFiltersSpy).toHaveBeenCalled();
  });

  describe('TranslationServiceStub', () => {
    let service: TranslationServiceStub;

    beforeEach(() => {
      service = new TranslationServiceStub();
    });

    it('should emit onLangChange event', () => {
      let result = null;
      service.onLangChange.subscribe((value) => (result = value));
      service.onLangChange.emit('test');
      expect(result).toEqual('test');
    });

    it('should emit onTranslationChange event', () => {
      let result = null;
      service.onTranslationChange.subscribe((value) => (result = value));
      service.onTranslationChange.emit('test');
      expect(result).toEqual('test');
    });

    it('should emit onDefaultLangChange event', () => {
      let result = null;
      service.onDefaultLangChange.subscribe((value) => (result = value));
      service.onDefaultLangChange.emit('test');
      expect(result).toEqual('test');
    });

    it('should return language', () => {
      expect(service.getLangs()).toEqual('en-us');
    });

    it('should return empty string for browser language', () => {
      expect(service.getBrowserLang()).toEqual('');
    });

    it('should return empty string for browser culture language', () => {
      expect(service.getBrowserCultureLang()).toEqual('');
    });

    it('should return empty string when use is called', () => {
      expect(service.use('en')).toEqual('');
    });

    it('should return key when get is called', (done) => {
      service.get('test').subscribe((value: any) => {
        expect(value).toEqual('test');
        done();
      });
    });

    it('should return true when setDefaultLang is called', () => {
      expect(service.setDefaultLang()).toEqual(true);
    });
  });
});
