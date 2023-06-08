import { Component, Inject, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TariffsService } from '../../../../services/tariffs.service';
import { Bag } from '../../../../models/tariffs.interface';
import { Subject } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Patterns } from 'src/assets/patterns/patterns';
import { ModalTextComponent } from '../../../shared/components/modal-text/modal-text.component';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { Language } from 'src/app/main/i18n/Language';

@Component({
  selector: 'app-ubs-admin-tariffs-add-tariff-service-pop-up',
  templateUrl: './ubs-admin-tariffs-add-tariff-service-pop-up.component.html',
  styleUrls: ['./ubs-admin-tariffs-add-tariff-service-pop-up.component.scss']
})
export class UbsAdminTariffsAddTariffServicePopUpComponent implements OnInit {
  addTariffServiceForm: FormGroup;
  receivedData;
  tariffs;
  tariffService: Bag;
  loadingAnim: boolean;
  private isLangEn = false;
  private destroy: Subject<boolean> = new Subject<boolean>();
  name: string;
  unsubscribe: Subject<any> = new Subject();
  newDate: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private tariffsService: TariffsService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<UbsAdminTariffsAddTariffServicePopUpComponent>,
    private fb: FormBuilder,
    private localeStorageService: LocalStorageService,
    private languageService: LanguageService
  ) {
    this.receivedData = data;
  }

  ngOnInit(): void {
    this.localeStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.unsubscribe)).subscribe((firstName) => {
      this.name = firstName;
    });
    this.initForm();
    this.fillFields();
    this.setDate();
  }

  setDate(): void {
    const lang = this.languageService.getCurrentLanguage();
    this.newDate = this.tariffsService.setDate(lang);
    this.isLangEn = lang === Language.EN;
  }

  private initForm(): void {
    this.receivedData.bagData ? this.editForm() : this.addForm();
  }

  addForm(): void {
    this.addTariffServiceForm = this.createTariffService();
  }

  createTariffService() {
    return this.fb.group({
      name: new FormControl('', [Validators.required, Validators.pattern(Patterns.NamePattern), Validators.maxLength(30)]),
      nameEng: new FormControl('', [Validators.required, Validators.pattern(Patterns.NamePattern), Validators.maxLength(30)]),
      capacity: new FormControl('', [
        Validators.required,
        Validators.pattern(Patterns.ubsServicePrice),
        Validators.min(1),
        Validators.max(999)
      ]),
      commission: new FormControl('', [Validators.required, Validators.pattern(Patterns.ubsServicePrice)]),
      price: new FormControl('', [Validators.required, Validators.pattern(Patterns.ubsServiceBasicPrice)]),
      description: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(255)])),
      descriptionEng: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(255)]))
    });
  }

  editForm(): void {
    this.addTariffServiceForm = this.fb.group({
      name: new FormControl({ value: this.getLangValue(this.receivedData.bagData.name, this.receivedData.bagData.nameEng) }, [
        Validators.required,
        Validators.maxLength(30)
      ]),
      nameEng: new FormControl({ value: this.getLangValue(this.receivedData.bagData.nameEng, this.receivedData.bagData.name) }, [
        Validators.required,
        Validators.maxLength(30)
      ]),
      capacity: new FormControl({ value: this.receivedData.bagData.capacity }, [
        Validators.pattern(Patterns.ubsServicePrice),
        Validators.min(1),
        Validators.max(999)
      ]),
      price: new FormControl('', [Validators.required, Validators.pattern(Patterns.ubsServiceBasicPrice)]),
      commission: new FormControl('', [Validators.required, Validators.pattern(Patterns.ubsServicePrice)]),
      description: new FormControl(
        { value: this.getLangValue(this.receivedData.bagData.description, this.receivedData.bagData.descriptionEng) },
        [Validators.required, Validators.maxLength(255)]
      ),
      descriptionEng: new FormControl(
        { value: this.getLangValue(this.receivedData.bagData.descriptionEng, this.receivedData.bagData.description) },
        [Validators.required, Validators.maxLength(255)]
      )
    });
  }

  public getLangValue(uaValue: string, enValue: string): string {
    const a = this.languageService.getLangValue(uaValue, enValue);
    return this.languageService.getLangValue(uaValue, enValue) as string;
  }
  getControl(control: string): AbstractControl {
    return this.addTariffServiceForm.get(control);
  }

  get isDiscriptoinInvalid(): boolean {
    return this.getControl('description').invalid && this.getControl('description').touched;
  }

  get isDiscriptoinEnInvalid(): boolean {
    return this.getControl('descriptionEng').invalid && this.getControl('descriptionEng').touched;
  }

  addNewTariffForService() {
    const tariffId = this.receivedData.tariffId;
    const { name, nameEng, capacity, price, commission, description, descriptionEng } = this.addTariffServiceForm.value;

    this.tariffService = {
      capacity,
      price,
      commission,
      name: this.isLangEn ? nameEng : name,
      description: this.isLangEn ? descriptionEng : description,
      descriptionEng: this.isLangEn ? description : descriptionEng,
      nameEng: this.isLangEn ? name : nameEng
    };
    this.loadingAnim = true;
    this.tariffsService
      .createNewTariffForService(this.tariffService, tariffId)
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.dialogRef.close({});
      });

    this.loadingAnim = false;
  }

  editTariffForService(receivedData) {
    const langCode = receivedData.bagData.languageCode;
    const { name, nameEng, capacity, price, commission, description, descriptionEng } = this.addTariffServiceForm.getRawValue();
    this.tariffService = {
      name: this.getLangValue(name, nameEng),
      nameEng: this.getLangValue(nameEng, name),
      price,
      capacity,
      commission,
      description: this.getLangValue(description, descriptionEng),
      descriptionEng: this.getLangValue(descriptionEng, description),
      langCode
    };

    this.loadingAnim = true;
    this.tariffsService
      .editTariffForService(receivedData.bagData.id, this.tariffService)
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.dialogRef.close({});
      });
    this.loadingAnim = false;
  }

  fillFields() {
    if (this.receivedData.bagData) {
      const { name, nameEng, price, capacity, commission, description, descriptionEng } = this.receivedData.bagData;
      this.addTariffServiceForm.patchValue({
        name: this.getLangValue(this.receivedData.bagData.name, this.receivedData.bagData.nameEng),
        nameEng: this.getLangValue(this.receivedData.bagData.nameEng, this.receivedData.bagData.name),
        price,
        capacity,
        commission,
        description: this.getLangValue(this.receivedData.bagData.description, this.receivedData.bagData.descriptionEng),
        descriptionEng: this.getLangValue(this.receivedData.bagData.descriptionEng, this.receivedData.bagData.description)
      });
    }
  }

  onCancel(): void {
    const matDialogRef = this.dialog.open(ModalTextComponent, {
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        title: 'modal-text.cancel',
        name: 'cancel',
        text: 'modal-text.cancel-message',
        action: 'modal-text.yes'
      }
    });
    matDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.dialogRef.close();
      }
    });
  }
}
