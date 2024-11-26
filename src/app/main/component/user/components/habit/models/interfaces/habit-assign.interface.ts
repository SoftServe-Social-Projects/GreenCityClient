import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { ToDoList } from '@global-user/models/to-do-list.interface';
import { HabitInterface } from './habit.interface';

export interface HabitAssignInterface {
  id: number;
  status: HabitStatus;
  createDateTime: Date;
  habit: HabitInterface;
  complexity?: number;
  enrolled?: boolean;
  userId: number;
  duration: number;
  defaultDuration?: number;
  workingDays: number;
  habitStreak: number;
  lastEnrollmentDate: Date;
  habitStatusCalendarDtoList: Array<HabitStatusCalendarListInterface>;
  toDoListItems: Array<ToDoList>;
  progressNotificationHasDisplayed?: boolean;
}

export interface HabitStatusCalendarListInterface {
  enrollDate: string;
  id: number;
}

export interface ResponseInterface {
  id: number;
  status: HabitStatus;
  createDateTime: Date;
  habit: number;
  userId: number;
  duration: number;
  workingDays: number;
  habitStreak: number;
  lastEnrollmentDate: Date;
}
export interface ChangesFromCalendarToProgress {
  isEnrolled: boolean;
  date: string;
}

export interface UpdateHabitDuration {
  habitAssignId: number;
  habitId: number;
  userId: number;
  status: HabitStatus;
  workingDays: number;
  duration: number;
}

export interface FriendsHabitPopupModel {
  id: number;
  name: string;
  profilePicturePath: string;
  habitProgress: FriendsHabitProgress;
}

export interface FriendsHabitProgress {
  userId: number;
  duration: number;
  workingDays: number;
}
