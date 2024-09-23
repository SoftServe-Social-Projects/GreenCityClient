import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { AddOrderNotTakenOutReasonComponent } from './add-order-not-taken-out-reason.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NotTakenOutReasonImage } from '../../models/not-taken-out-reason.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

describe('AddOrderNotTakenOutReasonComponent', () => {
  let component: AddOrderNotTakenOutReasonComponent;
  let fixture: ComponentFixture<AddOrderNotTakenOutReasonComponent>;
  let localStorageServiceMock = jasmine.createSpyObj('localeStorageService', ['getCurrentLanguage']);
  const getLargeFileMock = () => {
    const file = new File([''], 'test-file.jpeg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 10875578 });
    return file;
  };
  const largeFileMock = getLargeFileMock();
  const matDialogRefStub = jasmine.createSpyObj('matDialogRefStub', ['close']);
  matDialogRefStub.close = () => 'Close window please';
  const matDialogStub = jasmine.createSpyObj('matDialogRefStub', ['open']);
  const dataFileMock = new File([''], 'test-file.jpeg', { type: 'image/jpeg' });
  const fakeFileHandle = {
    file: dataFileMock,
    name: 'name',
    src: 'fakeUrl'
  };
  const event = { target: { files: [dataFileMock] } };
  const viewModeInputs = {
    id: 1577
  };
  const line = 'notTakenOutReasonnotTakenOutReasonnotTakenOutReasonnotTakenOutReasonnotTakenOutReasonnotTakenOutReasonnotTakenOut';
  const invalidnotTakenOutReason = [`${line}${line}${line}`];

  localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', ['firstNameBehaviourSubject']);
  localStorageServiceMock.firstNameBehaviourSubject = new BehaviorSubject('fakeName');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AddOrderNotTakenOutReasonComponent],
      imports: [
        MatDialogModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        SharedModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefStub },
        { provide: MatDialog, useValue: matDialogStub },
        { provide: MAT_DIALOG_DATA, useValue: viewModeInputs },
        { provide: LocalStorageService, useValue: localStorageServiceMock }
      ]
    });
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(AddOrderNotTakenOutReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('makes expected calls', () => {
      const spy = spyOn(component, 'initForm');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
      expect(component.adminName).toBe('fakeName');
    });
  });

  it('addNotTakenOutForm invalid when empty', () => {
    expect(component.addNotTakenOutForm.valid).toBeFalsy();
  });

  describe('Testing controls for the notTakenOutReason', () => {
    const validNotTakenOutReason = ['notTakenOutReason'];
    function controlsValidator(itemValue, controlName, status) {
      it(`The formControl: ${controlName} should be marked as ${status} if the value is ${itemValue}.`, () => {
        const control = component.addNotTakenOutForm.get(controlName);
        control.setValue(itemValue);
        status === 'valid' ? expect(control.valid).toBeTruthy() : expect(control.valid).toBeFalsy();
      });
    }

    validNotTakenOutReason.forEach((el) => controlsValidator(el, 'notTakenOutReason', 'valid'));
    invalidnotTakenOutReason.forEach((el) => controlsValidator(el, 'notTakenOutReason', 'invalid'));

    it('form should be invalid when empty', () => {
      expect(component.addNotTakenOutForm.valid).toBeFalsy();
    });
  });

  it('addNotTakenOutForm field required', () => {
    const control = component.addNotTakenOutForm.get('notTakenOutReason');
    control.setValue('');
    expect(control.valid).toBeFalsy();
  });

  it('initForm should create', () => {
    const initFormFake = {
      notTakenOutReason: ''
    };

    component.initForm();
    expect(component.addNotTakenOutForm.contains('notTakenOutReason')).toBeTruthy();
    expect(component.addNotTakenOutForm.value).toEqual(initFormFake);
  });

  it('LocalStorageService should get firstName', () => {
    expect(localStorageServiceMock.firstNameBehaviourSubject.value).toBe('fakeName');
  });

  it('open ShowImgsPopUpComponent', () => {
    const a: NotTakenOutReasonImage = component.images[0];
    component.openImage(a);
    expect(matDialogStub.open).toHaveBeenCalled();
  });

  describe('files', () => {
    it('makes expected calls loadFiles in onFilesDropped', () => {
      const loadFilesSpy = spyOn(component, 'loadFiles');
      component.isImageSizeError = false;
      component.isImageTypeError = false;
      component.onFilesDropped([fakeFileHandle] as any);
      expect(loadFilesSpy).toHaveBeenCalled();
    });

    it('makes expected calls loadFiles in onFilesSelected', () => {
      const loadFilesSpy = spyOn(component, 'loadFiles');
      component.onFilesSelected(event as any);
      expect(loadFilesSpy).toHaveBeenCalled();
    });

    it('deleteImage', () => {
      component.images = [{ src: 'imageSrc', name: 'nameImg', file: dataFileMock }];
      const a: NotTakenOutReasonImage = component.images[0];
      component.deleteImage(a);
      expect(component.images).toEqual([]);
    });

    it('loadFiles with file lenght more than 6', () => {
      const files = [];
      files.length = 7;
      component.isImageSizeError = false;
      component.isImageTypeError = false;

      expect(component.loadFiles(files)).toBeFalsy();
    });

    it('loadFiles with image errors', () => {
      const files = [];
      files.length = 4;
      component.isImageSizeError = true;
      component.isImageTypeError = true;

      expect(component.loadFiles(files)).toBeFalsy();
    });
  });

  describe('send and close', () => {
    it('makes expected call send', fakeAsync(() => {
      spyOn(component, 'send');
      component.send();
      fixture.detectChanges();
      const buton = fixture.nativeElement.querySelector('.agree').click();
      tick();
      expect(component.send).toHaveBeenCalled();
    }));

    it('makes expected call close', fakeAsync(() => {
      spyOn(component, 'close');
      component.close();
      fixture.detectChanges();
      const buton = fixture.nativeElement.querySelector('.disagree').click();
      tick();
      expect(component.close).toHaveBeenCalled();
    }));
  });
});
