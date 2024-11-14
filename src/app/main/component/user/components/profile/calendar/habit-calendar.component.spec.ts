import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarBaseComponent } from '@shared/components';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@global-user/components';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarComponent, CalendarBaseComponent],
      imports: [HttpClientTestingModule, MatDialogModule, TranslateModule.forRoot()],
      providers: [{ provide: LanguageService, useValue: {} }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    component.calendarDay = [
      {
        date: new Date('Tue Jul 04 2023 10:49:04 GMT+0300'),
        numberOfDate: 2,
        year: 2023,
        month: 6,
        firstDay: 5,
        dayName: '',
        totalDaysInMonth: 31,
        hasHabitsInProgress: true,
        areHabitsDone: false,
        isCurrentDayActive: false
      }
    ];
    component.monthView = true;
    fixture.detectChanges();
  });

  it('should create CalendarComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should call function OnInit', () => {
    spyOn(component, 'bindDefaultTranslate');
    spyOn(component, 'subscribeToLangChange');
    spyOn(component, 'buildCalendar');
    spyOn(component, 'getUserHabits');
    component.ngOnInit();
    expect(component.bindDefaultTranslate).toHaveBeenCalled();
    expect(component.subscribeToLangChange).toHaveBeenCalled();
    expect(component.buildCalendar).toHaveBeenCalled();
    expect(component.getUserHabits).toHaveBeenCalledWith(true, component.calendarDay);
  });
});
