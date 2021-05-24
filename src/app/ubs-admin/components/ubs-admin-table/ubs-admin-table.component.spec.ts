import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule, MatIconModule, MatPaginatorModule, MatTableModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { UbsAdminTableComponent } from './ubs-admin-table.component';

describe('UsbAdminTableComponent', () => {
  let component: UbsAdminTableComponent;
  let fixture: ComponentFixture<UbsAdminTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatPaginatorModule,
        MatTableModule,
        CdkTableModule,
        DragDropModule,
        HttpClientTestingModule,
        MatCheckboxModule,
        BrowserAnimationsModule
      ],
      declarations: [UbsAdminTableComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
