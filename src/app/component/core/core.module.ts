import { NgModule } from '@angular/core';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { LowerNavBarComponent } from './lower-nav-bar/lower-nav-bar.component';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProposeCafeComponent } from './propose-cafe/propose-cafe.component';
import { ModalComponent } from './_modal/modal.component';
import { AgmCoreModule } from '@agm/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { MatCheckboxModule, MatDialogModule, MatCardModule } from '@angular/material';
import { PhotoUploadComponent } from './photo-upload/photo-upload.component';
import { FileUploadModule } from 'ng2-file-upload';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { HeaderNewComponent } from './header-new/header-new.component';
import { SearchPopupComponent } from './search-popup/search-popup.component';
import { SearchItemComponent } from './search-popup/search-item/search-item.component';
import { SearchNotFoundComponent } from './search-popup/search-not-found/search-not-found.component';
import { SearchAllResultsComponent } from './search-all-results/search-all-results.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
  declarations: [
    NavBarComponent,
    ProposeCafeComponent,
    ModalComponent,
    PhotoUploadComponent,
    LowerNavBarComponent,
    HeaderNewComponent,
    SearchPopupComponent,
    SearchItemComponent,
    SearchNotFoundComponent,
    SearchAllResultsComponent
  ],
  imports: [
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyC7q2v0VgRy60dAoItfv3IJhfJQEEoeqCI',
      libraries: ['places', 'geometry']
    }),
    NgSelectModule,
    MDBBootstrapModule,
    MatCheckboxModule,
    MatDialogModule,
    FileUploadModule,
    MatCardModule,
    NgxPageScrollModule,
    InfiniteScrollModule
  ],
  exports: [
    NavBarComponent,
    ProposeCafeComponent,
    ModalComponent,
    PhotoUploadComponent,
    LowerNavBarComponent,
    HeaderNewComponent,
    CommonModule,
    TranslateModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule,
    NgSelectModule,
    MDBBootstrapModule,
    MatCheckboxModule,
    MatDialogModule,
    FileUploadModule,
    MatCardModule,
    NgxPageScrollModule,
    SearchPopupComponent
  ],
  providers: []
})

export class CoreModule {}

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(
    httpClient,
    './assets/i18n/',
    '.json'
  );
}
