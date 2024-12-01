import { ToDoList } from '@global-user/models/to-do-list.interface';

export interface HabitInterface {
  defaultDuration: number;
  habitTranslation: HabitTranslationInterface;
  id: number;
  image: string;
  isAssigned?: boolean;
  assignId?: number;
  complexity?: number;
  amountAcquiredUsers: number;
  habitAssignStatus?: string;
  isCustomHabit: boolean;
  usersIdWhoCreatedCustomHabit: number;
  customToDoListItems?: ToDoList[];
  toDoListItems?: ToDoList[];
  tags: Array<string>;
  duration?: number;
}

export interface HabitTranslationInterface {
  description: string;
  habitItem: any;
  languageCode: string;
  name: string;
  nameUa: string;
  descriptionUa: string;
  habitItemUa: any;
}

export interface HabitListInterface {
  currentPage: number;
  page: Array<HabitInterface>;
  totalElements: number;
  totalPages: number;
}
