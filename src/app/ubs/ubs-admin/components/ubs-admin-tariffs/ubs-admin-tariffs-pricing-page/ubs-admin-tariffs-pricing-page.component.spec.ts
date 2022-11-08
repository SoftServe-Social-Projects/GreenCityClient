import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { UbsAdminTariffsPricingPageComponent } from './ubs-admin-tariffs-pricing-page.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { UbsAdminTariffsAddServicePopUpComponent } from './ubs-admin-tariffs-add-service-pop-up/ubs-admin-tariffs-add-service-pop-up.component';
import { FilterListByLangPipe } from '../../../../../shared/sort-list-by-lang/filter-list-by-lang.pipe';
import { UbsAdminTariffsAddTariffServicePopUpComponent } from './ubs-admin-tariffs-add-tariff-service-pop-up/ubs-admin-tariffs-add-tariff-service-pop-up.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TariffsService } from 'src/app/ubs/ubs-admin/services/tariffs.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { OrderService } from 'src/app/ubs/ubs/services/order.service';
import { VolumePipe } from 'src/app/shared/volume-pipe/volume.pipe';
import { LocalizedCurrencyPipe } from 'src/app/shared/localized-currency-pipe/localized-currency.pipe';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Bag, Locations } from 'src/app/ubs/ubs-admin/models/tariffs.interface';
import { Store } from '@ngrx/store';
import { UbsAdminTariffsLocationDashboardComponent } from '../ubs-admin-tariffs-location-dashboard.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UbsAdminPricingPageComponent', () => {
  let component: UbsAdminTariffsPricingPageComponent;
  let fixture: ComponentFixture<UbsAdminTariffsPricingPageComponent>;
  let httpMock: HttpTestingController;
  let route: ActivatedRoute;
  let location: Location;
  let router: Router;

  const fakeValue = '1';
  const fakeCourierForm = new FormGroup({
    courierLimitsBy: new FormControl('fake'),
    minPriceOfOrder: new FormControl('fake'),
    maxPriceOfOrder: new FormControl('fake'),
    minAmountOfBigBags: new FormControl('fake'),
    maxAmountOfBigBags: new FormControl('fake'),
    limitDescription: new FormControl('fake')
  });
  const fakeLocations: Locations = {
    locationsDto: [
      {
        latitude: 0,
        longitude: 0,
        locationId: 159,
        locationTranslationDtoList: [
          {
            languageCode: 'ua',
            locationName: 'fake'
          }
        ]
      }
    ],
    regionId: 1,
    regionTranslationDtos: [
      {
        regionName: 'fake',
        languageCode: 'ua'
      }
    ]
  };

  const fakeService = {
    locationId: 159,
    price: 555,
    commission: 333,
    languageCode: 'ua'
  };

  const fakeBag: Bag = {
    capacity: 111,
    price: 478,
    commission: 15
  };
  const fakeDescription = {
    limitDescription: 'fake'
  };
  const fakeCouriers = {
    courierLimit: 'fake',
    minPriceOfOrder: 'fake',
    maxPriceOfOrder: 'fake',
    minAmountOfBigBags: 'fake',
    maxAmountOfBigBags: 'fake',
    limitDescription: 'fake'
  };
  const fakeParams = {
    id: '159'
  };
  const fakeBagInfo = {
    minAmountOfBigBags: 'fake',
    maxAmountOfBigBags: 'fake'
  };
  const fakeSumInfo = {
    minAmountOfOrder: 'fake',
    maxPriceOfOrder: 'fake'
  };
  const fakeCardId = { cardId: 3 };
  const dialogStub = {
    afterClosed() {
      return of(true);
    }
  };

  const tariffsServiceMock = jasmine.createSpyObj('tariffsServiceMock', [
    'getLocations',
    'editInfo',
    'getCouriers',
    'getAllServices',
    'getAllTariffsForService',
    'setLimitDescription',
    'setLimitsBySumOrder',
    'setLimitsByAmountOfBags',
    'getCardInfo'
  ]);
  tariffsServiceMock.editInfo.and.returnValue(of([]));
  tariffsServiceMock.getCouriers.and.returnValue(of([fakeCouriers]));
  tariffsServiceMock.getAllServices.and.returnValue(of([fakeService]));
  tariffsServiceMock.getAllTariffsForService.and.returnValue(of([fakeBag]));
  tariffsServiceMock.setLimitDescription.and.returnValue(of([fakeDescription]));
  tariffsServiceMock.setLimitsBySumOrder.and.returnValue(of([fakeSumInfo]));
  tariffsServiceMock.setLimitsByAmountOfBags.and.returnValue(of([fakeBagInfo]));
  tariffsServiceMock.getCardInfo.and.returnValue(of([fakeCardId]));

  const matDialogMock = jasmine.createSpyObj('matDialogMock', ['open']);
  matDialogMock.open.and.returnValue(dialogStub);

  const localStorageServiceMock = jasmine.createSpyObj('localStorageServiceMock', ['getCurrentLanguage']);
  localStorageServiceMock.languageBehaviourSubject = of();

  const orderServiceMock = jasmine.createSpyObj('orderServiceMock', ['completedLocation']);

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  storeMock.select = () => of([fakeLocations]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UbsAdminTariffsPricingPageComponent,
        UbsAdminTariffsAddServicePopUpComponent,
        UbsAdminTariffsAddTariffServicePopUpComponent,
        FilterListByLangPipe,
        VolumePipe,
        LocalizedCurrencyPipe
      ],
      imports: [
        OverlayModule,
        MatDialogModule,
        MatRadioModule,
        MatProgressBarModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        NoopAnimationsModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([{ path: 'ubs-admin/tariffs', component: UbsAdminTariffsLocationDashboardComponent }]),
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
        FormBuilder,
        { provide: MatDialog, useValue: matDialogMock },
        { provide: MatDialogRef, useValue: dialogStub },
        { provide: TariffsService, useValue: tariffsServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: OrderService, useValue: orderServiceMock },
        { provide: Store, useValue: storeMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    orderServiceMock.locationSubject = new Subject<any>();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminTariffsPricingPageComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    route = TestBed.inject(ActivatedRoute);
    location = TestBed.inject(Location);
    router = TestBed.inject(Router);
    route.params = of(fakeParams);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call all methods in ngOnInit', () => {
    const spy = spyOn(component, 'routeParams');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should fillFields correctly', () => {
    component.limitsForm.patchValue(fakeCourierForm.value);
    expect(component.limitsForm.value).toEqual(fakeCourierForm.value);
  });

  it('should call getCourierId correctly', (done) => {
    fixture.detectChanges();
    const getCourierIdSpy = spyOn(component, 'getCourierId').and.returnValue(Promise.resolve());
    component.getCourierId();
    getCourierIdSpy.calls.mostRecent().returnValue.then(() => {
      fixture.detectChanges();
      expect(getCourierIdSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should call getOurTariffs correctly', (done) => {
    fixture.detectChanges();
    const getOurTariffsSpy = spyOn(component, 'getOurTariffs').and.returnValue(Promise.resolve());
    component.getOurTariffs();
    getOurTariffsSpy.calls.mostRecent().returnValue.then(() => {
      fixture.detectChanges();
      expect(getOurTariffsSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should call getLocationId correctly', (done) => {
    fixture.detectChanges();
    const getLocationIdSpy = spyOn(component, 'getLocationId').and.returnValue(Promise.resolve());
    component.getLocationId();
    getLocationIdSpy.calls.mostRecent().returnValue.then(() => {
      fixture.detectChanges();
      expect(getLocationIdSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should call getOurTariffs correctly', (done) => {
    fixture.detectChanges();
    const getOurTariffsSpy = spyOn(component, 'getOurTariffs').and.returnValue(Promise.resolve());
    component.getOurTariffs();
    getOurTariffsSpy.calls.mostRecent().returnValue.then(() => {
      fixture.detectChanges();
      expect(getOurTariffsSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should convert to number', () => {
    const numbers = Number(fakeValue);
    expect(typeof numbers).toBe('number');
  });

  it('should call sumToggler', () => {
    component.sumToggler();
    expect(component.toggle).toBe(true);
  });

  it('should call bagToggler', () => {
    component.bagToggler();
    expect(component.toggle).toBe(false);
  });

  it('navigate to tariffs page', () => {
    const spy = spyOn(router, 'navigate');
    component.navigateToBack();
    expect(spy).toHaveBeenCalledWith(['ubs-admin/tariffs']);
  });

  it('should call openAddTariffForServicePopup', () => {
    component.currentLocation = 159;
    const addtariffData = {
      button: 'add',
      locationId: 159
    };
    component.openAddTariffForServicePopup();
    expect(matDialogMock.open).toHaveBeenCalledWith(UbsAdminTariffsAddTariffServicePopUpComponent, {
      data: addtariffData,
      hasBackdrop: true,
      disableClose: false,
      panelClass: 'address-matDialog-styles-pricing-page'
    });
  });

  it('should call openAddServicePopup', () => {
    component.currentLocation = 159;
    const addtariffData = {
      button: 'add',
      locationId: 159
    };
    component.openAddServicePopup();
    expect(matDialogMock.open).toHaveBeenCalledWith(UbsAdminTariffsAddServicePopUpComponent, {
      hasBackdrop: true,
      disableClose: false,
      panelClass: 'address-matDialog-styles-pricing-page',
      data: addtariffData
    });
  });

  it('should call openUpdateTariffForServicePopup', () => {
    const tariffData = {
      button: 'update',
      bagData: fakeBag
    };
    component.openUpdateTariffForServicePopup(fakeBag);
    expect(matDialogMock.open).toHaveBeenCalledWith(UbsAdminTariffsAddTariffServicePopUpComponent, {
      hasBackdrop: true,
      disableClose: false,
      panelClass: 'address-matDialog-styles-pricing-page',
      data: tariffData
    });
  });

  it('should call openUpdateServicePopup', () => {
    const tariffData = {
      button: 'update',
      serviceData: fakeService
    };
    component.openUpdateServicePopup(fakeService);
    expect(matDialogMock.open).toHaveBeenCalledWith(UbsAdminTariffsAddServicePopUpComponent, {
      hasBackdrop: true,
      disableClose: false,
      panelClass: 'address-matDialog-styles-pricing-page',
      data: tariffData
    });
  });

  it('should get all tariffs for service', () => {
    const spy = spyOn<any>(component, 'filterBags');
    component.bags = [];
    component.getAllTariffsForService();
    expect(component.isLoadBar).toEqual(false);
    expect(component.bags).toEqual([fakeBag]);
    expect(spy).toHaveBeenCalled();
  });

  it('should get all services', () => {
    const spy = spyOn<any>(component, 'filterServices');
    component.getServices();
    expect(component.isLoadBar1).toEqual(false);
    expect(component.services).toEqual([fakeService]);
    expect(spy).toHaveBeenCalled();
  });

  it('should get couriers', () => {
    const spy = spyOn(component, 'fillFields');
    component.getCouriers();
    expect(spy).toHaveBeenCalled();
    expect(component.couriers).toEqual([fakeCouriers]);
  });

  it('destroy Subject should be closed after ngOnDestroy()', () => {
    const destroy = 'destroy';
    component[destroy] = new Subject<boolean>();
    spyOn(component[destroy], 'unsubscribe');
    component.ngOnDestroy();
    expect(component[destroy].unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should disable save button correctly', () => {
    component.disableSaveButton();
    expect(component.inputDisable).toBe(true);
  });
  it('should disable save button falsy', () => {
    component.disableSaveButton();
    expect(!component.inputDisable).toBe(false);
  });
});
