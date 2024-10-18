import { DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, HostListener } from '@angular/core';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { HabitMark } from '@global-user/components/habit/models/HabitMark.enum';
import { take } from 'rxjs/operators';
import {
  HabitAssignInterface,
  ChangesFromCalendarToProgress,
  HabitStatusCalendarListInterface
} from '../../models/interfaces/habit-assign.interface';

@Component({
  selector: 'app-habit-progress',
  templateUrl: './habit-progress.component.html',
  styleUrls: ['./habit-progress.component.scss']
})
export class HabitProgressComponent implements OnChanges, OnInit {
  @Input() habit: HabitAssignInterface;
  @Input() set duration(value: number) {
    if (!!value && this.habit) {
      this.habit.duration = value;
      this.countProgressBar();
    }
  }

  indicator: number;
  isRequest = false;
  currentDate: string;
  habitMark: string;
  heightThumbLabel = 4;
  isHidden = false;
  millisecondsOfDay = 1000 * 3600 * 24;
  screenBreakpoint = 1024;
  isDesktopWidth: boolean;
  private descriptionType = {
    acquired: () => {
      this.habitMark = HabitMark.ACQUIRED;
    },
    done: () => {
      this.habitMark = HabitMark.DONE;
    },
    undone: () => {
      this.habitMark = HabitMark.UNDONE;
    }
  };

  @Output() nowAcquiredHabit = new EventEmitter();
  @Output() progressValue = new EventEmitter<number>();

  constructor(
    private habitAssignService: HabitAssignService,
    public datePipe: DatePipe
  ) {}

  ngOnChanges() {
    this.currentDate = this.datePipe.transform(new Date(), 'yyy-MM-dd');
    if (this.habit) {
      this.buildHabitDescription();
      this.countProgressBar();
      console.log(this.habit);
    }
    this.habitAssignService.habitForEdit = this.habit;
  }

  ngOnInit(): void {
    this.isDesktopWidth = this.isDeskWidth();
    this.habitAssignService.habitChangesFromCalendarSubj.subscribe((changes) => {
      if (changes.date === this.currentDate) {
        changes.isEnrolled ? this.descriptionType.done() : this.descriptionType.undone();
      }
      this.updateHabitSteak(changes);
      this.countProgressBar();
    });
    console.log(this.habit);
  }

  @HostListener('window:resize') public checkDisplayWidth() {
    this.isDesktopWidth = this.isDeskWidth();
  }

  isDeskWidth(): boolean {
    return window.innerWidth > this.screenBreakpoint;
  }

  countDifferenceInDays(date1: string, date2: string): number {
    return (new Date(date1).getTime() - new Date(date2).getTime()) / this.millisecondsOfDay;
  }

  sortHabitStatusCalendarDtoListByDate() {
    return this.habit.habitStatusCalendarDtoList.sort(
      (a: HabitStatusCalendarListInterface, b: HabitStatusCalendarListInterface) =>
        new Date(b.enrollDate).getTime() - new Date(a.enrollDate).getTime()
    );
  }

  updateHabitSteak(changes: ChangesFromCalendarToProgress): void {
    if (changes.isEnrolled) {
      this.habit.habitStatusCalendarDtoList.push({
        enrollDate: changes.date,
        id: null
      });
    } else {
      this.habit.habitStatusCalendarDtoList = this.habit.habitStatusCalendarDtoList.filter((habit) => habit.enrollDate !== changes.date);
    }
    const sortedCalendarDtoList = this.sortHabitStatusCalendarDtoListByDate();
    if (sortedCalendarDtoList[0]?.enrollDate !== this.currentDate) {
      this.habit.habitStreak = 0;
    } else {
      this.habit.habitStreak = sortedCalendarDtoList.filter((el, index, arr) =>
        index ? this.countDifferenceInDays(arr[0].enrollDate, el.enrollDate) === index : true
      ).length;
    }
    this.habit.workingDays = this.habit.habitStatusCalendarDtoList.length;
  }

  countProgressBar(): void {
    this.indicator = Math.round((this.habit.workingDays / this.habit.duration) * 100);
    this.progressValue.emit(this.indicator);
  }

  buildHabitDescription(): void {
    if (this.habit.status === HabitStatus.ACQUIRED) {
      this.descriptionType.acquired();
    } else if (this.habit.status === HabitStatus.INPROGRESS) {
      const isDone = this.habit.habitStatusCalendarDtoList.some((item) => item.enrollDate === this.currentDate);
      if (isDone) {
        this.descriptionType.done();
      } else {
        this.descriptionType.undone();
      }
    }
  }

  enroll() {
    this.isRequest = true;
    this.habitAssignService
      .enrollByHabit(this.habit.id, this.currentDate)
      .pipe(take(1))
      .subscribe((response: HabitAssignInterface) => {
        if (response.status === HabitStatus.ACQUIRED) {
          this.descriptionType.acquired();
          this.nowAcquiredHabit.emit(response);
        } else {
          this.setGreenCircleInCalendar(true);
          this.updateHabit(response);
        }
      });
  }

  unenroll() {
    this.isRequest = true;
    this.habitAssignService
      .unenrollByHabit(this.habit.id, this.currentDate)
      .pipe(take(1))
      .subscribe((response: HabitAssignInterface) => {
        this.setGreenCircleInCalendar(false);
        this.updateHabit(response);
      });
  }

  private updateHabit(response: HabitAssignInterface): void {
    this.habit.habitStatusCalendarDtoList = response.habitStatusCalendarDtoList;
    this.habit.workingDays = response.workingDays;
    this.habit.habitStreak = response.habitStreak;
    this.buildHabitDescription();
    this.countProgressBar();
    this.isRequest = false;
  }

  setGreenCircleInCalendar(isSetCircle: boolean) {
    const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    const lastDayInMonth = this.datePipe.transform(lastDay, 'yyy-MM-dd');
    const dataFromDashBoard = this.habitAssignService.habitsFromDashBoard.find((item) => item.enrollDate === this.currentDate);
    if (dataFromDashBoard) {
      dataFromDashBoard.habitAssigns.find((item) => item.habitAssignId === this.habit.id).enrolled = isSetCircle;
    } else {
      this.habitAssignService.getAssignHabitsByPeriod(this.currentDate, lastDayInMonth).subscribe((res) => {
        this.habitAssignService.habitsFromDashBoard = res;
        this.habitAssignService.habitsFromDashBoard
          .find((item) => item.enrollDate === this.currentDate)
          .habitAssigns.find((item) => item.habitAssignId === this.habit.id).enrolled = isSetCircle;
      });
    }
  }

  getDayName(): string {
    return this.habit.habitStreak === 1 ? 'user.habit.one-habit.good-day' : 'user.habit.one-habit.good-days';
  }
}
