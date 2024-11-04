import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { calendarIcons } from 'src/app/main/image-pathes/calendar-icons';
import { HabitPopupInterface, HabitPopUpRoutes } from '../habit-popup-interface';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { DatePipe } from '@angular/common';
import {
  HabitAssignInterface,
  HabitStatusCalendarListInterface
} from '@global-user/components/habit/models/interfaces/habit-assign.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-habits-popup',
  templateUrl: './habits-popup.component.html',
  styleUrls: ['./habits-popup.component.scss']
})
export class HabitsPopupComponent implements OnInit, OnDestroy {
  language: string;
  today: string;
  calendarIcons = calendarIcons;
  habitsCalendarSelectedDate: string;
  isHabitListEditable: boolean;
  popupHabits: HabitPopupInterface[];
  arrayOfDate: Array<HabitStatusCalendarListInterface>;
  trimWidth = 30;
  destroy = new Subject<void>();
  arrayOfDay: Date[];
  habitStreak = 0;
  currentDate: Date;
  currentPage: 'editHabit' | 'createHabit' | 'profileHabits';

  constructor(
    public dialogRef: MatDialogRef<HabitsPopupComponent>,
    public habitAssignService: HabitAssignService,
    public datePipe: DatePipe,
    public languageService: LanguageService,
    public router: Router,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      habitsCalendarSelectedDate: string;
      isHabitListEditable: boolean;
      habits: HabitPopupInterface[];
    }
  ) {}

  ngOnInit() {
    this.loadPopup();
    this.closePopup();
    this.checkCurrentPage();
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  loadPopup() {
    this.language = this.languageService.getCurrentLanguage();
    this.habitsCalendarSelectedDate = this.formatSelectedDate(this.data.habitsCalendarSelectedDate);
    this.isHabitListEditable = this.data.isHabitListEditable;
    this.popupHabits = this.data.habits.map((habit) => ({ ...habit }));
    this.today = this.formatSelectedDate().toString();
  }

  closePopup(): void {
    if (this.dialogRef) {
      this.dialogRef
        .beforeClosed()
        .pipe(takeUntil(this.destroy))
        .subscribe(() => this.dialogRef.close(this.popupHabits));
    }
  }

  formatSelectedDate(dateString?: string) {
    const date = dateString ? new Date(dateString) : new Date();
    const monthLow = date.toLocaleDateString(this.language === 'ua' ? 'uk' : this.language, { month: 'long' });
    const month = monthLow.charAt(0).toUpperCase() + monthLow.slice(1);
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  setWorkingDaysForVisibleHabit(enrolled: boolean, id: number) {
    const valueHabitsInProgressToView = this.habitAssignService.habitsInProgressToView.find((item) => item.id === id);
    const valueHabitsInProgress = this.habitAssignService.habitsInProgress.find((item) => item.id === id);
    if (valueHabitsInProgressToView !== undefined) {
      enrolled ? valueHabitsInProgressToView.workingDays++ : valueHabitsInProgressToView.workingDays--;
      this.habitAssignService.habitsInProgressToView = this.habitAssignService.habitsInProgressToView.map((obj) => ({ ...obj }));
    } else if (valueHabitsInProgress !== undefined) {
      enrolled ? valueHabitsInProgress.workingDays++ : valueHabitsInProgress.workingDays--;
      this.habitAssignService.habitsInProgress = this.habitAssignService.habitsInProgress.map((obj) => ({ ...obj }));
    }
  }

  sortByDueDate(): void {
    this.arrayOfDay.sort((a, b) => b.getTime() - a.getTime());
  }

  setHabitStreak(array: HabitStatusCalendarListInterface[], id: number, isEnrolled: boolean, isExistArray: HabitAssignInterface) {
    if (!this.habitAssignService.mapOfArrayOfAllDate.has(id)) {
      this.arrayOfDay = array.map((item) => new Date(item.enrollDate));
      this.habitAssignService.mapOfArrayOfAllDate.set(id, this.arrayOfDay);
    }

    this.arrayOfDay = this.habitAssignService.mapOfArrayOfAllDate.get(id) || [];
    this.arrayOfDay = this.arrayOfDay.map((date) => new Date(date));
    const dataExistArray = this.arrayOfDay.some((item) => item.getDate() === this.habitAssignService.habitDate.getDate());
    if (isEnrolled && !dataExistArray) {
      this.arrayOfDay.push(this.habitAssignService.habitDate);
    } else if (!isEnrolled && dataExistArray) {
      this.arrayOfDay = this.arrayOfDay.filter((day) => day.getDate() !== this.habitAssignService.habitDate.getDate());
    }
    this.sortByDueDate();
    this.habitAssignService.mapOfArrayOfAllDate.set(id, this.arrayOfDay);
    this.currentDate = new Date();
    this.habitStreak = 0;
    for (const value of this.arrayOfDay) {
      if (this.currentDate.getDate() !== value.getDate()) {
        break;
      }
      this.habitStreak++;
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    }
    this.updateHabitsCardsCircleAndStreak(id, isExistArray, this.habitStreak);
    this.habitStreak = 0;
  }

  updateHabitsCardsCircleAndStreak(id: number, isExistArray: any, value: any) {
    const ifValueNumber = Number.isInteger(value);
    const visitableArray = this.habitAssignService.habitsInProgressToView.find((item) => item.id === id);
    const invisibleArray = this.habitAssignService.habitsInProgress.find((item) => item.id === id);
    if (isExistArray !== undefined) {
      if (ifValueNumber) {
        visitableArray.habitStreak = value;
      } else {
        visitableArray.habitStatusCalendarDtoList = value;
      }
    } else {
      if (ifValueNumber) {
        invisibleArray.habitStreak = value;
      } else {
        invisibleArray.habitStatusCalendarDtoList = value;
      }
    }
  }

  setCircleFromPopUpToCards(id: number, isEnrolled: boolean) {
    const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    const isExistArray = this.habitAssignService.habitsInProgressToView.find((item) => item.id === id);
    this.setWorkingDaysForVisibleHabit(isEnrolled, id);
    this.arrayOfDate = this.habitAssignService.habitsInProgress.find((item) => item.id === id).habitStatusCalendarDtoList;
    if (this.habitsCalendarSelectedDate === this.today) {
      if (isEnrolled) {
        this.arrayOfDate.push({ enrollDate: currentDate, id: null });
      } else {
        this.arrayOfDate = this.arrayOfDate.filter((item) => item.enrollDate !== currentDate);
      }
      this.updateHabitsCardsCircleAndStreak(id, isExistArray, this.arrayOfDate);
    }
    this.setHabitStreak(this.arrayOfDate, id, isEnrolled, isExistArray);
  }

  toggleEnrollHabit(id: number) {
    const habitIndex = this.popupHabits.findIndex((habit) => habit.habitAssignId === id);
    this.popupHabits[habitIndex].enrolled = !this.popupHabits[habitIndex].enrolled;
    if (this.currentPage === 'editHabit' && id === this.habitAssignService.habitForEdit.id) {
      const changes = {
        date: this.datePipe.transform(this.data.habitsCalendarSelectedDate, 'yyyy-MM-dd'),
        isEnrolled: this.popupHabits[habitIndex].enrolled
      };
      this.habitAssignService.setCircleFromPopUpToProgress(changes);
    }
    if (this.currentPage === 'profileHabits') {
      this.setCircleFromPopUpToCards(id, this.popupHabits[habitIndex].enrolled);
    }
  }

  checkCurrentPage() {
    if (this.router.url.includes(HabitPopUpRoutes.EditHabit)) {
      this.currentPage = 'editHabit';
    } else if (this.router.url.includes(HabitPopUpRoutes.CreateHabit)) {
      this.currentPage = 'createHabit';
    } else {
      this.currentPage = 'profileHabits';
    }
  }

  showTooltip(habit: HabitPopupInterface): boolean {
    return habit.habitName.length < this.trimWidth;
  }
}
