import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServerTranslatePipe } from 'src/app/shared/translate-pipe/translate-pipe.pipe';
import { TableCellReadonlyComponent } from './table-cell-readonly.component';
import { Language } from 'src/app/main/i18n/Language';
import { TableKeys } from '../../../services/table-keys.enum';
import { MouseEvents } from 'src/app/shared/mouse-events';

describe('TableCellReadonlyComponent', () => {
  let component: TableCellReadonlyComponent;
  let fixture: ComponentFixture<TableCellReadonlyComponent>;

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

  it('should not show tooltip if textContainerWidth is greater than or equal to textWidth', () => {
    const event = {
      target: {
        offsetWidth: 100,
        innerText: 'Short text'
      }
    };
    const tooltip = {
      show: jasmine.createSpy('show')
    };

    component.calculateTextWidth(event, tooltip);

    expect(tooltip.show).not.toHaveBeenCalled();
  });

  it('should not show tooltip if the difference between textContainerWidth and textWidth is greater than or equal to maxLength', () => {
    const event = {
      target: {
        offsetWidth: 120,
        innerText: 'Long text'
      }
    };
    const tooltip = {
      show: jasmine.createSpy('show')
    };
    const maxLength = 20;

    component.calculateTextWidth(event, tooltip, maxLength);

    expect(tooltip.show).not.toHaveBeenCalled();
  });

  it('should hide tooltip if lengthStr is not greater than maxLength', () => {
    const event = {
      stopImmediatePropagation: jasmine.createSpy('stopImmediatePropagation'),
      target: {
        innerText: 'Short text'
      }
    };
    const tooltip = {
      toggle: jasmine.createSpy('toggle'),
      hide: jasmine.createSpy('hide')
    };
    const maxLength = 50;

    component.showTooltip(event, tooltip, maxLength);

    expect(event.stopImmediatePropagation).toHaveBeenCalled();
    expect(tooltip.toggle).not.toHaveBeenCalled();
    expect(tooltip.hide).toHaveBeenCalled();
  });
});
