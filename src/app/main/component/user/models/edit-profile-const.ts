export const emailPreferencesList = [
  { controlName: 'system', translationKey: 'system', periodicityControl: 'periodicitySystem' },
  { controlName: 'likes', translationKey: 'likes', periodicityControl: 'periodicityLikes' },
  { controlName: 'comments', translationKey: 'comments', periodicityControl: 'periodicityComments' },
  { controlName: 'invites', translationKey: 'invites', periodicityControl: 'periodicityInvites' },
  { controlName: 'places', translationKey: 'places', periodicityControl: 'periodicityPlaces' }
];

export const periodicityOptions = [
  { value: 'IMMEDIATELY', label: 'immediately' },
  { value: 'TWICE_A_DAY', label: 'twice_a_day' },
  { value: 'MONTHLY', label: 'monthly' },
  { value: 'DAILY', label: 'daily' },
  { value: 'WEEKLY', label: 'weekly' },
  { value: 'NEVER', label: 'never' }
];

export enum ProfilePrivacyPolicy {
  PRIVATE = 'PRIVATE',
  FRIENDS_ONLY = 'FRIENDS_ONLY',
  PUBLIC = 'PUBLIC'
}

export const privacyOptions = [
  { value: ProfilePrivacyPolicy.PRIVATE, translationKey: 'user.edit-profile.privacy-options.private' },
  { value: ProfilePrivacyPolicy.FRIENDS_ONLY, translationKey: 'user.edit-profile.privacy-options.friends_only' },
  { value: ProfilePrivacyPolicy.PUBLIC, translationKey: 'user.edit-profile.privacy-options.public' }
];

export const privacySettingsList = [
  { label: 'user.edit-profile.location', formControlName: 'showLocation' },
  { label: 'user.edit-profile.eco-place', formControlName: 'showEcoPlace' },
  { label: 'user.edit-profile.to-do-list', formControlName: 'showToDoList' }
];
