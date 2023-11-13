import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserSharedModule } from './../../../shared/user-shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileHeaderComponent } from './profile-header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfileProgressComponent } from '../profile-progress/profile-progress.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { BehaviorSubject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateStore } from '@ngx-translate/core';
import { ProfileService } from 'src/app/main/component/user/components/profile/profile-service/profile.service';
import { MaxTextLengthPipe } from 'src/app/shared/max-text-length-pipe/max-text-length.pipe';
import { EditProfileModel, UserLocationDto } from '@global-user/models/edit-profile.model';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { Language } from 'src/app/main/i18n/Language';

describe('ProfileHeaderComponent', () => {
  let component: ProfileHeaderComponent;
  let fixture: ComponentFixture<ProfileHeaderComponent>;
  let localStorageServiceMock: LocalStorageService;
  let profileService: ProfileService;
  const mockId = 123;
  localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', ['userIdBehaviourSubject']);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  localStorageServiceMock.getUserId = () => mockId;
  localStorageServiceMock.getCurrentLanguage = () => {
    return 'ua' as Language;
  };

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue']);
  languageServiceMock.getLangValue = (valUa: string, valEn: string) => {
    return valUa;
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileHeaderComponent, ProfileProgressComponent, MaxTextLengthPipe],
      imports: [UserSharedModule, RouterTestingModule.withRoutes([]), BrowserAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: LanguageService, useVale: languageServiceMock },
        TranslateStore,
        ProfileService
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
      showEcoPlace: false,
      showLocation: false,
      showShoppingList: false,
      socialNetworks: [{ id: 220, url: 'http://instagram' }]
    } as EditProfileModel;
    fixture.detectChanges();
    profileService = TestBed.inject(ProfileService);
    profileService.icons = {
      edit: './assets/img/profile/icons/edit.svg',
      add: './assets/img/profile/icons/add.svg',
      delete: './assets/img/profile/icons/delete.svg',
      defaultIcon: './assets/img/profile/icons/default_social.svg',
      facebook: './assets/img/icon/facebook-icon.svg',
      linkedin: './assets/img/icon/linked-icon.svg',
      instagram: './assets/img/icon/instagram-icon.svg',
      twitter: './assets/img/icon/twitter-icon.svg',
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
    const imgPath = profileService.icons.facebook;
    const result = component.getSocialImage(socialNetwork);

    expect(result).toBe(imgPath);
  });

  it('Should return  User City name according to current language', () => {
    const userLocationDto: UserLocationDto = {
      id: 1,
      cityEn: 'City',
      cityUa: 'Місто',
      countryEn: 'Country',
      countryUa: 'Країна'
    } as UserLocationDto;

    expect(component.getUserCity(userLocationDto)).toBe('Місто, Країна');
  });
});
