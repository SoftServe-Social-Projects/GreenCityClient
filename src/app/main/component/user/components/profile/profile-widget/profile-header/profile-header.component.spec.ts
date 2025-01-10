import { UserSharedModule } from './../../../shared/user-shared.module';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfileHeaderComponent } from '@global-user/components';
import { ProfileProgressComponent } from '@global-user/components';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { BehaviorSubject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { ProfileService } from 'src/app/main/component/user/components/profile/profile-service/profile.service';
import { EditProfileModel, UserLocationDto } from '@global-user/models/edit-profile.model';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { Language } from 'src/app/main/i18n/Language';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserProfileImageComponent } from '@global-user/components/shared/components/user-profile-image/user-profile-image.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserOnlineStatusService } from '@global-user/services/user-online-status.service';
import { routes } from 'src/app/app-routing.module';

describe('ProfileHeaderComponent', () => {
  let component: ProfileHeaderComponent;
  let fixture: ComponentFixture<ProfileHeaderComponent>;
  let profileService: ProfileService;
  const mockId = 123;
  const userLocationDto = { id: 1, cityEn: 'City', cityUa: 'Місто', countryEn: 'Country', countryUa: 'Країна' } as UserLocationDto;
  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', ['userIdBehaviourSubject']);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  localStorageServiceMock.getUserId = () => mockId;
  localStorageServiceMock.getCurrentLanguage = () => 'ua' as Language;

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue', 'getUserCity']);
  languageServiceMock.getLangValue = (valUa: string, valEn: string) => valUa;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileHeaderComponent, UserProfileImageComponent, ProfileProgressComponent],
      imports: [MatTooltipModule, TranslateModule.forChild(), UserSharedModule, HttpClientTestingModule, RouterModule.forRoot(routes)],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { userName: 'testUser', userId: 123 } } } },
        { provide: ProfileService, useClass: ProfileService },
        { provide: LanguageService, useValue: languageServiceMock },
        { provide: TranslateStore, useClass: TranslateStore },
        { provide: UserOnlineStatusService, useValue: { addUsersId: () => {}, removeUsersId: () => {}, checkIsOnline: () => true } },
        { provide: LocalStorageService, useValue: localStorageServiceMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileHeaderComponent);
    component = fixture.componentInstance;
    component.userInfo = {
      userLocationDto: {
        cityEn: 'City'
      },
      name: 'name',
      userCredo: 'credo',
      profilePicturePath: '',
      rating: 2,
      showEcoPlace: 'PUBLIC',
      showLocation: 'PUBLIC',
      showToDoList: 'PUBLIC',
      socialNetworks: [{ id: 220, url: 'http://instagram' }]
    } as EditProfileModel;
    fixture.detectChanges();
    profileService = TestBed.inject(ProfileService);
    profileService.icons = {
      edit: './assets/img/profile/icons/edit.svg',
      add: './assets/img/profile/icons/add.svg',
      delete: './assets/img/profile/icons/delete.svg',
      defaultIcon: './assets/img/profile/icons/default_social.svg'
    };
    profileService.socialMedia = {
      facebook: './assets/img/icon/facebook-icon.svg',
      linkedin: './assets/img/icon/linked-icon.svg',
      instagram: './assets/img/icon/instagram-icon.svg',
      x: './assets/img/icon/twitter-icon.svg',
      youtube: './assets/img/icon/youtube-icon.svg'
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('Should return default image', () => {
    const socialNetwork = 'https://www.some.com/';
    const imgPath = profileService.icons.defaultIcon;
    const result = component.getSocialImage(socialNetwork);

    expect(result).toBe(imgPath);
  });

  it('Should return facebook image', () => {
    const socialNetwork = 'https://www.facebook.com/';
    const imgPath = profileService.socialMedia.facebook;
    const result = component.getSocialImage(socialNetwork);

    expect(result).toBe(imgPath);
  });

  it('Should return  User City name according to current language', () => {
    expect(component.getUserCity(userLocationDto)).toBe('Місто, Країна');
  });

  it('should return empty string if locationDto is null', () => {
    const result = component.getUserCity(null);
    expect(result).toEqual('');
  });

  it('should return empty string if cityUa and cityEn are both undefined', () => {
    const result = component.getUserCity({ ...userLocationDto, cityEn: undefined, cityUa: undefined });
    expect(result).toEqual('');
  });

  it('should return city and country when both cityUa and cityEn are defined', () => {
    const result = component.getUserCity({ ...userLocationDto, cityEn: 'Kiev', cityUa: 'Kyiv' });
    languageServiceMock.getUserCity(userLocationDto);

    expect(languageServiceMock.getUserCity).toHaveBeenCalledTimes(1);
    expect(languageServiceMock.getUserCity).toHaveBeenCalledWith(userLocationDto);
    expect(result).toEqual('Kyiv, Країна');
  });

  it('should display city only to friends when showLocation is FRIENDS_ONLY', () => {
    component.userInfo.showLocation = 'FRIENDS_ONLY';
    spyOn(component, 'isContentVisible').and.returnValue(true);
    const result = component.getUserCity(userLocationDto);
    expect(result).toBe('Місто, Країна');
  });

  it('should display city when showLocation is PUBLIC', () => {
    component.userInfo.showLocation = 'PUBLIC';
    spyOn(component, 'isContentVisible').and.returnValue(true);
    const result = component.getUserCity(userLocationDto);
    expect(result).toBe('Місто, Країна');
  });
});
