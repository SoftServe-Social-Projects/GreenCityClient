import { HabitsGalleryViewComponent } from './components/habits-gallery-view/habits-gallery-view.component';
import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { UserProfileImageComponent } from './components/user-profile-image/user-profile-image.component';
import { HoverTextComponent } from './components/hover-text/hover-text.component';

@NgModule({
  declarations: [HabitsGalleryViewComponent, UserProfileImageComponent, HoverTextComponent],
  imports: [
    CommonModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MDBBootstrapModule
  ],
  exports: [TranslateModule, MDBBootstrapModule, HabitsGalleryViewComponent, UserProfileImageComponent, HoverTextComponent]
})
export class UserSharedModule {}

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}
