import { AdminTableService } from './services/admin-table.service';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { UbsAdminTableComponent } from './components/ubs-admin-table/ubs-admin-table.component';
import { UbsAdminSidebarComponent } from './components/ubs-admin-sidebar/ubs-admin-sidebar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../material.module';
import { IMaskModule } from 'angular-imask';
import { SharedModule } from '../../shared/shared.module';
import { SharedMainModule } from '@shared/shared-main.module';
import { UbsAdminComponent } from './ubs-admin.component';
import { UbsAdminEmployeeComponent } from './components/ubs-admin-employee/ubs-admin-employee.component';
import { PaginationComponent } from './components/shared/components/pagination/pagination.component';
import { UbsAdminEmployeeEditFormComponent } from './components/ubs-admin-employee/ubs-admin-employee-edit-form/ubs-admin-employee-edit-form.component';
import { UBSAdminRoutingModule } from './ubs-admin-routing.module';
import { UbsAdminResponsiblePersonsComponent } from './components/ubs-admin-responsible-persons/ubs-admin-responsible-persons.component';
import { UbsAdminExportDetailsComponent } from './components/ubs-admin-export-details/ubs-admin-export-details.component';
import { UbsAdminOrderPaymentComponent } from './components/ubs-admin-order-payment/ubs-admin-order-payment.component';
import { UbsAdminOrderClientInfoComponent } from './components/ubs-admin-order-client-info/ubs-admin-order-client-info.component';
import { UbsAdminOrderDetailsFormComponent } from './components/ubs-admin-order-details-form/ubs-admin-order-details-form.component';
import { UbsAdminOrderStatusComponent } from './components/ubs-admin-order-status/ubs-admin-order-status.component';
import { UbsAdminOrderComponent } from './components/ubs-admin-order/ubs-admin-order.component';
import { UbsAdminAddressDetailsComponent } from './components/ubs-admin-address-details/ubs-admin-address-details.component';
import { InterceptorService } from '../../shared/interceptors/interceptor.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AddViolationsComponent } from './components/add-violations/add-violations.component';
import { UbsAdminCancelModalComponent } from './components/ubs-admin-cancel-modal/ubs-admin-cancel-modal.component';
import { UbsAdminGoBackModalComponent } from './components/ubs-admin-go-back-modal/ubs-admin-go-back-modal.component';
import { MatTabsModule } from '@angular/material/tabs';
import { UbsAdminTableExcelPopupComponent } from './components/ubs-admin-table/ubs-admin-table-excel-popup/ubs-admin-table-excel-popup.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TableCellReadonlyComponent } from './components/ubs-admin-table/table-cell-readonly/table-cell-readonly.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableCellSelectComponent } from './components/ubs-admin-table/table-cell-select/table-cell-select.component';
import { TableCellDateComponent } from './components/ubs-admin-table/table-cell-date/table-cell-date.component';
import { TableCellTimeComponent } from './components/ubs-admin-table/table-cell-time/table-cell-time.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UbsAdminCertificateComponent } from './components/ubs-admin-certificate/ubs-admin-certificate.component';
import { AdminCertificateService } from './services/admin-certificate.service';
import { UbsAdminCertificateAddCertificatePopUpComponent } from './components/ubs-admin-certificate/ubs-admin-certificate-add-certificate-pop-up/ubs-admin-certificate-add-certificate-pop-up.component';
import { UbsAdminCustomersComponent } from './components/ubs-admin-customers/ubs-admin-customers.component';
import { MatTableModule } from '@angular/material/table';
import { UbsAdminTariffsPricingPageComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-pricing-page/ubs-admin-tariffs-pricing-page.component';
import { UbsAdminTariffsAddTariffServicePopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-pricing-page/ubs-admin-tariffs-add-tariff-service-pop-up/ubs-admin-tariffs-add-tariff-service-pop-up.component';
import { UbsAdminTariffsLocationDashboardComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-location-dashboard.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UbsAdminTariffsDeletePopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-pricing-page/ubs-admin-tariffs-delete-pop-up/ubs-admin-tariffs-delete-pop-up.component';
import { UbsAdminTariffsAddServicePopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-pricing-page/ubs-admin-tariffs-add-service-pop-up/ubs-admin-tariffs-add-service-pop-up.component';
import { UbsAdminEmployeeTableComponent } from './components/ubs-admin-employee/ubs-admin-employee-table/ubs-admin-employee-table.component';
import { UbsAdminCustomerDetailsComponent } from './components/ubs-admin-customers/ubs-admin-customer-details/ubs-admin-customer-details.component';
import { UbsAdminOrderHistoryComponent } from './components/ubs-admin-order-history/ubs-admin-order-history.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { AgmCoreModule } from '@agm/core';
import { environment } from '@environment/environment';
import { MatDialogModule } from '@angular/material/dialog';
import { UbsAdminCustomerOrdersComponent } from './components/ubs-admin-customers/ubs-admin-customer-orders/ubs-admin-customer-orders.component';
import { AddOrderCancellationReasonComponent } from './components/add-order-cancellation-reason/add-order-cancellation-reason.component';
import { AddOrderNotTakenOutReasonComponent } from './components/add-order-not-taken-out-reason/add-order-not-taken-out-reason.component';
import { ResizeColumnDirective } from './derictives/resize-table-columns.directive';
import { AddPaymentComponent } from './components/add-payment/add-payment.component';
import { UbsAdminCustomerViolationsComponent } from './components/ubs-admin-customers/ubs-admin-customer-violations/ubs-admin-customer-violations/ubs-admin-customer-violations.component';
import { ModalTextComponent } from './components/shared/components/modal-text/modal-text.component';
import { DialogTariffComponent } from './components/shared/components/dialog-tariff/dialog-tariff.component';
import { UbsAdminTariffsLocationPopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-location-pop-up/ubs-admin-tariffs-location-pop-up.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ShowPdfPopUpComponent } from './components/shared/components/show-pdf-pop-up/show-pdf-pop-up.component';
import { UbsAdminSeveralOrdersPopUpComponent } from './components/ubs-admin-several-orders-pop-up/ubs-admin-several-orders-pop-up.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { ColumnFiltersPopUpComponent } from './components/shared/components/column-filters-pop-up/column-filters-pop-up.component';
import { UbsAdminTariffsCourierPopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-courier-pop-up/ubs-admin-tariffs-courier-pop-up.component';
import { UbsAdminTariffsStationPopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-station-pop-up/ubs-admin-tariffs-station-pop-up.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { TimePickerComponent } from './components/shared/components/time-picker/time-picker.component';
import { UbsAdminTariffsCardPopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-card-pop-up/ubs-admin-tariffs-card-pop-up.component';
import { TariffConfirmationPopUpComponent } from './components/shared/components/tariff-confirmation-pop-up/tariff-confirmation-pop-up.component';
import { TariffDeactivateConfirmationPopUpComponent } from './components/shared/components/tariff-deactivate-confirmation-pop-up/tariff-deactivate-confirmation-pop-up.component';
import { UbsAdminEmployeePermissionsFormComponent } from './components/ubs-admin-employee/ubs-admin-employee-permissions-form/ubs-admin-employee-permissions-form.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { TariffStatusPipe } from '@pipe/tariff-status-pipe/tariff-status.pipe';
import { UbsAdminTariffsDeactivatePopUpComponent } from './components/ubs-admin-tariffs/ubs-admin-tariffs-deactivate-pop-up/ubs-admin-tariffs-deactivate-pop-up.component';
import { UbsAdminNotificationListComponent } from './components/ubs-admin-notification-list/ubs-admin-notification-list.component';
import { UbsAdminNotificationComponent } from './components/ubs-admin-notification/ubs-admin-notification.component';
import { CronPickerComponent } from './components/shared/components/cron-picker/cron-picker.component';
import { EditPaymentConfirmationPopUpComponent } from './components/shared/components/edit-payment-confirmation-pop-up/edit-payment-confirmation-pop-up.component';
import { UbsAdminNotificationEditFormComponent } from './components/ubs-admin-notification/ubs-admin-notification-edit-form/ubs-admin-notification-edit-form.component';
import { UbsAdminNotificationSettingsComponent } from './components/ubs-admin-notification/ubs-admin-notification-settings/ubs-admin-notification-settings.component';
import { ConfirmationDialogComponent } from './components/shared/components/confirmation-dialog/confirmation-dialog.component';
import { TariffSelectorComponent } from './components/ubs-admin-employee/ubs-admin-employee-edit-form/tariff-selector/tariff-selector.component';
import { ClickOutsideDirective } from './derictives/clickOutside.directive';
import { MatMenuModule } from '@angular/material/menu';
import { ChatModule } from 'src/app/chat/chat.module';
import { UbsAdminConfirmStatusChangePopUpComponent } from './components/ubs-admin-confirm-status-change-pop-up/ubs-admin-confirm-status-change-pop-up.component';
import { CommentPopUpComponent } from './components/shared/components/comment-pop-up/comment-pop-up.component';
import { TableCellInputComponent } from './components/ubs-admin-table/table-cell-input/table-cell-input.component';

@NgModule({
  declarations: [
    PaginationComponent,
    UbsAdminTableComponent,
    UbsAdminTableExcelPopupComponent,
    UbsAdminSidebarComponent,
    UbsAdminComponent,
    UbsAdminEmployeeComponent,
    UbsAdminEmployeeEditFormComponent,
    UbsAdminOrderComponent,
    UbsAdminAddressDetailsComponent,
    UbsAdminOrderStatusComponent,
    UbsAdminResponsiblePersonsComponent,
    UbsAdminExportDetailsComponent,
    UbsAdminOrderPaymentComponent,
    UbsAdminOrderClientInfoComponent,
    UbsAdminOrderDetailsFormComponent,
    AddViolationsComponent,
    UbsAdminCancelModalComponent,
    UbsAdminGoBackModalComponent,
    TableCellReadonlyComponent,
    TableCellSelectComponent,
    TableCellDateComponent,
    TableCellTimeComponent,
    UbsAdminCertificateComponent,
    UbsAdminTariffsDeletePopUpComponent,
    UbsAdminTariffsAddServicePopUpComponent,
    UbsAdminCertificateAddCertificatePopUpComponent,
    UbsAdminCustomersComponent,
    UbsAdminTariffsPricingPageComponent,
    UbsAdminTariffsAddTariffServicePopUpComponent,
    UbsAdminTariffsLocationDashboardComponent,
    UbsAdminEmployeeTableComponent,
    UbsAdminCustomerDetailsComponent,
    UbsAdminCustomerOrdersComponent,
    UbsAdminOrderHistoryComponent,
    AddOrderCancellationReasonComponent,
    AddOrderNotTakenOutReasonComponent,
    ResizeColumnDirective,
    ClickOutsideDirective,
    AddPaymentComponent,
    UbsAdminCustomerViolationsComponent,
    ShowPdfPopUpComponent,
    ColumnFiltersPopUpComponent,
    ModalTextComponent,
    DialogTariffComponent,
    UbsAdminTariffsLocationPopUpComponent,
    ShowPdfPopUpComponent,
    UbsAdminSeveralOrdersPopUpComponent,
    UbsAdminTariffsCourierPopUpComponent,
    UbsAdminTariffsStationPopUpComponent,
    TimePickerComponent,
    UbsAdminTariffsCardPopUpComponent,
    TariffConfirmationPopUpComponent,
    TariffDeactivateConfirmationPopUpComponent,
    UbsAdminEmployeePermissionsFormComponent,
    TariffStatusPipe,
    UbsAdminTariffsDeactivatePopUpComponent,
    UbsAdminNotificationListComponent,
    UbsAdminNotificationComponent,
    CronPickerComponent,
    EditPaymentConfirmationPopUpComponent,
    UbsAdminNotificationEditFormComponent,
    UbsAdminNotificationSettingsComponent,
    ConfirmationDialogComponent,
    TariffSelectorComponent,
    UbsAdminConfirmStatusChangePopUpComponent,
    CommentPopUpComponent,
    TableCellInputComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    SharedMainModule,
    RouterModule,
    IMaskModule,
    HttpClientModule,
    UBSAdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    InfiniteScrollModule,
    MatTabsModule,
    MatTooltipModule,
    DragDropModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatNativeDateModule,
    MatTableModule,
    MatDialogModule,
    GooglePlaceModule,
    MatMenuModule,
    SharedMainModule,
    AgmCoreModule.forRoot({
      apiKey: environment.agmCoreModuleApiKey,
      libraries: ['places']
    }),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoaderUbs,
        deps: [HttpClient]
      },
      isolate: true
    }),
    TooltipModule,
    PdfViewerModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatSelectModule,
    MatExpansionModule,
    CdkAccordionModule,
    ChatModule
  ],
  providers: [
    AdminCertificateService,
    TranslateService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ],
  exports: [UbsAdminEmployeeComponent],
  entryComponents: [
    UbsAdminTableComponent,
    AddViolationsComponent,
    UbsAdminEmployeeEditFormComponent,
    UbsAdminCancelModalComponent,
    UbsAdminGoBackModalComponent
  ]
})
export class UbsAdminModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: UbsAdminModule,
      providers: [AdminTableService]
    };
  }
}

export function createTranslateLoaderUbs(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/ubs-admin/', '.json');
}
