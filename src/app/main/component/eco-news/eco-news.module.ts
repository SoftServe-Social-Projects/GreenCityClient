import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { EcoNewsRoutingModule } from './eco-news-routing.module';
import { SharedModule } from '@shared/shared.module';
import {
  CreateEditNewsComponent,
  EcoNewsDetailComponent,
  EcoNewsWidgetComponent,
  NewsListComponent,
  ChangeViewButtonComponent,
  NewsListGalleryViewComponent,
  NewsListListViewComponent,
  NewsPreviewPageComponent,
  PostNewsLoaderComponent,
  RemainingCountComponent,
} from './components';
import { CommentsModule } from '../comments/comments.module';
import { MatSnackBarComponent } from '../errors/mat-snack-bar/mat-snack-bar.component';
import { EcoNewsComponent } from './eco-news.component';
import { ACTION_CONFIG, ACTION_TOKEN } from './components/create-edit-news/action.constants';

@NgModule({
  declarations: [
    EcoNewsComponent,
    ChangeViewButtonComponent,
    NewsListGalleryViewComponent,
    NewsListListViewComponent,
    NewsListComponent,
    RemainingCountComponent,
    EcoNewsWidgetComponent,
    EcoNewsDetailComponent,
    NewsPreviewPageComponent,
    PostNewsLoaderComponent,
    MatSnackBarComponent,
    CreateEditNewsComponent,
  ],
  imports: [
    CommonModule,
    CommentsModule,
    SharedModule,
    InfiniteScrollModule,
    EcoNewsRoutingModule,
    ImageCropperModule,
    MatSnackBarModule,
    CommentsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
      isolate: true,
    }),
  ],
  exports: [TranslateModule],
  entryComponents: [],
  providers: [MatSnackBarComponent, { provide: ACTION_TOKEN, useValue: ACTION_CONFIG }],
})
export class EcoNewsModule {}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
