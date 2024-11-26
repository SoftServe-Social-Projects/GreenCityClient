import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ToDoListService } from './to-do-list.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '@environment/environment';
import {
  ALLUSERTODOLISTS,
  CUSTOMTODOITEM,
  TODOLIST,
  TODOLISTITEMONE,
  TODOLISTITEMTWO,
  UPDATEHABITTODOLIST
} from '../../mocks/to-do-list-mock';

describe('ToDoListService', () => {
  let service: ToDoListService;
  let httpMock: HttpTestingController;

  const mainLink = environment.backendLink;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [ToDoListService, TranslateService]
    });

    service = TestBed.inject(ToDoListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return allToDoList by habitId on getHabitAllToDoLists', () => {
    service.getHabitAllToDoLists(2, 'en').subscribe((data) => {
      expect(data).toEqual(ALLUSERTODOLISTS);
    });

    const req = httpMock.expectOne(`${mainLink}habit/assign/2/allUserAndCustomList?lang=en`);
    expect(req.request.responseType).toEqual('json');
    expect(req.request.method).toBe('GET');
    req.flush(ALLUSERTODOLISTS);
  });

  it('should return all user toDoList by lang on getUserToDoLists', () => {
    service.getUserToDoLists('ua').subscribe((data) => {
      expect(data).toEqual([ALLUSERTODOLISTS]);
    });

    const req = httpMock.expectOne(`${mainLink}habit/assign/allUserAndCustomToDoListsInprogress?lang=ua`);
    expect(req.request.responseType).toEqual('json');
    expect(req.request.method).toBe('GET');
    req.flush([ALLUSERTODOLISTS]);
  });

  it('should update Standard ToDo Item Status', () => {
    service.updateStandardToDoItemStatus(TODOLISTITEMTWO, 'ua').subscribe((data) => {
      expect(data).toEqual([TODOLISTITEMTWO]);
    });
    const req = httpMock.expectOne(`${mainLink}user/to-do-list-items/2/status/INPROGRESS?lang=ua`);
    expect(req.request.method).toBe('PATCH');
    req.flush([TODOLISTITEMTWO]);
  });

  xit('should update Custom ToDo Item Status', () => {
    service.updateCustomToDoItemStatus(1, TODOLISTITEMTWO).subscribe((data) => {
      expect(data).toEqual(TODOLISTITEMTWO);
    });
    const req = httpMock.expectOne(`${mainLink}custom/to-do-list-items/1/custom-to-do-list-items?itemId=2&status=INPROGRESS`);
    expect(req.request.method).toBe('PATCH');
    req.flush(TODOLISTITEMTWO);
  });

  it('should update Habit ToDo List', () => {
    service.updateHabitToDoList(UPDATEHABITTODOLIST).subscribe((data) => {
      expect(data).toEqual(null);
    });
    const req = httpMock.expectOne(`${mainLink}habit/assign/2/allUserAndCustomList?lang=ua`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });
});
