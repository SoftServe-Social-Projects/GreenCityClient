import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServerTranslatePipe } from 'src/app/shared/translate-pipe/translate-pipe.pipe';
import { TableCellReadonlyComponent } from './table-cell-readonly.component';
import { Language } from 'src/app/main/i18n/Language';
import { TableKeys } from '../../../services/table-keys.enum';
import { PaymnetStatus } from '../../../../ubs/order-status.enum';

describe('TableCellReadonlyComponent', () => {
  let component: TableCellReadonlyComponent;
  let fixture: ComponentFixture<TableCellReadonlyComponent>;

  const fakeStrValue = '20л - 0шт; 120л - 3шт';
  const fakeColumn = {
    key: 'fakeKey',
    ua: 'ua',
    en: 'en'
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatTooltipModule],
      declarations: [TableCellReadonlyComponent, ServerTranslatePipe],
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
    it('should translate in en for bagsAmount', () => {
      component.key = TableKeys.bagsAmount;
      component.lang = Language.EN;
      component.title = fakeStrValue;

      component.ngOnChanges();

      expect(component.data).toBe('20L - 0p; 120L - 3p');
    });

    it('should not translate for bagsAmount in ua', () => {
      component.key = TableKeys.bagsAmount;
      component.lang = 'ua';
      component.title = fakeStrValue;

      component.ngOnChanges();

      expect(component.data).toBe(fakeStrValue);
    });

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

  it('should update title and data on changes', () => {
    component.key = TableKeys.generalDiscount;
    component.title = '0.00 UAH';
    component.ngOnChanges();
    expect(component.title).toEqual('0.00 UAH');
    expect(component.data).toEqual('0.00 UAH');

    component.key = TableKeys.clientPhone;
    component.title = '1234567890';
    component.ngOnChanges();
    expect(component.title).toEqual('+1234567890');
    expect(component.data).toEqual('+1234567890');

    component.key = TableKeys.bagsAmount;
    component.title = '20л - 0шт; 120л - 3шт';
    component.lang = Language.EN;
    component.ngOnChanges();
    expect(component.title).toEqual('20L - 0p; 120L - 3p');
    expect(component.data).toEqual('20L - 0p; 120L - 3p');
  });

  it('should call ngOnChanges and update title and data with replaceRules', () => {
    component.key = TableKeys.bagsAmount;
    component.lang = Language.EN;
    component.title = '20л - 0шт';
    component.ngOnChanges();
    expect(component.title).toBe('20L - 0p');
    expect(component.data).toBe('20L - 0p');
    component.lang = Language.UA;
    component.title = '20L - 0p';
    component.ngOnChanges();
    expect(component.title).toBe('20л - 0шт');
    expect(component.data).toBe('20л - 0шт');
  });

  it('should call isStatus and update payment status', () => {
    component.data = PaymnetStatus.PAID;
    component.isStatus();
    expect(component.paid).toBeTruthy();
    component.data = PaymnetStatus.HALF_PAID;
    component.isStatus();
    expect(component.halfpaid).toBeTruthy();
    component.data = PaymnetStatus.UNPAID;
    component.isStatus();
    expect(component.unpaid).toBeTruthy();
  });
});
