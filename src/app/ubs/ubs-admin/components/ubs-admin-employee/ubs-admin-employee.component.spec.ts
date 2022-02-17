import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { UbsAdminEmployeeComponent } from './ubs-admin-employee.component';

describe('UbsAdminEmployeeComponent', () => {
  let component: UbsAdminEmployeeComponent;
  let fixture: ComponentFixture<UbsAdminEmployeeComponent>;
  let dialog: MatDialog;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UbsAdminEmployeeComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, MatDialogModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminEmployeeComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setData inside getEmployees', () => {
    const spy = spyOn(dialog, 'open');
    component.openDialog();
    expect(spy).toHaveBeenCalled();
  });
});
