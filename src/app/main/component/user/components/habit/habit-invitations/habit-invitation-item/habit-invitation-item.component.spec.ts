import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitInvitationItemComponent } from './habit-invitation-item.component';

describe('HabitInvitationItemComponent', () => {
  let component: HabitInvitationItemComponent;
  let fixture: ComponentFixture<HabitInvitationItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HabitInvitationItemComponent]
    });
    fixture = TestBed.createComponent(HabitInvitationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
