import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Location } from '@angular/common';
import { UbsAdminTariffsPricingPageComponent } from './ubs-admin-tariffs-pricing-page.component';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { UbsAdminTariffsAddServicePopUpComponent } from './ubs-admin-tariffs-add-service-pop-up/ubs-admin-tariffs-add-service-pop-up.component';
import { FilterListByLangPipe } from 'src/app/shared/sort-list-by-lang/filter-list-by-lang.pipe';
import { UbsAdminTariffsAddTariffServicePopUpComponent } from './ubs-admin-tariffs-add-tariff-service-pop-up/ubs-admin-tariffs-add-tariff-service-pop-up.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TariffsService } from 'src/app/ubs/ubs-admin/services/tariffs.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { OrderService } from 'src/app/ubs/ubs/services/order.service';
import { VolumePipe } from 'src/app/shared/volume-pipe/volume.pipe';
import { LocalizedCurrencyPipe } from 'src/app/shared/localized-currency-pipe/localized-currency.pipe';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Bag, BagLimitDto, Locations } from 'src/app/ubs/ubs-admin/models/tariffs.interface';
import { Store } from '@ngrx/store';
import { UbsAdminTariffsLocationDashboardComponent } from '../ubs-admin-tariffs-location-dashboard.component';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { limitStatus } from '../ubs-tariffs.enum';
import { provideMockStore } from '@ngrx/store/testing';
import { LangValueDirective } from 'src/app/shared/directives/lang-value/lang-value.directive';

describe('UbsAdminPricingPageComponent', () => {
  let component: UbsAdminTariffsPricingPageComponent;
  let fixture: ComponentFixture<UbsAdminTariffsPricingPageComponent>;
  let httpMock: HttpTestingController;
  let route: ActivatedRoute;
  let location: Location;
  let router: Router;
  let fakeTariffService: TariffsService;
  const initialState = {
    employees: null,
    error: null,
    employeesPermissions: []
  };

  const mockData = ['SEE_BIG_ORDER_TABLE', 'SEE_CLIENTS_PAGE', 'SEE_CERTIFICATES', 'SEE_EMPLOYEES_PAGE', 'SEE_TARIFFS'];

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  storeMock.select.and.returnValue(of({ employees: { employeesPermissions: mockData } }));

  const fakeValue = '1';
  const fakeCourierForm = new FormGroup({
    courierLimitsBy: new FormControl('fake'),
    minPriceOfOrder: new FormControl('fake', [Validators.required, Validators.min(1)]),
    maxPriceOfOrder: new FormControl('fake'),
    minAmountOfBigBags: new FormControl('fake', [Validators.required, Validators.min(1)]),
    maxAmountOfBigBags: new FormControl('fake'),
    limitDescription: new FormControl('fake')
  });
  const fakeLocations: Locations = {
    locationsDto: [
      {
        latitude: 0,
        locationId: 159,
        locationStatus: 'фейк1',
        locationTranslationDtoList: [
          {
            languageCode: 'ua',
            locationName: 'fake'
          }
        ],
        longitude: 0
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

  const fakeCheckBoxes: BagLimitDto[] = [
    {
      id: 4,
      limitIncluded: true
    },
    {
      id: 5,
      limitIncluded: true
    },
    {
      id: 6,
      limitIncluded: false
    }
  ];

  const fakeAllCheckBoxesAreEmpty: BagLimitDto[] = [
    {
      id: 4,
      limitIncluded: false
    },
    {
      id: 5,
      limitIncluded: false
    },
    {
      id: 6,
      limitIncluded: false
    }
  ];

  const fakeService = {
    name: 'fake1',
    nameEng: 'fake',
    price: 2,
    description: 'fake1',
    descriptionEng: 'fake1'
  };

  const fakeBag: Bag = {
    capacity: 111,
    price: 478,
    commission: 15,
    limitIncluded: false,
    id: 1
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
  const fakeCard = {
    courierDto: {
      courierId: 1,
      courierStatus: 'fake1',
      nameUk: 'фейкКурєр1',
      nameEn: 'fakeCourier1',
      createDate: 'fakedate',
      createdBy: 'fakeadmin'
    },
    receivingStationDtos: [
      {
        id: 1,
        name: 'Станція'
      }
    ],
    regionDto: {
      nameEn: 'Region',
      nameUk: 'Область',
      regionId: 1
    },
    locationInfoDtos: [
      {
        locationId: 2,
        nameEn: 'City',
        nameUk: 'Місто'
      }
    ],
    tariffStatus: 'Active',
    cardId: 3,
    min: 1,
    max: 100,
    courierLimit: 'fake',
    limitDescription: 'fake'
  };

  const fakeBagLimits = {
    minAmountOfBigBags: 1,
    maxAmountOfBigBags: 5,
    limitDescription: 'fake'
  };

  const fakePriceLimits = {
    minPriceOfOrder: 10,
    maxPriceOfOrder: 205,
    limitDescription: 'fake'
  };

  const dialogStub = {
    afterClosed() {
      return of(true);
    }
  };

  const tariffsServiceMock = jasmine.createSpyObj('tariffsServiceMock', [
    'getLocations',
    'editInfo',
    'getCouriers',
    'getService',
    'getAllTariffsForService',
    'setLimitDescription',
    'setLimitsBySumOrder',
    'setLimitsByAmountOfBags',
    'getCardInfo',
    'setTariffLimits'
  ]);
  tariffsServiceMock.editInfo.and.returnValue(of([]));
  tariffsServiceMock.getCouriers.and.returnValue(of([fakeCouriers]));
  tariffsServiceMock.getService.and.returnValue(of(fakeService));
  tariffsServiceMock.getAllTariffsForService.and.returnValue(of([fakeBag]));
  tariffsServiceMock.setLimitDescription.and.returnValue(of([fakeDescription]));
  tariffsServiceMock.setLimitsBySumOrder.and.returnValue(of([fakeSumInfo]));
  tariffsServiceMock.setLimitsByAmountOfBags.and.returnValue(of([fakeBagInfo]));
  tariffsServiceMock.getCardInfo.and.returnValue(of([fakeCard]));
  tariffsServiceMock.setTariffLimits.and.returnValue(of());

  const matDialogMock = jasmine.createSpyObj('matDialogMock', ['open']);
  matDialogMock.open.and.returnValue(dialogStub);

  const localStorageServiceMock = jasmine.createSpyObj('localStorageServiceMock', ['getCurrentLanguage']);
  localStorageServiceMock.languageBehaviourSubject = of();

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue', 'getCurrentLangObs']);
  languageServiceMock.getLangValue = (valUa: string, valEn: string) => valUa;
  languageServiceMock.getCurrentLangObs = () => of('ua');

  const orderServiceMock = jasmine.createSpyObj('orderServiceMock', ['completedLocation']);

  storeMock.select = () => of([fakeLocations]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        UbsAdminTariffsPricingPageComponent,
        UbsAdminTariffsAddServicePopUpComponent,
        UbsAdminTariffsAddTariffServicePopUpComponent,
        FilterListByLangPipe,
        VolumePipe,
        LocalizedCurrencyPipe,
        LangValueDirective
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
        provideMockStore({ initialState }),
        { provide: Store, useValue: storeMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: MatDialogRef, useValue: dialogStub },
        { provide: TariffsService, useValue: tariffsServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: LanguageService, useValue: languageServiceMock },
        { provide: OrderService, useValue: orderServiceMock },
        { provide: Store, useValue: storeMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    orderServiceMock.locationSubject = new Subject<any>();
    fakeTariffService = TestBed.inject(TariffsService);
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
    const spy1 = spyOn(component, 'routeParams');
    const spy2 = spyOn(component, 'getSelectedTariffCard');
    component.ngOnInit();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  xit('should get selected tariff card', () => {
    component.selectedCardId = 3;
    const result = {
      station: ['Станція'],
      tariff: 'Active',
      courierUk: 'фейкКурєр1',
      courierEn: 'fakeCourier1',
      regionEn: 'Region',
      regionUk: 'Область',
      citiesUk: ['Місто'],
      citiesEn: ['City'],
      regionId: 1,
      cardId: 3,
      min: 1,
      max: 100,
      courierLimit: 'fake',
      limitDescription: 'fake'
    };
    component.getSelectedTariffCard();
    expect(component.selectedCard).toEqual(result);
    fixture.detectChanges();
    expect(component.isLoading).toEqual(false);
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

  it('should convert to number', () => {
    const numbers = Number(fakeValue);
    expect(typeof numbers).toBe('number');
  });

  it('should call setCourierId correctly', (done) => {
    fixture.detectChanges();
    const setCourierIdSpy = spyOn(component, 'setCourierId').and.returnValue(Promise.resolve());
    component.setCourierId();
    setCourierIdSpy.calls.mostRecent().returnValue.then(() => {
      fixture.detectChanges();
      expect(setCourierIdSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should call setLimits for Bag case', () => {
    component.selectedCardId = 3;
    component.getSelectedTariffCard();
    component.selectedCard.courierLimit = component.limitEnum.limitByAmountOfBag;
    component.setLimits();
    component.limitsForm.patchValue(fakeBagLimits);
    expect(component.limitsForm.get('minAmountOfBigBags').value).toEqual(1);
    expect(component.limitsForm.get('maxAmountOfBigBags').value).toEqual(5);
    expect(component.limitsForm.get('limitDescription').value).toEqual('fake');
    expect(component.limitStatus).toEqual(component.limitEnum.limitByAmountOfBag);
  });

  it('should call setLimits for price case', () => {
    component.selectedCardId = 3;
    component.getSelectedTariffCard();
    component.selectedCard.courierLimit = component.limitEnum.limitByPriceOfOrder;
    component.setLimits();
    component.limitsForm.patchValue(fakePriceLimits);
    expect(component.limitsForm.get('minPriceOfOrder').value).toEqual(10);
    expect(component.limitsForm.get('maxPriceOfOrder').value).toEqual(205);
    expect(component.limitsForm.get('limitDescription').value).toEqual('fake');
    expect(component.limitStatus).toEqual(component.limitEnum.limitByPriceOfOrder);
  });

  it('should call initializeCourierId', () => {
    const spy = spyOn(component, 'initializeCourierId').and.returnValue(Promise.resolve(5));
    component.initializeCourierId();
    spy.calls.mostRecent().returnValue.then();
    expect(spy).toHaveBeenCalled();
  });

  it('should call initializeLocationId', () => {
    const spy = spyOn(component, 'initializeLocationId').and.returnValue(Promise.resolve(5));
    component.initializeLocationId();
    spy.calls.mostRecent().returnValue.then();
    expect(spy).toHaveBeenCalled();
  });

  it('should check whether sumLimitStatus patching values correctly', () => {
    component.limitsForm.patchValue({
      minAmountOfBigBags: 'fake',
      maxAmountOfBigBags: 'fake'
    });
    component.sumLimitStatus();
    expect(component.limitsForm.get('minAmountOfBigBags').value).toEqual(null);
    expect(component.limitsForm.get('maxAmountOfBigBags').value).toEqual(null);
    expect(component.limitStatus).toBe(component.limitEnum.limitByPriceOfOrder);
  });

  it('should check whether bagLimitStatus patching values correctly', () => {
    component.limitsForm.patchValue({
      minPriceOfOrder: 1,
      maxPriceOfOrder: 3
    });
    component.bagLimitStatus();
    expect(component.limitsForm.get('minPriceOfOrder').value).toEqual(null);
    expect(component.limitsForm.get('maxPriceOfOrder').value).toEqual(null);
    expect(component.limitStatus).toBe(component.limitEnum.limitByAmountOfBag);
  });

  it('should call saveChanges method', () => {
    const spy = spyOn(component, 'saveChanges');
    component.saveChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should call saveChanges method if order by amount', () => {
    component.limitStatus = limitStatus.limitByAmountOfBag;
    const limit = {
      courierLimitsBy: 'fake',
      minAmountOfBigBags: 1,
      maxAmountOfBigBags: 100,
      limitDescription: 'fake'
    };
    component.limitsForm.patchValue(limit);
    component.locationId = 2;
    component.saveChanges();
    expect(component.limitStatus).toBe(null);
    expect(component.saveBTNClicked).toBeTruthy();
  });

  it('should call  saveChanges method if order by price', () => {
    component.limitStatus = limitStatus.limitByPriceOfOrder;
    const limit = {
      courierLimitsBy: 'fake',
      minPriceOfOrder: 1,
      maxriceOfOrder: 100,
      limitDescription: 'fake'
    };
    component.limitsForm.patchValue(limit);
    component.locationId = 2;
    component.saveChanges();
    expect(component.limitStatus).toBe(null);
    expect(component.saveBTNClicked).toBeTruthy();
  });

  it('navigate to tariffs page', () => {
    const spy = spyOn(router, 'navigate');
    component.navigateToBack();
    expect(spy).toHaveBeenCalledWith(['ubs-admin/tariffs']);
  });

  it('should call openAddTariffForServicePopup', () => {
    component.selectedCardId = 5;
    const addtariffData = {
      button: 'add',
      tariffId: 5
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
    component.selectedCardId = 1;
    component.service = fakeService;
    const addtariffData = {
      button: 'add',
      tariffId: 1,
      service: fakeService
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
    component.locationId = 159;
    const tariffData = {
      button: 'update',
      serviceData: fakeService,
      locationId: 159
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
    component.bags = [];
    component.getAllTariffsForService();
    expect(component.isLoadBar).toEqual(false);
    expect(component.bags).toEqual([fakeBag]);
  });

  it('should get all services', () => {
    component.getService();
    expect(component.isLoadBar1).toEqual(false);
    expect(component.service).toEqual(fakeService);
  });

  it('should get couriers', () => {
    const spy = spyOn(component, 'fillFields');
    component.getCouriers();
    expect(spy).toHaveBeenCalled();
    expect(component.couriers).toEqual([fakeCouriers]);
  });

  it('onCheck should set limitIncluded to true of checked is true', () => {
    const fakeEvent = {
      checked: true
    };
    component.onChecked(fakeBag.id, fakeEvent);
    expect(fakeBag.limitIncluded).toEqual(true);
  });

  it('onCheck should set limitIncluded to false of checked is false', () => {
    const fakeEvent = {
      checked: false
    };
    component.onChecked(fakeBag.id, fakeEvent);
    expect(fakeBag.limitIncluded).toEqual(false);
  });

  it('should call getCheckBoxStatus correctly if not all check boxes empty', () => {
    const spy = spyOn(component, 'getCheckBoxInfo').and.returnValue(fakeCheckBoxes);
    component.getCheckBoxInfo();
    component.getCheckBoxStatus();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(component.areAllCheckBoxEmpty).toEqual(false);
  });

  it('should call getCheckBoxStatus correctly if all are check boxes empty', () => {
    const spy = spyOn(component, 'getCheckBoxInfo').and.returnValue(fakeAllCheckBoxesAreEmpty);
    component.getCheckBoxInfo();
    component.getCheckBoxStatus();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(component.areAllCheckBoxEmpty).toEqual(true);
  });
});
