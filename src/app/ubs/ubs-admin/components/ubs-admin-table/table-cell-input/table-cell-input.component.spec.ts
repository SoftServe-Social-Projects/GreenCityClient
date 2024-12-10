import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellInputComponent } from './table-cell-input.component';

describe('TableCellInputComponent', () => {
  let component: TableCellInputComponent;
  let fixture: ComponentFixture<TableCellInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableCellInputComponent]
    });
    fixture = TestBed.createComponent(TableCellInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
