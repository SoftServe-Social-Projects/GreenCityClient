import { TestBed, waitForAsync } from '@angular/core/testing';

import { UbsAdminSeveralOrdersPopUpComponent } from './ubs-admin-several-orders-pop-up.component';

describe('UbsAdminSeveralOrdersPopUpComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UbsAdminSeveralOrdersPopUpComponent]
    }).compileComponents();
  }));
  it('should create', () => {
    expect(UbsAdminSeveralOrdersPopUpComponent).toBeTruthy();
  });
});
