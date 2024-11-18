import { FilterSelect } from 'src/app/main/interface/filter-select.interface';

export const HabitsFiltersList: FilterSelect[] = [
  {
    name: 'tags',
    title: 'user.habit.all-habits.filters.tags.title',
    selectAllOption: 'user.habit.all-habits.filters.tags.select-all',
    isAllSelected: false,
    options: []
  },
  {
    name: 'complexities',
    title: 'user.habit.all-habits.filters.complexities.title',
    selectAllOption: 'user.habit.all-habits.filters.complexities.select-all',
    isAllSelected: false,
    options: [
      { name: 'Easy', nameUa: 'Легка', value: '1', isActive: false },
      { name: 'Medium', nameUa: 'Середня', value: '2', isActive: false },
      { name: 'Hard', nameUa: 'Важка', value: '3', isActive: false }
    ]
  },
  {
    name: 'isCustomHabit',
    title: 'user.habit.all-habits.filters.is-custom.title',
    selectAllOption: 'user.habit.all-habits.filters.is-custom.select-all',
    isAllSelected: false,
    options: [
      { name: 'Default', nameUa: 'Стандартні', value: 'false', isActive: false },
      { name: 'Custom', nameUa: 'Створені', value: 'true', isActive: false }
    ]
  }
];
