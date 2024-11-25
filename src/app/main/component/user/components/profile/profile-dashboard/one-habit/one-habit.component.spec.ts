import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HabitService } from '@global-service/habit/habit.service';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { OneHabitComponent } from './one-habit.component';
import { DatePipe } from '@angular/common';
import { By } from '@angular/platform-browser';

@Pipe({ name: 'datePipe' })
class DatePipeMock implements PipeTransform {
  transform(value: Date): string {
    return '2022-02-20';
  }
}

describe('OneHabitComponent', () => {
  let component: OneHabitComponent;
  let fixture: ComponentFixture<OneHabitComponent>;

  const fakeHabitStatusCalendarList = {
    enrollDate: '2022-02-19',
    id: 123
  };

  const fakeHabitAssign = {
    id: 123,
    status: 'ACQUIRED',
    habit: {
      id: 123,
      habitTranslation: {
        name: 'fakeName'
      },
      image: 'https://www.testgreencity.ga/blob/13231313.png'
    },
    duration: 44,
    workingDays: 4,
    habitStreak: 2,
    habitStatusCalendarDtoList: [fakeHabitStatusCalendarList]
  };

  const fakeHabit = {
    id: 321,
    status: 'INPROGRESS',
    habit: {
      id: 321,
      habitTranslation: {
        name: 'fakeName'
      },
      image: ''
    },
    duration: 33,
    workingDays: 4,
    habitStreak: 5,
    habitStatusCalendarDtoList: [fakeHabitStatusCalendarList]
  };

  const fakeFriendsTrakingSameHabit = [
    {
      id: 1,
      name: 'Ivanov',
      profilePicturePath: 'photo/qacsads.jpg'
    },
    {
      id: 2,
      name: 'Petrov',
      profilePicturePath: 'photo/petrov.jpg'
    }
  ];

  const habitAssignServiceMock = jasmine.createSpyObj('HabitAssignService', [
    'getAssignHabitsByPeriod',
    'enrollByHabit',
    'unenrollByHabit'
  ]);
  habitAssignServiceMock.habitsFromDashBoard = JSON.parse(
    JSON.stringify([
      {
        enrollDate: '2022-02-10',
        habitAssigns: [
          {
            habitId: 123,
            enrolled: false
          }
        ]
      }
    ])
  );
  habitAssignServiceMock.getAssignHabitsByPeriod.and.returnValue(of());
  const routerMock = jasmine.createSpyObj('router', ['navigate']);

  const habitServiceMock: HabitService = jasmine.createSpyObj('HabitService', ['getFriendsTrakingSameHabitByHabitAssignId']);
  habitServiceMock.getFriendsTrakingSameHabitByHabitAssignId = () => of();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot(), MatDialogModule, MatTooltipModule],
      declarations: [OneHabitComponent],
      providers: [
        { provide: HabitAssignService, useValue: habitAssignServiceMock },
        { provide: HabitService, useValue: habitServiceMock },
        { provide: DatePipe, useClass: DatePipeMock },
        { provide: Router, useValue: routerMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneHabitComponent);
    component = fixture.componentInstance;
    component.habit = fakeHabitAssign as any;
    component.friends = fakeFriendsTrakingSameHabit as any;
    fixture.detectChanges();
  });

  it('should create HabitsPopupComponent', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit', () => {
    const buildHabitDescriptionSpy = spyOn(component, 'buildHabitDescription');
    component.ngOnInit();
    expect(buildHabitDescriptionSpy).toHaveBeenCalled();
    expect(component.currentDate).toBe('2022-02-20');
  });

  it('goToHabitProfile', () => {
    spyOn(localStorage, 'getItem').and.returnValue('777');
    component.goToHabitProfile();
    expect(routerMock.navigate).toHaveBeenCalledWith(['profile/777/allhabits/edithabit/123']);
  });

  describe('buildHabitDescription', () => {
    it('makes expected calls if status is ACQUIRED', () => {
      component.currentDate = '2022-02-19';
      component.buildHabitDescription();
      expect(component.daysCounter).toBe(4);
      expect(component.showPhoto).toBeFalsy();
      expect(component.habitMark).toBe('acquired');
    });

    it('makes expected calls if status is INPROGRESS and a habit has the current date is equal to the registration date', () => {
      component.currentDate = '2022-02-19';
      component.habit = fakeHabit as any;
      component.buildHabitDescription();
      expect(component.daysCounter).toBe(4);
      expect(component.showPhoto).toBeFalsy();
      expect(component.habitMark).toBe('done');
    });

    it('makes expected calls if status is INPROGRESS and a habit has the current date is not equal to the registration date', () => {
      component.currentDate = '2022-02-20';
      component.habit = fakeHabit as any;
      component.buildHabitDescription();
      expect(component.daysCounter).toBe(4);
      expect(component.showPhoto).toBeTruthy();
      expect(component.habitMark).toBe('undone');
    });
  });

  describe('setGreenCircleInCalendar', () => {
    it('makes expected calls', () => {
      component.setGreenCircleInCalendar(true);
      expect(habitAssignServiceMock.getAssignHabitsByPeriod).toHaveBeenCalledWith('2022-02-20', '2022-02-20');
    });
  });

  describe('unenroll', () => {
    it('makes expected calls', () => {
      habitAssignServiceMock.unenrollByHabit.and.returnValue(of(fakeHabit));
      const setGreenCircleInCalendarSpy = spyOn(component, 'setGreenCircleInCalendar');
      const buildHabitDescriptionSpy = spyOn(component, 'buildHabitDescription');
      component.unenroll();
      expect(setGreenCircleInCalendarSpy).toHaveBeenCalledWith(false);
      expect(buildHabitDescriptionSpy).toHaveBeenCalled();
      expect(component.habit.habitStatusCalendarDtoList).toEqual([fakeHabitStatusCalendarList]);
      expect(component.habit.workingDays).toBe(4);
      expect(component.habit.habitStreak).toBe(5);
      expect(component.isRequest).toBeFalsy();
    });

    it('should get right description for one day in row on getDayName', () => {
      component.habit.habitStreak = 1;
      const value = component.getDayName();
      expect(value).toBe('user.habit.one-habit.good-day');
    });

    it('should get right description for days in row on getDayName', () => {
      component.habit.habitStreak = 2;
      const value = component.getDayName();
      expect(value).toBe('user.habit.one-habit.good-days');
    });
  });

  describe('habit image', () => {
    it('should be displayed', () => {
      const image = fixture.debugElement.query(By.css('.image')).nativeElement;
      expect(image.src).toBe('https://www.testgreencity.ga/blob/13231313.png');
    });
  });

  describe('getTooltipText', () => {
    it('should return string with friends names and new lines', () => {
      const friendsNames = component.getTooltipText();
      expect(friendsNames).toBe('Ivanov\nPetrov');
    });
  });
});
