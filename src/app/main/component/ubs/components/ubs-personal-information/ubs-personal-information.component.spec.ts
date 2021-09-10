import { of, Subject } from 'rxjs';
import { OrderService } from './../../services/order.service';
import { UBSOrderFormService } from './../../services/ubs-order-form.service';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { async, ComponentFixture, TestBed, __core_private_testing_placeholder__ } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UBSInputErrorComponent } from '../ubs-input-error/ubs-input-error.component';

import { UBSPersonalInformationComponent } from './ubs-personal-information.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('PersonalDataFormComponent', () => {
  let component: UBSPersonalInformationComponent;
  let fixture: ComponentFixture<UBSPersonalInformationComponent>;
  let realTakeUserData;
  const listMock = {
    addressList: [
      {
        actual: true,
        id: 2,
        city: 'fake',
        district: 'fake',
        street: 'fake',
        houseCorpus: 'fake',
        entranceNumber: 'fake',
        houseNumber: 'fake'
      }
    ]
  };
  const mockedPersonalData = {
    id: 3,
    firstName: 'fake',
    lastName: 'fake',
    email: 'fake',
    phoneNumber: 'fake',
    addressComment: 'fake',
    city: 'fake',
    district: 'fake',
    street: 'fake',
    houseCorpus: 'fake',
    entranceNumber: 'fake',
    houseNumber: 'fake'
  };
  const fakeShareFormService = jasmine.createSpyObj('fakeShareFormService', ['changePersonalData', 'orderDetails']);
  const fakeOrderService = jasmine.createSpyObj('fakeOrderService', ['findAllAddresses', 'getPersonalData', 'deleteAddress', 'setOrder']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        HttpClientTestingModule,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      declarations: [UBSPersonalInformationComponent, UBSInputErrorComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: UBSOrderFormService, useValue: fakeShareFormService },
        { provide: OrderService, useValue: fakeOrderService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UBSPersonalInformationComponent);
    component = fixture.componentInstance;
    realTakeUserData = component.takeUserData;
    spyOn(component, 'takeUserData').and.callFake(() => {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('method ngDoCheck should invoke methods', () => {
    const spy = spyOn(component, 'submit').and.callFake(() => {});
    fakeShareFormService.changePersonalData.and.callFake(() => {});
    component.completed = true;
    fixture.detectChanges();
    component.ngDoCheck();
    expect(fakeShareFormService.changePersonalData).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it('method findAllAddresses should get data from orderService', () => {
    const spy = spyOn<any>(component, 'getLastAddresses').and.callThrough();
    fakeOrderService.findAllAddresses.and.returnValue(of(listMock));
    spyOn(component, 'checkAddress').and.callFake(() => {});
    component.findAllAddresses();
    expect(spy).toHaveBeenCalledWith(listMock.addressList);
  });

  it('destroy Subject should be closed after ngOnDestroy()', () => {
    // @ts-ignore
    component.destroy = new Subject<boolean>();
    // @ts-ignore
    spyOn(component.destroy, 'unsubscribe');
    component.ngOnDestroy();
    // @ts-ignore
    expect(component.destroy.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('method takeUserData should get data from orderService', () => {
    fakeOrderService.personalData = mockedPersonalData;
    spyOn(component, 'setFormData').and.callFake(() => {});
    spyOn(component, 'findAllAddresses').and.callFake(() => {});
    fakeOrderService.getPersonalData.and.returnValue(of(mockedPersonalData));
    component.takeUserData = realTakeUserData;
    fixture.detectChanges();
    component.takeUserData();
    expect(component.setFormData).toHaveBeenCalledTimes(1);
    expect(component.findAllAddresses).toHaveBeenCalledTimes(1);
  });

  it('method checkAddress should invoke changeAddressInPersonalData', () => {
    spyOn(component, 'changeAddressInPersonalData').and.callFake(() => {});
    component.checkAddress(0);
    expect(component.changeAddressInPersonalData).toHaveBeenCalledTimes(1);
  });

  it('method editAddress should invoke openDialog', () => {
    spyOn(component, 'openDialog').and.callFake(() => {});
    component.editAddress(0);
    expect(component.openDialog).toHaveBeenCalledTimes(1);
  });

  it('method deleteAddress should invoke deleteAddress from orderService', () => {
    fakeOrderService.deleteAddress.and.returnValue(of(listMock));
    spyOn(component, 'checkAddress').and.callFake(() => {});
    component.deleteAddress(listMock.addressList[0]);
    expect(component.checkAddress).toHaveBeenCalledTimes(1);
  });

  it('method submit should invoke methods', () => {
    const mockedOrderDetails = {
      bags: [],
      points: 9
    };
    component.personalData = mockedPersonalData;
    fakeShareFormService.orderDetails = mockedOrderDetails;
    console.log(fakeShareFormService.orderDetails);
    fixture.detectChanges();
    spyOn(component, 'activeAddressId').and.callFake(() => {});
    spyOn(component, 'changeAddressInPersonalData').and.callFake(() => {});
    fakeOrderService.setOrder.and.callFake(() => {});
    component.submit();
    expect(component.activeAddressId).toHaveBeenCalledTimes(1);
    expect(component.changeAddressInPersonalData).toHaveBeenCalledTimes(1);
    expect(fakeOrderService.setOrder).toHaveBeenCalledTimes(1);
  });
});
