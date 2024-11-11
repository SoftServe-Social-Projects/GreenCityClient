import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EditProfileModel, NotificationPreference, UserLocationDto } from '@global-user/models/edit-profile.model';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Injectable()
export class EditProfileFormBuilder {
  constructor(
    private builder: FormBuilder,
    private langService: LanguageService
  ) {}

  emailPreferences = ['system', 'likes', 'comments', 'invites', 'places'];

  getProfileForm() {
    return this.builder.group({
      name: ['', Validators.maxLength(30)],
      city: ['', Validators.maxLength(85)],
      credo: ['', Validators.maxLength(170)],
      showLocation: [false],
      showEcoPlace: [false],
      showToDoList: [false],
      socialNetworks: [''],
      emailPreferences: this.createEmailPreferencesGroup(null)
    });
  }

  private createEmailPreferencesGroup(preferences: NotificationPreference[] | null): FormGroup {
    const emailPrefsGroup = this.builder.group(
      this.emailPreferences.reduce(
        (acc, pref) => ({
          ...acc,
          [pref]: [false],
          [`periodicity${this.capitalizeFirstLetter(pref)}`]: ['NEVER']
        }),
        {}
      )
    );

    this.setupEmailPreferenceListeners(emailPrefsGroup);

    if (preferences) {
      this.initializeEmailPreferences(emailPrefsGroup, preferences);
    }

    return emailPrefsGroup;
  }

  private setupEmailPreferenceListeners(group: FormGroup): void {
    this.emailPreferences.forEach((pref) => {
      const periodicityControl = group.get(`periodicity${this.capitalizeFirstLetter(pref)}`);
      const checkboxControl = group.get(pref);

      periodicityControl?.valueChanges.subscribe((value) => {
        checkboxControl?.setValue(value !== 'NEVER', { emitEvent: false });
      });
    });
  }

  initializeEmailPreferences(group: FormGroup, preferences: NotificationPreference[]): void {
    preferences.forEach(({ emailPreference, periodicity }) => {
      const controlName = this.mapPreferenceToFormControl(emailPreference);
      const periodicityControl = `periodicity${this.capitalizeFirstLetter(emailPreference)}`;

      if (controlName) {
        group.get(controlName)?.setValue(periodicity !== 'NEVER');
        group.get(periodicityControl)?.setValue(periodicity);
      }
    });
  }

  mapPreferenceToFormControl(preference: string): string | null {
    return this.emailPreferences.find((pref) => pref.toUpperCase() === preference) || null;
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getSelectedEmailPreferences(form: FormGroup): NotificationPreference[] {
    const emailPrefGroup = form.get('emailPreferences') as FormGroup;
    return this.emailPreferences.map((pref) => {
      const isChecked = emailPrefGroup.get(pref)?.value;
      const periodicityControl = `periodicity${this.capitalizeFirstLetter(pref)}`;
      const periodicity = emailPrefGroup.get(periodicityControl)?.value;

      return {
        emailPreference: pref.toUpperCase(),
        periodicity: isChecked ? periodicity : 'NEVER'
      };
    });
  }

  getFormatedCity(editForm: UserLocationDto): string {
    if (editForm) {
      const city = this.langService.getLangValue(editForm?.cityUa, editForm?.cityEn);
      const country = this.langService.getLangValue(editForm?.countryUa, editForm?.countryEn);
      return editForm.cityUa && editForm.cityEn ? `${city}, ${country}` : '';
    }
    return '';
  }

  getEditProfileForm(editForm: EditProfileModel) {
    return this.builder.group({
      name: [editForm.name, [Validators.maxLength(30), Validators.required]],
      city: [this.getFormatedCity(editForm.userLocationDto), Validators.maxLength(85)],
      credo: [editForm.userCredo, Validators.maxLength(170)],
      showLocation: [editForm.showLocation],
      showEcoPlace: [editForm.showEcoPlace],
      showToDoList: [editForm.showToDoList],
      socialNetworks: [editForm.socialNetworks],
      emailPreferences: this.createEmailPreferencesGroup(editForm.notificationPreferences)
    });
  }
}
