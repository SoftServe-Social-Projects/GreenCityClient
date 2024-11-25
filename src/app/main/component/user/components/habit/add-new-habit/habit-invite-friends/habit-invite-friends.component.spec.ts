import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { HabitService } from '@global-service/habit/habit.service';
import { HabitInviteFriendsComponent } from './habit-invite-friends.component';
import { TranslateModule } from '@ngx-translate/core';

describe('HabitInviteFriendsComponent', () => {
  let component: HabitInviteFriendsComponent;
  let fixture: ComponentFixture<HabitInviteFriendsComponent>;
  let habitServiceMock: any;
  let matDialogMock: any;

  beforeEach(waitForAsync(() => {
    habitServiceMock = jasmine.createSpyObj('HabitService', ['getFriendsTrakingSameHabitByHabitAssignId']);
    matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [HabitInviteFriendsComponent],
      imports: [HttpClientTestingModule, MatDialogModule, TranslateModule.forRoot()],
      providers: [
        { provide: HabitService, useValue: habitServiceMock },
        { provide: MatDialog, useValue: matDialogMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitInviteFriendsComponent);
    component = fixture.componentInstance;

    matDialogMock.open.and.returnValue({
      backdropClick: () => of({}),
      componentInstance: {
        data: {
          onFriendsUpdated: jasmine.any(Function)
        }
      },
      close: jasmine.createSpy('close')
    });

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call fetchFriendsTrackingHabit', () => {
      const spy = spyOn(component, 'fetchFriendsTrackingHabit');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('fetchFriendsTrackingHabit', () => {
    it('should not call the service if habitAssignId is undefined', () => {
      component.habitAssignId = undefined;
      component.fetchFriendsTrackingHabit();
      expect(habitServiceMock.getFriendsTrakingSameHabitByHabitAssignId).not.toHaveBeenCalled();
    });

    it('should call the service and update friends array', () => {
      const mockFriends = [{ id: 1, name: 'Friend 1', profilePicturePath: 'path/to/picture1.jpg' }];
      habitServiceMock.getFriendsTrakingSameHabitByHabitAssignId.and.returnValue(of(mockFriends));

      component.habitAssignId = 1001;
      component.fetchFriendsTrackingHabit();
      expect(habitServiceMock.getFriendsTrakingSameHabitByHabitAssignId).toHaveBeenCalledWith(1001);
      expect(component.friends).toEqual(mockFriends);
    });
  });

  describe('calculateDotsPosition', () => {
    it('should return correct position based on friend count', () => {
      expect(component.calculateDotsPosition(1)).toBe('calc(0% + 60px)');
      expect(component.calculateDotsPosition(3)).toBe('calc(40% + 60px)');
      expect(component.calculateDotsPosition(5)).toBe('calc(80% + 60px)');
    });

    it('should cap position at 5 friends', () => {
      expect(component.calculateDotsPosition(10)).toBe('calc(80% + 60px)');
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroyed$ subject', () => {
      const spyNext = spyOn(component['destroyed$'], 'next');
      const spyComplete = spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();
      expect(spyNext).toHaveBeenCalledWith();
      expect(spyComplete).toHaveBeenCalled();
    });
  });
});
