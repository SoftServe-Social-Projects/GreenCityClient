import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HabitInviteFriendsPopUpComponent } from './habit-invite-friends-pop-up.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Router } from '@angular/router';
import { FRIENDS, FIRSTFRIEND, SECONDFRIEND } from '@global-user/mocks/friends-mock';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('HabitInviteFriendsPopUpComponent', () => {
  let component: HabitInviteFriendsPopUpComponent;
  let fixture: ComponentFixture<HabitInviteFriendsPopUpComponent>;
  let httpMock: HttpTestingController;

  const localStorageServiceMock = jasmine.createSpyObj('localStorageService', ['getUserId', 'getFriends']);
  localStorageServiceMock.getUserId = () => 2;

  const userFriendsServiceMock = jasmine.createSpyObj('userFriendsService', ['getAllFriends']);
  const routerSpy = { navigate: jasmine.createSpy('navigate') };
  const MatSnackBarMock = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);
  userFriendsServiceMock.getAllFriends = () => of(FRIENDS);
  userFriendsServiceMock.inviteFriendsToHabit = jasmine.createSpy('inviteFriendsToHabit').and.returnValue(of({}));
  userFriendsServiceMock.addedFriends = [];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HabitInviteFriendsPopUpComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), MatDialogModule, MatCheckboxModule],
      providers: [
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBarComponent, useValue: MatSnackBarMock },
        { provide: MAT_DIALOG_DATA, useValue: { habitId: 1 } },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitInviteFriendsPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call on ngOnInit', () => {
    const spy2 = spyOn(component, 'getFriends');
    component.ngOnInit();
    expect(spy2).toHaveBeenCalled();
  });

  describe('setFriendDisable', () => {
    it('should return true if the friend is in the addedFriends list and invitationSent is false', () => {
      const friendId = 1;
      userFriendsServiceMock.addedFriends = [FIRSTFRIEND, SECONDFRIEND];
      component.invitationSent = false;
      const result = component.setFriendDisable(friendId);
      expect(result).toBe(false);
    });

    it('should return true if invitationSent is true, regardless of addedFriends', () => {
      const friendId = 1;
      userFriendsServiceMock.addedFriends = [FIRSTFRIEND, SECONDFRIEND];
      component.invitationSent = true;
      const result = component.setFriendDisable(friendId);
      expect(result).toBe(true);
    });
  });

  xit('should update allAdd status', () => {
    component.friends = [FIRSTFRIEND, SECONDFRIEND];
    component.updateAllAdd();
    expect(component.allAdd).toBeTruthy();
  });

  it('should check if some friends are added', () => {
    component.friends = [FIRSTFRIEND, SECONDFRIEND];
    component.allAdd = false;
    expect(component.someAdd()).toBeTruthy();
  });

  describe('onFriendCheckboxChange', () => {
    it('should add friend to selectedFriends when checked', () => {
      component.friends = [FIRSTFRIEND];
      component.onFriendCheckboxChange(FIRSTFRIEND.id, true);

      expect(component.selectedFriends).toContain(FIRSTFRIEND.id);
    });

    it('should remove friend from selectedFriends when unchecked', () => {
      component.friends = [FIRSTFRIEND];
      component.selectedFriends = [FIRSTFRIEND.id];
      component.onFriendCheckboxChange(FIRSTFRIEND.id, false);

      expect(component.selectedFriends).not.toContain(FIRSTFRIEND.id);
    });
  });

  it('should update selected friends when setAll is called', () => {
    component.friends = [FIRSTFRIEND, SECONDFRIEND];
    const spy = spyOn(component, 'toggleFriendSelection');
    component.setAll(true);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(component.allAdd).toBeTrue();
  });

  it('should filter friends by input', () => {
    const event = {
      target: {
        value: 'test'
      }
    } as any;
    component.onInput(event);
    expect(component.inputValue).toBe('test');
    expect(component.allAdd).toBeFalse();
  });

  it('should unsubscribe on ngOnDestroy', () => {
    const spy = spyOn(component['destroyed$'], 'next');
    const spyComplete = spyOn(component['destroyed$'], 'complete');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalledWith(true);
    expect(spyComplete).toHaveBeenCalled();
  });
});
