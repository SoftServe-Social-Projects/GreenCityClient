import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
  IResponsiblePersonsData,
  IUpdateExportDetails,
  IUpdateResponsibleEmployee,
  FormFieldsName,
  IDataForPopUp,
  IOrderInfo,
  IExportDetails,
  IResponsiblePersons,
  ResponsibleEmployee
} from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';
import { OrderService } from '../../services/order.service';
import { take } from 'rxjs';
import { formatDate } from '@angular/common';
import { WorkingHours } from '../ubs-admin-table/table-cell-time/table-cell-time-range';

@Component({
  selector: 'app-ubs-admin-several-orders-pop-up',
  templateUrl: './ubs-admin-several-orders-pop-up.component.html',
  styleUrls: ['./ubs-admin-several-orders-pop-up.component.scss']
})
export class UbsAdminSeveralOrdersPopUpComponent implements OnInit {
  showTimePicker = false;
  fromSelect: string[];
  toSelect: string[];
  fromInput: string;
  toInput: string;
  from: string;
  to: string;
  allCallManagers: string[];
  allLogisticians: string[];
  allNavigators: string[];
  allDrivers: string[];
  receivingStations: string[];
  currentDate: string;
  responsiblePersonsData: IResponsiblePersonsData[];
  exportInfo: IExportDetails;
  responsiblePersonInfo: IResponsiblePersons;

  values = {};
  ordersForm: FormGroup;

  @Input() dataFromTable: IDataForPopUp[];
  @Input() ordersId: number[];
  @Input() currentLang: string;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private dialogRef: MatDialogRef<UbsAdminSeveralOrdersPopUpComponent>
  ) {}

  ngOnInit(): void {
    if (this.ordersId.length === 1) {
      this.getOrderInfo(this.ordersId[0]);
    } else {
      this.initForm();
    }
    this.currentDate = new Date().toISOString().split('T')[0];
  }

  getOrderInfo(orderId: number): void {
    this.orderService
      .getOrderInfo(orderId)
      .pipe(take(1))
      .subscribe((data: IOrderInfo) => {
        this.exportInfo = data.exportDetailsDto;
        this.responsiblePersonInfo = data.employeePositionDtoRequest;
        this.initForm();
      });
  }

  initForm(): void {
    const currentEmployees = this.responsiblePersonInfo?.currentPositionEmployees;
    this.ordersForm = this.fb.group({
      exportDetailsDto: this.fb.group({
        dateExport: [
          this.exportInfo?.dateExport ? formatDate(this.exportInfo.dateExport, 'yyyy-MM-dd', this.currentLang) : '',
          [Validators.required]
        ],
        timeDeliveryFrom: [this.parseTimeToStr(this.exportInfo?.timeDeliveryFrom, WorkingHours.FROM), [Validators.required]],
        timeDeliveryTo: [this.parseTimeToStr(this.exportInfo?.timeDeliveryTo, WorkingHours.TO), [Validators.required]],
        receivingStationId: [this.getReceivingStationById(this.exportInfo?.receivingStationId), [Validators.required]]
      }),

      responsiblePersonsForm: this.fb.group({
        responsibleCaller: [this.getEmployeeById(currentEmployees, ResponsibleEmployee.CallManager), [Validators.required]],
        responsibleLogicMan: [this.getEmployeeById(currentEmployees, ResponsibleEmployee.Logistician)],
        responsibleNavigator: [this.getEmployeeById(currentEmployees, ResponsibleEmployee.Navigator)],
        responsibleDriver: [this.getEmployeeById(currentEmployees, ResponsibleEmployee.Driver)]
      })
    });
    this.setEmployeesByPosition();
  }

  isFieldOptional(controlName: string): boolean {
    const control = this.ordersForm.get(['responsiblePersonsForm', controlName]);
    return control && !control.hasValidator(Validators.required);
  }

  showTimePickerClick(): void {
    this.showTimePicker = true;
    this.fromInput = this.getFormControl('exportDetailsDto', FormFieldsName.TimeDeliveryFrom)?.value || '';
    this.toInput = this.getFormControl('exportDetailsDto', FormFieldsName.TimeDeliveryTo)?.value || '';
  }

  private getFormControl(groupName: string, fieldName: string): AbstractControl | null {
    const group = this.ordersForm.get(groupName);
    return group ? group.get(fieldName) : null;
  }

  formAction(groupName: string, fieldName: string, data?: string): void {
    this.ordersForm.get(groupName).get(fieldName).setValue(data);
    this.ordersForm.get(groupName).get(fieldName).markAsDirty();
    this.ordersForm.get(groupName).get(fieldName).markAsTouched();
  }

  setExportTime(data: any): void {
    this.formAction('exportDetailsDto', FormFieldsName.TimeDeliveryFrom, data.from);
    this.formAction('exportDetailsDto', FormFieldsName.TimeDeliveryTo, data.to);
    this.fromInput = this.getFormControl('exportDetailsDto', FormFieldsName.TimeDeliveryFrom)?.value || '';
    this.toInput = this.getFormControl('exportDetailsDto', FormFieldsName.TimeDeliveryTo)?.value || '';
    this.showTimePicker = false;
  }

  getExportDate() {
    return this.ordersForm.controls.exportDetailsDto.get('dateExport').value;
  }

  getEmployeeById(allCurrentEmployees: Map<string, string>, id: number) {
    if (!allCurrentEmployees) {
      return '';
    }
    const key = Object.keys(allCurrentEmployees).find((el) => el.includes(`id=${id},`));
    return key ? allCurrentEmployees[key] : '';
  }

  parseStrToTime(dateStr: string, date: Date): string {
    const hours = dateStr.split(':')[0];
    const minutes = dateStr.split(':')[1];
    date.setHours(+hours + 2);
    date.setMinutes(+minutes);
    return date ? date.toISOString().split('Z').join('') : '';
  }

  parseTimeToStr(dateStr: string, defaultTime: WorkingHours) {
    return dateStr ? formatDate(dateStr, 'HH:mm', this.currentLang) : defaultTime;
  }

  getReceivingStationById(receivingStationId: number): string {
    return this.exportInfo?.allReceivingStations.find((element) => receivingStationId === element.id)?.name || '';
  }

  setEmployeesByPosition(): void {
    this.receivingStations = this.getDataByColumnName(FormFieldsName.ReceivingStation);
    this.allCallManagers = this.getDataByColumnName(FormFieldsName.CallManager);
    this.allLogisticians = this.getDataByColumnName(FormFieldsName.Logistician);
    this.allNavigators = this.getDataByColumnName(FormFieldsName.Navigator);
    this.allDrivers = this.getDataByColumnName(FormFieldsName.Driver);
    this.getResponsiblePersonsData();
  }

  getDataByColumnName(position: string): string[] {
    return this.dataFromTable.find((element) => element.title === position).arrayData.map((e) => e.ua);
  }

  getFilledEmployeeData(responsibleEmployee: string, responiblePersonId: number, positionName: string): IUpdateResponsibleEmployee {
    const newEmployee: IUpdateResponsibleEmployee = {
      employeeId: 0,
      positionId: responiblePersonId
    };
    const employeeId =
      this.dataFromTable.find((e) => e.title === positionName).arrayData.find((element) => element.ua === responsibleEmployee)?.key ?? 0;
    newEmployee.employeeId = Number(employeeId);
    return newEmployee;
  }

  onSubmit(): void {
    const newValues: any = {};
    this.ordersForm.disable();
    newValues.orderId = this.ordersId;
    const responsibleEmployeeData = this.ordersForm.get('responsiblePersonsForm').value;
    const responsibleProps = Object.keys(responsibleEmployeeData);
    const arrEmployees: IUpdateResponsibleEmployee[] = [];
    newValues.exportDetailsDto = this.createExportDetailsDto(this.ordersForm.get('exportDetailsDto').value);
    responsibleProps.forEach((item: string) =>
      arrEmployees.push(this.getFilledEmployeeData(responsibleEmployeeData[item], this.orderService.matchProps(item), item))
    );
    newValues.updateResponsibleEmployeeDto = arrEmployees;
    this.values = newValues;
    this.orderService.updateOrdersInfo(this.currentLang, newValues).subscribe(() => this.dialogRef.close(true));
  }

  createExportDetailsDto(exportDetails: IUpdateExportDetails): IUpdateExportDetails {
    exportDetails.receivingStationId = this.getReceivingStationId(this.ordersForm.get('exportDetailsDto').value.receivingStationId);
    exportDetails.timeDeliveryFrom = this.parseStrToTime(exportDetails.timeDeliveryFrom, new Date(exportDetails.dateExport));
    exportDetails.timeDeliveryTo = this.parseStrToTime(exportDetails.timeDeliveryTo, new Date(exportDetails.dateExport));

    return exportDetails;
  }

  getReceivingStationId(receivingStationName: string): number {
    const receivingStationId = this.dataFromTable
      .find((e) => e.title === FormFieldsName.ReceivingStation)
      .arrayData.find((element) => element.ua === receivingStationName).key;
    return Number(receivingStationId);
  }

  getResponsiblePersonsData(): void {
    this.responsiblePersonsData = [
      {
        translate: 'responsible-persons.call-manager',
        formControlName: FormFieldsName.CallManager,
        responsiblePersonsArray: this.allCallManagers
      },
      {
        translate: 'responsible-persons.logistician',
        formControlName: FormFieldsName.Logistician,
        responsiblePersonsArray: this.allLogisticians
      },
      {
        translate: 'responsible-persons.navigator',
        formControlName: FormFieldsName.Navigator,
        responsiblePersonsArray: this.allNavigators
      },
      {
        translate: 'responsible-persons.driver',
        formControlName: FormFieldsName.Driver,
        responsiblePersonsArray: this.allDrivers
      }
    ];
  }
}
