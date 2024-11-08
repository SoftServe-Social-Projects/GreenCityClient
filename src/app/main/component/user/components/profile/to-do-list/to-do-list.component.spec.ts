import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToDoListComponent } from '@global-user/components';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { of, BehaviorSubject } from 'rxjs';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToDoListService } from '@global-user/components/habit/add-new-habit/habit-edit-to-do-list/to-do-list.service';
import { Language } from 'src/app/main/i18n/Language';
import { TODOLISTITEMONE, TODOLISTITEMTWO } from '@global-user/components/habit/mocks/to-do-list-mock';
import { TODOLIST } from '@global-user/components/habit/mocks/to-do-list-mock';
import { ALLUSERTODOLISTS } from '@global-user/components/habit/mocks/to-do-list-mock';
import { CorrectUnitPipe } from 'src/app/shared/correct-unit-pipe/correct-unit.pipe';
import { TodoStatus } from '@global-user/components/habit/models/todo-status.enum';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('ToDoListComponent', () => {
  let component: ToDoListComponent;
  let fixture: ComponentFixture<ToDoListComponent>;

  const localStorageServiceMock = jasmine.createSpyObj('localStorageService', [
    'languageBehaviourSubject',
    'getCurrentLanguage',
    'getUserId'
  ]);
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');
  localStorageServiceMock.getCurrentLanguage = () => 'en' as Language;
  localStorageServiceMock.languageSubject = of('en');
  localStorageServiceMock.getUserId = () => 1;

  const toDoListServiceMock: ToDoListService = jasmine.createSpyObj('fakeToDoListService', [
    'getUserToDoLists',
    'updateStandardToDoItemStatus',
    'updateCustomToDoItemStatus'
  ]);
  toDoListServiceMock.getUserToDoLists = () => of([ALLUSERTODOLISTS]);
  toDoListServiceMock.updateStandardToDoItemStatus = () => of();
  toDoListServiceMock.updateCustomToDoItemStatus = () => of();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ToDoListComponent, CorrectUnitPipe],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        NoopAnimationsModule,
        NgbModule
      ],
      providers: [
        { provide: ToDoListService, useValue: toDoListServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToDoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set custom true after getToDoLists', () => {
    const result = [
      { ...TODOLISTITEMONE, custom: true },
      { ...TODOLISTITEMTWO, custom: true }
    ];
    TODOLIST.forEach((el) => (el.custom = true));
    component.toDoList = TODOLIST;
    expect(component.toDoList).toEqual(result);
  });

  it('should set toDoList after getToDoList', () => {
    component.toDoList = [];
    component.toDoList = [...component.toDoList, ...TODOLIST];
    expect(component.toDoList).toEqual(TODOLIST);
  });

  it('should change toogle from true on openCloseList', () => {
    component.toggle = true;
    component.openCloseList();
    expect(component.toggle).toBeFalsy();
  });

  it('should change toogle from false on openCloseList', () => {
    component.toggle = false;
    component.openCloseList();
    expect(component.toggle).toBeTruthy();
  });

  it('should change item status on toggleDone', () => {
    TODOLISTITEMONE.status = TodoStatus.inprogress;
    component.toggleDone(TODOLISTITEMONE);
    expect(TODOLISTITEMONE.status).toBe('DONE');
  });
});
