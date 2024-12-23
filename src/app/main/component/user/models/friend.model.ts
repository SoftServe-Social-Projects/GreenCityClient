import { UserLocationDto } from './edit-profile.model';

export interface FriendModel {
  id: number;
  name: string;
  email: string;
  profilePicturePath?: string;
  added?: boolean;
  rating: number;
  userLocationDto?: UserLocationDto | null;
  mutualFriends?: number;
  friendStatus: FriendStatus;
  requesterId: number | null;
  chatId?: number;
  isOnline?: boolean;
  friendsChatDto?: { chatId?: number };
  hasInvitation?:boolean;
}

export type FriendStatus = 'FRIEND' | 'REQUEST' | 'REJECTED' | null;

export const FriendStatusValues = {
  FRIEND: 'FRIEND' as FriendStatus,
  REQUEST: 'REQUEST' as FriendStatus,
  REJECTED: 'REJECTED' as FriendStatus,
  NONE: null as FriendStatus
};

export interface FriendArrayModel {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  page: FriendModel[];
}

export interface FriendProfilePicturesArrayModel {
  id: number;
  name: string;
  profilePicturePath: string;
}

export enum UserDashboardTab {
  allHabits = 'All habits',
  mutualHabits = 'Mutual habits',
  myHabits = 'My habits',
  allFriends = 'All friends',
  mutualFriends = 'Mutual friends'
}

export enum UsersCategOnlineStatus {
  profile = 'profile',
  allFriends = 'allFriends',
  recommendedFriends = 'recommendedFriends',
  friendsRequests = 'friendsRequests',
  usersFriends = 'usersFriends',
  mutualFriends = 'mutualFriends'
}

export type UserCateg = keyof typeof UsersCategOnlineStatus;

export interface UserOnlineStatus {
  id: number;
  onlineStatus: boolean;
}

export interface UserDataAsFriend {
  id: number;
  friendStatus: FriendStatus | null;
  requesterId: number | null;
  chatId?: number;
}
