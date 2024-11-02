import { HabitInterface } from '../models/interfaces/habit.interface';
import {
  ChangesFromCalendarToProgress,
  FriendsHabitProgress,
  HabitAssignInterface,
  ResponseInterface
} from '../models/interfaces/habit-assign.interface';
import { HabitsForDateInterface } from '@global-user/components/profile/calendar/habit-popup-interface';
import { TodoStatus } from '../models/todo-status.enum';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';

export const DEFAULTHABIT: HabitInterface = {
  complexity: 2,
  defaultDuration: 8,
  amountAcquiredUsers: 10,
  habitAssignStatus: 'INPROGRESS',
  habitTranslation: {
    description: 'Default habit description',
    habitItem: '',
    languageCode: 'en',
    name: 'Default habit',
    nameUa: '',
    descriptionUa: '',
    habitItemUa: ''
  },
  id: 1,
  usersIdWhoCreatedCustomHabit: 33,
  image: 'https://www.testgreencity.ga/assets/img/habits/man.svg',
  toDoListItems: [],
  tags: [],
  isCustomHabit: false,
  isAssigned: false
};

export const CUSTOMHABIT: HabitInterface = {
  complexity: 1,
  defaultDuration: 14,
  amountAcquiredUsers: 3,
  habitAssignStatus: 'INPROGRESS',
  habitTranslation: {
    description: 'Custom habit description',
    habitItem: 'test',
    languageCode: 'en',
    name: 'Custom habit',
    nameUa: '',
    descriptionUa: '',
    habitItemUa: 'test'
  },
  id: 2,
  usersIdWhoCreatedCustomHabit: 50,
  image: '',
  toDoListItems: [],
  tags: [],
  isCustomHabit: true,
  isAssigned: false
};

export const DEFAULTFULLINFOHABIT: HabitAssignInterface = {
  id: 1,
  status: HabitStatus.INPROGRESS,
  createDateTime: new Date('2023-04-14'),
  habit: DEFAULTHABIT,
  enrolled: true,
  userId: 17,
  duration: 8,
  workingDays: 6,
  habitStreak: 5,
  lastEnrollmentDate: new Date(2021, 5, 23),
  habitStatusCalendarDtoList: [
    { enrollDate: '2023-04-14', id: 2 },
    { enrollDate: '2023-04-10', id: 3 }
  ],
  toDoListItems: [
    {
      id: 6,
      status: TodoStatus.active,
      text: 'TEST'
    }
  ],
  progressNotificationHasDisplayed: false
};

export const CUSTOMFULLINFOHABIT: HabitAssignInterface = {
  id: 2,
  status: HabitStatus.INPROGRESS,
  createDateTime: new Date('2021-05-08'),
  habit: CUSTOMHABIT,
  enrolled: true,
  userId: 17,
  duration: 8,
  workingDays: 6,
  habitStreak: 5,
  lastEnrollmentDate: new Date(2021, 5, 23),
  habitStatusCalendarDtoList: [
    { enrollDate: 'monday', id: 2 },
    { enrollDate: 'wednesday', id: 3 }
  ],
  toDoListItems: [
    {
      id: 6,
      status: TodoStatus.active,
      text: 'TEST',
      custom: true
    }
  ],
  progressNotificationHasDisplayed: false
};

export const HABITSASSIGNEDLIST: HabitAssignInterface[] = [DEFAULTFULLINFOHABIT, CUSTOMFULLINFOHABIT];

export const ASSIGNRESPONSE: ResponseInterface = {
  id: 1,
  status: HabitStatus.SUSPENDED,
  createDateTime: new Date('2021-05-17'),
  habit: 2,
  userId: 13,
  duration: 7,
  workingDays: 5,
  habitStreak: 4,
  lastEnrollmentDate: new Date('2021-05-27')
};

export const HABITSFORDATE: HabitsForDateInterface[] = [
  {
    enrollDate: '2021-05-20',
    habitAssigns: [
      {
        enrolled: false,
        habitDescription: 'buying eco bags, to reduce amount of pollution in environment',
        habitAssignId: 2,
        habitName: 'buying eco bags'
      },
      {
        enrolled: true,
        habitDescription: 'buying eco brush, to reduce amount of pollution in environment',
        habitAssignId: 3,
        habitName: 'buying eco brush'
      }
    ]
  },
  {
    enrollDate: '2021-05-30',
    habitAssigns: [
      {
        enrolled: false,
        habitDescription: 'buying eco clothes, to reduce amount of pollution in environment',
        habitAssignId: 2,
        habitName: 'buying eco clothes'
      },
      {
        enrolled: true,
        habitDescription: 'buying healthy food, to reduce amount of pollution in environment',
        habitAssignId: 3,
        habitName: 'buying healthy food'
      }
    ]
  }
];

export const DEFAULTFULLINFOHABIT_2: HabitAssignInterface = {
  id: 1,
  status: HabitStatus.INPROGRESS,
  createDateTime: new Date('2023-04-14'),
  habit: DEFAULTHABIT,
  enrolled: true,
  userId: 17,
  duration: 8,
  workingDays: 2,
  habitStreak: 1,
  lastEnrollmentDate: new Date(2021, 5, 23),
  habitStatusCalendarDtoList: [
    { enrollDate: '2023-04-14', id: 2 },
    { enrollDate: '2023-04-10', id: 3 }
  ],
  toDoListItems: [
    {
      id: 6,
      status: TodoStatus.active,
      text: 'TEST'
    }
  ],
  progressNotificationHasDisplayed: false
};

export const CHANGES_FROM_CALENDAR: ChangesFromCalendarToProgress = {
  isEnrolled: true,
  date: '2024-04-25'
};

export const FRIENDSHABITPROGESS: FriendsHabitProgress[] = [
  {
    userId: 1,
    duration: 14,
    workingDays: 2
  }
];
