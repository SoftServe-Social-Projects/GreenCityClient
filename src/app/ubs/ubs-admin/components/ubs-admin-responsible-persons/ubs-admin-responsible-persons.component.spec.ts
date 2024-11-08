import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

import { UbsAdminResponsiblePersonsComponent } from './ubs-admin-responsible-persons.component';

describe('UbsAdminResponsiblePersonsComponent', () => {
  let component: UbsAdminResponsiblePersonsComponent;
  let fixture: ComponentFixture<UbsAdminResponsiblePersonsComponent>;

  const ResponsiblePersonInfoFake = {
    allPositionsEmployees: { 'PositionDto(id=2, name=call meneger)': [{ name: 'John', id: 2 }] },
    currentPositionEmployees: { 'PositionDto(id=2, name=call meneger)': 'Leonard Hofstadter' },
    orderId: 1
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UbsAdminResponsiblePersonsComponent],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule]
    }).compileComponents();
  }));

  const FormGroupMock = new FormGroup({});

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminResponsiblePersonsComponent);
    component = fixture.componentInstance;
    component.responsiblePersonInfo = ResponsiblePersonInfoFake as any;
    component.responsiblePersonsForm = FormGroupMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('setEmployeesByPosition should be called in ngOnInit', () => {
    spyOn(component, 'setEmployeesByPosition');
    component.ngOnInit();
    expect(component.setEmployeesByPosition).toHaveBeenCalled();
  });

  it('after openDetails called pageOpen should false', () => {
    component.pageOpen = true;
    component.openDetails();
    expect(component.pageOpen).toBe(false);
  });

  it('allCallManagers should have employee', () => {
    const res = component.getEmployeesById(component.responsiblePersonInfo.allPositionsEmployees, 2);
    expect(res).toEqual(['John']);
  });

  it('allCallManagers should have employee', () => {
    component.allCallManagers = [];
    component.setEmployeesByPosition();
    expect(component.allCallManagers.length > 0).toBe(true);
  });

  it('should return true when pageOpen is false, responsiblePersonInfo is invalid and orderStatus is not cancel or done', () => {
    component.pageOpen = false;
    component.uneditableStatus = false;
    expect(component.isFormRequired()).toBeFalsy();
  });
});
