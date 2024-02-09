import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CommonModule } from '@angular/common';
import { PlacesRoutesModule } from './places-routing.module';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { RatingModule } from 'ngx-bootstrap/rating';
// import { Ng5SliderModule } from 'ng5-slider';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { SharedMainModule } from '@shared/shared-main.module';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PlacesComponent } from './places.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { environment } from '@environment/environment.js';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MoreOptionsFilterComponent } from './components/more-options-filter/more-options-filter.component';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
// import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { AddPlaceComponent } from './components/add-place/add-place.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
// import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { MaterialModule } from '../../../material.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TimePickerPopupComponent } from './components/time-picker-pop-up/time-picker-popup.component';
import { AddressInputComponent } from './components/address-input/address-input.component';

@NgModule({
  declarations: [PlacesComponent, MoreOptionsFilterComponent, AddPlaceComponent, TimePickerPopupComponent, AddressInputComponent],
  imports: [
    MatSidenavModule,
    SharedModule,
    SharedMainModule,
    CommonModule,
    PlacesRoutesModule,
    // Ng2SearchPipeModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    ReactiveFormsModule,
    // GooglePlaceModule,
    GoogleMapsModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    RatingModule,
    // Ng5SliderModule,
    MatDialogModule,
    NgbModule,
    MatRippleModule,
    MatTabsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    MatSliderModule,
    // MatGoogleMapsAutocompleteModule,
    MaterialModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [TranslateService]
})
export class PlacesModule {}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
