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
