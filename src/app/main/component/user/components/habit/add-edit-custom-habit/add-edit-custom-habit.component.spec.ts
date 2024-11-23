import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { HabitService } from '@global-service/habit/habit.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HabitDurationComponent } from '@global-user/components/habit/add-new-habit/habit-duration/habit-duration.component';
import { HabitEditToDoListComponent } from '@global-user/components/habit/add-new-habit/habit-edit-to-do-list/habit-edit-to-do-list.component';
import { HabitInviteFriendsComponent } from '@global-user/components/habit/add-new-habit/habit-invite-friends/habit-invite-friends.component';
import { HabitProgressComponent } from '@global-user/components/habit/add-new-habit/habit-progress/habit-progress.component';
import { CalendarWeekComponent } from '@global-user/components/profile/calendar/calendar-week/calendar-week.component';
import { ToDoList } from '@global-user/models/to-do-list.interface';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DragAndDropComponent } from '@shared/components/drag-and-drop/drag-and-drop.component';
import { SelectImagesComponent } from '@shared/components/select-images/select-images.component';
import { TagInterface } from '@shared/components/tag-filter/tag-filter.model';
import { TagsSelectComponent } from '@shared/components/tags-select/tags-select.component';
import { EditorChangeContent, QuillModule } from 'ngx-quill';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Language } from 'src/app/main/i18n/Language';
import { LangValueDirective } from 'src/app/shared/directives/lang-value/lang-value.directive';
import { TodoStatus } from '../models/todo-status.enum';
import { AddEditCustomHabitComponent } from './add-edit-custom-habit.component';
import { CalendarComponent } from '@global-user/components';

describe('AddEditCustomHabitComponent', () => {
  let component: AddEditCustomHabitComponent;
  let fixture: ComponentFixture<AddEditCustomHabitComponent>;
  const initialState = { habit: { defaultDuration: 1 } };
  const mockEvent: EditorChangeContent = {
    event: 'text-change',
    text: 'Updated text',
    content: null,
    delta: null,
    editor: null,
    html: null,
    oldDelta: null,
    source: null
  };
  const tagsMock: TagInterface[] = [{ id: 1, name: 'Tag', nameUa: 'Тег', isActive: true }];
  const localStorageServiceMock = jasmine.createSpyObj('localStorageService', ['getUserId', 'getCurrentLanguage', 'pipe']);

  localStorageServiceMock.getUserId = () => 2;
  localStorageServiceMock.languageSubject = new Subject<string>();
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject<number>(2);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject<string>('ua');
  localStorageServiceMock.getCurrentLanguage = () => 'ua' as Language;

  const habitServiceMock = jasmine.createSpyObj('fakeHabitService', ['getAllTags', 'addCustomHabit', 'deleteCustomHabit']);
  habitServiceMock.getAllTags = () => of(tagsMock);
  habitServiceMock.addCustomHabit = () => of(null);
  habitServiceMock.deleteCustomHabit = () => of({});

  const habitAssignServiceMock = jasmine.createSpyObj('fakeHabitAssignService', [
    'getHabitByAssignId',
    'getAssignHabitsByPeriod',
    'getAssignedHabits',
    'getFriendsTrakingSameHabitByHabitAssignId'
  ]);
  habitAssignServiceMock.getHabitByAssignId = () => of(initialState);
  habitAssignServiceMock.getAssignHabitsByPeriod = () => of([]);
  habitAssignServiceMock.getAssignedHabits = () => of([]);
  habitServiceMock.getFriendsTrakingSameHabitByHabitAssignId = () => of([]);

  const routerMock: Router = jasmine.createSpyObj('router', ['navigate']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AddEditCustomHabitComponent,
        TagsSelectComponent,
        DragAndDropComponent,
        HabitDurationComponent,
        CalendarWeekComponent,
        CalendarComponent,
        HabitEditToDoListComponent,
        HabitInviteFriendsComponent,
        HabitProgressComponent,
        SelectImagesComponent,
        LangValueDirective
      ],
      imports: [
        NgbModule,
        FormsModule,
        QuillModule.forRoot(),
        TranslateModule.forRoot(),
        RouterTestingModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatDialogModule,
        MatSnackBarModule,
        MatSliderModule
      ],
      providers: [
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: HabitService, useValue: habitServiceMock },
        { provide: HabitAssignService, useValue: habitAssignServiceMock },
        { provide: Router, useValue: routerMock },
        provideMockStore({ initialState }),
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 123 })
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditCustomHabitComponent);
    component = fixture.componentInstance;
    habitAssignServiceMock.habitChangesFromCalendarSubj = new Subject();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getStars should return right star image', () => {
    let starImage = component.getStars(1, 3);
    expect(starImage).toBe('assets/img/icon/star-1.png');
    starImage = component.getStars(3, 2);
    expect(starImage).toBe('assets/img/icon/star-2.png');
  });

  it('should trim value', () => {
    const titleControl = component.habitForm.get('title');
    titleControl.setValue('    ab ');
    component.trimValue(titleControl);
    expect(titleControl.value).toBe('ab');
  });

  it('should call goToAllHabits on addHabit', () => {
    const spy = spyOn(component, 'goToAllHabits');
    component.addHabit();
    expect(spy).toHaveBeenCalled();
  });

  it('should call changeCustomHabit() and goToAllHabits() on success', () => {
    const habitFormValue = { title: 'Title', description: 'Description', complexity: 1, duration: 7, tagIds: [1], image: '', toDoList: [] };
    component.habitForm.setValue(habitFormValue);
    habitServiceMock.changeCustomHabit = jasmine.createSpy('changeCustomHabit').and.returnValue(of(null));
    spyOn(component, 'goToAllHabits');
    component.saveHabit();
    expect(habitServiceMock.changeCustomHabit).toHaveBeenCalled();
    expect(component.goToAllHabits).toHaveBeenCalled();
  });

  it('should set the complexity field in the form', () => {
    const complexityValue = 2;
    component.setComplexity(complexityValue);
    expect(component.habitForm.get('complexity').value).toEqual(complexityValue + 1);
  });

  it('should not update editorText when event is selection-change', () => {
    const spy = spyOn(component, 'handleErrorClass').and.callThrough();
    component.changedEditor(mockEvent);
    expect(spy).toHaveBeenCalledWith('warning');
  });

  it('should set errors when description is valid', () => {
    const mockForm: FormGroup = TestBed.inject(FormBuilder).group({ description: ['Short'] });
    component.habitForm = mockForm;
    component.handleErrorClass('warning');
    expect(mockForm.get('description').errors).toEqual({ invalidDescription: false });
  });

  it('should call handleHabitDelete after habit has been deleted', () => {
    const spy = spyOn(component, 'handleHabitDelete');
    component.handleHabitDelete();

    expect(spy).toHaveBeenCalled();
  });

  it('should navigate to all habits after habit has been deleted', () => {
    component.handleHabitDelete();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/profile/2/allhabits']);
  });
});
