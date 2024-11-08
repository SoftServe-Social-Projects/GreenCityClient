import { Component, Input, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { IEmployee, IResponsiblePersons } from '../../models/ubs-admin.interface';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';

@Component({
  selector: 'app-ubs-admin-responsible-persons',
  templateUrl: './ubs-admin-responsible-persons.component.html',
  styleUrls: ['./ubs-admin-responsible-persons.component.scss']
})
export class UbsAdminResponsiblePersonsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() responsiblePersonInfo: IResponsiblePersons;
  @Input() responsiblePersonsForm: FormGroup;
  @Input() orderStatus: string;
  @Input() isEmployeeCanEditOrder: boolean;

  allCallManagers: string[];
  allLogisticians: string[];
  allNavigators: string[];
  allDrivers: string[];
  uneditableStatus = false;
  pageOpen: boolean;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.orderStatus?.currentValue === OrderStatus.CANCELED ||
      changes.orderStatus?.currentValue === OrderStatus.DONE ||
      changes.orderStatus?.currentValue === OrderStatus.BROUGHT_IT_HIMSELF
    ) {
      this.uneditableStatus = true;
    }
  }

  ngOnInit(): void {
    this.setEmployeesByPosition();
  }

  openDetails() {
    this.pageOpen = !this.pageOpen;
  }

  setEmployeesByPosition() {
    const employees = this.responsiblePersonInfo.allPositionsEmployees;
    this.allCallManagers = this.getEmployeesById(employees, 2);
    this.allLogisticians = this.getEmployeesById(employees, 3);
    this.allNavigators = this.getEmployeesById(employees, 4);
    this.allDrivers = this.getEmployeesById(employees, 5);
  }

  isFormRequired(): boolean {
    const isNotOpen = !this.pageOpen;
    const isNotValid = !this.responsiblePersonsForm.valid;
    const isUneditable = !this.uneditableStatus;

    return isNotOpen && isNotValid && isUneditable;
  }

  getEmployeesById(employeeObjects: Map<string, IEmployee[]>, id: number): string[] {
    for (const key of Object.keys(employeeObjects)) {
      if (key.includes(`id=${id},`)) {
        const resultEmployeeArr: string[] = [];
        employeeObjects[key].forEach((emp: IEmployee) => {
          resultEmployeeArr.push(emp.name);
        });
        return resultEmployeeArr;
      }
    }
    return [];
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
