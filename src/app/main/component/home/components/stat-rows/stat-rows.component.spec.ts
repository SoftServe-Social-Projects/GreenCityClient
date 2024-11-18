import { HabitItemsAmountStatisticDto } from 'src/app/main/model/goal/HabitItemsAmountStatisticDto';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UserService } from '@global-service/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { StatRowComponent } from '..';

import { StatRowsComponent } from './stat-rows.component';
import { RouterModule } from '@angular/router';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { MatDialog } from '@angular/material/dialog';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true)
    };
  }
}

describe('StatRowsComponent', () => {
  let component: StatRowsComponent;
  let fixture: ComponentFixture<StatRowsComponent>;
  const snackBarMock: MatSnackBarComponent = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);
  snackBarMock.openSnackBar = () => true;
  const userServiceMock: UserService = jasmine.createSpyObj('UserService', ['getTodayStatisticsForAllHabitItems']);
  userServiceMock.getTodayStatisticsForAllHabitItems = (): Observable<Array<HabitItemsAmountStatisticDto>> =>
    of([
      {
        habitItem: 'string',
        notTakenItems: 1
      }
    ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatRowsComponent, StatRowComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, RouterModule.forRoot([], {})],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: MatSnackBarComponent, useValue: snackBarMock },
        { provide: MatDialog, useClass: MatDialogMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
