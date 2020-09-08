import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatButtonModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatSliderModule,
  MatTreeModule
} from '@angular/material';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { AuthServiceConfig, SocialLoginModule } from 'angularx-social-login';
import { NgFlashMessagesModule } from 'ng-flash-messages';
// tslint:disable-next-line:max-line-length
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { provideConfig } from './config/GoogleAuthConfig';
import { environment } from '../environments/environment';
import { reducers } from './store/app.reducers';
import { ProposeCafeComponent } from './component/core/components/propose-cafe/propose-cafe.component';
import { AdminModule } from './component/admin/admin.module';
import { RestoreComponent } from './component/auth/components/restore/restore.component';
import { InterceptorService } from './service/interceptors/interceptor.service';
import { CoreModule } from './component/core/core.module';
import { AuthModule } from './component/auth/auth.module';
import { HomeModule } from './component/home/home.module';
import { LayoutModule } from './component/layout/layout.module';
import { CancelPopUpComponent } from './component/shared/components/cancel-pop-up/cancel-pop-up.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ErrorComponent } from './component/errors/error/error.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent
  ],
  imports: [
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    LayoutModule,
    MatDialogModule,
    AuthModule,
    CoreModule,
    HomeModule,
    InfiniteScrollModule,
    HttpClientModule,
    SocialLoginModule,
    FormsModule,
    AdminModule,
    NgFlashMessagesModule.forRoot(),
    ReactiveFormsModule,
    MatSliderModule,
    MatTreeModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    MatSelectModule,
    MatRadioModule,
    DragDropModule,
    NgxPaginationModule,
    MatSnackBarModule
  ],
  entryComponents: [
    ProposeCafeComponent,
    RestoreComponent,
    CancelPopUpComponent,
    ErrorComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
    { provide: MatDialogRef, useValue: {} },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { hasBackdrop: false }
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
