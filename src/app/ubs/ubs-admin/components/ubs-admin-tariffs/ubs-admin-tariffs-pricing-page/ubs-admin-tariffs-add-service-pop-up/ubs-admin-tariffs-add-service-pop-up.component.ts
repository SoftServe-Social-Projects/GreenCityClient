import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TariffsService } from '../../../../services/tariffs.service';
import { Service } from '../../../../models/tariffs.interface';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CreateEditTariffsServicesFormBuilder } from '../../../../services/create-edit-tariffs-service-form-builder';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Component({
  selector: 'app-ubs-admin-tariffs-add-service-pop-up',
  templateUrl: './ubs-admin-tariffs-add-service-pop-up.component.html',
  styleUrls: ['./ubs-admin-tariffs-add-service-pop-up.component.scss']
})
export class UbsAdminTariffsAddServicePopUpComponent implements OnInit, OnDestroy {
  service: Service;
  date: string;
  user: string;
  langCode: string;
  receivedData;
  loadingAnim: boolean;
  namePattern = /^[А-Яа-яїЇіІєЄёЁ ]+$/;
  addServiceForm: FormGroup;
  private destroy: Subject<boolean> = new Subject<boolean>();
  name: string;
  unsubscribe: Subject<any> = new Subject();
  datePipe = new DatePipe('ua');
  newDate = this.datePipe.transform(new Date(), 'MMM dd, yyyy');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private tariffsService: TariffsService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<UbsAdminTariffsAddServicePopUpComponent>,
    private fb: FormBuilder,
    private formBuilder: CreateEditTariffsServicesFormBuilder,
    private localeStorageService: LocalStorageService
  ) {
    this.receivedData = data;
  }

  ngOnInit(): void {
    this.localeStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.unsubscribe)).subscribe((firstName) => {
      this.name = firstName;
    });
    this.initForm();
    this.fillFields(this.receivedData);
  }

  private initForm() {
    this.receivedData.serviceData ? this.editForm() : this.addForm();
  }

  addForm(): void {
    this.addServiceForm = this.formBuilder.createTariffService();
  }

  editForm(): void {
    this.addServiceForm = this.fb.group({
      name: new FormControl({ value: this.receivedData.serviceData.name, disabled: true }),
      englishName: new FormControl(''),
      capacity: new FormControl({ value: this.receivedData.serviceData.capacity, disabled: true }),
      price: new FormControl('', [Validators.required, Validators.pattern('[0-9]{1,3}')]),
      commission: new FormControl('', [Validators.required, Validators.pattern('[0-9]{1,3}')]),
      description: new FormControl({ value: this.receivedData.serviceData.description, disabled: true }),
      englishDescription: new FormControl({ value: this.receivedData.serviceData.description, disabled: true })
    });
  }

  addNewService() {
    const locationId = this.receivedData.locationId;
    const { name, nameEn, capacity, price, commission, description, descriptionEn } = this.addServiceForm.value;
    this.service = {
      capacity,
      price,
      locationId,
      commission,
      serviceTranslationDtoList: [
        {
          description,
          languageId: 1,
          name
        },
        {
          description: descriptionEn,
          languageId: 2,
          name: nameEn
        }
      ]
    };
    this.loadingAnim = true;
    this.tariffsService
      .createService(this.service)
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.dialogRef.close({});
      });
  }

  fillFields(receivedData) {
    if (this.receivedData.serviceData) {
      const { name, price, capacity, commission, description } = this.receivedData.serviceData;
      this.addServiceForm.patchValue({
        name,
        price,
        capacity,
        commission,
        description
      });
    }
  }

  editService(receivedData) {
    const locationId = receivedData.serviceData.locationId;
    const { name, price, capacity, commission, description } = this.addServiceForm.getRawValue();
    this.service = {
      name,
      capacity,
      price,
      commission,
      description,
      languageCode: 'ua',
      locationId
    };
    this.loadingAnim = true;
    this.tariffsService
      .editService(receivedData.serviceData.id, this.service)
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.dialogRef.close({});
      });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}
