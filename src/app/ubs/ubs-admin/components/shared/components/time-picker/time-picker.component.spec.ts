import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { TimePickerComponent } from './time-picker.component';

describe('TimePickerComponent', () => {
  let component: TimePickerComponent;
  let fixture: ComponentFixture<TimePickerComponent>;
  const fakeTimeFrom = '10:00';
  const fakeTimeTo = '14:00';
  const fakeTimeSelectFrom = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30'
  ];
  const fakeTimeSelectTo = [
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00'
  ];
  const fakeTimeToChange: string[] = [
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00'
  ];
  const fakeTimeFromChange: string[] = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30'
  ];
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimePickerComponent],
      imports: [TranslateModule.forRoot(), FormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    component.setTimeFrom = '10:00';
    component.setTimeTo = '14:00';
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create TimePickerComponent', () => {
    expect(component).toBeTruthy();
  });

  it('shoud set time in selectors', () => {
    component.fromSelect = fakeTimeSelectFrom;
    component.toSelect = fakeTimeSelectTo;
    expect(component.fromSelect).toEqual(fakeTimeSelectFrom);
    expect(component.toSelect).toEqual(fakeTimeSelectTo);
    expect(component.setTimeFrom).toBe(fakeTimeFrom);
    expect(component.setTimeTo).toBe(fakeTimeTo);
    expect(component.fromInput).toBe(component.setTimeFrom);
    expect(component.toInput).toBe(component.setTimeTo);
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should set list of time "delivery to" started with time "delivery from" plus 30 minutes', () => {
    const selector = fixture.debugElement.query(By.css('#timeFrom')).nativeElement;
    selector.value = selector.options[3].value;
    selector.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.toSelect).toEqual(fakeTimeToChange);
  });
  it('should set list of time "delivery from" with time which precedes the current value in "delivery from" minuse 30 minutes ', () => {
    const selector = fixture.debugElement.query(By.css('#timeTo')).nativeElement;
    selector.value = selector.options[14].value;
    selector.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.fromSelect).toEqual(fakeTimeFromChange);
  });
  it('should save time selected in the time picker', () => {
    const fakeDataToSave = { from: fakeTimeFrom, to: fakeTimeTo, dataWasChanged: true };
    component.from = fakeTimeFrom;
    component.to = fakeTimeTo;
    const event = spyOn(component.timeOfExport, 'emit');
    const saveButton = fixture.debugElement.query(By.css('.save'));
    saveButton.nativeElement.click();
    expect(event).toHaveBeenCalledWith(fakeDataToSave);
    expect(component.from).toBe(fakeTimeFrom);
    expect(component.to).toBe(fakeTimeTo);
  });
  it('should cancel all changes in the time picker', () => {
    component.from = fakeTimeFrom;
    component.to = fakeTimeTo;
    const fakeDataToSave = { from: fakeTimeFrom, to: fakeTimeTo, dataWasChanged: false };
    const event = spyOn(component.timeOfExport, 'emit');
    const saveButton = fixture.debugElement.query(By.css('.cancel'));
    saveButton.nativeElement.click();
    expect(event).toHaveBeenCalledWith(fakeDataToSave);
    expect(component.fromInput).toBe(fakeTimeFrom);
    expect(component.toInput).toBe(fakeTimeTo);
    expect(component.from).toBe(fakeTimeFrom);
    expect(component.to).toBe(fakeTimeTo);
  });

  it('should call calcTimeFromOptions() if current day is selected', () => {
    component.isCurrentDaySelected = true;
    const spy = spyOn(component, 'calcTimeFromOptions');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });
});
