import { Component, Input, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { IEmployee, IResponsiblePersons, IResponsiblePersonsData } from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';
import { OrderService } from '../../services/order.service';
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
  isUneditableStatus = false;
  pageOpen: boolean;
  responsiblePersonsData: IResponsiblePersonsData[];
  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public orderService: OrderService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.orderStatus?.currentValue === OrderStatus.CANCELED ||
      changes.orderStatus?.currentValue === OrderStatus.DONE ||
      changes.orderStatus?.currentValue === OrderStatus.BROUGHT_IT_HIMSELF
    ) {
      this.isUneditableStatus = true;
    }
  }

  ngOnInit(): void {
    this.setEmployeesByPosition();
  }

  openDetails() {
    this.pageOpen = !this.pageOpen;
  }

  loadArrowImage() {
    return this.orderService.getArrowImageSrc(
      this.isFormRequired(),
      this.pageOpen,
      this.responsiblePersonsForm.valid,
      this.isUneditableStatus
    );
  }

  setEmployeesByPosition() {
    const employees = this.responsiblePersonInfo.allPositionsEmployees;
    this.allCallManagers = this.getEmployeesById(employees, 2);
    this.allLogisticians = this.getEmployeesById(employees, 3);
    this.allNavigators = this.getEmployeesById(employees, 4);
    this.allDrivers = this.getEmployeesById(employees, 5);
    this.getResponsiblePersonsData();
  }

  isFormRequired(): boolean {
    const isNotOpen = !this.pageOpen;
    const isNotValid = !this.responsiblePersonsForm.valid;
    const isUneditable = !this.isUneditableStatus;

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

  isFieldOptional(controlName: string): boolean {
    if (this.orderStatus !== 'ADJUSTMENT') {
      return false;
    }

    const control = this.responsiblePersonsForm.get(controlName);
    return control && !control.hasValidator(Validators.required);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
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
