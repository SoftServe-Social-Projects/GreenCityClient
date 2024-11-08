import { ToDoList } from '@global-user/models/to-do-list.interface';
import { HabitTranslationInterface } from './habit.interface';

export interface CustomHabitDtoRequest {
  habitTranslations: HabitTranslationInterface[];
  complexity: number;
  defaultDuration: number;
  image: string;
  tagIds: number[];
  customToDoListItemDto: ToDoList[];
  id?: number;
  userId?: number;
}

export interface CustomHabit {
  title: string;
  description: string;
  complexity: number;
  duration: number;
  tagIds: number[];
  image: string;
  toDoList: ToDoList[];
}
