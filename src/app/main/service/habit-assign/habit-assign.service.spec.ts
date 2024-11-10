import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HabitAssignService } from './habit-assign.service';
import { habitAssignLink } from '../../links';
import {
  ASSIGNRESPONSE,
  HABITSFORDATE,
  DEFAULTFULLINFOHABIT,
  HABITSASSIGNEDLIST,
  CHANGES_FROM_CALENDAR,
  FRIENDSHABITPROGESS
} from '@global-user/components/habit/mocks/habit-assigned-mock';

import { HabitAssignInterface, UpdateHabitDuration } from '@global-user/components/habit/models/interfaces/habit-assign.interface';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { HttpResponse } from '@angular/common/http';
import { HabitAssignCustomPropertiesDto } from '@global-models/goal/HabitAssignCustomPropertiesDto';

describe('HabitService', () => {
  let service: HabitAssignService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HabitAssignService],
      imports: [HttpClientTestingModule]
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(HabitAssignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get data', () => {
    service.getAssignedHabits().subscribe((data) => {
      expect(data).toEqual(HABITSASSIGNEDLIST);
    });
    const req = httpMock.expectOne(`${habitAssignLink}/allForCurrentUser?lang=${service.language}`);
    expect(req.request.method).toBe('GET');
    req.flush(HABITSASSIGNEDLIST);
  });

  it('should get get Habit By Assign Id', () => {
    service.getHabitByAssignId(1, 'ua').subscribe((data) => {
      expect(data).toEqual(DEFAULTFULLINFOHABIT);
    });
    const req = httpMock.expectOne(`${habitAssignLink}/1?lang=ua`);
    expect(req.request.method).toBe('GET');
    req.flush(DEFAULTFULLINFOHABIT);
  });

  it('should get friends habit progress by habit id', () => {
    service.getFriendsHabitProgress(1).subscribe((data) => {
      expect(data).toEqual(FRIENDSHABITPROGESS);
    });
    const req = httpMock.expectOne(`${habitAssignLink}/1/friends/habit-duration-info`);
    expect(req.request.method).toBe('GET');
    req.flush(FRIENDSHABITPROGESS);
  });

  it('should assign habit', () => {
    service.assignHabit(1).subscribe((habit) => {
      expect(habit).toEqual(ASSIGNRESPONSE);
    });
    const req = httpMock.expectOne(`${habitAssignLink}/1`);
    expect(req.request.method).toBe('POST');
    req.flush(ASSIGNRESPONSE);
  });

  it('should enroll by habit', () => {
    service.enrollByHabit(3, '2021-05-07').subscribe((habit) => {
      expect(habit).toEqual(DEFAULTFULLINFOHABIT);
    });
    const req = httpMock.expectOne(`${habitAssignLink}/3/enroll/2021-05-07?lang=${service.language}`);
    expect(req.request.method).toBe('POST');
    req.flush(DEFAULTFULLINFOHABIT);
  });

  it('should unenroll by habit', () => {
    service.unenrollByHabit(3, '2021-05-07').subscribe((habit) => {
      expect(habit).toEqual(DEFAULTFULLINFOHABIT);
    });
    const req = httpMock.expectOne(`${habitAssignLink}/3/unenroll/2021-05-07`);
    expect(req.request.method).toBe('POST');
    req.flush(DEFAULTFULLINFOHABIT);
  });

  it('should get assigned habits by period', () => {
    service.getAssignHabitsByPeriod('2021-05-20', '2021-05-30').subscribe((habits) => {
      expect(habits).toEqual(HABITSFORDATE);
    });
    const req = httpMock.expectOne(`${habitAssignLink}/activity/2021-05-20/to/2021-05-30?lang=${service.language}`);
    expect(req.request.method).toBe('GET');
    req.flush(HABITSFORDATE);
  });

  it('should update progress Notification Has Displayed', () => {
    service.progressNotificationHasDisplayed(1).subscribe((data) => {
      expect(data).toEqual({});
    });
    const req = httpMock.expectOne(`${habitAssignLink}/1/updateProgressNotificationHasDisplayed`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should assign custom habit', () => {
    const HABIT_ASSIGN_CUSTOM: HabitAssignCustomPropertiesDto = {
      friendsIdsList: [2, 3, 4],
      habitAssignPropertiesDto: {
        defaultToDoListItems: [],
        duration: 15,
        isPrivate: true
      },
      customToDoListItemList: [{ text: '1234567890' }]
    };

    const spy = spyOn(service, 'assignCustomHabit');
    const habitId = 1;
    service.assignCustomHabit(habitId, HABIT_ASSIGN_CUSTOM);
    expect(spy).toHaveBeenCalled();
  });

  it('should update habit duration', () => {
    const habitId = 1;
    const duration = 30;
    const expectedRes: Partial<UpdateHabitDuration> = { habitId, duration };
    let actualRes: Partial<UpdateHabitDuration>;

    service.updateHabitDuration(habitId, duration).subscribe((res) => {
      actualRes = res;
    });

    const req = httpMock.expectOne(`${habitAssignLink}/${habitId}/update-habit-duration?duration=${duration}`);
    req.flush(expectedRes);
    expect(req.request.method).toBe('PUT');
    expect(actualRes).toEqual(expectedRes);
  });

  it('should set circle from pop up to progress', () => {
    const changesFromCalendar = CHANGES_FROM_CALENDAR;
    service.habitChangesFromCalendarSubj.subscribe((value) => {
      expect(value).toEqual(changesFromCalendar);
    });
    service.setCircleFromPopUpToProgress(changesFromCalendar);
  });

  it('should update habit', () => {
    const habitAssignId = HABITSASSIGNEDLIST[0].id;
    const duration = 30;

    const expectedResponse: UpdateHabitDuration = {
      habitAssignId,
      habitId: 123,
      userId: 456,
      status: HabitStatus.INPROGRESS,
      workingDays: 10,
      duration
    };

    service.updateHabitDuration(habitAssignId, duration).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${habitAssignLink}/${habitAssignId}/update-habit-duration?duration=${duration}`);
    expect(req.request.method).toBe('PUT');

    req.flush(expectedResponse);
  });

  it('should set habit status', () => {
    const expectedRes = { ...DEFAULTFULLINFOHABIT, status: HabitStatus.ACQUIRED };
    let actualRes: HabitAssignInterface;

    service.setHabitStatus(DEFAULTFULLINFOHABIT.id, HabitStatus.ACQUIRED).subscribe((res) => {
      actualRes = res;
    });

    const req = httpMock.expectOne(`${habitAssignLink}/${DEFAULTFULLINFOHABIT.id}`);
    req.flush(expectedRes);
    expect(req.request.method).toBe('PATCH');
    expect(actualRes).toEqual(expectedRes);
  });

  it('should delete habit assign by id', () => {
    const habitAssignId = 1;
    service.deleteHabitById(habitAssignId).subscribe();

    const req = httpMock.expectOne(`${habitAssignLink}/delete/${habitAssignId}`);
    req.flush(new HttpResponse({ status: 200 }));
    expect(req.request.method).toBe('DELETE');
  });

  it('should toggle the progressNotificationHasDisplayed value to true', () => {
    const habitAssignId = 1;
    service.progressNotificationHasDisplayed(habitAssignId).subscribe();

    const req = httpMock.expectOne(`${habitAssignLink}/${habitAssignId}/updateProgressNotificationHasDisplayed`);
    req.flush(new HttpResponse({ status: 200 }));
    expect(req.request.method).toBe('PUT');
  });

  afterEach(() => {
    httpMock.verify();
  });
});
