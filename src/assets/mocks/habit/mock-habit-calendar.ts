import { HabitPopupInterface, HabitsForDateInterface } from '@global-user/components/profile/calendar/habit-popup-interface';
import { CalendarInterface } from '@global-user/components/profile/calendar/calendar-interface';
import { BaseCalendar } from '@global-user/components/profile/calendar/calendar-week/calendar-week-interface';

export const mockHabits = {
  id: 1,
  status: 'INPROGRESS',
  userId: 10,
  duration: 20,
  workingDays: 2,
  habitStreak: 10,
  habit: {
    toDoListItems: [{ id: 1, status: 'INPROGRESS', text: 'text', selected: true, custom: true }]
  }
};

export const mockPopupHabits: HabitPopupInterface[] = [
  {
    enrolled: false,
    habitDescription: 'Eating local food is good for air quality and reducing environmental emissions!',
    habitAssignId: 503,
    habitName: 'Buy local products'
  },
  {
    enrolled: true,
    habitDescription: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia',
    habitAssignId: 506,
    habitName: 'Use less transport'
  }
];
export const mockData = {
  habitsCalendarSelectedDate: '2022-02-20',
  isHabitListEditable: true,
  habits: mockPopupHabits
};

export const habitMockFalse = [
  {
    enrolled: false,
    habitDescription: 'test',
    habitAssignId: 0,
    habitName: 'test'
  }
];

export const habitMock = [
  {
    enrolled: true,
    habitDescription: 'test',
    habitAssignId: 0,
    habitName: 'test'
  }
] as HabitPopupInterface[];

export const habitsList = [
  {
    habitAssigns: [
      {
        enrolled: true,
        habitDescription: 'Description 1',
        habitAssignId: 1,
        habitName: 'Habit 1'
      }
    ],
    enrollDate: '2024-01-01'
  },
  {
    habitAssigns: [
      {
        enrolled: false,
        habitDescription: 'Description 2',
        habitAssignId: 2,
        habitName: 'Habit 2'
      }
    ],
    enrollDate: '2024-01-02'
  },
  {
    habitAssigns: [
      {
        enrolled: true,
        habitDescription: 'Description 3',
        habitAssignId: 3,
        habitName: 'Habit 3'
      }
    ],
    enrollDate: '2024-01-03'
  }
] as HabitsForDateInterface[];

export const calendarDay = [
  {
    numberOfDate: new Date().getDate(),
    date: new Date(),
    month: 5,
    year: 2021,
    firstDay: 1,
    totalDaysInMonth: 30,
    dayName: 'test',
    hasHabitsInProgress: true,
    areHabitsDone: false,
    isCurrentDayActive: undefined
  },
  {
    numberOfDate: 2,
    date: new Date(),
    month: 5,
    year: 2021,
    firstDay: 1,
    totalDaysInMonth: 30,
    dayName: 'test',
    hasHabitsInProgress: true,
    areHabitsDone: false,
    isCurrentDayActive: undefined
  },
  {
    numberOfDate: 8,
    date: new Date(),
    month: 5,
    year: 2020,
    firstDay: 1,
    totalDaysInMonth: 30,
    dayName: 'test',
    hasHabitsInProgress: true,
    areHabitsDone: false,
    isCurrentDayActive: undefined
  },
  {
    numberOfDate: 4,
    date: new Date(),
    month: 8,
    year: 2021,
    firstDay: 1,
    totalDaysInMonth: 30,
    dayName: 'test',
    hasHabitsInProgress: true,
    areHabitsDone: false,
    isCurrentDayActive: undefined
  },
  {
    numberOfDate: 8,
    date: new Date(2021, 5, 8),
    month: 5,
    year: 2021,
    firstDay: 1,
    totalDaysInMonth: 30,
    dayName: 'test',
    hasHabitsInProgress: true,
    areHabitsDone: false,
    isCurrentDayActive: true
  },
  {
    numberOfDate: 8,
    date: new Date('2023-06-26'),
    month: 5,
    year: 2023,
    firstDay: 1,
    totalDaysInMonth: 31,
    dayName: 'test',
    hasHabitsInProgress: true,
    areHabitsDone: true,
    isCurrentDayActive: undefined
  },
  {
    numberOfDate: 8,
    date: new Date('26 Jun 2023'),
    month: 5,
    year: 2023,
    firstDay: 1,
    totalDaysInMonth: 31,
    dayName: 'test',
    hasHabitsInProgress: true,
    areHabitsDone: false,
    isCurrentDayActive: undefined
  }
] as CalendarInterface[];

export const calendarMock: CalendarInterface = {
  numberOfDate: 11,
  date: new Date('26 Jun 2024'),
  month: 0,
  year: 2020,
  firstDay: 1,
  totalDaysInMonth: 30,
  dayName: 'test',
  hasHabitsInProgress: true,
  areHabitsDone: false,
  isCurrentDayActive: false
};

export const baseDays = [
  {
    numberOfDate: 1,
    year: 2020,
    month: 7,
    date: new Date(),
    hasHabitsInProgress: false,
    areHabitsDone: false
  },
  {
    numberOfDate: 2,
    year: 2020,
    month: 7,
    date: new Date(),
    hasHabitsInProgress: false,
    areHabitsDone: false
  }
] as BaseCalendar[];
