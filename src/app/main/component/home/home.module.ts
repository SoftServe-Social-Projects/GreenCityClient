import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { SharedMainModule } from '@shared/shared-main.module';
import { HomepageComponent, EcoEventsComponent, StatRowComponent, StatRowsComponent, SubscribeComponent } from './components';
import { EcoEventsItemComponent } from './components/eco-events/eco-events-item/eco-events-item.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnsubscribeComponent } from './components/unsubscribe/unsubscribe.component';

@NgModule({
  declarations: [
    HomepageComponent,
    EcoEventsComponent,
    StatRowComponent,
    StatRowsComponent,
    SubscribeComponent,
    EcoEventsItemComponent,
    UnsubscribeComponent
  ],
  imports: [CommonModule, CoreModule, SharedMainModule, SharedModule],
  exports: [HomepageComponent, EcoEventsComponent, StatRowComponent, StatRowsComponent, SubscribeComponent, EcoEventsItemComponent],
  providers: []
})
export class HomeModule {}
