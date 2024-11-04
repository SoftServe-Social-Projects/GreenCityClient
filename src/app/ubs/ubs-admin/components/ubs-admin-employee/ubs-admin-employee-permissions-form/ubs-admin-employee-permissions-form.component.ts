import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Page } from '../../../models/ubs-admin.interface';
import { UbsAdminEmployeeService } from '../../../services/ubs-admin-employee.service';
import { DialogPopUpComponent } from 'src/app/shared/dialog-pop-up/dialog-pop-up.component';
import { PopUpsStyles, ActionTypeForPermissions } from '../ubs-admin-employee-table/employee-models.enum';

@Component({
  selector: 'app-ubs-admin-employee-permissions-form',
  templateUrl: './ubs-admin-employee-permissions-form.component.html',
  styleUrls: ['./ubs-admin-employee-permissions-form.component.scss']
})
export class UbsAdminEmployeePermissionsFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  employee: Page;
  panelToggler = false;

  groups = [
    { name: 'clients', permissions: ['SEE_CLIENTS_PAGE'] },
    {
      name: 'employees',
      permissions: ['SEE_EMPLOYEES_PAGE', 'REGISTER_A_NEW_EMPLOYEE', 'EDIT_EMPLOYEE', 'DEACTIVATE_EMPLOYEE', 'EDIT_EMPLOYEES_AUTHORITIES']
    },
    {
      name: 'certificates',
      permissions: ['SEE_CERTIFICATES', 'CREATE_NEW_CERTIFICATE', 'EDIT_CERTIFICATE']
    },
    {
      name: 'orders',
      permissions: ['SEE_BIG_ORDER_TABLE', 'EDIT_ORDER']
    },
    {
      name: 'messages',
      permissions: ['SEE_MESSAGES_PAGE', 'CREATE_NEW_MESSAGE', 'EDIT_MESSAGE', 'DELETE_MESSAGE']
    },
    {
      name: 'tariffs',
      permissions: [
        'SEE_TARIFFS',
        'CREATE_NEW_LOCATION',
        'CREATE_NEW_COURIER',
        'CREATE_NEW_STATION',
        'EDIT_LOCATION',
        'EDIT_COURIER',
        'EDIT_STATION',
        'CREATE_PRICING_CARD',
        'SEE_PRICING_CARD',
        'EDIT_DELETE_DEACTIVATE_PRICING_CARD',
        'CONTROL_SERVICE'
      ]
    }
  ];

  labels = {
    SEE_CLIENTS_PAGE: 'see-main-page',
    SEE_EMPLOYEES_PAGE: 'see-main-page',
    REGISTER_A_NEW_EMPLOYEE: 'create-card',
    EDIT_EMPLOYEES_AUTHORITIES: 'edit-authority',
    EDIT_EMPLOYEE: 'edit-card',
    DEACTIVATE_EMPLOYEE: 'delete-card',
    SEE_CERTIFICATES: 'see-main-page',
    CREATE_NEW_CERTIFICATE: 'create-card',
    EDIT_CERTIFICATE: 'edit-card',
    SEE_BIG_ORDER_TABLE: 'see-main-page',
    EDIT_ORDER: 'edit-card',
    SEE_MESSAGES_PAGE: 'see-main-page',
    CREATE_NEW_MESSAGE: 'create-card',
    EDIT_MESSAGE: 'edit-card',
    DELETE_MESSAGE: 'delete-card',
    SEE_TARIFFS: 'see-main-page',
    CREATE_NEW_LOCATION: 'create-location',
    CREATE_NEW_COURIER: 'create-courier',
    CREATE_NEW_STATION: 'create-station',
    EDIT_LOCATION: 'edit-location-name',
    EDIT_COURIER: 'edit-courier-name',
    EDIT_STATION: 'edit-destination-name',
    CREATE_PRICING_CARD: 'create-price-card',
    SEE_PRICING_CARD: 'see-price-card',
    CONTROL_SERVICE: 'edit-service',
    EDIT_DELETE_DEACTIVATE_PRICING_CARD: 'edit-delete-price-card',
    DELETE_LOCATION: 'delete-location',
    DELETE_DEACTIVATE_COURIER: 'delete-courier',
    DELETE_DEACTIVATE_STATION: 'delete-station'
  };

  isUpdating = false;
  isDisabled = true;
  private destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: Page,
    private employeeService: UbsAdminEmployeeService,
    private dialogRef: MatDialogRef<UbsAdminEmployeePermissionsFormComponent>,
    private snackBar: MatSnackBarComponent,
    private dialog: MatDialog
  ) {
    this.employee = data;
    this.form = this.fb.group(
      Object.fromEntries(
        this.groups.map((group) => [group.name, this.fb.group(Object.fromEntries(group.permissions.map((field) => [field, false])))])
      )
    );
  }

  ngOnInit(): void {
    this.employeeService
      .getAllEmployeePermissions(this.employee.email)
      .pipe(take(1))
      .subscribe((employeePermissions: string[]) => {
        this.groups.forEach((group) => {
          group.permissions.forEach((perm) => {
            if (employeePermissions.includes(perm)) {
              this.form.get(group.name).get(perm).setValue(true);
            }
          });
        });
      });
    this.dialogRef
      .backdropClick()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.dialogRef.close(true));
  }

  isPanelOpen() {
    this.panelToggler = !this.panelToggler;
  }

  updateAllComplete() {
    this.isDisabled = false;
  }

  savePermissions() {
    this.isUpdating = true;
    const selectedPermissions = Object.entries(this.form.value)
      .flatMap(([, perm]) => Object.entries(perm))
      .filter(([, selected]) => selected)
      .map(([perm]) => perm);

    this.employeeService.updatePermissions(this.employee.email, selectedPermissions).subscribe({
      next: () => {
        this.isUpdating = false;
        this.snackBar.openSnackBar('successUpdateUbsData');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.snackBar.openSnackBar('error', error);
        this.dialogRef.close(false);
      }
    });
  }

  managePermissionSettings(actionType: string): void {
    const cancelData = {
      popupTitle: 'employees.permissions.clients.cancel-changes',
      popupConfirm: 'employees.btn.yes',
      popupCancel: 'employees.btn.no',
      style: PopUpsStyles.lightGreen,
      іsPermissionConfirm: false,
      isItrefund: false
    };
    const dialogRef = this.dialog.open(DialogPopUpComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: '',
      data: cancelData
    });

    if (actionType === ActionTypeForPermissions.cancel) {
      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((confirm) => {
          if (confirm) {
            this.dialogRef.close(true);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
