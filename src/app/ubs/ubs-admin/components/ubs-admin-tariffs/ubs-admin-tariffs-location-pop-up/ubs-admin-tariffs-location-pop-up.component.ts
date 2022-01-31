import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { TariffsService } from 'src/app/ubs/ubs-admin/services/tariffs.service';

@Component({
  selector: 'app-ubs-admin-tariffs-location-pop-up',
  templateUrl: './ubs-admin-tariffs-location-pop-up.component.html',
  styleUrls: ['./ubs-admin-tariffs-location-pop-up.component.scss']
})
export class UbsAdminTariffsLocationPopUpComponent implements OnInit, AfterViewChecked {
  @ViewChildren('locationInput') inputs: QueryList<ElementRef>;
  locationForm = this.fb.group({
    courier: [''],
    englishCourier: [''],
    station: [''],
    englishStation: [''],
    region: [''],
    englishRegion: [''],
    items: this.fb.array([this.createItem()])
  });

  regionOptions = {
    types: ['(regions)'],
    componentRestrictions: { country: 'UA' }
  };

  localityOptions;
  regionBounds;
  autocomplete = [];
  tempAutocomplete;
  items: FormArray;
  translatedText: string;
  isDisabled = false;
  name: string;
  unsubscribe: Subject<any> = new Subject();
  datePipe = new DatePipe('ua');
  newDate = this.datePipe.transform(new Date(), 'MMM dd, yyyy');
  quantityOfLocations: number;
  regionSelected = false;

  constructor(
    private tariffsService: TariffsService,
    private fb: FormBuilder,
    private localeStorageService: LocalStorageService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<UbsAdminTariffsLocationPopUpComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      headerText: string;
      template: TemplateRef<any>;
    }
  ) {}

  ngOnInit(): void {
    this.localeStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.unsubscribe)).subscribe((firstName) => {
      this.name = firstName;
    });
  }

  translate(sourceText: string, input: any): void {
    this.tariffsService.getJSON(sourceText).subscribe((data) => {
      input.setValue(data[0][0][0]);
    });
  }

  addCity(): void {
    this.items = this.locationForm.get('items') as FormArray;
    if (this.regionSelected && this.checkIfAllCitysAreSelected()) {
      this.items.push(this.createItem());
      this.quantityOfLocations++;
      this.cdr.detectChanges();
      const tempInput = this.inputs.toArray()[this.quantityOfLocations - 1].nativeElement;
      this.tempAutocomplete = new google.maps.places.Autocomplete(tempInput, this.localityOptions);
      this.tempAutocomplete.setBounds(this.regionBounds);
      this.tempAutocomplete.setOptions(this.localityOptions);
      this.autocomplete.push(this.tempAutocomplete);
      this.addEventToAutocomplete(this.quantityOfLocations - 1);
    }
  }

  checkIfAllCitysAreSelected(): boolean {
    for (const item of this.autocomplete) {
      if (!item.getPlace()) {
        return false;
      }
    }
    return true;
  }

  createItem(): FormGroup {
    return this.fb.group({
      location: '',
      englishLocation: ''
    });
  }

  deleteLocation(i: number) {
    const fa = this.locationForm.get('items') as FormArray;
    if (fa.length !== 1) {
      fa.removeAt(i);
      this.autocomplete.splice(i, 1);
      this.quantityOfLocations--;
    }
  }

  onRegionSelected(event: any): void {
    this.regionSelected = true;
    this.setValueOfRegion(event);
    this.quantityOfLocations = 1;
    const tempInput = this.inputs.toArray()[this.quantityOfLocations - 1].nativeElement;
    this.autocomplete[this.quantityOfLocations - 1] = new google.maps.places.Autocomplete(tempInput, this.localityOptions);

    const l = event.geometry.viewport.getSouthWest();
    const x = event.geometry.viewport.getNorthEast();

    this.regionBounds = new google.maps.LatLngBounds(l, x);

    this.autocomplete[this.quantityOfLocations - 1].setBounds(this.regionBounds);
    this.localityOptions = {
      bounds: this.regionBounds,
      strictBounds: true,
      types: ['(cities)'],
      componentRestrictions: { country: 'ua' }
    };
    this.autocomplete[this.quantityOfLocations - 1].setOptions(this.localityOptions);
    this.addEventToAutocomplete(this.quantityOfLocations - 1);
  }

  setValueOfRegion(event: any): void {
    this.locationForm.get('region').setValue(event.name);
    this.translate(event.name, this.locationForm.get('englishRegion'));
    this.locationForm.get('englishRegion').setValue(this.translatedText);
  }

  addEventToAutocomplete(i: number): void {
    this.autocomplete[i].addListener('place_changed', () => {
      const locationName = this.autocomplete[i].getPlace().name;
      const key = 'controls';
      this.locationForm.get('items')[key][i][key].location.setValue(locationName);
      this.translate(locationName, this.locationForm.get('items')[key][i][key].englishLocation);
      this.locationForm.get('items')[key][i][key].englishLocation.setValue(this.translatedText);
    });
  }

  addLocation() {
    this.isDisabled = true;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }
}
