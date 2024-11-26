import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AddNewHabitComponent } from './add-new-habit.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ToDoListService } from './habit-edit-to-do-list/to-do-list.service';
import { HabitService } from '@global-service/habit/habit.service';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CUSTOMFULLINFOHABIT, DEFAULTFULLINFOHABIT } from '@global-user/components/habit/mocks/habit-assigned-mock';
import { ECONEWSMOCK } from 'src/app/main/component/eco-news/mocks/eco-news-mock';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { DEFAULTHABIT } from '../mocks/habit-assigned-mock';
import { HABITLIST } from '../mocks/habit-mock';
import { take } from 'rxjs/operators';
import { HabitAcquireConfirm } from '../models/habit-warnings';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TodoStatus } from '../models/todo-status.enum';
import { HabitInterface, HabitTranslationInterface } from '../models/interfaces/habit.interface';
import { MOCK_CUSTOM_HABIT_RESPONSE } from '../mocks/habit-mock';

describe('AddNewHabitComponent', () => {
  let component: AddNewHabitComponent;
  let fixture: ComponentFixture<AddNewHabitComponent>;

  const mockActivatedRoute = {
    params: of({ habitId: 2 })
  };
  const locationMock = { back: () => {} };

  class MatDialogMock {
    open(): any {
      return {
        afterClosed: () => of(true)
      };
    }
  }

  const fakeHabitAssignService: HabitAssignService = jasmine.createSpyObj('fakeHabitAssignService', [
    'getHabitByAssignId',
    'deleteHabitById',
    'assignCustomHabit',
    'setHabitStatus',
    'progressNotificationHasDisplayed',
    'assignHabit',
    'updateHabitDuration'
  ]);
  fakeHabitAssignService.getHabitByAssignId = () => of(DEFAULTFULLINFOHABIT);
  fakeHabitAssignService.deleteHabitById = () => of();
  fakeHabitAssignService.assignCustomHabit = () => of();
  fakeHabitAssignService.setHabitStatus = () => of(DEFAULTFULLINFOHABIT);
  fakeHabitAssignService.progressNotificationHasDisplayed = () => of({});
  fakeHabitAssignService.assignHabit = () => of();
  fakeHabitAssignService.updateHabitDuration = () => of();

  const fakeHabitService: HabitService = jasmine.createSpyObj('fakeHabitService', [
    'getHabitById',
    'getHabitsByFilters',
    'deleteCustomHabit'
  ]);
  fakeHabitService.getHabitById = () => of(DEFAULTHABIT);
  fakeHabitService.getHabitsByFilters = () => of(HABITLIST);
  fakeHabitService.deleteCustomHabit = () => of(MOCK_CUSTOM_HABIT_RESPONSE);

  const fakeLocalStorageService: LocalStorageService = jasmine.createSpyObj('fakeLocalStorageService', { getCurrentLanguage: () => 'ua' });
  fakeLocalStorageService.setEditMode = (key: string, permission: boolean) => {
    localStorage.setItem(key, `${permission}`);
  };
  fakeLocalStorageService.getUserId = () => 2;
  fakeLocalStorageService.languageSubject = new Subject<string>();
  fakeLocalStorageService.languageSubject.next('ua');

  const matSnackBarMock: MatSnackBarComponent = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);

  const fakeToDoListService: ToDoListService = jasmine.createSpyObj('fakeToDoListService', [
    'getHabitAllToDoLists',
    'getHabitToDoList',
    'updateHabitToDoList'
  ]);
  fakeToDoListService.getHabitAllToDoLists = () => of();
  fakeToDoListService.getHabitToDoList = () => of();
  fakeToDoListService.updateHabitToDoList = () => of();

  matSnackBarMock.openSnackBar = (type: string) => type;

  const ecoNewsServiceMock = jasmine.createSpyObj('EcoNewsService', ['getEcoNewsListByPage']);
  ecoNewsServiceMock.getEcoNewsListByPage = () => of(ECONEWSMOCK);

  const routerMock: Router = jasmine.createSpyObj('router', ['navigate']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddNewHabitComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        NoopAnimationsModule,
        MatDialogModule,
        BrowserModule,
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
        { provide: MatSnackBarComponent, useValue: matSnackBarMock },
        { provide: HabitService, useValue: fakeHabitService },
        { provide: HabitAssignService, useValue: fakeHabitAssignService },
        { provide: EcoNewsService, useValue: ecoNewsServiceMock },
        { provide: ToDoListService, useValue: fakeToDoListService },
        { provide: LocalStorageService, useValue: fakeLocalStorageService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Location, useValue: locationMock },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: Router, useValue: routerMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewHabitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.habitResponse = { habitTranslation: { name: 'fake-name' } as HabitTranslationInterface } as HabitInterface;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back on onGoBack without call dialog', () => {
    component.initialDuration = 1;
    component.newDuration = 1;
    component.standardToDoList = null;
    component.customToDoList = null;
    const spy = spyOn(locationMock, 'back');
    component.onGoBack();
    expect(spy).toHaveBeenCalled();
  });

  it('getDuration should set this.newDuration', fakeAsync(() => {
    component.getDuration(1);
    tick();
    expect(component.newDuration).toEqual(1);
  }));

  it('should set canAcquire false on getProgressValue', () => {
    component.assignedHabit = DEFAULTFULLINFOHABIT;
    component.getProgressValue(60);
    expect(component.canAcquire).toBeFalsy();
  });

  it('should set canAcquire true on getProgressValue', () => {
    component.assignedHabit = DEFAULTFULLINFOHABIT;
    component.getProgressValue(80);
    expect(component.canAcquire).toBeTruthy();
  });

  it('should set standardToDoList', () => {
    component.getList(DEFAULTFULLINFOHABIT.toDoListItems);
    expect(component.standardToDoList).toEqual([{ id: 6, status: TodoStatus.active, text: 'TEST' }]);
    expect(component.customToDoList).toEqual([]);
  });

  it('should set and customToDoList', () => {
    component.getList(CUSTOMFULLINFOHABIT.toDoListItems);
    expect(component.customToDoList).toEqual([{ id: 6, status: TodoStatus.active, text: 'TEST', custom: true }]);
    expect(component.standardToDoList).toEqual([]);
  });

  it('should set standardToDoList and customToDoList', () => {
    const toDoListItems = DEFAULTFULLINFOHABIT.toDoListItems.concat(CUSTOMFULLINFOHABIT.toDoListItems);
    component.getList(toDoListItems);
    expect(component.customToDoList).toEqual(toDoListItems.filter((item) => item.custom));
    expect(component.standardToDoList).toEqual(toDoListItems.filter((item) => !item.custom));
  });
});
