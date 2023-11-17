import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateEditEventsComponent } from './components/create-edit-events/create-edit-events.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { EventsListComponent } from './components/events-list/events-list.component';
import { EventsComponent } from './events.component';
import { AuthPageGuardService } from '@global-service/route-guards/auth-page-guard.service';

const routes: Routes = [
  {
    path: '',
    component: EventsComponent,
    children: [
      {
        path: 'preview',
        component: EventDetailsComponent
      },
      {
        path: '',
        component: EventsListComponent
      },
      {
        path: 'create-event',
        component: CreateEditEventsComponent,
        canActivate: [AuthPageGuardService]
      },

      {
        path: ':id',
        component: EventDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule {}
