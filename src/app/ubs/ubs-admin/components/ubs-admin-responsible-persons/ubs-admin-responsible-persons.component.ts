import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IEmployee, IResponsiblePersons, IResponsiblePersonsData } from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';

@Component({
  selector: 'app-ubs-admin-responsible-persons',
  templateUrl: './ubs-admin-responsible-persons.component.html',
  styleUrls: ['./ubs-admin-responsible-persons.component.scss']
})
export class UbsAdminResponsiblePersonsComponent implements OnInit, OnChanges {
  @Input() responsiblePersonInfo: IResponsiblePersons;
  @Input() responsiblePersonsForm: FormGroup;
  @Input() orderStatus: string;
  @Input() isEmployeeCanEditOrder: boolean;

  public allCallManagers: string[];
  public allLogisticians: string[];
  public allNavigators: string[];
  public allDrivers: string[];
  public isOrderStatusCancelOrDone = false;
  pageOpen: boolean;
  responsiblePersonsData: IResponsiblePersonsData[];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orderStatus?.currentValue === OrderStatus.CANCELED || changes.orderStatus?.currentValue === OrderStatus.DONE) {
      this.isOrderStatusCancelOrDone = true;
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
    this.getResponsiblePersonsData();
  }

  public isFormRequired(): boolean {
    const isNotOpen = !this.pageOpen;
    const isNotValid = !this.responsiblePersonsForm.valid;
    const isNotCancelOrDone = !this.isOrderStatusCancelOrDone;

    return isNotOpen && isNotValid && isNotCancelOrDone;
  }

  public getEmployeesById(employeeObjects: Map<string, IEmployee[]>, id: number): string[] {
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

  isFieldOptional(controlName: string): boolean {
    return this.orderStatus === 'ADJUSTMENT' && !['responsibleCaller'].includes(controlName);
  }

  getResponsiblePersonsData(): void {
    this.responsiblePersonsData = [
      {
        translate: 'responsible-persons.call-manager',
        formControlName: 'responsibleCaller',
        responsiblePersonsArray: this.allCallManagers
      },
      {
        translate: 'responsible-persons.logistician',
        formControlName: 'responsibleLogicMan',
        responsiblePersonsArray: this.allLogisticians
      },
      {
        translate: 'responsible-persons.navigator',
        formControlName: 'responsibleNavigator',
        responsiblePersonsArray: this.allNavigators
      },
      {
        translate: 'responsible-persons.driver',
        formControlName: 'responsibleDriver',
        responsiblePersonsArray: this.allDrivers
      }
    ];
  }
}
