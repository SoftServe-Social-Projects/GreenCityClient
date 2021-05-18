import { UserSharedModule } from '../user/components/shared/user-shared.module';
import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { FileUploadModule } from 'ng2-file-upload';
import { MatCardModule, MatTooltipModule } from '@angular/material';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { WarningPopUpComponent, PhotoUploadComponent, EditPhotoPopUpComponent } from './components';
import { MatDialogModule } from '@angular/material';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DragAndDropDirective } from '../eco-news/directives/drag-and-drop.directive';
import { DragAndDropComponent } from './components/drag-and-drop/drag-and-drop.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { DateLocalisationPipe } from '@pipe/date-localisation-pipe/date-localisation.pipe';
import { NoDataComponent } from './components/no-data/no-data.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { TagFilterComponent } from './components/tag-filter/tag-filter.component';
import { CalendarBaseComponent } from '@shared/components';
import usLocale from '@angular/common/locales/en-US-POSIX';
import ruLocale from '@angular/common/locales/ru';
import ukLocale from '@angular/common/locales/uk';
import { FormBaseComponent } from './components/form-base/form-base.component';
import { HabitsPopupComponent } from '@global-user/components/profile/calendar/habits-popup/habits-popup.component';

registerLocaleData(usLocale, 'en');
registerLocaleData(ruLocale, 'ru');
registerLocaleData(ukLocale, 'ua');

@NgModule({
  declarations: [
    PhotoUploadComponent,
    DragAndDropDirective,
    DragAndDropComponent,
    EditPhotoPopUpComponent,
    DateLocalisationPipe,
    NoDataComponent,
    SpinnerComponent,
    TagFilterComponent,
    CalendarBaseComponent,
    WarningPopUpComponent,
    FormBaseComponent,
    HabitsPopupComponent,
  ],
  imports: [
    ImageCropperModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    MDBBootstrapModule,
    FileUploadModule,
    MatCardModule,
    MatDialogModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    UserSharedModule,
    MatTooltipModule,
  ],
  exports: [
    EditPhotoPopUpComponent,
    TranslateModule,
    PhotoUploadComponent,
    FormsModule,
    ReactiveFormsModule,
    MDBBootstrapModule,
    FileUploadModule,
    MatCardModule,
    MatDialogModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DragAndDropDirective,
    DragAndDropComponent,
    DateLocalisationPipe,
    NoDataComponent,
    SpinnerComponent,
    TagFilterComponent,
    UserSharedModule,
    WarningPopUpComponent,
    FormBaseComponent,
  ],
  providers: [MatSnackBarComponent, TranslateService],
  entryComponents: [WarningPopUpComponent, HabitsPopupComponent],
})
export class SharedModule {}

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}
