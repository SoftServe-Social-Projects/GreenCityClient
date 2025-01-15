import { HabitListInterface } from '../models/interfaces/habit.interface';
import { CUSTOMHABIT, DEFAULTHABIT } from './habit-assigned-mock';
import { HabitStatisticsDto } from '@global-models/habit/HabitStatisticsDto';
import { DayEstimation } from '@global-models/habit/DayEstimation';
import { AvailableHabitDto } from '@global-models/habit/AvailableHabitDto';
import { NewHabitDto } from '@global-models/habit/NewHabitDto';
import { CustomHabit } from '@global-user/components/habit/models/interfaces/custom-habit.interface';
import { CustomHabitDtoRequest } from '@global-user/components/habit/models/interfaces/custom-habit.interface';
import { TodoStatus } from '../models/todo-status.enum';
import { HttpParams } from '@angular/common/http';
import { AddedCommentDTO, CommentsModel } from 'src/app/main/component/comments/models/comments-model';

export const MOCK_HABIT_ADDED_COMMENT: AddedCommentDTO = {
  author: { id: 1, name: 'User', profilePicturePath: null },
  id: 2,
  text: 'Test comment',
  modifiedDate: new Date().toISOString()
};

export const MOCK_HABIT_COMMENTS_MODEL: CommentsModel = {
  currentPage: 0,
  page: [
    {
      author: { id: 1, name: 'User', profilePicturePath: null },
      id: 1,
      text: 'Test comment',
      likes: 10,
      modifiedDate: new Date().toISOString(),
      status: 'ORIGINAL',
      replies: 0,
      currentUserLiked: false
    }
  ],
  totalElements: 1
};

export const HABITLIST: HabitListInterface = {
  page: [DEFAULTHABIT, CUSTOMHABIT],
  totalElements: 31,
  currentPage: 1,
  totalPages: 2
};

export const HABIT_STATISTIC_DTO: HabitStatisticsDto = {
  id: 1,
  habitRate: DayEstimation.GOOD,
  createdOn: new Date(),
  amountOfItems: 1,
  habitId: 1
};

export const HABIT_STATISTICS: HabitStatisticsDto = {
  id: 2,
  habitRate: DayEstimation.NORMAL,
  createdOn: new Date(),
  amountOfItems: 2,
  habitId: 2
};

export const AVAIL_HABIT_ARRAY_MOCK: AvailableHabitDto[] = [
  {
    id: 1,
    name: 'availableHabit1',
    description: 'description1'
  },
  {
    id: 2,
    name: 'availableHabit2',
    description: 'description2'
  },
  {
    id: 3,
    name: 'availableHabit3',
    description: 'description3'
  }
];

export const MOCK_CUSTOM_HABIT: CustomHabit = {
  title: 'testTitle',
  description: 'testDescription',
  complexity: 1,
  duration: 30,
  tagIds: [1, 2],
  image: 'testImage',
  toDoList: [
    {
      id: 2,
      text: 'Collapsible Silicone Water Bottle',
      status: TodoStatus.inprogress
    }
  ]
};

export const MOCK_CUSTOM_HABIT_RESPONSE: CustomHabitDtoRequest = {
  habitTranslations: [
    {
      name: MOCK_CUSTOM_HABIT.title,
      description: MOCK_CUSTOM_HABIT.description,
      habitItem: 'testHabitItem',
      languageCode: 'en',
      nameUa: MOCK_CUSTOM_HABIT.title,
      descriptionUa: MOCK_CUSTOM_HABIT.description,
      habitItemUa: 'testHabitItem'
    }
  ],
  complexity: MOCK_CUSTOM_HABIT.complexity,
  defaultDuration: MOCK_CUSTOM_HABIT.duration,
  image: MOCK_CUSTOM_HABIT.image,
  tagIds: MOCK_CUSTOM_HABIT.tagIds,
  customToDoListItemDto: MOCK_CUSTOM_HABIT.toDoList
};

export const NEW_HABIT_ARRAY_MOCK: NewHabitDto[] = [new NewHabitDto(1), new NewHabitDto(2), new NewHabitDto(3)];

export const CRITERIA_FILTER = new HttpParams()
  .set('lang', 'en')
  .set('page', '1')
  .set('size', '10')
  .set('sort', 'asc')
  .set('filters', 'filter1,filter2');

export const CRITERIA_TAGS = new HttpParams()
  .set('lang', 'en')
  .set('page', '1')
  .set('size', '1')
  .set('sort', 'asc')
  .set('excludeAssigned', 'false')
  .set('tags', 'test');

export const CRITERIA = new HttpParams().set('lang', 'en').set('page', '0').set('size', '6').set('sort', 'asc');

export const EXCLUDE_ASSIGNED_TRUE = new HttpParams()
  .set('lang', 'en')
  .set('page', '1')
  .set('size', '10')
  .set('sort', 'desc')
  .set('excludeAssigned', 'true')
  .set('isCustomHabit', 'true')
  .set('complexities', '1,2')
  .set('tags', 'Testing,Reusable');

export const EXCLUDE_ASSIGNED_FALSE = new HttpParams()
  .set('lang', 'en')
  .set('page', '1')
  .set('size', '10')
  .set('sort', 'desc')
  .set('excludeAssigned', 'false')
  .set('isCustomHabit', 'true')
  .set('complexities', '1,2')
  .set('tags', 'Testing,Reusable');

export const CUSTOM_HABIT_FALSE = new HttpParams()
  .set('lang', 'en')
  .set('page', '1')
  .set('size', '10')
  .set('sort', 'asc')
  .set('excludeAssigned', 'false')
  .set('isCustomHabit', 'false')
  .set('tags', 'tag2');

export const CUSTOM_HABIT_TRUE = new HttpParams()
  .set('lang', 'en')
  .set('page', '1')
  .set('size', '10')
  .set('sort', 'asc')
  .set('excludeAssigned', 'false')
  .set('isCustomHabit', 'true')
  .set('tags', 'tag2');
