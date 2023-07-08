import { Component, Input, OnDestroy, OnInit, TemplateRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { TariffsService } from '../../services/tariffs.service';
import { map, skip, startWith, takeUntil } from 'rxjs/operators';
import { Couriers, CreateCard, Locations, Stations, Card, DeactivateCard } from '../../models/tariffs.interface';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UbsAdminTariffsLocationPopUpComponent } from './ubs-admin-tariffs-location-pop-up/ubs-admin-tariffs-location-pop-up.component';
import { Store } from '@ngrx/store';
import { MatChipInputEvent } from '@angular/material/chips';
import { IAppState } from 'src/app/store/state/app.state';
import { GetLocations } from 'src/app/store/actions/tariff.actions';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { UbsAdminTariffsCourierPopUpComponent } from './ubs-admin-tariffs-courier-pop-up/ubs-admin-tariffs-courier-pop-up.component';
import { UbsAdminTariffsStationPopUpComponent } from './ubs-admin-tariffs-station-pop-up/ubs-admin-tariffs-station-pop-up.component';
import { UbsAdminTariffsCardPopUpComponent } from './ubs-admin-tariffs-card-pop-up/ubs-admin-tariffs-card-pop-up.component';
import { TariffConfirmationPopUpComponent } from '../shared/components/tariff-confirmation-pop-up/tariff-confirmation-pop-up.component';
import { TranslateService } from '@ngx-translate/core';
import { Patterns } from 'src/assets/patterns/patterns';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { UbsAdminTariffsDeactivatePopUpComponent } from './ubs-admin-tariffs-deactivate-pop-up/ubs-admin-tariffs-deactivate-pop-up.component';
import { TariffDeactivateConfirmationPopUpComponent } from '../shared/components/tariff-deactivate-confirmation-pop-up/tariff-deactivate-confirmation-pop-up.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { GoogleScript } from 'src/assets/google-script/google-script';
import { statusOfTariff, actionsWithTariffs, switchTariffStatus } from './tariff-status.enum';
import { Language } from 'src/app/main/i18n/Language';

@Component({
  selector: 'app-ubs-admin-tariffs-location-dashboard',
  templateUrl: './ubs-admin-tariffs-location-dashboard.component.html',
  styleUrls: ['./ubs-admin-tariffs-location-dashboard.component.scss']
})
export class UbsAdminTariffsLocationDashboardComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() showAllTariff = true;
  @Input() isLoading: boolean;
  @Input() locationCard: Locations;
  @Input() textBack: TemplateRef<any>;
  @Input() selectedCard;

  locations: Locations[];
  regionEnglishName: string[];
  regionNameUk: string;
  regionId: number;
  stations: Stations[];
  stationName: Array<string> = [];
  couriers: Couriers[];
  couriersName: Array<string>;
  courierNameEng: string;
  courierNameUk: string;
  courierId;
  searchForm: FormGroup;
  reset = true;
  selectedCities = [];
  cities = [];
  filteredRegions;
  filteredCities;
  filteredStations;
  cityPlaceholder: string;
  stationPlaceholder: string;
  selectedStation = [];
  cards = [];
  cardsUk = [];
  cardsEn = [];
  filterData = { status: '' };
  createCardObj: CreateCard;
  isFieldFilled = false;
  isCardExist = false;
  currentLang;
  deactivateCardObj: DeactivateCard;

  private destroy: Subject<boolean> = new Subject<boolean>();

  public icons = {
    setting: './assets/img/ubs-tariff/setting.svg',
    crumbs: './assets/img/ubs-tariff/crumbs.svg',
    restore: './assets/img/ubs-tariff/restore.svg',
    arrowDown: './assets/img/ubs-tariff/arrow-down.svg',
    arrowRight: './assets/img/ubs-tariff/arrow-right.svg'
  };

  locations$ = this.store.select((state: IAppState): Locations[] => state.locations.locations);

  constructor(
    private tariffsService: TariffsService,
    private router: Router,
    public dialog: MatDialog,
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private localeStorageService: LocalStorageService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
    private googleScript: GoogleScript
  ) {}

  get region() {
    return this.searchForm.get('region');
  }
  get city() {
    return this.searchForm.get('city');
  }
  get courier() {
    return this.searchForm.get('courier');
  }
  get station() {
    return this.searchForm.get('station');
  }
  get state() {
    return this.searchForm.get('state');
  }

  ngOnInit(): void {
    this.localeStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy)).subscribe((lang: string) => {
      this.currentLang = lang;
      this.setCard();
    });
    this.initForm();
    this.getLocations();
    this.getCouriers();
    this.getReceivingStation();
    this.region.valueChanges.pipe(takeUntil(this.destroy)).subscribe((value) => {
      this.checkRegionValue(value);
      this.selectedCities = [];
    });
    this.setCountOfCheckedCity();
    this.setStationPlaceholder();
    this.setStateValue();
    this.getExistingCard(this.filterData);
    this.languageService
      .getCurrentLangObs()
      .pipe(takeUntil(this.destroy))
      .subscribe((i) => {
        this.getLocations();
        this.translateSelectedCity();
        this.setCountOfCheckedCity();
        this.setStationPlaceholder();
        this.getCouriers();
      });
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
    this.localeStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy)).subscribe((lang: string) => {
      this.googleScript.load(lang);
    });
  }

  public setStateValue(): void {
    Object.assign(this.filterData, { status: 'ACTIVE' });
    this.state.valueChanges.subscribe((value) => {
      Object.assign(this.filterData, { status: value });
      this.getExistingCard(this.filterData);
    });
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      region: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern(Patterns.NamePattern)]],
      city: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(Patterns.NamePattern)]],
      courier: ['', [Validators.required]],
      station: ['', [Validators.required]],
      state: ['ACTIVE']
    });
  }

  public checkisCardExist(): void {
    if (this.courier.value && this.selectedCities.length) {
      this.isFieldFilled = true;
      this.createCardDto();
      this.tariffsService
        .checkIfCardExist(this.createCardObj)
        .pipe(takeUntil(this.destroy))
        .subscribe((response) => {
          this.isCardExist = JSON.parse(JSON.stringify(response));
        });
    }
  }

  resetLocationValues(fieldName: string): void {
    this.resetFormFieldValue(fieldName);
    this.selectedCities = [];
    this.setCountOfCheckedCity();
    const locationsId = this.locations.map((location) => location.locationsDto.map((elem) => elem.locationId)).flat(2);
    this.updateFilterData({ [fieldName]: '', location: locationsId });
    this.getExistingCard(this.filterData);
  }

  resetCourierValue(): void {
    this.resetFormFieldValue('courier');
    this.updateFilterData({ courier: '' });
    this.getExistingCard(this.filterData);
  }

  resetStationValue(): void {
    this.resetFormFieldValue('station');
    this.selectedStation = [];
    const stationsId = this.stations.map((station) => station.id);
    this.updateFilterData({ receivingStation: stationsId });
    this.setStationPlaceholder();
    this.getExistingCard(this.filterData);
  }

  private updateFilterData(data: object): void {
    Object.assign(this.filterData, data);
  }

  private resetFormFieldValue(fieldName: string): void {
    this[fieldName].setValue('');
  }

  public _filter(name: string, items: any[]): any[] {
    const filterValue = name.toLowerCase();
    return items.filter((option) => option.toLowerCase().includes(filterValue));
  }

  addItem(event: MatChipInputEvent): void {
    const value = event.value;

    if ((value || '').trim()) {
      this.selectedCities.push(value.trim());
    }

    if (this.city.value) {
      this.city.setValue('');
    }
  }

  public setCountOfCheckedCity(): void {
    if (this.selectedCities.length) {
      this.translate.get('ubs-tariffs.selected').subscribe((data) => (this.cityPlaceholder = `${this.selectedCities.length} ${data}`));
    } else {
      this.translate.get('ubs-tariffs.placeholder-locality').subscribe((data) => (this.cityPlaceholder = data));
    }
  }

  public onSelectCity(event: MatAutocompleteSelectedEvent, trigger?: MatAutocompleteTrigger): void {
    if (event.option.value === 'all') {
      this.toggleSelectAllCity();
      const locationsId = this.locations.map((location) => location.locationsDto.map((elem) => elem.locationId)).flat(2);
      Object.assign(this.filterData, { location: locationsId });
    } else {
      this.selectCity(event);
      const locationId = this.selectedCities.map((it) => it.id);
      Object.assign(this.filterData, { location: locationId });
    }
    this.getExistingCard(this.filterData);
    this.setCountOfCheckedCity();
    this.city.setValue('');
    this.checkisCardExist();
    if (trigger) {
      requestAnimationFrame(() => {
        trigger.openPanel();
      });
    }
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
    const selectedCityName = this.getSelectedCityName(selectedCity, Language.UA);
    const selectedCityEnglishName = this.getSelectedCityName(selectedCity, Language.EN);
    const tempItem = {
      name: this.getLangValue(selectedCityName, selectedCityEnglishName),
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

  translateSelectedCity() {
    this.selectedCities.forEach((city) => {
      city.name = this.getLangValue(city.ukrainianName, city.englishName);
    });
  }

  public onSelectStation(event: MatAutocompleteSelectedEvent): void {
    const selectedValue = this.stations.find((ob) => ob.name === event.option.value);
    const tempItem = {
      name: selectedValue.name,
      id: selectedValue.id
    };
    const newValue = event.option.value;
    if (this.selectedStation.map((it) => it.name).includes(newValue)) {
      this.selectedStation = this.selectedStation.filter((item) => item.name !== newValue);
    } else {
      this.selectedStation.push(tempItem);
    }
  }

  public stationSelected(event: MatAutocompleteSelectedEvent, trigger?: MatAutocompleteTrigger) {
    if (event.option.value === 'all') {
      this.toggleSelectAllStation();
      const stationsId = this.stations.map((station) => station.id);
      Object.assign(this.filterData, { receivingStation: stationsId });
    } else {
      this.onSelectStation(event);
      const receivingStationId = this.selectedStation.map((it) => it.id);
      Object.assign(this.filterData, { receivingStation: receivingStationId });
    }
    this.getExistingCard(this.filterData);
    this.station.setValue('');
    this.setStationPlaceholder();
    if (trigger) {
      requestAnimationFrame(() => {
        trigger.openPanel();
      });
    }
    this.checkisCardExist();
  }

  public checkSelectedItem(item: string, array: Array<{ name: string; id: number }>): boolean {
    return array.map((it) => it.name).includes(item);
  }

  public setStationPlaceholder(): void {
    if (this.selectedStation.length) {
      this.translate.get('ubs-tariffs.selected').subscribe((data) => (this.stationPlaceholder = `${this.selectedStation.length} ${data}`));
    } else {
      this.translate.get('ubs-tariffs.placeholder-choose-station').subscribe((data) => (this.stationPlaceholder = data));
    }
  }

  isCityChecked(): boolean {
    return this.selectedCities.length === this.cities.length;
  }

  isStationChecked(): boolean {
    return this.selectedStation.length === this.stationName.length;
  }

  openAuto(event: Event, trigger: MatAutocompleteTrigger): void {
    event.stopPropagation();
    trigger.openPanel();
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
  }

  transformCityToSelectedCity(city: any) {
    const selectedCityName = this.getSelectedCityName(city, Language.UA);
    const selectedCityEnglishName = this.getSelectedCityName(city, Language.EN);
    return {
      name: this.getLangValue(selectedCityName, selectedCityEnglishName),
      id: city.id,
      englishName: selectedCityEnglishName,
      ukrainianName: selectedCityName
    };
  }

  getSelectedCityName(city: any, languageCode: string) {
    return city.locationTranslationDtoList
      .filter((it) => it.languageCode === languageCode)
      .map((it) => it.locationName)
      .join();
  }

  toggleSelectAllStation(): void {
    if (!this.isStationChecked()) {
      this.selectedStation.length = 0;
      this.stations.forEach((station) => {
        this.selectedStation.push({
          name: station.name,
          id: station.id
        });
      });
    } else {
      this.selectedStation.length = 0;
    }
  }

  public onSelectCourier(event): void {
    if (event.value === 'all') {
      Object.assign(this.filterData, { courier: '' });
    } else {
      const selectedValue = this.couriers.find((ob) => {
        const searchingFilter = this.getLangValue(ob.nameUk, ob.nameEn);
        return searchingFilter === event.value;
      });
      this.courierNameEng = selectedValue.nameEn;
      this.courierId = selectedValue.courierId;
      Object.assign(this.filterData, { courier: this.courierId });
    }
    this.getExistingCard(this.filterData);
    this.checkisCardExist();
  }

  getLocations(): void {
    this.store.dispatch(GetLocations({ reset: this.reset }));

    this.locations$.pipe(skip(1), takeUntil(this.destroy)).subscribe((item: Locations[]) => {
      if (item) {
        this.locations = item;
        const regions = [];
        this.locations
          .map((element) => {
            return element.regionTranslationDtos.filter((it) => it.languageCode === this.currentLang).map((it) => it.regionName);
          })
          .flat(2)
          .forEach((region) => {
            if (!regions.includes(region)) {
              regions.push(region);
            }
          });

        this.filteredRegions = this.filterOptions(this.region, regions);
        this.cities = this.mapCities(this.locations);
        this.filteredCities = this.filterOptions(
          this.city,
          this.cities.map((elem) => elem.name)
        );
        this.reset = false;
      }
    });
  }

  public mapCities(region: Locations[]): Array<object> {
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

  page(className: string, cardID: number): void {
    if (className === 'tariff-img mr-3') {
      return;
    }
    this.router.navigate([`ubs-admin/tariffs/location/${cardID}`]);
  }

  getCouriers(): void {
    this.tariffsService
      .getCouriers()
      .pipe(takeUntil(this.destroy))
      .subscribe((res: Couriers[]) => {
        this.couriers = res;
        this.couriersName = this.couriers.map((el) => this.getLangValue(el.nameUk, el.nameEn));
      });
  }

  getReceivingStation(): void {
    this.tariffsService
      .getAllStations()
      .pipe(takeUntil(this.destroy))
      .subscribe((res: Stations[]) => {
        this.stations = res;
        this.stationName = this.stations.map((el) => el.name);
        this.filteredStations = this.filterOptions(this.station, this.stationName);
      });
  }

  public getExistingCard(filterData) {
    this.cardsUk.length = 0;
    this.cardsEn.length = 0;
    this.tariffsService
      .getFilteredCard(filterData)
      .pipe(takeUntil(this.destroy))
      .subscribe((card) => {
        card.forEach((el) => {
          const cardObjUk = {
            courier: el.courierDto.nameUk,
            station: el.receivingStationDtos.map((it) => it.name),
            region: el.regionDto.nameUk,
            city: el.locationInfoDtos.map((it) => it.nameUk),
            tariff: el.tariffStatus,
            regionId: el.regionDto.regionId,
            cardId: el.cardId
          };
          const cardObjEn = {
            courier: el.courierDto.nameEn,
            station: el.receivingStationDtos.map((it) => it.name),
            region: el.regionDto.nameEn,
            city: el.locationInfoDtos.map((it) => it.nameEn),
            tariff: el.tariffStatus,
            regionId: el.regionDto.regionId,
            cardId: el.cardId
          };
          this.courierNameEng = el.courierDto.nameEn;
          this.courierNameUk = el.courierDto.nameUk;
          this.regionEnglishName = el.regionDto.nameEn;
          this.regionNameUk = el.regionDto.nameUk;
          this.cardsUk.push(cardObjUk);
          this.cardsEn.push(cardObjEn);
        });
      });
  }

  private setCard(): void {
    this.cards = this.languageService.getLangValue(this.cardsUk, this.cardsEn) as any[];
  }

  checkRegionValue(value): void {
    let currentRegion;
    if (value === 'Усі' || !value) {
      currentRegion = this.locations;
    } else {
      currentRegion = this.locations.filter((element) => element.regionTranslationDtos.find((it) => it.regionName === value));
    }
    this.cities = this.mapCities(currentRegion);
    this.filteredCities = this.filterOptions(
      this.city,
      this.cities.map((elem) => elem.name)
    );
  }

  public regionSelected(event) {
    if (event.option.value === 'Усі') {
      Object.assign(this.filterData, { region: '' });
    } else {
      const selectedValue = this.locations.filter((it) =>
        it.regionTranslationDtos.find((ob) => ob.regionName === event.option.value.toString())
      );

      this.regionEnglishName = selectedValue
        .map((it) => it.regionTranslationDtos.filter((ob) => ob.languageCode === Language.EN).map((i) => i.regionName))
        .flat(2);
      this.regionId = selectedValue.find((it) => it.regionId).regionId;
      Object.assign(this.filterData, { region: this.regionId });
    }

    this.filteredRegions = of(
      this.locations.flatMap((it) =>
        it.regionTranslationDtos.filter((ob) => ob.languageCode === this.currentLang).map((ob) => ob.regionName)
      )
    );
    this.getExistingCard(this.filterData);
    this.checkisCardExist();
  }

  filterOptions(control, array): Array<string> {
    return control.valueChanges.pipe(
      startWith(''),
      map((value: string) => (value ? this._filter(value, array) : array.slice()))
    );
  }

  public createCardDto(): void {
    this.createCardObj = {
      courierId: this.courierId,
      receivingStationsIdList: this.selectedStation.map((it) => it.id).sort(),
      regionId: this.regionId,
      locationIdList: this.selectedCities.map((it) => it.id).sort()
    };
  }

  public createTariffCard(): void {
    this.createCardDto();
    const matDialogRef = this.dialog.open(TariffConfirmationPopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        title: 'ubs-tariffs-add-location-pop-up.create_card_title',
        courierName: this.courier.value,
        selectedStation: this.selectedStation,
        courierEnglishName: this.courierNameEng,
        stationNames: this.selectedStation.map((it) => it.name),
        regionName: this.region.value,
        regionEnglishName: this.regionEnglishName,
        locationNames: this.selectedCities.map((it) => {
          return { name: it.name, ukrainianName: it.ukrainianName, englishName: it.englishName };
        }),
        locationEnglishNames: this.selectedCities.map((it) => it.englishName),
        courierId: this.courierId,
        regionId: this.regionId,
        receivingStationsIdList: this.selectedStation.map((it) => it.id).sort(),
        locationIdList: this.selectedCities.map((it) => it.id).sort(),
        action: 'ubs-tariffs-add-location-pop-up.create_button'
      }
    });
    matDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.createCardRequest(this.createCardObj);
        this.region.setValue('');
        this.courier.setValue('');
        this.selectedStation = [];
        this.selectedCities = [];
        this.getExistingCard({});
        this.setCountOfCheckedCity();
        this.setStationPlaceholder();
        this.isCardExist = false;
      }
    });
  }

  openEditPopUp(card): void {
    const ukCard = this.cardsUk.filter((item) => item.cardId === card.cardId)[0];
    const enCard = this.cardsEn.filter((item) => item.cardId === card.cardId)[0];

    const matDialogRef = this.dialog.open(UbsAdminTariffsCardPopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        tariffId: card.cardId,
        title: 'ubs-tariffs-add-location-pop-up.edit_card_title',
        courierUkrainianName: this.selectedCard ? card.courierUk : ukCard.courier,
        courierEnglishName: this.selectedCard ? card.courierEn : enCard.courier,
        selectedStation: card.station,
        regionUkrainianName: this.selectedCard ? card.regionUk : ukCard.region,
        regionEnglishName: this.selectedCard ? card.regionEn : enCard.region,
        cityNameUk: this.selectedCard ? card.citiesUk : ukCard.city,
        cityNameEn: this.selectedCard ? card.citiesEn : enCard.city,
        action: 'ubs-tariffs-add-location-pop-up.edit_button',
        edit: true,
        button: 'edit'
      }
    });

    matDialogRef.afterClosed().subscribe((res) => {
      if (this.selectedCard && res) {
        this.updateSelectedCard(res);
      }
    });
  }

  updateSelectedCard(res): void {
    this.selectedCard.citiesEn = res.citiesEn;
    this.selectedCard.citiesUk = res.citiesUk;
    this.selectedCard.courierEn = res.courierEn;
    this.selectedCard.courierUk = res.courierUk;
    this.selectedCard.regionEn = res.regionEn;
    this.selectedCard.regionUk = res.regionUk;
    this.selectedCard.regionId = res.regionId;
    this.selectedCard.station = res.station;
  }

  public createCardRequest(card): void {
    this.tariffsService.createCard(card).pipe(takeUntil(this.destroy)).subscribe();
  }

  openAddCourierDialog(): void {
    this.dialog.open(UbsAdminTariffsCourierPopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        headerText: 'addCourier',
        edit: false
      }
    });
  }

  openEditCourier(): void {
    this.dialog.open(UbsAdminTariffsCourierPopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        headerText: 'editCourier',
        edit: true
      }
    });
  }

  openAddStationDialog(): void {
    this.dialog.open(UbsAdminTariffsStationPopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        headerText: 'addStation',
        edit: false
      }
    });
  }

  openEditStation(): void {
    this.dialog.open(UbsAdminTariffsStationPopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        headerText: 'editStation',
        edit: true
      }
    });
  }

  openAddLocation(): void {
    this.dialog.open(UbsAdminTariffsLocationPopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        headerText: 'addLocation',
        edit: false
      }
    });
  }

  openEditLocation(): void {
    this.dialog.open(UbsAdminTariffsLocationPopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        headerText: 'editLocation',
        edit: true
      }
    });
  }

  openDialog(component, data): any {
    return this.dialog.open(component, {
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data
    });
  }

  openConfirmationDialog(result): any {
    const data = {
      courierNameUk: result.selectedValue?.nameUk,
      courierEnglishName: result.selectedValue?.nameEn,
      regionNameUk: result.selectedRegionValue.map((region) => region.nameUa),
      regionEnglishName: result.selectedRegionValue.map((region) => region.name),
      cityNameUk: result.selectedCitiesValue.map((city) => city.nameUa),
      cityNameEn: result.selectedCitiesValue.map((city) => city.name),
      stationNames: result.selectedStations.map((it) => it.name),
      isDeactivate: result.isDeactivation,
      isRestore: result.isActivation
    };
    return this.openDialog(TariffDeactivateConfirmationPopUpComponent, data);
  }

  openDeactivateOrActivatePopUp(actionName: string): void {
    const isItActivation = actionName === actionsWithTariffs.activate;
    const isItDeactivation = actionName === actionsWithTariffs.deactivation;

    const dialogRef = this.dialog.open(UbsAdminTariffsDeactivatePopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      data: {
        isDeactivation: isItDeactivation,
        isActivation: isItActivation
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const confirmDialogRef = this.openConfirmationDialog(result);
        const status = result.isDeactivation ? switchTariffStatus.deactivated : switchTariffStatus.active;
        this.createDeactivateCardDto(result);

        confirmDialogRef.afterClosed().subscribe((confirmRes) => {
          if (confirmRes) {
            this.tariffsService
              .deactivate(this.deactivateCardObj, status)
              .pipe(takeUntil(this.destroy))
              .subscribe((res) => this.getExistingCard(this.filterData));
          }
        });
      }
    });
  }

  private createDeactivateCardDto(result): void {
    this.deactivateCardObj = {
      cities: result.selectedCitiesValue.map((it) => it.id).join('%2C%20'),
      courier: result.selectedCourier?.id,
      regions: result.selectedRegionValue.map((it) => it.id).join('%2C%20'),
      stations: result.selectedStations.map((it) => it.id).join('%2C%20')
    };
  }

  openTariffDeactivateOrRestorePopUp(card, tariffId: number, actionName: string): void {
    const isItRestore = actionName === actionsWithTariffs.restore;
    const isItDeactivate = actionName === actionsWithTariffs.deactivation;
    const ukCard = this.cardsUk.filter((item) => item.cardId === card.cardId)[0];
    const enCard = this.cardsEn.filter((item) => item.cardId === card.cardId)[0];
    const matDialogRef = this.dialog.open(TariffDeactivateConfirmationPopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        courierNameUk: this.selectedCard ? card.courierUk : ukCard.courier,
        courierEnglishName: this.selectedCard ? card.courierEn : enCard.courier,
        regionNameUk: this.selectedCard ? card.regionUk : ukCard.region.split(),
        regionEnglishName: this.selectedCard ? card.regionEn : enCard.region.split(),
        cityNameUk: this.selectedCard ? card.citiesUk : ukCard.city,
        cityNameEn: this.selectedCard ? card.citiesEn : enCard.city,
        stationNames: card.station,
        isDeactivate: isItDeactivate,
        isRestore: isItRestore
      }
    });
    matDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        if (actionName === actionsWithTariffs.deactivation) {
          this.changeTariffStatusInTable(card, statusOfTariff.deactivated);
        }
        if (actionName === actionsWithTariffs.restore && this.checkTariffAvailability(tariffId)) {
          this.changeTariffStatusInTable(card, statusOfTariff.active);
        }
      }
    });
  }

  changeTariffStatusInTable(card: Card, status: string) {
    this.tariffsService
      .switchTariffStatus(card.cardId, status)
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        card.tariff = status;
        if (!this.selectedCard) {
          this.getExistingCard(this.filterData);
        }
      });
  }

  checkTariffAvailability(tariffId: number): Observable<boolean> {
    return forkJoin([
      this.tariffsService.getService(tariffId),
      this.tariffsService.getAllTariffsForService(tariffId),
      this.tariffsService.getTariffLimits(tariffId)
    ]).pipe(map(([service, tariffForService, limits]) => !!(service && tariffForService && limits)));
  }

  public openCreateCard(): void {
    this.dialog.open(UbsAdminTariffsCardPopUpComponent, {
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'address-matDialog-styles-w-100',
      data: {
        headerText: 'createCard',
        create: true
      }
    });
  }

  public getLangValue(uaValue: string, enValue: string): string {
    return this.languageService.getLangValue(uaValue, enValue) as string;
  }

  public getLangArrayValue(uaValue: string[], enValue: string[]) {
    return this.languageService.getLangValue(uaValue, enValue) as string[];
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
