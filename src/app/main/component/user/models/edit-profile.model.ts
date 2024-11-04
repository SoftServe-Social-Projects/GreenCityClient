export class EditProfileModel {
  userLocationDto: UserLocationDto | null;
  name: string;
  userCredo: string;
  profilePicturePath: string;
  rating: number | null;
  showEcoPlace: boolean;
  showLocation: boolean;
  showShoppingList: boolean;
  socialNetworks: Array<{ id: number; url: string }>;
  notificationPreferences: NotificationPreference[];
}

export class EditProfileDto {
  coordinates: Coordinates;
  name: string;
  userCredo: string;
  showEcoPlace: boolean;
  showLocation: boolean;
  showShoppingList: boolean;
  socialNetworks: Array<string>;
  emailPreferences: NotificationPreference[];
}

export class UserLocationDto {
  id: number | null;
  cityEn: string | null;
  cityUa: string | null;
  regionEn: string | null;
  regionUa: string | null;
  countryEn: string | null;
  countryUa: string | null;
  latitude: number | null;
  longitude: number | null;
}

export class Coordinates {
  latitude?: number | null;
  longitude?: number | null;
}

export interface NotificationPreference {
  emailPreference: string;
  periodicity: string;
}
