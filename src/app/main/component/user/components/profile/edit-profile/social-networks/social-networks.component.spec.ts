import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SocialNetworksComponent } from './social-networks.component';
import { WarningPopUpComponent } from '@shared/components';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ProfileService } from 'src/app/main/component/user/components/profile/profile-service/profile.service';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true)
    };
  }
}

describe('SocialNetworksComponent', () => {
  let component: SocialNetworksComponent;
  let fixture: ComponentFixture<SocialNetworksComponent>;
  let dialog: MatDialog;
  let profileService: ProfileService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SocialNetworksComponent, WarningPopUpComponent],
      imports: [TranslateModule.forRoot(), FormsModule, BrowserAnimationsModule, HttpClientTestingModule],
      providers: [{ provide: MatDialog, useClass: MatDialogMock, ProfileService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialNetworksComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    profileService = TestBed.inject(ProfileService);
    fixture.detectChanges();
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
      twitter: './assets/img/icon/twitter-icon.svg',
      x: './assets/img/icon/twitter-icon.svg',
      youtube: './assets/img/icon/youtube-icon.svg'
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tests of main functions', () => {
    beforeEach(() => {
      component.socialNetworks = [
        {
          url: 'https://www.facebook.com/',
          socialNetworkImage: ''
        }
      ];
    });

    it('should replace https/http from string', () => {
      expect(component.replaceHttp('https://www.facebook.com/')).toBe('www.facebook.com/');
      expect(component.replaceHttp('http://www.facebook.com/')).toBe('www.facebook.com/');
    });

    it('check if string is url', () => {
      expect((component as any).checkIsUrl('https://www.facebook.com/')).toBeTruthy();
      expect((component as any).checkIsUrl('www.facebook.com')).toBeFalsy();
    });

    it('Check for existing url', () => {
      expect((component as any).onCheckForExisting('https://www.facebook.com/')).toBeTruthy();

      expect((component as any).onCheckForExisting('https://www.pinterest.com/')).toBeFalsy();
    });

    it('Should add link to arr', () => {
      component.onAddLink('https://www.pinterest.com/');

      expect((component as any).socialNetworks.length).toBe(2);
    });

    it('Should add link to arr', () => {
      component.inputTextValue = 'https://www.pinterest.com/';
      component.onAddLink();

      expect((component as any).socialNetworks.length).toBe(2);
    });

    it('Should delete link', () => {
      component.onDeleteLink({ url: 'https://www.facebook.com/' });
      spyOn(dialog, 'open').and.callThrough();

      expect((component as any).socialNetworks.length).toBe(0);
    });

    it('Should delete link on edit and add it to input', () => {
      component.onEditLink({ url: 'https://www.facebook.com/' });

      expect((component as any).inputTextValue).toBe('https://www.facebook.com/');
    });

    it('Should change input visibility state', () => {
      component.showInput = true;
      component.onToggleInput();

      expect((component as any).showInput).toBeFalsy();
    });

    it('Should return default image', () => {
      const socialNetwork = {
        url: 'https://www.some.com/',
        socialNetworkImage: {
          imagePath: ''
        }
      };
      const imgPath = profileService.icons.defaultIcon;
      const result = component.getSocialImage(socialNetwork.url);

      expect(result).toBe(imgPath);
    });

    it('Should return facebook image', () => {
      const socialNetwork = {
        url: 'https://www.facebook.com/',
        socialNetworkImage: {
          imagePath: ''
        }
      };
      const imgPath = profileService.socialMedia.facebook;
      const result = component.getSocialImage(socialNetwork.url);

      expect(result).toBe(imgPath);
    });

    it('Should onCloseForm', () => {
      component.editedSocialLink = true;
      spyOn(component, 'onAddLink').and.returnValue();
      component.onCloseForm();
      expect(component.editedSocialLink).toBeFalsy();
    });

    it('Should return error message', () => {
      const mockError = { pattern: { test: 1 } };
      expect(component.getErrorMessage(mockError)).toMatch('pattern');
    });
  });
});
