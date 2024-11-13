import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ProfileService } from './profile-service/profile.service';

import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  const fakeItem = {
    city: 'fakeCity',
    showToDoList: false
  };
  const liveAnnouncerMock = jasmine.createSpyObj('announcer', ['announce']);
  const localStorageServiceMock = jasmine.createSpyObj('localStorageService', ['getCurrentLanguage', 'setCurentPage']);
  localStorageServiceMock.getCurrentLanguage.and.returnValue('ua');
  localStorageServiceMock.languageSubject = of('en');
  const profileServiceMock = jasmine.createSpyObj('profileService', ['getUserInfo', 'getUserProfileStatistics']);
  profileServiceMock.getUserProfileStatistics.and.returnValue(of('fakeStatistics' as any));
  profileServiceMock.getUserInfo.and.returnValue(of(fakeItem as any));
  const translateServiceMock = jasmine.createSpyObj('translate', ['setDefaultLang']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: LiveAnnouncer, useValue: liveAnnouncerMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: TranslateService, useValue: translateServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('makes expected calls', () => {
      const spyIsDeskWidth = spyOn(component, 'isDeskWidth').and.returnValue(true);
      const spyAnnounce = spyOn(component, 'announce');
      const spyShowUserInfo = spyOn(component, 'showUserInfo');

      component.ngOnInit();
      expect(spyIsDeskWidth).toHaveBeenCalled();
      expect(spyAnnounce).toHaveBeenCalled();
      expect(spyShowUserInfo).toHaveBeenCalled();
      expect(component.isDesktopWidth).toBeTruthy();
      expect(localStorageServiceMock.setCurentPage).toHaveBeenCalledWith('previousPage', '/profile');
    });
  });

  it('announce makes expected calls', () => {
    component.announce();
    expect(liveAnnouncerMock.announce).toHaveBeenCalledWith('Success, logging you in', 'assertive');
  });

  it('showUserInfo makes expected calls', () => {
    component.showUserInfo();
    expect(component.userInfo).toEqual(fakeItem as any);
  });
});
