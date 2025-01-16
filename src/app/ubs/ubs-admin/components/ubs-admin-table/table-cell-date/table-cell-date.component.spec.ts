import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableCellDateComponent } from './table-cell-date.component';
import { AdminTableService } from 'src/app/ubs/ubs-admin/services/admin-table.service';
import { IAlertInfo, IEditCell } from 'src/app/ubs/ubs-admin/models/edit-cell.model';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

describe('TableCellDateComponent', () => {
  let component: TableCellDateComponent;
  let fixture: ComponentFixture<TableCellDateComponent>;
  const iAlertInfo: IAlertInfo[] = [
    { orderId: 1, userName: 'userName1' },
    { orderId: 2, userName: 'userName2' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableCellDateComponent],
      imports: [HttpClientModule, NoopAnimationsModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, MatInputModule],
      providers: [AdminTableService]
    }).compileComponents();
  });

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date());

    fixture = TestBed.createComponent(TableCellDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('TableCellDateComponent and its methods testing ', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('component.current should be current date', () => {
      const mockDate = new Date();

      expect(component.current).toEqual(mockDate);
    });

    it('should set current date to min attribute in input date', () => {
      component.isEditable = true;
      fixture.detectChanges();
      const inputElem = fixture.debugElement.nativeElement.querySelector('#date-input');
      const actualMinDate = inputElem.min.split('T')[0];
      expect(actualMinDate).toEqual(new Date().toISOString().split('T')[0]);
    });

    it('Test if edit() calls blockOrders() from AdminTableService with []', () => {
      const service = TestBed.inject(AdminTableService);
      spyOn(service, 'blockOrders').and.returnValue(of(iAlertInfo));
      component.isAllChecked = true;
      component.ordersToChange = [];
      fixture.detectChanges();
      component.edit();

      expect(service.blockOrders).toHaveBeenCalledWith([]);
    });

    it('Test if edit() calls blockOrders() from AdminTableService with ordersToChange', () => {
      const service = TestBed.inject(AdminTableService);
      spyOn(service, 'blockOrders').and.returnValue(of(iAlertInfo));
      component.isAllChecked = false;
      component.ordersToChange = [1, 2];
      fixture.detectChanges();
      component.edit();

      expect(service.blockOrders).toHaveBeenCalledWith([1, 2]);
    });

    it('Test if edit() calls blockOrders() from AdminTableService with [this.id]', () => {
      const service = TestBed.inject(AdminTableService);
      spyOn(service, 'blockOrders').and.returnValue(of(iAlertInfo));
      component.isAllChecked = false;
      component.ordersToChange = [];
      component.id = 1;
      fixture.detectChanges();
      component.edit();

      expect(service.blockOrders).toHaveBeenCalledWith([1]);
    });

    it('Test if when blockOrders() res[0] == undefined, method changes values of isBlocked and isEditable', () => {
      const service = TestBed.inject(AdminTableService);
      spyOn(service, 'blockOrders').and.returnValue(of(iAlertInfo));
      component.ordersToChange = [];
      iAlertInfo[0] = undefined;
      fixture.detectChanges();
      component.edit();

      expect(component.isBlocked).toBe(false);
      expect(component.isEditable).toBe(true);
    });

    it('Test if blockOrders() res[0] !== undefined method changes values of isBlocked and isEditable and calls showBlockedInfo ', () => {
      const service = TestBed.inject(AdminTableService);
      spyOn(service, 'blockOrders').and.returnValue(of(iAlertInfo));
      iAlertInfo[0] = { orderId: 1, userName: 'userName1' };
      component.ordersToChange = [];
      const spy = spyOn(component.showBlockedInfo, 'emit');
      fixture.detectChanges();
      component.edit();

      expect(component.isBlocked).toBe(false);
      expect(component.isEditable).toBe(false);
      expect(spy).toHaveBeenCalledWith(iAlertInfo);
    });

    it('Test changeData() calls editDateCell.emit() ', () => {
      const spy = spyOn(component.editDateCell, 'emit');
      const dateEvent: any = { value: new Date() };
      const isoDate = dateEvent.value.toISOString();

      const iEditCell: IEditCell = {
        id: 1,
        nameOfColumn: 'name-of-column',
        newValue: isoDate
      };

      component.id = 1;
      component.nameOfColumn = 'name-of-column';
      fixture.detectChanges();
      component.changeData(dateEvent);
      expect(spy).toHaveBeenCalledWith(iEditCell);
    });
  });

  describe('@Input() properties testitg', () => {
    beforeEach(() => {
      component.nameOfColumn = 'name-of-column-for-testing';
      component.id = 123;
      component.ordersToChange = [1, 2, 3];
      component.isAllChecked = true;

      fixture.detectChanges();
    });

    it('changeData() should set nameOfColumn to newValue field of iEditCell and call editDateCell.emit with it', () => {
      const spy = spyOn(component.editDateCell, 'emit');
      const dateEvent: any = { value: new Date() };
      const newDate = dateEvent.value.toISOString();

      component.id = 1;
      component.nameOfColumn = 'name-of-column-for-testing';
      fixture.detectChanges();
      component.changeData(dateEvent);

      expect(spy).toHaveBeenCalledWith({
        id: 1,
        nameOfColumn: 'name-of-column-for-testing',
        newValue: newDate
      });
    });

    it('changeData() should set id to id field of iEditCell and call editDateCell.emit with it ', () => {
      const spy = spyOn(component.editDateCell, 'emit');
      const dateEvent: any = { value: new Date() };
      const newDate = dateEvent.value.toISOString();
      component.nameOfColumn = 'name-of-column';
      fixture.detectChanges();
      component.changeData(dateEvent);

      expect(spy).toHaveBeenCalledWith({
        id: 123,
        nameOfColumn: 'name-of-column',
        newValue: newDate
      });
    });

    it('edit() should call blockOrders() with ordersToChange if ordersToChange.length > 0 ', () => {
      const service = TestBed.inject(AdminTableService);
      spyOn(service, 'blockOrders').and.returnValue(of(iAlertInfo));
      component.isAllChecked = false;
      component.edit();

      expect(service.blockOrders).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('if isAllChecked == true and !ordersToChange.length, edit() should call blockOrders with [] ', () => {
      const service = TestBed.inject(AdminTableService);
      spyOn(service, 'blockOrders').and.returnValue(of(iAlertInfo));
      component.ordersToChange = [];
      component.edit();

      expect(service.blockOrders).toHaveBeenCalledWith([]);
    });
  });
});
