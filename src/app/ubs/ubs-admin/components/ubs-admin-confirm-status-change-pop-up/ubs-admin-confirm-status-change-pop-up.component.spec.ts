import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { UbsAdminConfirmStatusChangePopUpComponent } from './ubs-admin-confirm-status-change-pop-up.component';

describe('UbsAdminConfirmStatusChangePopUpComponent', () => {
  let component: UbsAdminConfirmStatusChangePopUpComponent;
  let fixture: ComponentFixture<UbsAdminConfirmStatusChangePopUpComponent>;
  const matDialogRefStub = jasmine.createSpyObj('matDialogRefStub', ['close']);
  matDialogRefStub.close = () => 'Close window';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UbsAdminConfirmStatusChangePopUpComponent],
      imports: [MatDialogModule, TranslateModule.forRoot()],
      providers: [{ provide: MatDialogRef, useValue: matDialogRefStub }]
    });
    fixture = TestBed.createComponent(UbsAdminConfirmStatusChangePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
