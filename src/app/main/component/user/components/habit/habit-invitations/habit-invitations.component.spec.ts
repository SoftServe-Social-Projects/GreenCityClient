import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitInvitationsComponent } from './habit-invitations.component';

describe('HabitInvitationsComponent', () => {
  let component: HabitInvitationsComponent;
  let fixture: ComponentFixture<HabitInvitationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HabitInvitationsComponent]
    });
    fixture = TestBed.createComponent(HabitInvitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
