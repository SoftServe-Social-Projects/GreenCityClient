import { ProfilePrivacyPolicy } from '@global-user/models/edit-profile-const';
import { EditProfileModel } from '@global-user/models/edit-profile.model';

export const defaultImagePath =
  'https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg';

export const mockUserData: EditProfileModel = {
  userLocationDto: {
    cityUa: 'Місто'
  },
  name: 'string',
  userCredo: 'string',
  profilePicturePath: defaultImagePath,
  rating: null,
  showEcoPlace: ProfilePrivacyPolicy.PUBLIC,
  showLocation: ProfilePrivacyPolicy.PUBLIC,
  showToDoList: ProfilePrivacyPolicy.PUBLIC,
  socialNetworks: [{ id: 1, url: defaultImagePath }]
} as EditProfileModel;
