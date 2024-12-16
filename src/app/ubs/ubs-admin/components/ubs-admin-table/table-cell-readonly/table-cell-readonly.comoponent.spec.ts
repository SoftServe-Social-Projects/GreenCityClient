import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServerTranslatePipe } from 'src/app/shared/translate-pipe/translate-pipe.pipe';
import { TableCellReadonlyComponent } from './table-cell-readonly.component';
import { Language } from 'src/app/main/i18n/Language';
import { TableKeys } from '../../../services/table-keys.enum';
import { AdminTableService } from '../../../services/admin-table.service';

describe('TableCellReadonlyComponent', () => {
  let component: TableCellReadonlyComponent;
  let fixture: ComponentFixture<TableCellReadonlyComponent>;
  const adminTableServiceSpy = jasmine.createSpyObj('AdminTableService', ['howChangeCell', 'blockOrders', 'showTooltip']);

  const fakeStrValue = '20л - 0шт; 120л - 3шт';
  const fakeColumn = {
    key: 'fakeKey',
    ua: 'ua',
    en: 'en'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTooltipModule],
      declarations: [TableCellReadonlyComponent, ServerTranslatePipe],
      providers: [{ provide: AdminTableService, useValue: adminTableServiceSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellReadonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set dataObj', () => {
    component.optional = [fakeColumn];
    component.title = 'fakeKey';

    component.ngOnInit();

    expect(component.dataObj).toEqual(fakeColumn);
  });

  describe('ngOnChanges', () => {
    it('should add minus sign for generalDiscount when not zero', () => {
      component.key = TableKeys.generalDiscount;
      component.title = '10.00 UAH';

      component.ngOnChanges();

      expect(component.data).toBe('-10.00 UAH');
    });

    it('should not add minus sign for generalDiscount when zero', () => {
      component.key = TableKeys.generalDiscount;
      component.title = '0.00 UAH';

      component.ngOnChanges();

      expect(component.data).toBe('0.00 UAH');
    });
  });
});
