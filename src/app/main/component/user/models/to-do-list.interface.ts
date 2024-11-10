import { TodoStatus } from '@global-user/components/habit/models/todo-status.enum';

export interface ToDoList {
  id: null | number;
  status: TodoStatus;
  text: string;
  selected?: boolean;
  custom?: boolean;
}

export interface AllToDoLists {
  userToDoListItemDto: ToDoList[];
  customToDoListItemDto: ToDoList[];
}

export interface CustomToDoItem {
  text: string;
}

export interface HabitUpdateToDoList {
  habitAssignId: number;
  standardToDoList: ToDoList[];
  customToDoList: ToDoList[];
  lang: string;
}
