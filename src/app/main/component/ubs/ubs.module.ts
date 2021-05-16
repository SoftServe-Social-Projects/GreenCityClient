import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { AgmCoreModule } from '@agm/core';
import { IMaskModule } from 'angular-imask';
import { MatDialogModule, MatFormFieldModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { environment } from '@environment/environment';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { UbsRoutingModule } from './ubs-routing.module';
import { UbsComponent } from './ubs.component';
import { UBSOrderFormComponent } from './components/ubs-order-form/ubs-order-form.component';
import { UBSOrderDetailsComponent } from './components/ubs-order-details/ubs-order-details.component';
import { UBSPersonalInformationComponent } from './components/ubs-personal-information/ubs-personal-information.component';
import { UBSSubmitOrderComponent } from './components/ubs-submit-order/ubs-submit-order.component';
import { UBSInputErrorComponent } from './components/ubs-input-error/ubs-input-error.component';
import { UBSAddAddressPopUpComponent } from './components/ubs-personal-information/ubs-add-address-pop-up/ubs-add-address-pop-up.component';
import { AddressComponent } from './components/ubs-personal-information/address/address.component';
import { UbsConfirmPageComponent } from './components/ubs-confirm-page/ubs-confirm-page.component';
import { SharedModule } from 'src/app/main/component/shared/shared.module';

@NgModule({
  declarations: [
    UbsComponent,
    UBSOrderFormComponent,
    UBSOrderDetailsComponent,
    UBSPersonalInformationComponent,
    UBSSubmitOrderComponent,
    UBSInputErrorComponent,
    UBSAddAddressPopUpComponent,
    AddressComponent,
    UbsConfirmPageComponent
  ],
  imports: [
    MatFormFieldModule,
    CommonModule,
    UbsRoutingModule,
    MatStepperModule,
    MatDialogModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    IMaskModule,
    MatGoogleMapsAutocompleteModule,
    AgmCoreModule.forRoot({
      apiKey: environment.agmCoreModuleApiKey,
      libraries: ['places']
    }),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    SharedModule
  ],
  entryComponents: [UBSAddAddressPopUpComponent],
  providers: [
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { hasBackdrop: true }
    },
    TranslateService
  ]
})
export class UbsModule {}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/ubs/', '.json');
}
