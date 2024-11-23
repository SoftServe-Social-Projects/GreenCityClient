import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedMainModule } from '@shared/shared-main.module';
import { IMaskModule } from 'angular-imask';
import { RatingModule } from 'ngx-bootstrap/rating';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxPaginationModule } from 'ngx-pagination';
import { QuillModule } from 'ngx-quill';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommentsModule } from '../comments/comments.module';
import { CommentsService } from '../comments/services/comments.service';
import { EventsListComponent } from './components';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { EventScheduleOverlayComponent } from './components/event-details/event-schedule-overlay/event-schedule-overlay.component';
import { EventScheduleComponent } from './components/event-details/event-schedule/event-schedule.component';
import { ImagesSliderComponent } from './components/event-details/images-slider/images-slider.component';
import { DateTimeComponent } from './components/event-editor/components/create-event-dates/date-time/date-time.component';
import { PlaceOnlineComponent } from './components/event-editor/components/create-event-dates/place-online/place-online.component';
import { ImagesContainerComponent } from './components/event-editor/components/create-event-information/components/images-container/images-container.component';
import { CreateEventInformationComponent } from './components/event-editor/components/create-event-information/create-event-information.component';
import { EventEditorComponent } from './components/event-editor/event-editor.component';
import { MapEventComponent } from './components/map-event/map-event.component';
import { UpdateEventComponent } from './components/update-event/update-event.component';
import { EventsRoutingModule } from './events-routing.module';
import { EventsComponent } from './events.component';
import { EventStoreService } from './services/event-store.service';
import { EventsCommentsService } from './services/events-comments.service';

@NgModule({
  declarations: [
    EventsComponent,
    EventsListComponent,
    EventEditorComponent,
    PlaceOnlineComponent,
    MapEventComponent,
    ImagesContainerComponent,
    EventDetailsComponent,
    ImagesSliderComponent,
    EventScheduleOverlayComponent,
    EventScheduleComponent,
    CreateEventInformationComponent,
    DateTimeComponent,
    UpdateEventComponent
  ],
  imports: [
    MatDialogModule,
    RatingModule.forRoot(),
    ReactiveFormsModule,
    CommonModule,
    EventsRoutingModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatGridListModule,
    NgxPaginationModule,
    GoogleMapsModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatSelectModule,
    SharedMainModule,
    IMaskModule,
    SharedModule,
    InfiniteScrollModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    QuillModule.forRoot(),
    MatMenuModule,
    DragDropModule,
    MatBottomSheetModule,
    NgbDropdownModule,
    MatIconModule,
    MatDividerModule,
    CommentsModule,
    MatChipsModule
  ],
  providers: [{ provide: CommentsService, useClass: EventsCommentsService }, EventStoreService],
  exports: [TranslateModule]
})
export class EventsModule {}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
