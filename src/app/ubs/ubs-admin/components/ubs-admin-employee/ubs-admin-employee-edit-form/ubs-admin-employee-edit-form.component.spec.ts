import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { IMaskModule } from 'angular-imask';
import { of } from 'rxjs';
import { ShowImgsPopUpComponent } from 'src/app/shared/show-imgs-pop-up/show-imgs-pop-up.component';
import { UbsAdminEmployeeEditFormComponent } from './ubs-admin-employee-edit-form.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { FileHandle } from 'src/app/ubs/ubs-admin/models/file-handle.model';

describe('UbsAdminEmployeeEditFormComponent', () => {
  let component: UbsAdminEmployeeEditFormComponent;
  let fixture: ComponentFixture<UbsAdminEmployeeEditFormComponent>;

  const defaultImagePath =
    'https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg';
  const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
  matDialogRefMock.afterClosed.and.returnValue(of(true));
  const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
  matDialogMock.open.and.returnValue(matDialogRefMock);

  const mockedEmployeePositions = [
    {
      id: 2,
      name: 'fake',
      nameEn: 'fakeEn'
    }
  ];
  const mockedReceivingStations = [
    {
      id: 3,
      name: 'fake',
      nameEn: 'fakeEn'
    },
    {
      id: 4,
      name: 'fake',
      nameEn: 'fakeEn'
    }
  ];
  const mockedData = {
    email: 'fake',
    employeePositions: mockedEmployeePositions,
    firstName: 'fake',
    id: 1,
    image: defaultImagePath,
    lastName: 'fake',
    phoneNumber: 'fake',
    tariffs: [
      {
        id: 1,
        region: {
          id: 1,
          nameEn: 'Kyiv Oblast',
          nameUk: 'Київська область'
        },
        locationsDtos: [
          {
            id: 1,
            nameEn: 'Kyiv',
            nameUk: 'Київ'
          }
        ],
        courier: {
          id: 1,
          nameEn: 'UBS',
          nameUk: 'УБС'
        }
      },
      {
        id: 2,
        region: {
          id: 1,
          nameEn: 'Kyiv Oblast',
          nameUk: 'Київська область'
        },
        locationsDtos: [
          {
            id: 2,
            nameEn: 'Irpin',
            nameUk: 'Ірпінь'
          }
        ],
        courier: {
          id: 1,
          nameEn: 'UBS',
          nameUk: 'УБС'
        }
      }
    ]
  };
  const mockFormData = {
    firstName: 'fakeFirstName',
    lastName: 'fakeLastName',
    phoneNumber: 'fakePhoneNumber',
    email: 'fakeEmail'
  };
  const mockedInitialData = {
    firstName: 'fake',
    lastName: 'fake',
    phoneNumber: 'fake',
    email: 'fake',
    imageURL: defaultImagePath,
    employeePositionsIds: [2],
    receivingStationsIds: [3, 4]
  };
  const mockedDto = 'employeeDto';
  const transferFile = 'transferFile';
  const fakeEmployeePositions = ['fake'];
  const fakeReceivingStations = ['fake'];
  const fakeEmployeeForm = new FormGroup({
    firstName: new FormControl('fake'),
    lastName: new FormControl('fake'),
    phoneNumber: new FormControl('fake'),
    email: new FormControl('fake')
  });
  const dataFileMock = new File([''], 'test-file.jpeg');
  const datasFileMock: FileHandle[] = [
    {
      file: new File([''], 'test-file.jpeg'),
      url: ''
    }
  ];
  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  storeMock.select = () => of(true, true);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UbsAdminEmployeeEditFormComponent],
      imports: [HttpClientTestingModule, MatDialogModule, TranslateModule.forRoot(), ReactiveFormsModule, IMaskModule, CdkAccordionModule],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: MAT_DIALOG_DATA, useValue: mockedData },
        { provide: Store, useValue: storeMock },
        FormBuilder
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminEmployeeEditFormComponent);
    component = fixture.componentInstance;
    component.employeePositions = JSON.parse(JSON.stringify(mockedEmployeePositions));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return firstName Control on get firstName', () => {
    const firstName = component.firstName;
    expect(firstName).toEqual(component.employeeForm.get('firstName'));
  });

  it('should return lastName Control on get lastName', () => {
    const lastName = component.lastName;
    expect(lastName).toEqual(component.employeeForm.get('lastName'));
  });

  it('should return phoneNumber Control on get phoneNumber', () => {
    expect(component.employeeForm.get('phoneNumber')).toBeTruthy();
    expect(component.employeeForm.get('phoneNumber').status).toEqual('INVALID');
  });

  it('should return email Control on get email', () => {
    expect(component.employeeForm.get('email')).toBeTruthy();
    expect(component.employeeForm.get('email').status).toEqual('INVALID');
  });

  it('employeeForm should receive data from MAT_DIALOG_DATA', () => {
    expect(component.employeeForm.value).toEqual({
      firstName: 'fake',
      lastName: 'fake',
      phoneNumber: 'fake',
      email: 'fake'
    });
  });

  it('Returned formData should have employeeDto', () => {
    component.selectedFile = false;
    const returnedFormData = component.prepareEmployeeDataToSend(mockedDto);
    expect(returnedFormData.has('employeeDto')).toBe(true);
  });

  it('Returned formData should have image if has selectedFile', () => {
    component.selectedFile = true;
    const returnedFormData = component.prepareEmployeeDataToSend(mockedDto);
    expect(returnedFormData.has('image')).toBe(true);
  });

  it('Role should be included', () => {
    const isIncludeRole = component.doesIncludeRole({ id: 2 });
    expect(isIncludeRole).toBe(true);
  });

  it('Role should be added', () => {
    const fakeRole = { id: 3, name: 'addedFake', nameEn: 'addedFakeEn' };
    component.onCheckChangeRole(fakeRole);
    expect(component.employeePositions).toEqual([...mockedEmployeePositions, fakeRole]);
  });

  it('Role should be removed', () => {
    component.onCheckChangeRole({ id: 2 });
    expect(component.employeePositions).toEqual([]);
  });

  it('updateEmployee method should close dialogRef when EmployeeService has sent a response', () => {
    component.selectedFile = false;
    spyOn(component, 'prepareEmployeeDataToSend').and.returnValue(new FormData());
    component.updateEmployee();
    expect(storeMock.dispatch).toHaveBeenCalled();
  });

  it('createEmployee method should close dialogRef when EmployeeService has sent a response', () => {
    spyOn(component, 'prepareEmployeeDataToSend').and.returnValue(new FormData());
    component.createEmployee();
    expect(storeMock.dispatch).toHaveBeenCalled();
  });

  it('should remove image', () => {
    component.imageURL = defaultImagePath;
    component.imageName = 'fake';
    component.selectedFile = 'fake';
    component.removeImage();

    expect(component.imageURL).toBe(null);
    expect(component.imageName).toBe(null);
    expect(component.selectedFile).toBe(null);
  });

  it('filesDropped should be called', () => {
    const filesDroppedMock = spyOn(component, 'filesDropped');
    component.filesDropped(datasFileMock);
    expect(filesDroppedMock).toHaveBeenCalledWith(datasFileMock);
  });

  describe('checkIsInitialPositionsChanged', () => {
    it('isInitialPositionsChangedMock should be falsy', () => {
      const isInitialPositionsChangedMock = component.checkIsInitialPositionsChanged();
      expect(isInitialPositionsChangedMock).toBeFalsy();
    });

    it('isInitialPositionsChangedMock should be truthy', () => {
      component.employeePositions = [
        {
          id: 2,
          name: 'fake',
          nameEn: 'fakeEn'
        },
        {
          id: 22,
          name: 'fake22',
          nameEn: 'fake22En'
        }
      ];
      const isInitialPositionsChangedMock = component.checkIsInitialPositionsChanged();
      expect(isInitialPositionsChangedMock).toBeTruthy();
    });
  });

  describe('editEmployee', () => {
    it(`employee has been edited`, () => {
      component.editEmployee();
      component.employeeForm.controls.firstName.setValue('NewFakeName');
      expect(component.isInitialDataChanged).toBeTruthy();
    });
  });

  describe('openImg', () => {
    it(`dialog has been opened`, () => {
      component.openImg();
      expect(matDialogMock.open).toHaveBeenCalledWith(ShowImgsPopUpComponent, {
        hasBackdrop: true,
        panelClass: 'custom-img-pop-up',
        data: {
          imgIndex: 0,
          images: [{ src: defaultImagePath }]
        }
      });
    });
  });
});
