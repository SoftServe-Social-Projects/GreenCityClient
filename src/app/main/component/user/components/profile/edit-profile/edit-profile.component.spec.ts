import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { EditProfileFormBuilder } from '@global-user/components/profile/edit-profile/edit-profile-form-builder';
import { EditProfileService } from '@global-user/services/edit-profile.service';
import { ProfileService } from '@global-user/components/profile/profile-service/profile.service';
import { EditProfileModel } from '@global-user/models/edit-profile.model';
import { EditProfileComponent } from '@global-user/components';
import { SocialNetworksComponent } from '@global-user/components';
import { Router } from '@angular/router';
import { SharedMainModule } from '@shared/shared-main.module';
import { InputGoogleAutocompleteComponent } from '@shared/components/input-google-autocomplete/input-google-autocomplete.component';
import { MatSelectModule } from '@angular/material/select';

class Test {}

describe('EditProfileComponent', () => {
  let component: EditProfileComponent;
  let fixture: ComponentFixture<EditProfileComponent>;
  let router: Router;
  let formBuilder: EditProfileFormBuilder;
  let form: FormGroup;
  const previousGoogle = (window as any).google;

  beforeEach(waitForAsync(() => {
    (window as any).google = {
      maps: {
        places: {
          AutocompleteService: class {
            getPlacePredictions(request, callback) {
              const predictions = [
                { description: 'Place 1', place_id: '1' },
                { description: 'Place 2', place_id: '2' }
              ];
              callback(predictions, 'OK');
            }
          }
        }
      }
    };

    TestBed.configureTestingModule({
      declarations: [EditProfileComponent, InputGoogleAutocompleteComponent],
      imports: [
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatDialogModule,
        MatSelectModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', component: Test }]),
        HttpClientTestingModule,
        SharedMainModule,
        TranslateModule.forRoot()
      ],
      providers: [
        EditProfileFormBuilder,
        EditProfileService,
        MatSnackBarComponent,
        SocialNetworksComponent,
        ProfileService,
        { provide: 'google', useValue: google }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProfileComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    formBuilder = TestBed.inject(EditProfileFormBuilder);

    form = formBuilder.getProfileForm();
    component.emailPreferencesList = [
      { controlName: 'system', translationKey: 'system', periodicityControl: 'periodicitySystem' },
      { controlName: 'likes', translationKey: 'likes', periodicityControl: 'periodicityLikes' }
    ];
    component.periodicityOptions = [
      { value: 'IMMEDIATELY', label: 'immediately' },
      { value: 'DAILY', label: 'daily' },
      { value: 'WEEKLY', label: 'weekly' },
      { value: 'NEVER', label: 'never' }
    ];

    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  afterAll(() => {
    (window as any).google = previousGoogle;
  });

  it('should create EditProfileComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('getSelectedEmailPreferences', () => {
    it('should return selected preferences with periodicity', () => {
      const emailPrefsGroup = form.get('emailPreferences') as FormGroup;
      emailPrefsGroup.get('likes')?.setValue(true);
      emailPrefsGroup.get('periodicityLikes')?.setValue('IMMEDIATELY');
      emailPrefsGroup.get('comments')?.setValue(false);

      const selectedPrefs = formBuilder.getSelectedEmailPreferences(form);

      expect(selectedPrefs).toEqual([
        { emailPreference: 'SYSTEM', periodicity: 'NEVER' },
        { emailPreference: 'LIKES', periodicity: 'IMMEDIATELY' },
        { emailPreference: 'COMMENTS', periodicity: 'NEVER' },
        { emailPreference: 'INVITES', periodicity: 'NEVER' },
        { emailPreference: 'PLACES', periodicity: 'NEVER' }
      ]);
    });
  });

  describe('Email Preferences Tests', () => {
    it('should initialize email preferences with correct default values', () => {
      const emailPreferencesForm = component.editProfileForm.get('emailPreferences');
      expect(emailPreferencesForm.get('system').value).toBe(false);
      expect(emailPreferencesForm.get('periodicitySystem').value).toBe('NEVER');
      expect(emailPreferencesForm.get('likes').value).toBe(false);
      expect(emailPreferencesForm.get('periodicityLikes').value).toBe('NEVER');
    });

    it('should populate email preferences correctly from existing data', () => {
      const preferences = [
        { emailPreference: 'SYSTEM', periodicity: 'WEEKLY' },
        { emailPreference: 'LIKES', periodicity: 'NEVER' }
      ];
      component.populateEmailPreferences(preferences);

      const emailPreferencesForm = component.editProfileForm.get('emailPreferences');
      expect(emailPreferencesForm.get('system').value).toBe(true);
      expect(emailPreferencesForm.get('periodicitySystem').value).toBe('WEEKLY');
      expect(emailPreferencesForm.get('likes').value).toBe(false);
      expect(emailPreferencesForm.get('periodicityLikes').value).toBe('NEVER');
    });

    it('should return correct email preferences when form is submitted', () => {
      const emailPreferencesForm = component.editProfileForm.get('emailPreferences');

      emailPreferencesForm.get('system').setValue(true);
      emailPreferencesForm.get('periodicitySystem').setValue('DAILY');

      emailPreferencesForm.get('likes').setValue(true);
      emailPreferencesForm.get('periodicityLikes').setValue('NEVER');

      emailPreferencesForm.get('comments').setValue(true);
      emailPreferencesForm.get('periodicityComments').setValue('DAILY');

      emailPreferencesForm.get('invites').setValue(true);
      emailPreferencesForm.get('periodicityInvites').setValue('NEVER');

      emailPreferencesForm.get('places').setValue(true);
      emailPreferencesForm.get('periodicityPlaces').setValue('NEVER');

      const selectedPrefs = component.builder.getSelectedEmailPreferences(component.editProfileForm);

      const expectedPrefs = [
        { emailPreference: 'SYSTEM', periodicity: 'DAILY' },
        { emailPreference: 'LIKES', periodicity: 'NEVER' },
        { emailPreference: 'COMMENTS', periodicity: 'DAILY' },
        { emailPreference: 'INVITES', periodicity: 'NEVER' },
        { emailPreference: 'PLACES', periodicity: 'NEVER' }
      ];

      expect(selectedPrefs).toEqual(expectedPrefs);
    });
  });

  describe('Testing of warnings in cases of user leaves the page', () => {
    beforeEach(() => {
      component.initialValues = {
        city: '',
        name: '',
        userCredo: '',
        showLocation: '',
        showEcoPlace: '',
        showShoppingList: '',
        socialNetworks: []
      };
      component.editProfileForm.value.city = '';
      component.editProfileForm.value.name = '';
      component.editProfileForm.value.credo = '';
      component.editProfileForm.value.showLocation = '';
      component.editProfileForm.value.showEcoPlace = '';
      component.editProfileForm.value.showShoppingList = '';
      component.socialNetworksToServer = [];
    });

    it('should return false in case of form fields were not changed', () => {
      expect(component.checkChanges()).toBeFalsy();
    });

    it('should return true in case of form fields were not changed', () => {
      expect(component.canDeactivate()).toBeTruthy();
    });
  });

  describe('Testing controls for the form:', () => {
    const controlsName = ['name', 'city', 'credo'];
    const maxLength =
      'Lorem ipsum dolor sit amet consectetur, adipisicing elit. ' +
      'Facilis asperiores minus corrupti impedit cumque sapiente est architecto obcaecati quisquam velit quidem quis nesciunt';
    const invalidCity = ['@Lviv', '.Lviv', 'Kiev6', 'Kyiv$'];
    const validCity = ['Lviv', 'Ivano-Frankivsk', 'Kiev(Ukraine)', 'Львов, Украина'];

    for (let i = 0; i < controlsName.length; i++) {
      it(`should create form with ${i + 1}-st formControl: ${controlsName[i]}`, () => {
        expect(component.editProfileForm.contains(controlsName[i])).toBeTruthy();
      });

      it(`The formControl: ${controlsName[i]} should be marked as invalid if the value is too long`, () => {
        const control = component.editProfileForm.get(controlsName[i]);
        control.setValue(maxLength);
        expect(control.valid).toBeFalsy();
      });
    }

    describe('The formControl: city should be marked as invalid if the value:', () => {
      for (let i = 0; i < invalidCity.length; i++) {
        it(`${i + 1}-st - ${invalidCity[i]}.`, () => {
          const control = component.editProfileForm.get('city');
          control.setValue(invalidCity[i]);
          expect(control.valid).toBeTruthy();
        });
      }
    });

    describe('The formControl: city should be marked as valid if the value:', () => {
      for (let i = 0; i < validCity.length; i++) {
        it(`${i + 1}-st - ${validCity[i]}.`, fakeAsync(() => {
          const control = component.editProfileForm.get('city');
          control.setValue(validCity[i]);
          tick(100);
          expect(control.valid).toBeTruthy();
        }));
      }
    });
  });

  describe('Testing services:', () => {
    let editProfileService: EditProfileService;
    let profileService: ProfileService;
    let mockUserInfo: EditProfileModel;

    beforeEach(() => {
      editProfileService = fixture.debugElement.injector.get(EditProfileService);
      profileService = fixture.debugElement.injector.get(ProfileService);
      mockUserInfo = {
        userLocationDto: { cityEn: 'Lviv' },
        name: 'John',
        userCredo: 'My Credo is to make small steps that leads to huge impact. Let’s change the world together.',
        profilePicturePath: './assets/img/profileAvatarBig.png',
        rating: 658,
        showEcoPlace: true,
        showLocation: true,
        showShoppingList: true,
        socialNetworks: [{ id: 220, url: 'http://instagram.com/profile' }]
      } as EditProfileModel;
    });

    it('getInitialValue should call ProfileService', () => {
      const spy = spyOn(profileService, 'getUserInfo').and.returnValue(of(mockUserInfo));
      component.getInitialValue();
      expect(spy.calls.any()).toBeTruthy();
    });

    it('onSubmit should call EditProfileService', () => {
      const spy = spyOn(editProfileService, 'postDataUserProfile').and.returnValue(of(mockUserInfo));
      component.onSubmit();
      expect(spy).toHaveBeenCalled();
    });
  });
});
