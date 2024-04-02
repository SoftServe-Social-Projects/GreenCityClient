import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
  IResponsiblePersonsData,
  IUpdateExportDetails,
  IUpdateResponsibleEmployee,
  FormFieldsName,
  IDataForPopUp
} from '../../models/ubs-admin.interface';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-ubs-admin-several-orders-pop-up',
  templateUrl: './ubs-admin-several-orders-pop-up.component.html',
  styleUrls: ['./ubs-admin-several-orders-pop-up.component.scss']
})
export class UbsAdminSeveralOrdersPopUpComponent implements OnInit {
  public showTimePicker = false;
  public fromSelect: string[];
  public toSelect: string[];
  public fromInput: string;
  public toInput: string;
  public from: string;
  public to: string;
  public allCallManagers: string[];
  public allLogisticians: string[];
  public allNavigators: string[];
  public allDrivers: string[];
  public receivingStations: string[];
  public currentDate: string;
  public responsiblePersonsData: IResponsiblePersonsData[];

  values = {};
  ordersForm: UntypedFormGroup;

  @Input() dataFromTable: IDataForPopUp[];
  @Input() ordersId: number[];
  @Input() currentLang: string;

  constructor(
    private fb: UntypedFormBuilder,
    private orderService: OrderService,
    private dialogRef: MatDialogRef<UbsAdminSeveralOrdersPopUpComponent>
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.currentDate = new Date().toISOString().split('T')[0];
  }

  initForm(): void {
    this.ordersForm = this.fb.group({
      exportDetailsDto: this.fb.group({
        dateExport: [null, [Validators.required]],
        timeDeliveryFrom: [null, [Validators.required]],
        timeDeliveryTo: [null, [Validators.required]],
        receivingStationId: [null, [Validators.required]]
      }),

      responsiblePersonsForm: this.fb.group({
        responsibleCaller: [null, [Validators.required]],
        responsibleLogicMan: [null, [Validators.required]],
        responsibleNavigator: [null, [Validators.required]],
        responsibleDriver: [null, [Validators.required]]
      })
    });
    this.setEmployeesByPosition();
  }

  showTimePickerClick(): void {
    this.showTimePicker = true;
  }

  formAction(groupName: string, fieldName: string, data?: string): void {
    this.ordersForm.get(groupName).get(fieldName).setValue(data);
    this.ordersForm.get(groupName).get(fieldName).markAsDirty();
    this.ordersForm.get(groupName).get(fieldName).markAsTouched();
  }

  setExportTime(data: any): void {
    this.formAction('exportDetailsDto', FormFieldsName.TimeDeliveryFrom, data.from);
    this.formAction('exportDetailsDto', FormFieldsName.TimeDeliveryTo, data.to);
    this.fromInput = this.ordersForm.get('exportDetailsDto').get(FormFieldsName.TimeDeliveryFrom).value;
    this.toInput = this.ordersForm.get('exportDetailsDto').get(FormFieldsName.TimeDeliveryTo).value;
    this.showTimePicker = false;
  }

  getExportDate() {
    return this.ordersForm.controls.exportDetailsDto.get('dateExport').value;
  }

  parseStrToTime(dateStr: string, date: Date): string {
    const hours = dateStr.split(':')[0];
    const minutes = dateStr.split(':')[1];
    date.setHours(+hours + 2);
    date.setMinutes(+minutes);
    return date ? date.toISOString().split('Z').join('') : '';
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
    const employeeId = this.dataFromTable
      .find((e) => e.title === positionName)
      .arrayData.find((element) => element.ua === responsibleEmployee).key;
    newEmployee.employeeId = Number(employeeId);
    return newEmployee;
  }

  public onSubmit(): void {
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
