import { environment } from '@environment/environment';

// back-end
export const mainLink = environment.backendLink;
export const mainUserLink = environment.backendUserLink;
export const mainUbsLink = environment.backendUbsLink;

// Own Security Controller
export const userOwnSecurityLink = mainUserLink + 'ownSecurity/';
export const changePasswordLink = userOwnSecurityLink + 'changePassword';
export const setPasswordForGoogleLink = userOwnSecurityLink + 'set-password';
export const userOwnSignUpLink = userOwnSecurityLink + 'signUp';
export const userOwnSignInLink = userOwnSecurityLink + 'signIn';
export const updateAccessTokenLink = userOwnSecurityLink + 'updateAccessToken';
export const updatePasswordLink = userOwnSecurityLink + 'updatePassword';
export const verifyEmailLink = userOwnSecurityLink + 'verifyEmail';
export const restorePasswordLink = userOwnSecurityLink + 'restorePassword';
export const unblockAccountLink = userOwnSecurityLink + 'unblockAccount';

// Google Security Controller
export const googleSecurityLink = mainUserLink + 'googleSecurity';
// User Controller
export const userLink = mainUserLink + 'user';

export const categoryLink = mainLink + 'category';
export const placeLink = mainLink + 'place/';
export const favoritePlaceLink = mainLink + 'favorite_place/';
export const factLink = mainLink + 'facts/';
export const habitFactRandomLink = factLink + 'random/';
export const adviceLink = mainLink + 'advices/';
export const adviceRandomLink = adviceLink + 'random';
export const habitStatisticLink = mainLink + 'habit/statistic/';
export const habitLink = mainLink + 'habit';
export const habitAssignLink = mainLink + 'habit/assign';
export const achievementLink = mainLink + 'achievements';
export const latestNewsLink = mainLink + 'eco-news';
export const subscriptionLink = mainLink + 'subscriptions';

// front-end
export const frontMailLink = environment.frontendLink;
export const frontAuthLink = frontMailLink + 'auth/';

// ubs-admin
export const ubsAdminEmployeeLink = mainUbsLink + '/admin/ubs-employee';
export const ubsAdminStationLink = mainUbsLink + '/ubs/superAdmin';

export const ubsAdminNotificationLink = mainUbsLink + '/admin/notification';
