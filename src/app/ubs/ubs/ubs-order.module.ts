import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';

import { IMaskModule } from 'angular-imask';
import { MatSelectModule } from '@angular/material/select';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { UbsRoutingModule } from './ubs-routing.module';
import { UbsOrderComponent } from './ubs-order.component';
import { UBSOrderFormComponent } from './components/ubs-order-form/ubs-order-form.component';
import { UBSOrderDetailsComponent } from './components/ubs-order-details/ubs-order-details.component';
import { UBSPersonalInformationComponent } from './components/ubs-personal-information/ubs-personal-information.component';
import { UBSSubmitOrderComponent } from './components/ubs-submit-order/ubs-submit-order.component';
import { AddressComponent } from './components/ubs-personal-information/address/address.component';
import { UbsConfirmPageComponent } from './components/ubs-confirm-page/ubs-confirm-page.component';
import { SharedMainModule } from '@shared/shared-main.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UbsMainPageComponent } from './components/ubs-main-page/ubs-main-page.component';
import { UbsOrderLocationPopupComponent } from './components/ubs-order-details/ubs-order-location-popup/ubs-order-location-popup.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { UbsSubmitOrderNotificationComponent } from './components/ubs-submit-order/ubs-submit-order-notification/ubs-submit-order-notification.component';
import { UbsOrderCertificateComponent } from './components/ubs-order-details/ubs-order-certificate/ubs-order-certificate.component';
import { ExtraPackagesPopUpComponent } from './components/ubs-order-details/extra-packages-pop-up/extra-packages-pop-up.component';
import { InterceptorService } from 'src/app/shared/interceptors/interceptor.service';
import { PendingChangesGuard } from '@global-service/pending-changes-guard/pending-changes.guard';
import { ConfirmRestorePasswordGuard } from '@global-service/route-guards/confirm-restore-password.guard';
import { UbsMainPageSpinnerComponent } from './components/ubs-main-page-spinner/ubs-main-page-spinner.component';
import { UbsPickUpServicePopUpComponent } from './components/ubs-pick-up-service-pop-up/ubs-pick-up-service-pop-up.component';
import { UbsOrderAddressComponent } from './components/ubs-personal-information/ubs-order-address/ubs-order-address.component';
import { ValidateAddressDirective } from 'src/app/ubs/ubs/directives/validate-address/validate-address.directive';
import { UbsUserAgreementComponent } from './components/ubs-user-agreement/ubs-user-agreement.component';
import { PhoneNumberTreatPipe } from 'src/app/shared/phone-number-treat/phone-number-treat.pipe';

@NgModule({
  declarations: [
    UbsOrderComponent,
    UBSOrderFormComponent,
    UBSOrderDetailsComponent,
    UBSPersonalInformationComponent,
    UBSSubmitOrderComponent,
    AddressComponent,
    UbsConfirmPageComponent,
    UbsMainPageComponent,
    UbsOrderLocationPopupComponent,
    UbsSubmitOrderNotificationComponent,
    UbsOrderCertificateComponent,
    ExtraPackagesPopUpComponent,
    UbsMainPageSpinnerComponent,
    UbsPickUpServicePopUpComponent,
    UbsOrderAddressComponent,
    ValidateAddressDirective,
    UbsUserAgreementComponent
  ],
  imports: [
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    UbsRoutingModule,
    MatStepperModule,
    MatDialogModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    IMaskModule,
    // GoogleMapsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    SharedMainModule,
    SharedModule
  ],
  exports: [],
  providers: [
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { hasBackdrop: true }
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
    { provide: MatDialogRef, useValue: {} },
    DatePipe,
    PendingChangesGuard,
    ConfirmRestorePasswordGuard,
    TranslateService,
    PhoneNumberTreatPipe
  ]
})
export class UbsOrderModule {}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/ubs/', '.json');
}
