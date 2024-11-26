import { UserSharedModule } from './components/shared/user-shared.module';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ButtonComponent,
  HabitTrackersComponent,
  HabitTrackerComponent,
  AdviceComponent,
  HabitChartComponent,
  HabitEstimationComponent,
  DayEstimationComponent,
  HabitItemComponent,
  HabitItemListComponent,
  HabitFactComponent,
  HabitTitleComponent,
  HabitTrackerDateComponent,
  UserLogComponent,
  ProfileComponent,
  CalendarComponent,
  EcoPlacesComponent,
  ProfileCardsComponent,
  ProfileDashboardComponent,
  OneHabitComponent,
  ProfileWidgetComponent,
  ProfileHeaderComponent,
  ProfileProgressComponent,
  UserSettingComponent,
  EditProfileComponent,
  PersonalPhotoComponent,
  SocialNetworksComponent,
  ToDoListComponent
} from './components';
import { ShowFirstNLettersPipe } from '@pipe/show-first-n-letters/show-first-n-letters.pipe';
import { ShowFirstNPipe } from '@pipe/show-first-n-pipe/show-first-n.pipe';
import { UncheckedFirstPipe } from '@pipe/unchecked-first-pipe/unchecked-first.pipe';
import { AlphabeticalPipePipe } from '@pipe/alphabetical-pipe/alphabetical-pipe.pipe';
import { SharedMainModule } from '@shared/shared-main.module';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { FirstStringWordPipe } from '@pipe/first-string-word/first-string-word.pipe';
import { CalendarWeekComponent } from './components/profile/calendar/calendar-week/calendar-week.component';
import { AllHabitsComponent } from './components/habit/all-habits/all-habits.component';
import { HabitsListViewComponent } from './components/habit/all-habits/components/habits-list-view/habits-list-view.component';
import { EditProfileFormBuilder } from '@global-user/components/profile/edit-profile/edit-profile-form-builder';
import { UsersFriendsComponent } from './components/profile/users-friends/users-friends.component';
import { UsersAchievementsComponent } from './components/profile/users-achievements/users-achievements.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HabitProgressComponent } from './components/habit/add-new-habit/habit-progress/habit-progress.component';
import { HabitInviteFriendsComponent } from './components/habit/add-new-habit/habit-invite-friends/habit-invite-friends.component';
import { HabitDurationComponent } from './components/habit/add-new-habit/habit-duration/habit-duration.component';
import { HabitEditToDoListComponent } from './components/habit/add-new-habit/habit-edit-to-do-list/habit-edit-to-do-list.component';
import { AddNewHabitComponent } from './components/habit/add-new-habit/add-new-habit.component';
import { GradientDirective } from './components/habit/add-new-habit/habit-duration/gradient.directive';
import { FriendDashboardComponent } from './components/profile/users-friends/friend-dashboard/friend-dashboard.component';
import { AllFriendsComponent } from './components/profile/users-friends/friend-dashboard/all-friends/all-friends.component';
import { RecommendedFriendsComponent } from './components/profile/users-friends/friend-dashboard/recommended-friends/recommended-friends.component';
import { FriendItemComponent } from './components/profile/users-friends/friend-dashboard/friend-item/friend-item.component';
import { FriendRequestsComponent } from './components/profile/users-friends/friend-dashboard/friend-requests/friend-requests.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HabitInviteFriendsPopUpComponent } from './components/habit/add-new-habit/habit-invite-friends/habit-invite-friends-pop-up/habit-invite-friends-pop-up.component';
import { MatTabsModule } from '@angular/material/tabs';
import { OneNewsComponent } from './components/profile/profile-dashboard/one-news/one-news.component';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { FriendProfilePageComponent } from './components/profile/users-friends/friend-dashboard/friend-profile-page/friend-profile-page.component';
import { FriendProfileDashboardComponent } from './components/profile/users-friends/friend-dashboard/friend-profile-page/friend-profile-dashboard/friend-profile-dashboard.component';
import { SetCountComponent } from './components/profile/profile-dashboard/set-count/set-count.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { HabitsWidgetComponent } from './components/habit/add-new-habit/habits-widget/habits-widget.component';
import { AddEditCustomHabitComponent } from './components/habit/add-edit-custom-habit/add-edit-custom-habit.component';
import { QuillModule } from 'ngx-quill';
import { UserNotificationsComponent } from './components/profile/user-notifications/user-notifications.component';
import { UserNotificationsPopUpComponent } from './components/profile/user-notifications/user-notifications-pop-up/user-notifications-pop-up.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NotificContentReplaceDirective } from './directives/notific-content-replace.directive';
import { FriendshipButtonsComponent } from './components/profile/users-friends/friend-dashboard/friendship-buttons/friendship-buttons.component';
import { CommentsModule } from '../comments/comments.module';
import { CommentsService } from '../comments/services/comments.service';
import { HabitCommentsService } from '@global-service/habit-comments/habit-comments.service';
import { AchievementsModalComponent } from './components/profile/users-achievements/achievements-modal/achievements-modal.component';
import { AchievementItemComponent } from './components/profile/users-achievements/achievement-item/achievement-item.component';

@NgModule({
  declarations: [
    UserComponent,
    ProfileCardsComponent,
    ProfileDashboardComponent,
    OneHabitComponent,
    UserSettingComponent,
    ButtonComponent,
    UserLogComponent,
    HabitTrackersComponent,
    AdviceComponent,
    HabitChartComponent,
    HabitEstimationComponent,
    DayEstimationComponent,
    HabitItemComponent,
    HabitItemListComponent,
    HabitFactComponent,
    HabitTitleComponent,
    HabitTrackerDateComponent,
    HabitTrackerComponent,
    ShowFirstNLettersPipe,
    ShowFirstNPipe,
    UncheckedFirstPipe,
    FirstStringWordPipe,
    AlphabeticalPipePipe,
    ProfileWidgetComponent,
    ProfileHeaderComponent,
    ProfileProgressComponent,
    ProfileComponent,
    EcoPlacesComponent,
    ToDoListComponent,
    CalendarComponent,
    EditProfileComponent,
    PersonalPhotoComponent,
    SocialNetworksComponent,
    AllHabitsComponent,
    HabitsListViewComponent,
    CalendarWeekComponent,
    UsersFriendsComponent,
    UsersAchievementsComponent,
    AddNewHabitComponent,
    HabitProgressComponent,
    HabitInviteFriendsComponent,
    HabitDurationComponent,
    HabitEditToDoListComponent,
    GradientDirective,
    FriendDashboardComponent,
    AllFriendsComponent,
    RecommendedFriendsComponent,
    FriendItemComponent,
    FriendRequestsComponent,
    HabitInviteFriendsPopUpComponent,
    OneNewsComponent,
    FriendProfilePageComponent,
    FriendProfileDashboardComponent,
    SetCountComponent,
    HabitsWidgetComponent,
    AddEditCustomHabitComponent,
    UserNotificationsComponent,
    UserNotificationsPopUpComponent,
    NotificContentReplaceDirective,
    FriendshipButtonsComponent,
    AchievementsModalComponent,
    AchievementItemComponent
  ],
  imports: [
    NgbModule,
    MatIconModule,
    // GooglePlaceModule,
    UserRoutingModule,
    CommonModule,
    SharedMainModule,
    SharedModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatSliderModule,
    MatTooltipModule,
    DragDropModule,
    HttpClientModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    InfiniteScrollModule,
    UserSharedModule,
    MatTabsModule,
    NgxPaginationModule,
    QuillModule.forRoot(),
    FormsModule,
    CommentsModule
  ],
  exports: [MatAutocompleteModule],
  providers: [EditProfileFormBuilder, { provide: CommentsService, useClass: HabitCommentsService }]
})
export class UserModule {}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
