import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { UbsAdminExportDetailsComponent } from './ubs-admin-export-details.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';
import { HttpClientModule, HttpClient } from '@angular/common/http';

describe('UbsAdminExportDetailsComponent', () => {
  let component: UbsAdminExportDetailsComponent;
  let fixture: ComponentFixture<UbsAdminExportDetailsComponent>;
  const mockDate = '2022-01-01';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UbsAdminExportDetailsComponent],
      imports: [TranslateModule.forRoot(), BrowserAnimationsModule, HttpClientModule, ReactiveFormsModule],
      providers: [HttpClient]
    }).compileComponents();
  }));

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(mockDate));

    fixture = TestBed.createComponent(UbsAdminExportDetailsComponent);
    component = fixture.componentInstance;
    component.exportDetailsDto = new FormGroup({
      dateExport: new FormControl(''),
      timeDeliveryFrom: new FormControl('9-00'),
      timeDeliveryTo: new FormControl('10-00'),
      receivingStationId: new FormControl('')
    });
    component.exportInfo = {
      allReceivingStations: [
        {
          createDate: '2022-04-14',
          createdBy: 'null',
          id: 1,
          name: 'Саперно-Слобідська'
        }
      ],
      dateExport: null,
      timeDeliveryFrom: null,
      timeDeliveryTo: null,
      receivingStationId: 1
    };
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set formatted date to currentDate', () => {
    component.ngOnInit();

    expect(component.currentDate).toBe(mockDate);
  });

  it('openDetails should set pageOpen to opposite', () => {
    component.pageOpen = false;
    component.openDetails();

    expect(component.pageOpen).toBe(true);
  });

  it('component should set currentDate date to min attribute in html', () => {
    component.pageOpen = true;
    fixture.detectChanges();
    const inputElem = fixture.debugElement.nativeElement.querySelector('#export-date');

    expect(inputElem.min).toBe(mockDate);
  });

  it('showTimePickerClick should re-assign values to properties', () => {
    component.isEmployeeCanEditOrder = true;
    component.showTimePickerClick();

    expect(component.showTimePicker).toBe(true);
    expect(component.fromInput).toBe('9-00');
    expect(component.toInput).toBe('10-00');
  });

  it('setExportTime should re-assign values to properties', () => {
    const data = {
      from: '9-00',
      to: '10-00',
      dataWasChanged: true
    };
    component.showTimePicker = true;

    component.setExportTime(data);

    expect(component.exportDetailsDto.get('timeDeliveryFrom').value).toBe('9-00');
    expect(component.exportDetailsDto.get('timeDeliveryTo').value).toBe('10-00');
    expect(component.exportDetailsDto.get('timeDeliveryFrom').dirty).toBe(true);
    expect(component.exportDetailsDto.get('timeDeliveryTo').dirty).toBe(true);
    expect(component.showTimePicker).toBe(false);
  });

  it('should return true when pageOpen is false, exportDetailsDto is invalid and orderStatus is not cancel or done', () => {
    component.pageOpen = false;
    component.uneditableStatus = false;
    expect(component.isFormRequired).toBeFalsy();
  });
});
