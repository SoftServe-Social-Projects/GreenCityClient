import { AppRoutingModule } from 'src/app/app-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedMainModule } from '../shared/shared-main.module';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    SharedMainModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    NgSelectModule,

    NgxPageScrollModule
  ],
  exports: [
    NgxPageScrollModule,
    CommonModule,
    TranslateModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    NgSelectModule
  ],
  providers: []
})
export class CoreModule {}
