import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UbsAdminEmployeeEditFormComponent } from './ubs-admin-employee-edit-form/ubs-admin-employee-edit-form.component';
import { UbsAdminEmployeeService } from '../../services/ubs-admin-employee.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Patterns } from 'src/assets/patterns/patterns';
import { Subject } from 'rxjs';
import { map, skip, startWith, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { GetLocations } from 'src/app/store/actions/tariff.actions';
import { Couriers, Locations, City, FilterData } from '../../models/tariffs.interface';
import { IAppState } from 'src/app/store/state/app.state';
import { Store } from '@ngrx/store';
import { TariffsService } from '../../services/tariffs.service';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { EmployeePositions, Employees, Page } from '../../models/ubs-admin.interface';
import {
  selectOptions,
  filterOptions,
  filtersPlaceholderOptions,
  authoritiesChangeEmployee,
  filtersStateEmployeeOptions,
  EmployeeStatus
} from './ubs-admin-employee-table/employee-models.enum';
import { Language } from 'src/app/main/i18n/Language';

@Component({
  selector: 'app-ubs-admin-employee',
  templateUrl: './ubs-admin-employee.component.html',
  styleUrls: ['./ubs-admin-employee.component.scss']
})
export class UbsAdminEmployeeComponent implements OnInit, OnDestroy {
  @Input() locationCard: Locations;

  employeePositions: EmployeePositions[];
  locations: Locations[];
  regionEnglishName: string[];
  regionNameUk: string;
  regionId: number;
  selectRegionId: number[] = [];
  showAllEmployees = true;
  positionsPlaceholder: string;
  cityPlaceholder: string;
  courierPlaceholder: string;
  regionPlaceholder: string;
  reset = true;
  cities = [];
  regions = [];
  filteredRegions;
  filteredCities;
  couriers: Couriers[];
  couriersName: Array<string>;
  positionName: Array<string>;
  filterData = { positions: [], regions: [], locations: [], couriers: [], employeeStatus: 'ACTIVE' };
  currentLang: string;
  selectedTagsList: Array<string> = [];
  isElementFocused = false;
  selectedCities = [];
  selectedCouriers = [];
  selectedPositions = [];
  selectedRegions = [];
  selectedContact = [];
  selectedState = [];
  employees$ = this.store.select((state: IAppState): Employees => state.employees.employees);
  employeePhoneNumbers = [];
  employeeEmails = [];
  employeesContacts = [];
  employeeStates = filtersStateEmployeeOptions;
  userEmail: string;
  userRoles: string[];
  userAuthorities = [];
  isThisUserAdmin = false;
  isThisUserCanCreateEmployee = false;
  isThisUserCanEditEmployee = false;
  isThisUserCanDeleteEmployee = false;
  isThisUserCanEditEmployeeAuthorities = false;
  userHasRights = false;
  sizeForTable = 30;
  search: string;
  currentPageForTable = 0;

  icons = {
    setting: './assets/img/ubs-tariff/setting.svg',
    crumbs: './assets/img/ubs-tariff/crumbs.svg',
    restore: './assets/img/ubs-tariff/restore.svg',
    arrowDown: './assets/img/ubs-tariff/arrow-down.svg',
    arrowRight: './assets/img/ubs-tariff/arrow-right.svg'
  };

  locations$ = this.store.select((state: IAppState): Locations[] => state.locations.locations);

  searchForm: FormGroup;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  permissions$ = this.store.select((state: IAppState): Array<string> => state.employees.employeesPermissions);

  constructor(
    private tariffsService: TariffsService,
    public dialog: MatDialog,
    private ubsAdminEmployeeService: UbsAdminEmployeeService,
    private fb: FormBuilder,
    private localeStorageService: LocalStorageService,
    private translate: TranslateService,
    public languageService: LanguageService,
    private store: Store<IAppState>
  ) {}

  ngOnInit(): void {
    this.localeStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((lang: string) => {
      this.currentLang = lang;
    });
    this.definitionUserAuthorities();
    this.initForm();
    this.getPositions();
    this.getContacts();
    this.getLocations();
    this.getCouriers();
    this.region.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.regionSelectedSub(value);
      this.checkRegionValue();
      this.selectedCities = [];
      this.selectedCouriers = [];
    });
    this.setCountOfCheckedFilters(this.selectedCities, filtersPlaceholderOptions.city, 'cityPlaceholder');
    this.setCountOfCheckedFilters(this.selectedPositions, filtersPlaceholderOptions.position, 'positionsPlaceholder');
    this.setCountOfCheckedFilters(this.selectedCouriers, filtersPlaceholderOptions.courier, 'courierPlaceholder');
    this.setCountOfCheckedFilters(this.selectedRegions, filtersPlaceholderOptions.region, 'regionPlaceholder');
    this.languageService
      .getCurrentLangObs()
      .pipe(takeUntil(this.destroy$))
      .subscribe((i) => {
        this.getLocations();
        this.getCouriers();
        this.getPositions();
        this.translateSelectedCity();
        this.setCountOfCheckedFilters(this.selectedCities, filtersPlaceholderOptions.city, 'cityPlaceholder');
        this.setCountOfCheckedFilters(this.selectedPositions, filtersPlaceholderOptions.position, 'positionsPlaceholder');
        this.setCountOfCheckedFilters(this.selectedCouriers, filtersPlaceholderOptions.courier, 'courierPlaceholder');
        this.setCountOfCheckedFilters(this.selectedRegions, filtersPlaceholderOptions.region, 'regionPlaceholder');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
  addNewFilters(data: FilterData) {
    this.ubsAdminEmployeeService.updateFilterData(data);
  }

  definitionUserAuthorities(): void {
    this.permissions$.subscribe((employeeRight) => {
      if (employeeRight.length) {
        this.definedIsEmployeeHasRights(employeeRight);
      }
    });
  }

  definedIsEmployeeHasRights(employeeRight) {
    this.userAuthorities = employeeRight;
    this.isThisUserCanCreateEmployee = this.userAuthorities.includes(authoritiesChangeEmployee.add);
    this.isThisUserCanEditEmployee = this.userAuthorities.includes(authoritiesChangeEmployee.edit);
    this.isThisUserCanEditEmployeeAuthorities = this.userAuthorities.includes(authoritiesChangeEmployee.editauthorities);
    this.isThisUserCanDeleteEmployee = this.userAuthorities.includes(authoritiesChangeEmployee.deactivate);
    this.userHasRights = this.isThisUserCanEditEmployee || this.isThisUserCanEditEmployeeAuthorities || this.isThisUserCanDeleteEmployee;
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      position: ['', [Validators.required]],
      state: ['', [Validators.required]],
      region: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern(Patterns.NamePattern)]],
      city: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(Patterns.NamePattern)]],
      courier: ['', [Validators.required]]
    });
  }

  private getEmployeePositionbyEmail(userEmail: string) {
    this.ubsAdminEmployeeService.getEmployeeLoginPositions(userEmail).subscribe((roles) => {
      this.userRoles = roles;
    });
  }

  get position() {
    return this.searchForm.get('position');
  }
  get state() {
    return this.searchForm.get('state');
  }
  get region() {
    return this.searchForm.get('region');
  }
  get city() {
    return this.searchForm.get('city');
  }
  get courier() {
    return this.searchForm.get('courier');
  }

  getPositions(): void {
    this.ubsAdminEmployeeService
      .getAllPositions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.employeePositions = roles;
          this.positionName = this.employeePositions.map((position: EmployeePositions) =>
            this.languageService.getLangValue(position.name, position.nameEn)
          );
        },
        error: (error) => console.error('Observer for role got an error: ' + error)
      });
  }

  getContacts(): void {
    this.employees$.subscribe((item: Employees) => {
      if (item) {
        this.employeePhoneNumbers = item[`content`].map((employee: Page) => employee.phoneNumber);
        this.employeeEmails = item[`content`].map((employee: Page) => employee.email);
        this.employeesContacts = [...this.employeePhoneNumbers, ...this.employeeEmails];
      }
    });
  }

  getLocations(): void {
    this.store.dispatch(GetLocations({ reset: this.reset }));
    this.locations$.pipe(skip(1)).subscribe((item: Locations[]) => {
      if (item) {
        this.locations = item;
        const regions = this.locations
          .map((element) => element.regionTranslationDtos.filter((it) => it.languageCode === this.currentLang).map((it) => it.regionName))
          .flat(2);
        this.filteredRegions = regions;
        this.cities = this.mapCities(this.locations);
        this.filteredCities = this.filterOptions(
          this.city,
          this.cities.map((elem) => elem.name)
        );
        this.reset = false;
      }
    });
  }

  filterOptions(control, array): Array<string> {
    return control.valueChanges.pipe(
      startWith(''),
      map((value: string) => (value ? this._filter(value, array) : array.slice()))
    );
  }

  _filter(name: string, items: any[]): any[] {
    const filterValue = name.toLowerCase();
    return items.filter((option) => option.toLowerCase().includes(filterValue));
  }

  mapCities(region: Locations[]): Array<object> {
    const cityArray = [];
    region.forEach((element) =>
      element.locationsDto.forEach((el) => {
        const tempItem = {
          name: el.locationTranslationDtoList
            .filter((it) => it.languageCode === this.currentLang)
            .map((it) => it.locationName)
            .join(),
          id: el.locationId,
          locationTranslationDtoList: el.locationTranslationDtoList
        };
        cityArray.push(tempItem);
      })
    );
    return cityArray;
  }

  translateSelectedCity() {
    this.selectedCities.forEach((city) => {
      city.name = this.languageService.getLangValue(city.ukrainianName, city.englishName);
    });
  }

  animationUtil(trigger: MatAutocompleteTrigger): void {
    requestAnimationFrame(() => {
      trigger.openPanel();
    });
  }

  getCouriers(): void {
    this.tariffsService
      .getCouriers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: Couriers[]) => {
        this.couriers = res;
        this.couriersName = this.couriers.map((el) => this.languageService.getLangValue(el.nameUk, el.nameEn));
      });
  }

  setCountOfCheckedFilters(selectedFilter, filtreName: string, placeholder: string): void {
    if (selectedFilter.length) {
      this.translate.get('ubs-tariffs.selected').subscribe((data) => (this[placeholder] = `${selectedFilter.length} ${data}`));
    } else {
      this.translate.get(filtreName).subscribe((data) => {
        this[placeholder] = data;
      });
    }
  }

  get getEnableResetAll(): boolean {
    return (
      !!this.selectedPositions.length ||
      !!this.selectedContact.length ||
      !!this.selectedRegions.length ||
      !!this.selectedCities.length ||
      !!this.selectedCouriers.length ||
      !!this.selectedState.length
    );
  }

  checkRegionValue(): void {
    let currentRegion;
    if (this.selectedRegions.length === 0) {
      currentRegion = this.locations;
    } else {
      currentRegion = this.selectedRegions;
    }

    this.cities = this.mapCities(currentRegion);
    this.filteredCities = this.filterOptions(
      this.city,
      this.cities.map((elem) => elem.name)
    );
  }

  onSelectPosition(event: MatAutocompleteSelectedEvent, trigger?: MatAutocompleteTrigger): void {
    if (event.option.value === selectOptions.all) {
      this.toggleSelectAllPositions();
      const positionsId = this.employeePositions.map((position) => position.id);
      Object.assign(this.filterData, { positions: positionsId });
      this.addNewFilters(this.filterData);
    } else {
      this.selectPosition(event);
      const positionId = this.selectedPositions.map((it) => it.id);
      Object.assign(this.filterData, { positions: positionId });
      this.addNewFilters(this.filterData);
    }
    this.position.setValue('');
    if (trigger) {
      this.animationUtil(trigger);
    }
  }

  onSelectCourier(event: MatAutocompleteSelectedEvent, trigger?: MatAutocompleteTrigger): void {
    if (event.option.value === selectOptions.all) {
      this.toggleSelectAllCourier();
      const couriersId = this.couriers.map((courier) => courier.courierId);
      Object.assign(this.filterData, { couriers: couriersId });
      this.addNewFilters(this.filterData);
    } else {
      this.selectCourier(event);
      const courierId = this.selectedCouriers.map((it) => it.id);
      Object.assign(this.filterData, { couriers: courierId });
      this.addNewFilters(this.filterData);
    }
    this.courier.setValue('');
    if (trigger) {
      this.animationUtil(trigger);
    }
  }

  toggleSelectAllPositions(): void {
    if (!this.isPositionChecked()) {
      this.selectedPositions.length = 0;
      this.employeePositions.forEach((position) => {
        const tempItem = this.transformPositionToSelectedPosition(position);
        this.selectedPositions.push(tempItem);
      });
    } else {
      this.selectedPositions.length = 0;
    }
    this.setCountOfCheckedFilters(this.selectedPositions, filtersPlaceholderOptions.position, 'positionsPlaceholder');
  }

  toggleSelectAllRegion(): void {
    if (!this.isRegionChecked()) {
      this.selectedRegions.length = 0;
      this.selectedRegions = [...this.locations];
    } else {
      this.selectedRegions.length = 0;
    }
    this.setCountOfCheckedFilters(this.selectedRegions, filtersPlaceholderOptions.region, 'regionPlaceholder');
  }

  toggleSelectAllCity(): void {
    if (!this.isCityChecked()) {
      this.selectedCities.length = 0;
      this.cities.forEach((city) => {
        const tempItem = this.transformCityToSelectedCity(city);
        this.selectedCities.push(tempItem);
      });
    } else {
      this.selectedCities.length = 0;
    }
    this.setCountOfCheckedFilters(this.selectedCities, filtersPlaceholderOptions.city, 'cityPlaceholder');
  }

  toggleSelectAllCourier(): void {
    if (!this.isCourierChecked()) {
      this.selectedCouriers.length = 0;
      this.couriers.forEach((courier) => {
        const tempItem = this.transformCourierToSelectedCourier(courier);
        this.selectedCouriers.push(tempItem);
      });
    } else {
      this.selectedCouriers.length = 0;
    }
    this.setCountOfCheckedFilters(this.selectedCouriers, filtersPlaceholderOptions.courier, 'courierPlaceholder');
  }

  transformPositionToSelectedPosition(position: any) {
    return {
      name: this.languageService.getLangValue(position.name, position.nameEn),
      id: position.id,
      englishName: position.nameEn,
      ukrainianName: position.name
    };
  }

  transformCityToSelectedCity(city: City) {
    const selectedCityName = this.getSelectedCityName(city, 'ua');
    const selectedCityEnglishName = this.getSelectedCityName(city, 'en');
    return {
      name: this.languageService.getLangValue(selectedCityName, selectedCityEnglishName),
      id: city.id,
      englishName: selectedCityEnglishName,
      ukrainianName: selectedCityName
    };
  }

  transformCourierToSelectedCourier(courier: Couriers) {
    return {
      name: this.languageService.getLangValue(courier.nameUk, courier.nameEn),
      id: courier.courierId,
      englishName: courier.nameEn,
      ukrainianName: courier.nameUk
    };
  }

  isPositionChecked(): boolean {
    return this.selectedPositions.length === this.employeePositions?.length;
  }

  isRegionChecked(): boolean {
    return this.selectedRegions.length === this.filteredRegions?.length;
  }

  isCityChecked(): boolean {
    return this.selectedCities.length === this.cities.length;
  }

  isCourierChecked(): boolean {
    return this.selectedCouriers.length === this.couriers?.length;
  }

  getSelectedCityName(city: any, languageCode: string) {
    return city.locationTranslationDtoList
      .filter((it) => it.languageCode === languageCode)
      .map((it) => it.locationName)
      .join();
  }

  getSelectedRegionName(location: any, languageCode: string) {
    return location.regionTranslationDtos
      .filter((it) => it.languageCode === languageCode)
      .map((it) => it.regionName)
      .join();
  }

  resetRegionValue(): void {
    this.region.setValue('');
    this.selectedCities = [];
    this.setCountOfCheckedFilters(this.selectedRegions, filtersPlaceholderOptions.region, 'regionPlaceholder');
    const locationsId = this.locations.map((location) => location.locationsDto.map((elem) => elem.locationId)).flat(2);
    Object.assign(this.filterData, { regions: '', locations: locationsId });
    this.addNewFilters(this.filterData);
  }

  onSelectCity(event: MatAutocompleteSelectedEvent, trigger?: MatAutocompleteTrigger): void {
    if (event.option.value === selectOptions.all) {
      this.toggleSelectAllCity();
      const locationsId = this.locations.map((location) => location.locationsDto.map((elem) => elem.locationId)).flat(2);
      Object.assign(this.filterData, { locations: locationsId });
      this.addNewFilters(this.filterData);
    } else {
      this.selectCity(event);
      const locationId = this.selectedCities.map((it) => it.id);
      Object.assign(this.filterData, { locations: locationId });
      this.addNewFilters(this.filterData);
    }
    this.setCountOfCheckedFilters(this.selectedCities, filtersPlaceholderOptions.city, 'cityPlaceholder');
    this.city.setValue('');
    if (trigger) {
      this.animationUtil(trigger);
    }
  }

  selectPosition(event: MatAutocompleteSelectedEvent): void {
    const newValue = event.option.viewValue;
    const selectedValue = this.employeePositions.find((ob) => this.languageService.getLangValue(ob.name, ob.nameEn) === newValue);
    const positionNameUk = selectedValue.name;
    const positionNameEng = selectedValue.nameEn;
    const positionId = selectedValue.id;

    const tempItem = {
      name: this.languageService.getLangValue(positionNameUk, positionNameEng),
      id: positionId,
      englishName: positionNameEng,
      ukrainianName: positionNameUk
    };
    if (this.selectedPositions.map((it) => this.languageService.getLangValue(it.ukrainianName, it.englishName)).includes(newValue)) {
      this.selectedPositions = this.selectedPositions.filter(
        (item) => this.languageService.getLangValue(item.ukrainianName, item.englishName) !== newValue
      );
    } else {
      this.selectedPositions.push(tempItem);
    }
    this.setCountOfCheckedFilters(this.selectedPositions, filtersPlaceholderOptions.position, 'positionsPlaceholder');
  }

  selectCourier(event: MatAutocompleteSelectedEvent): void {
    const newValue = event.option.viewValue;
    const selectedValue = this.couriers.find((ob) => this.languageService.getLangValue(ob.nameUk, ob.nameEn) === newValue);
    const courierNameUk = selectedValue.nameUk;
    const courierNameEng = selectedValue.nameEn;
    const courierId = selectedValue.courierId;

    const tempItem = {
      name: this.languageService.getLangValue(courierNameUk, courierNameEng),
      id: courierId,
      englishName: courierNameEng,
      ukrainianName: courierNameUk
    };

    if (this.selectedCouriers.map((it) => it.name).includes(newValue)) {
      this.selectedCouriers = this.selectedCouriers.filter((item) => item.name !== newValue);
    } else {
      this.selectedCouriers.push(tempItem);
    }
    this.setCountOfCheckedFilters(this.selectedCouriers, filtersPlaceholderOptions.courier, 'courierPlaceholder');
  }

  selectCity(event: MatAutocompleteSelectedEvent): void {
    const selectedLocation = this.locations.find((location) =>
      location.locationsDto.find((locationName) =>
        locationName.locationTranslationDtoList.find((name) => name.locationName === event.option.viewValue)
      )
    );
    const selectedCity = selectedLocation.locationsDto.find((name) =>
      name.locationTranslationDtoList.find((elem) => elem.locationName === event.option.viewValue)
    );
    const selectedCityId = selectedCity.locationId;
    const selectedCityName = selectedCity.locationTranslationDtoList
      .filter((it) => it.languageCode === Language.UA)
      .map((it) => it.locationName)
      .join();
    const selectedCityEnglishName = selectedCity.locationTranslationDtoList
      .filter((it) => it.languageCode === Language.EN)
      .map((it) => it.locationName)
      .join();
    const tempItem = {
      name: this.languageService.getLangValue(selectedCityName, selectedCityEnglishName),
      id: selectedCityId,
      englishName: selectedCityEnglishName,
      ukrainianName: selectedCityName
    };
    const newValue = event.option.viewValue;
    if (this.selectedCities.map((it) => it.name).includes(newValue)) {
      this.selectedCities = this.selectedCities.filter((item) => item.name !== newValue);
    } else {
      this.selectedCities.push(tempItem);
    }
  }

  openAuto(event: Event, trigger?: MatAutocompleteTrigger): void {
    event.stopPropagation();
    if (trigger) {
      trigger.openPanel();
    }
  }

  checkSelectedItem(item: string, array: Array<{ name: string; id: number }>): boolean {
    return array.map((it) => it.name).includes(item);
  }

  checkSelectedItemRegion(name: string): boolean {
    return this.selectedRegions.some((it) => it.regionTranslationDtos.some((ob) => ob.regionName === name));
  }

  selectedStates(event) {
    this.selectedState = [];
    const statusValue = this.employeeStates.find(
      (state) => this.languageService.getLangValue(state.nameUa, state.nameEn) === event.option.value.toString()
    );
    let selectedStatus = '';
    switch (statusValue.nameEn) {
      case 'Active':
        selectedStatus = EmployeeStatus.active;
        break;
      case 'Inactive':
        selectedStatus = EmployeeStatus.inactive;
        break;
      default:
        selectedStatus = EmployeeStatus.all;
    }
    Object.assign(this.filterData, { employeeStatus: selectedStatus });
    this.addNewFilters(this.filterData);
    this.selectedState.push(statusValue);
  }

  regionSelectedSub(value) {
    if (value === selectOptions.all) {
      this.toggleSelectAllRegion();
      const regionsId = this.selectedRegions.map((region) => region.regionId);
      Object.assign(this.filterData, { regions: regionsId });
      this.addNewFilters(this.filterData);
    } else if (value == null) {
      this.selectedRegions.length = 0;
      Object.assign(this.filterData, { regions: [] });
      this.addNewFilters(this.filterData);
    } else {
      const newValue = value;
      const selectedValue = this.locations.filter((it) => it.regionTranslationDtos.find((ob) => ob.regionName === newValue));
      this.regionEnglishName = selectedValue
        .map((it) => it.regionTranslationDtos.filter((ob) => ob.languageCode === Language.EN).map((i) => i.regionName))
        .flat(2);
      this.regionId = selectedValue.find((it) => it.regionId).regionId;
      if (this.selectedRegions.some((it) => it.regionId === this.regionId)) {
        this.selectedRegions = this.selectedRegions.filter((item) => item.regionId !== this.regionId);
        this.selectRegionId = this.selectedRegions.filter((item) => item.regionId !== this.regionId).map((item) => item.regionId);
      } else {
        this.selectedRegions.push(selectedValue.find((it) => it.regionId === this.regionId));
        this.selectRegionId = this.selectedRegions.map((item) => item.regionId);
      }
      Object.assign(this.filterData, { regions: this.selectRegionId });
      this.addNewFilters(this.filterData);
    }
    this.setCountOfCheckedFilters(this.selectedRegions, filtersPlaceholderOptions.region, 'regionPlaceholder');
  }

  getRegionName(region: Locations): string {
    const selectedRegionName = this.getSelectedRegionName(region, 'ua');
    const selectedRegionEnglishName = this.getSelectedRegionName(region, 'en');
    return this.languageService.getLangValue(selectedRegionName, selectedRegionEnglishName) as string;
  }

  addItem(event: any, option: string): void {
    //$Event MatChipInputEvent
    const value = event.value;

    if ((value || '').trim()) {
      if (option === filterOptions.city) {
        this.selectedCities.push(value.trim());
      } else if (option === filterOptions.courier) {
        this.selectedCouriers.push(value.trim());
      } else if (option === filterOptions.position) {
        this.selectedPositions.push(value.trim());
      } else if (option === filterOptions.region) {
        this.selectedRegions.push(value.trim());
      } else if (option === filterOptions.state) {
        this.selectedState.push(value.trim());
      }
    }
  }

  resetAllFilters(): void {
    this.searchForm.reset();

    this.selectedCouriers.length = 0;
    this.setCountOfCheckedFilters(this.selectedCouriers, filtersPlaceholderOptions.courier, 'courierPlaceholder');

    this.selectedPositions.length = 0;
    this.setCountOfCheckedFilters(this.selectedPositions, filtersPlaceholderOptions.position, 'positionsPlaceholder');

    this.selectedCities.length = 0;
    this.setCountOfCheckedFilters(this.selectedCities, filtersPlaceholderOptions.city, 'cityPlaceholder');

    this.selectedRegions.length = 0;
    this.setCountOfCheckedFilters(this.selectedRegions, filtersPlaceholderOptions.region, 'regionPlaceholder');

    this.selectedState.length = 0;
    Object.assign(this.filterData, { positions: [], regions: [], locations: [], couriers: [], employeeStatus: 'ACTIVE' });
    this.addNewFilters(this.filterData);
  }

  removeItem(filterName: any, selectorType: string): void {
    switch (selectorType) {
      case filterOptions.position:
        this.selectedPositions = this.selectedPositions.filter((item) => item.id !== filterName.id);
        this.setCountOfCheckedFilters(this.selectedPositions, filtersPlaceholderOptions.position, 'positionsPlaceholder');
        Object.assign(this.filterData, { positions: this.selectedPositions.map((it) => it.id) });
        break;
      case filterOptions.state:
        this.selectedState = [];
        this.state.setValue('');
        Object.assign(this.filterData, { employeeStatus: '' });
        break;
      case filterOptions.city:
        this.selectedCities = this.selectedCities.filter((item) => item.id !== filterName.id);
        this.setCountOfCheckedFilters(this.selectedCities, filtersPlaceholderOptions.city, 'cityPlaceholder');
        Object.assign(this.filterData, { locations: this.selectedCities.map((it) => it.id) });
        break;
      case filterOptions.courier:
        this.selectedCouriers = this.selectedCouriers.filter((item) => item.id !== filterName.id);
        this.setCountOfCheckedFilters(this.selectedCouriers, filtersPlaceholderOptions.courier, 'courierPlaceholder');
        Object.assign(this.filterData, { couriers: this.selectedCouriers.map((it) => it.id) });
        break;
      case filterOptions.region:
        this.selectedRegions = this.selectedRegions.filter((item) => item.regionId !== filterName.regionId);
        this.setCountOfCheckedFilters(this.selectedRegions, filtersPlaceholderOptions.region, 'regionPlaceholder');
        this.checkRegionValue();
        Object.assign(this.filterData, { regions: this.selectedRegions.map((it) => it.regionId) });
        break;
    }

    this.addNewFilters(this.filterData);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.ubsAdminEmployeeService.searchValue.next(filterValue.trim().toLowerCase());
  }

  openDialog() {
    this.dialog.open(UbsAdminEmployeeEditFormComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'admin-cabinet-dialog-container'
    });
  }
}
