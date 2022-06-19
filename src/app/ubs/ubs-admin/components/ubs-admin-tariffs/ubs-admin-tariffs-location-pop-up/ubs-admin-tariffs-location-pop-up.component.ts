import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { map, skip, startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { TariffsService } from 'src/app/ubs/ubs-admin/services/tariffs.service';
import { CreateLocation, Locations, EditLocationName } from '../../../models/tariffs.interface';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { AddLocations, EditLocation, GetLocations } from 'src/app/store/actions/tariff.actions';
import { ModalTextComponent } from '../../shared/components/modal-text/modal-text.component';
import { ubsNamePattern } from '../../shared/validators-pattern/ubs-name-patterns';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

interface LocationItem {
  location: string;
  englishLocation: string;
  latitute: number;
  longitude: number;
}

@Component({
  selector: 'app-ubs-admin-tariffs-location-pop-up',
  templateUrl: './ubs-admin-tariffs-location-pop-up.component.html',
  styleUrls: ['./ubs-admin-tariffs-location-pop-up.component.scss']
})
export class UbsAdminTariffsLocationPopUpComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('locationInput') input: ElementRef;

  locationForm = this.fb.group({
    region: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern(ubsNamePattern.namePattern)]],
    englishRegion: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern(ubsNamePattern.englishPattern)]
    ],
    location: ['', [Validators.minLength(3), Validators.maxLength(40), Validators.pattern(ubsNamePattern.namePattern)]],
    englishLocation: ['', [Validators.minLength(3), Validators.maxLength(40), Validators.pattern(ubsNamePattern.englishPattern)]]
  });

  regionOptions = {
    types: ['(regions)'],
    componentRestrictions: { country: 'UA' }
  };

  createdCards: CreateLocation[] = [];
  newCard: CreateLocation = {
    addLocationDtoList: [],
    latitude: 0,
    longitude: 0,
    regionTranslationDtos: []
  };
  newLocationName: EditLocationName[] = [];
  selectedCities: LocationItem[] = [];
  editedCities = [];
  locations = [];
  currentLatitude: number;
  currentLongitude: number;
  reset = true;
  localityOptions;
  regionBounds;
  autocomplete;
  autocompleteLsr;
  name: string;
  unsubscribe: Subject<any> = new Subject();
  datePipe = new DatePipe('ua');
  newDate = this.datePipe.transform(new Date(), 'MMM dd, yyyy');
  regionSelected = false;
  regionExist = false;
  citySelected = false;
  cityExist = false;
  editedCityExist = false;
  uaregions = [];
  cities = [];
  filteredRegions;
  filteredCities = [];
  editLocationId;
  regionId;
  enCities;
  locations$ = this.store.select((state: IAppState): Locations[] => state.locations.locations);

  public icons = {
    arrowDown: '././assets/img/ubs-tariff/arrow-down.svg',
    cross: '././assets/img/ubs/cross.svg'
  };

  constructor(
    private tariffsService: TariffsService,
    private fb: FormBuilder,
    private localeStorageService: LocalStorageService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<UbsAdminTariffsLocationPopUpComponent>,
    private store: Store<IAppState>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      headerText: string;
      template: TemplateRef<any>;
      edit: boolean;
    }
  ) {}

  get region() {
    return this.locationForm.get('region');
  }

  get englishRegion() {
    return this.locationForm.get('englishRegion');
  }

  get location() {
    return this.locationForm.get('location');
  }

  get englishLocation() {
    return this.locationForm.get('englishLocation');
  }

  ngOnInit(): void {
    this.getLocations();
    this.localeStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.unsubscribe)).subscribe((firstName) => {
      this.name = firstName;
    });
    this.region.valueChanges.subscribe((item) => {
      this.regionExist = !this.regionSelected && item.length > 3;
      const currentRegion = this.locations.filter((element) => element.regionTranslationDtos.find((it) => it.regionName === item));
      this.selectCities(currentRegion);
    });
    this.location.valueChanges.subscribe((item) => {
      this.cityExist = !this.citySelected && item.length > 3;
    });
  }

  selectCities(currentRegion): void {
    if (!currentRegion || !currentRegion.length || !currentRegion[0].locationsDto) {
      return;
    }
    this.filteredCities = currentRegion[0].locationsDto;
    this.location.valueChanges.subscribe((data) => {
      if (!data) {
        this.filteredCities = currentRegion[0].locationsDto;
      }
      const res = [];
      this.filteredCities.forEach((elem, index) => {
        elem.locationTranslationDtoList.forEach((el) => {
          if (el.locationName.toLowerCase().includes(data) && el.languageCode === 'ua') {
            res.push(this.filteredCities[index]);
          }
        });
      });
      this.filteredCities = res;
    });
    this.regionId = currentRegion[0].regionId;
    this.cities = currentRegion.map((element) =>
      element.locationsDto.map((item) =>
        item.locationTranslationDtoList.filter((it) => it.languageCode === 'ua').map((it) => it.locationName)
      )
    );
    this.enCities = currentRegion.map((element) =>
      element.locationsDto.map((item) =>
        item.locationTranslationDtoList.filter((it) => it.languageCode === 'en').map((it) => it.locationName)
      )
    );
    this.cities = this.cities.reduce((acc, val) => acc.concat(val), []).reduce((acc, val) => acc.concat(val), []);
    this.enCities = this.enCities.reduce((acc, val) => acc.concat(val), []).reduce((acc, val) => acc.concat(val), []);
  }

  translate(sourceText: string, input: any): void {
    this.tariffsService.getJSON(sourceText).subscribe((data) => {
      input.setValue(data[0][0][0]);
    });
  }

  public addCity(): void {
    if (this.location.value && this.englishLocation.value && !this.cities.includes(this.location.value) && this.citySelected) {
      const tempItem: LocationItem = {
        location: this.location.value,
        englishLocation: this.englishLocation.value,
        latitute: this.currentLatitude,
        longitude: this.currentLongitude
      };
      this.selectedCities.push(tempItem);
      this.location.setValue('');
      this.englishLocation.setValue('');
      this.citySelected = false;
    }
  }

  public addEditedCity(): void {
    const locationValueExist = this.location.value && this.englishLocation.value;
    const locationValueChanged: boolean = !this.cities.includes(this.location.value) || !this.enCities.includes(this.englishLocation.value);
    if (locationValueExist && locationValueChanged) {
      this.editedCityExist = false;
      const tempItem = {
        location: this.location.value,
        englishLocation: this.englishLocation.value,
        locationId: this.editLocationId,
        regionId: this.regionId
      };
      this.editedCities.push(tempItem);
      this.location.setValue('');
      this.englishLocation.setValue('');
    } else {
      this.editedCityExist = true;
    }
  }

  public deleteCity(index): void {
    this.selectedCities.splice(index, 1);
  }

  public deleteEditedCity(index): void {
    this.editedCities.splice(index, 1);
  }

  onRegionSelected(event: any): void {
    this.regionSelected = true;
    this.setValueOfRegion(event);

    if (!this.autocomplete) {
      this.autocomplete = new google.maps.places.Autocomplete(this.input.nativeElement, this.localityOptions);
    }
    const l = event.geometry.viewport.getSouthWest();
    const x = event.geometry.viewport.getNorthEast();
    this.regionBounds = new google.maps.LatLngBounds(l, x);

    this.autocomplete.setBounds(event.geometry.viewport);
    this.localityOptions = {
      bounds: this.regionBounds,
      strictBounds: true,
      types: ['(cities)'],
      componentRestrictions: { country: 'ua' }
    };
    this.autocomplete.setOptions(this.localityOptions);
    this.addEventToAutocomplete();
  }

  setValueOfRegion(event: any): void {
    this.region.setValue(event.name);
    this.translate(event.name, this.englishRegion);
  }

  addEventToAutocomplete(): void {
    this.autocompleteLsr = this.autocomplete.addListener('place_changed', () => {
      this.citySelected = true;
      const locationName = this.autocomplete.getPlace().name;
      this.currentLatitude = this.autocomplete.getPlace().geometry.location.lat();
      this.currentLongitude = this.autocomplete.getPlace().geometry.location.lng();
      this.location.setValue(locationName);
      this.translate(locationName, this.englishLocation);
    });
  }

  selectedEditRegion(event): void {
    const enValue = this.locations.filter((it) => it.regionTranslationDtos.find((ob) => ob.regionName === event.option.value.toString()));
    this.englishRegion.setValue(
      enValue.map((it) => it.regionTranslationDtos.filter((ob) => ob.languageCode === 'en').map((i) => i.regionName))
    );
  }

  selectCitiesEdit(event): void {
    event.option.value.locationTranslationDtoList.forEach((el) => {
      if (el.languageCode === 'ua') {
        this.location.setValue(el.locationName);
      }
      if (el.languageCode === 'en') {
        this.englishLocation.setValue(el.locationName);
      }
      this.editLocationId = event.option.value.locationId;
    });
  }

  getLocations(): void {
    this.store.dispatch(GetLocations({ reset: this.reset }));

    this.locations$.pipe(skip(1)).subscribe((item) => {
      if (item) {
        this.locations = item;
        this.uaregions = [].concat(
          ...this.locations.map((element) =>
            element.regionTranslationDtos.filter((it) => it.languageCode === 'ua').map((it) => it.regionName)
          )
        );
        this.region.valueChanges
          .pipe(
            startWith(''),
            map((value: string) => this._filter(value, this.uaregions))
          )
          .subscribe((data) => {
            this.filteredRegions = data;
          });
        this.reset = false;
      }
    });
  }

  private _filter(name: string, items: any[]): any[] {
    const filterValue = name.toLowerCase();
    return items.filter((option) => option.toLowerCase().includes(filterValue));
  }

  addLocation(): void {
    const enRegion = { languageCode: 'en', regionName: this.locationForm.value.englishRegion };
    const region = { languageCode: 'ua', regionName: this.locationForm.value.region };

    for (const item of this.selectedCities) {
      const enLocation = { languageCode: 'en', locationName: item.englishLocation };
      const Location = { languageCode: 'ua', locationName: item.location };

      const cart: CreateLocation = {
        latitude: item.latitute,
        addLocationDtoList: [enLocation, Location],
        longitude: item.longitude,
        regionTranslationDtos: [enRegion, region]
      };

      this.createdCards.push(cart);
    }
    this.store.dispatch(AddLocations({ locations: this.createdCards }));
    this.dialogRef.close({});
  }

  public editLocation(): void {
    for (const item of this.editedCities) {
      const cart = {
        nameEn: item.englishLocation,
        nameUa: item.location,
        locationId: item.locationId,
        regionId: item.regionId
      };
      this.newLocationName.push(cart);
    }
    this.store.dispatch(EditLocation({ editedLocations: this.newLocationName }));
    this.dialogRef.close({});
  }

  onNoClick(): void {
    if (this.selectedCities.length || this.editedCities.length) {
      const matDialogRef = this.dialog.open(ModalTextComponent, {
        hasBackdrop: true,
        panelClass: 'address-matDialog-styles-w-100',
        data: {
          name: 'cancel',
          text: 'modal-text.cancel-message',
          action: 'modal-text.yes'
        }
      });
      matDialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }
  public openAuto(event: Event, trigger: MatAutocompleteTrigger): void {
    event.stopPropagation();
    trigger.openPanel();
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    google.maps.event.removeListener(this.autocompleteLsr);
    google.maps.event.clearInstanceListeners(this.autocomplete);
  }
}
