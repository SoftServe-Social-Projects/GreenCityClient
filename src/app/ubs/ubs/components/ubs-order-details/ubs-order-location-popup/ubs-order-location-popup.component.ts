import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subject, Observable, of, iif } from 'rxjs';
import { takeUntil, startWith, map, mergeMap } from 'rxjs/operators';
import { CourierLocations, AllLocationsDtos, LocationsName } from '../../../models/ubs.interface';
import { OrderService } from '../../../services/order.service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Store } from '@ngrx/store';
import { GetCourierLocations, GetOrderDetails } from 'src/app/store/actions/order.actions';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Component({
  selector: 'app-ubs-order-location-popup',
  templateUrl: './ubs-order-location-popup.component.html',
  styleUrls: ['./ubs-order-location-popup.component.scss']
})
export class UbsOrderLocationPopupComponent implements OnInit, OnDestroy {
  closeButton = './assets/img/profile/icons/cancel.svg';
  public locations: CourierLocations;
  public cities: LocationsName[];
  public selectedLocationId: number;
  public selectedTariffId: number;
  public isFetching = false;
  private currentLanguage: string;
  public currentLocation: string;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  public myControl = new FormControl();
  public filteredOptions: Observable<any>;
  courierUBS;
  courierUBSName = 'UBS';

  constructor(
    private orderService: OrderService,
    private dialogRef: MatDialogRef<UbsOrderLocationPopupComponent>,
    private localStorageService: LocalStorageService,
    private langService: LanguageService,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.currentLanguage = this.localStorageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.getActiveCouriers();
    this.myControl.setValidators(Validators.required);
  }

  filterOptions(): void {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.locationName)),
      map((locationName) => (locationName ? this._filter(locationName) : this.cities.slice()))
    );
  }

  displayFn(city: LocationsName): string {
    return city?.locationName ? city.locationName : '';
  }

  private _filter(value: string): LocationsName[] {
    this.currentLocation = null;

    const filterValue = value.toLowerCase();
    return this.cities.filter((option) => option.locationName.toLowerCase().includes(filterValue));
  }

  getActiveCouriers() {
    this.orderService
      .getAllActiveCouriers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.courierUBS = res.find((courier) => courier.nameEn.includes(this.courierUBSName));
        if (this.courierUBS) {
          this.getLocations();
          this.filterOptions();
        }
      });
  }

  getLocations(): void {
    this.isFetching = true;
    of(true)
      .pipe(
        takeUntil(this.destroy$),
        mergeMap(() => iif(() => this.data, of(this.data), this.orderService.getLocations(this.courierUBS.courierId, true)))
      )
      .subscribe((res: AllLocationsDtos) => {
        this.isFetching = false;
        this.cities = res.allActiveLocationsDtos.reduce(
          (acc, region) => [
            ...acc,
            ...region.locations.map((city) => ({
              locationId: city.locationId,
              locationName: this.getLocationName(city, region)
            }))
          ],
          []
        );
        this.cities.forEach((city) => {
          if (city.locationId === 1) {
            this.myControl.setValue({ locationId: city.locationId, locationName: city.locationName });
            this.currentLocation = city.locationName;
            this.changeLocation(city.locationId, city.locationName);
          }
        });
      });
  }

  saveLocation(): void {
    this.store.dispatch(GetCourierLocations({ courierId: this.courierUBS.courierId, locationId: this.selectedLocationId }));
    this.orderService
      .getInfoAboutTariff(this.courierUBS.courierId, this.selectedLocationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: AllLocationsDtos) => {
        if (res.orderIsPresent) {
          this.locations = res.tariffsForLocationDto;
          res.tariffsForLocationDto.locationsDtosList.forEach((location) => {
            if (location.nameEn === this.currentLocation) {
              this.selectedLocationId = location.locationId;
            }
          });
          this.selectedTariffId = res.tariffsForLocationDto.tariffInfoId;
          this.store.dispatch(GetOrderDetails({ locationId: this.selectedLocationId, tariffId: this.selectedTariffId }));
          this.localStorageService.setLocationId(this.selectedLocationId);
          this.localStorageService.setTariffId(this.selectedTariffId);
          this.localStorageService.setLocations(this.locations);
          this.orderService.setLocationData(this.currentLocation);
          this.orderService.completedLocation(true);
          this.passDataToComponent();
        }
      });
  }

  private getLocationName(location: { nameUk: string; nameEn: string }, region: { nameUk: string; nameEn: string }): string {
    return location.nameEn === 'Kyiv'
      ? this.getLangValue(location.nameUk, location.nameEn)
      : this.getLangValue(location.nameUk, location.nameEn) + ', ' + this.getLangValue(region.nameUk, region.nameEn);
  }

  private getLangValue(uaValue: string, enValue: string): string {
    return this.langService.getLangValue(uaValue, enValue) as string;
  }

  openAuto(event: Event, trigger: MatAutocompleteTrigger): void {
    event.stopPropagation();
    trigger.openPanel();
  }

  passDataToComponent(): void {
    this.dialogRef.close({ locationId: this.selectedLocationId, currentLanguage: this.currentLanguage, data: this.locations });
  }

  changeLocation(id: number, locationName: string): number {
    this.selectedLocationId = id;
    this.currentLocation = locationName.split(',')[0];
    return id;
  }

  public closePopUp(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
