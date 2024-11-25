export interface NotificationArrayModel {
  currentPage: number;
  first: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  last: boolean;
  number: number;
  page: NotificationModel[];
  totalElements: number;
  totalPages: number;
}

export interface NotificationModel {
  actionUserId: number[];
  actionUserText: string[];
  bodyText: string;
  message: string;
  notificationId: number;
  notificationType: string;
  projectName: string;
  secondMessage: string;
  secondMessageId: number;
  targetId: number;
  time: any;
  titleText: string;
  viewed: boolean;
}

export enum FilterCriteria {
  ALL = 'All',
  ORIGIN = 'Origin',
  TYPE = 'Type'
}

export interface NotificationFilter {
  name: string;
  nameEn?: string;
  nameUa?: string;
  isSelected: boolean;
  filterArr?: string[];
}

export enum NotificationCriteria {
  COMMENT_LIKE = 'COMMENT_LIKE',
  COMMENT_REPLY = 'COMMENT_REPLY',
  ECONEWS_LIKE = 'ECONEWS_LIKE',
  ECONEWS_CREATED = 'ECONEWS_CREATED',
  ECONEWS_COMMENT = 'ECONEWS_COMMENT',
  EVENT_CREATED = 'EVENT_CREATED',
  EVENT_CANCELED = 'EVENT_CANCELED',
  EVENT_UPDATED = 'EVENT_UPDATED',
  EVENT_JOINED = 'EVENT_JOINED',
  EVENT_COMMENT = ' EVENT_COMMENT',
  FRIEND_REQUEST_RECEIVED = 'FRIEND_REQUEST_RECEIVED',
  FRIEND_REQUEST_ACCEPTED = 'FRIEND_REQUEST_ACCEPTED',
  HABIT_INVITATION = 'HABIT_INVITE'
}

export const filterCriteriaOptions = [
  { name: FilterCriteria.ALL, isSelected: true, nameUa: 'Усі', nameEn: 'All' },
  { name: FilterCriteria.TYPE, isSelected: false, nameUa: 'Типом', nameEn: 'Type' },
  { name: FilterCriteria.ORIGIN, isSelected: false, nameUa: 'Джерелом', nameEn: 'Origin' }
];

export const notificationCriteriaOptions: NotificationFilter[] = [
  {
    name: 'All',
    nameEn: 'All',
    nameUa: 'Усі',
    isSelected: true
  },
  {
    name: NotificationCriteria.COMMENT_LIKE,
    nameEn: 'Comment like',
    nameUa: 'Вподобання коментаря',
    filterArr: ['ECONEWS_COMMENT_LIKE', 'EVENT_COMMENT_LIKE'],
    isSelected: true
  },
  {
    name: NotificationCriteria.COMMENT_REPLY,
    nameEn: 'Comment reply',
    nameUa: 'Відповідь на коментар',
    filterArr: ['ECONEWS_COMMENT_REPLY', 'EVENT_COMMENT_REPLY'],
    isSelected: true
  },
  { name: NotificationCriteria.ECONEWS_LIKE, nameEn: ' News Like', nameUa: 'Вподобання новини', isSelected: true },
  { name: NotificationCriteria.ECONEWS_CREATED, nameEn: ' News Created', nameUa: 'Створення новини', isSelected: true },
  { name: NotificationCriteria.ECONEWS_COMMENT, nameEn: ' News Commented', nameUa: 'Коментарі новин', isSelected: true },
  { name: NotificationCriteria.EVENT_CREATED, nameEn: 'Event created', nameUa: 'Створення події', isSelected: true },
  { name: NotificationCriteria.EVENT_CANCELED, nameEn: 'Event canceled', nameUa: 'Скасування події', isSelected: true },
  { name: NotificationCriteria.EVENT_UPDATED, nameEn: 'Event updated', nameUa: 'Зміни у подіях', isSelected: true },
  { name: NotificationCriteria.EVENT_JOINED, nameEn: 'Event joined', nameUa: 'приєднання до події', isSelected: true },
  { name: NotificationCriteria.EVENT_COMMENT, nameEn: 'Event commented', nameUa: 'Коментарі подій', isSelected: true },
  {
    name: NotificationCriteria.FRIEND_REQUEST_RECEIVED,
    nameEn: 'Friend request received',
    nameUa: 'Нові запити дружити',
    isSelected: true
  },
  {
    name: NotificationCriteria.FRIEND_REQUEST_ACCEPTED,
    nameEn: 'Friend request accepted',
    nameUa: 'Підтверджені запити дружити',
    isSelected: true
  }
];
export const projects: NotificationFilter[] = [
  { name: 'All', nameEn: 'All', nameUa: 'Усі', isSelected: true },
  { name: 'GREENCITY', nameEn: 'GreenCity', isSelected: false },
  { name: 'PICKUP', nameEn: 'Pick up', isSelected: false }
];
