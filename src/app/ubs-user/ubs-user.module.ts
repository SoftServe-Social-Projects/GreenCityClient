import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { UbsUserOrdersListComponent } from '../ubs-user/ubs-user-orders-list/ubs-user-orders-list.component';
import { UbsUserOrderDetailsComponent } from '../ubs-user/ubs-user-order-details/ubs-user-order-details.component';
import { UbsUserOrdersComponent } from '../ubs-user/ubs-user-orders/ubs-user-orders.component';
import { UbsUserRoutingModule } from './ubs-user-routing.module';
import { UbsUserComponent } from './ubs-user.component';
import { UbsUserSidebarComponent } from './ubs-user-sidebar/ubs-user-sidebar.component';

@NgModule({
  declarations: [
    UbsUserSidebarComponent,
    UbsUserComponent,
    UbsUserOrderDetailsComponent,
    UbsUserOrdersComponent,
    UbsUserOrdersListComponent
  ],
  imports: [
    CommonModule,
    UbsUserRoutingModule,
    SharedModule,
    MatTabsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoaderUbsUser,
        deps: [HttpClient]
      },
      isolate: true
    })
  ]
})
export class UbsUserModule {}

export function createTranslateLoaderUbsUser(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/ubs-admin/', '.json');
}
