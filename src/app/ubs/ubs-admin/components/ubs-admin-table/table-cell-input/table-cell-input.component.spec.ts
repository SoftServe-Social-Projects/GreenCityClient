import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TableCellInputComponent } from './table-cell-input.component';
import { AdminTableService } from '@ubs/ubs-admin/services/admin-table.service';
import { of } from 'rxjs';
import { IAlertInfo } from '@ubs/ubs-admin/models/edit-cell.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { IColumnBelonging } from '@ubs/ubs-admin/models/ubs-admin.interface';

describe('TableCellInputComponent', () => {
  let component: TableCellInputComponent;
  let fixture: ComponentFixture<TableCellInputComponent>;
  let adminTableService: jasmine.SpyObj<AdminTableService>;

  beforeEach(() => {
    const adminTableServiceSpy = jasmine.createSpyObj('AdminTableService', ['howChangeCell', 'blockOrders', 'showTooltip']);
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    const mockModalRef = {
      componentInstance: {
        header: '',
        comment: ''
      },
      afterClosed: jasmine.createSpy().and.returnValue(of('New Comment'))
    };

    matDialogSpy.open.and.returnValue(mockModalRef as any);

    TestBed.configureTestingModule({
      declarations: [TableCellInputComponent],
      imports: [MatDialogModule, MatTooltipModule, TranslateModule.forRoot()],
      providers: [
        { provide: AdminTableService, useValue: adminTableServiceSpy },
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TableCellInputComponent);
    component = fixture.componentInstance;
    adminTableService = TestBed.inject(AdminTableService) as jasmine.SpyObj<AdminTableService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call showBlockedInfo.emit() when orders are blocked', () => {
    const mockColumn: IColumnBelonging = { key: 'test', ua: 'Test', en: 'Test' };
    const mockData = 'Test Comment';
    component.column = mockColumn;
    component.id = 1;
    component.ordersToChange = [1, 2, 3];
    component.isAllChecked = true;
    component.isUneditableStatus = false;
    component.data = mockData;

    adminTableService.howChangeCell.and.returnValue([1, 2, 3]);
    adminTableService.blockOrders.and.returnValue(of([{ message: 'Blocked' } as unknown as IAlertInfo]));

    spyOn(component.showBlockedInfo, 'emit');

    component.edit();

    expect(component.showBlockedInfo.emit).toHaveBeenCalledWith([{ message: 'Blocked' }]);
    expect(component.isBlocked).toBeFalse();
    expect(component.isEditable).toBeFalse();
  });

  it('should call onMouseEnter() and show tooltip', () => {
    const event = new MouseEvent('mouseenter');
    const tooltip = {};

    component.onMouseEnter(event, tooltip);

    expect(adminTableService.showTooltip).toHaveBeenCalledWith(event, tooltip, '12px Lato, sans-serif');
  });

  it('should emit showBlockedInfo when blockOrders returns data', () => {
    const mockResponse: IAlertInfo[] = [{ orderId: 10, userName: 'user' }];
    adminTableService.howChangeCell.and.returnValue([10]);
    adminTableService.blockOrders.and.returnValue(of(mockResponse));
    spyOn(component.showBlockedInfo, 'emit');

    component.edit();

    expect(component.isEditable).toBeFalse();
    expect(component.isBlocked).toBeFalse();
    expect(component.showBlockedInfo.emit).toHaveBeenCalledWith(mockResponse);
  });
});
