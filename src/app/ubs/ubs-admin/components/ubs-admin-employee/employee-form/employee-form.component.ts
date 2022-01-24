import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UbsAdminEmployeeService } from '../../../services/ubs-admin-employee.service';
import { Employees, Page } from '../../../models/ubs-admin.interface';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { AddEmployee, DeleteEmployee, UpdateEmployee } from 'src/app/store/actions/employee.actions';
import { skip, take } from 'rxjs/operators';
import { DialogPopUpComponent } from '../../shared/components/dialog-pop-up/dialog-pop-up.component';
import { ShowImgsPopUpComponent } from '../../shared/components/show-imgs-pop-up/show-imgs-pop-up.component';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  locations;
  roles;
  employeeForm: FormGroup;
  employeePositions;
  receivingStations;
  employeeDataToSend: Page;
  viewMode: boolean;
  editMode = false;
  isDeleting = false;
  phoneMask = '+{38\\0} (00) 000 00 00';
  private maxImageSize = 10485760;
  public isWarning = false;
  public isUploading = false;
  imageURL: string;
  imageName = 'Your Avatar';
  selectedFile;
  imageFile;
  defaultPhotoURL = 'https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg';
  deleteDialogData = {
    popupTitle: 'employees.warning-title',
    popupConfirm: 'employees.btn.yes',
    popupCancel: 'employees.btn.no'
  };

  ngOnInit() {
    this.employeeService.getAllPositions().subscribe(
      (roles) => {
        this.roles = roles;
      },
      (error) => console.error('Observer for role got an error: ' + error)
    );
    this.employeeService.getAllStations().subscribe(
      (locations) => {
        this.locations = locations;
      },
      (error) => console.error('Observer for stations got an error: ' + error)
    );
    this.store
      .select((state: IAppState): Employees => state.employees.employees)
      .pipe(skip(1))
      .subscribe(() => {
        this.dialogRef.close();
      });
    this.store
      .select((state: IAppState): string | null => state.employees.error)
      .pipe(skip(1))
      .subscribe(() => {
        this.isUploading = false;
        this.isDeleting = false;
      });
  }

  constructor(
    private employeeService: UbsAdminEmployeeService,
    private store: Store<IAppState>,
    public dialogRef: MatDialogRef<EmployeeFormComponent>,
    public fb: FormBuilder,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Page
  ) {
    this.employeeForm = this.fb.group({
      firstName: [this.data?.firstName ?? '', Validators.required],
      lastName: [this.data?.lastName ?? '', Validators.required],
      phoneNumber: [this.data?.phoneNumber ?? '', Validators.required],
      email: [this.data?.email ?? '']
    });
    this.employeePositions = this.data?.employeePositions ?? [];
    this.receivingStations = this.data?.receivingStations ?? [];
    this.imageURL = this.data?.image;
    this.viewMode = !!this.data;
    if (this.viewMode) {
      this.employeeForm.disable();
    }
  }

  get isUpdatingEmployee() {
    return this.data && Object.keys(this.data).length !== 0;
  }

  get isCreatingEmployee() {
    return !this.isUpdatingEmployee;
  }

  get userHasDefaultPhoto() {
    return this.imageURL === this.defaultPhotoURL;
  }

  findRole(id: number): number {
    return this.employeePositions.findIndex((role) => {
      return role.id === id;
    });
  }

  onCheckChangeRole(role) {
    if (this.doesIncludeRole(role)) {
      const removeIndex = this.findRole(role.id);
      this.employeePositions.splice(removeIndex, 1);
      return;
    }
    this.employeePositions.push(role);
  }

  doesIncludeRole(role) {
    return this.employeePositions.some((existingRole) => existingRole.id === role.id);
  }

  findLocation(id: number): number {
    return this.receivingStations.findIndex((location) => {
      return location.id === id;
    });
  }

  onCheckChangeLocation(location) {
    if (this.doesIncludeLocation(location)) {
      const removeIndex = this.findLocation(location.id);
      this.receivingStations.splice(removeIndex, 1);
      return;
    }
    this.receivingStations.push(location);
  }

  doesIncludeLocation(location): boolean {
    return this.receivingStations.some((station) => location.id === station.id);
  }

  prepareEmployeeDataToSend(dto: string, image?: string): FormData {
    this.isUploading = true;
    this.employeeDataToSend = {
      ...this.employeeForm.value,
      employeePositions: this.employeePositions,
      receivingStations: this.receivingStations
    };
    if (this.isUpdatingEmployee) {
      this.employeeDataToSend.id = this.data.id;
    }
    if (image) {
      this.employeeDataToSend.image = image;
    }
    const formData: FormData = new FormData();
    const stringifiedDataToSend = JSON.stringify(this.employeeDataToSend);
    formData.append(dto, stringifiedDataToSend);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    return formData;
  }

  editEmployee(): void {
    this.editMode = true;
    this.employeeForm.enable();
    this.employeeForm.markAsTouched();
  }

  updateEmployee(): void {
    const image = this.selectedFile ? this.defaultPhotoURL : this.imageURL || this.defaultPhotoURL;
    const dataToSend = this.prepareEmployeeDataToSend('employeeDto', image);
    this.store.dispatch(UpdateEmployee({ data: dataToSend, employee: this.employeeDataToSend }));
  }

  createEmployee(): void {
    const dataToSend = this.prepareEmployeeDataToSend('addEmployeeDto');
    this.store.dispatch(AddEmployee({ data: dataToSend, employee: this.employeeDataToSend }));
  }

  deleteEmployee() {
    const matDialogRef = this.dialog.open(DialogPopUpComponent, {
      data: this.deleteDialogData,
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: ''
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res) {
          this.isDeleting = true;
          this.store.dispatch(DeleteEmployee({ id: this.data.id }));
        }
      });
  }

  treatFileInput(event: Event): void {
    event.preventDefault();

    const imageFile = (event.target as HTMLInputElement).files[0];
    this.transferFile(imageFile);
  }

  public filesDropped(files: File): void {
    const imageFile = files[0].file;
    this.transferFile(imageFile);
  }

  private transferFile(imageFile: File): void {
    this.isWarning = this.showWarning(imageFile);

    if (!this.isWarning) {
      const reader: FileReader = new FileReader();
      this.selectedFile = imageFile;
      this.imageName = this.selectedFile.name;

      reader.readAsDataURL(this.selectedFile);
      reader.onload = () => {
        this.imageURL = reader.result as string;
      };
    }
  }

  private showWarning(file: File): boolean {
    return file.size > this.maxImageSize || (file.type !== 'image/jpeg' && file.type !== 'image/png');
  }

  cancelDefault(e: DragEvent) {
    e.preventDefault();
  }

  removeImage() {
    this.imageURL = null;
    this.imageName = null;
    this.selectedFile = null;
  }

  openImg(): void {
    this.dialog.open(ShowImgsPopUpComponent, {
      hasBackdrop: true,
      panelClass: 'custom-img-pop-up',
      data: {
        imgIndex: 0,
        images: [{ src: this.imageURL }]
      }
    });
  }
}
