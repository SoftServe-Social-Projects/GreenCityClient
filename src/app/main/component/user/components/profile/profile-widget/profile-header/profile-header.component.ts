import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { EditProfileModel, UserLocationDto } from '@user-models/edit-profile.model';
import { ProfileStatistics } from '@global-user/models/profile-statistiscs';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ProfileService } from '../../profile-service/profile.service';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { UserOnlineStatusService } from '@global-user/services/user-online-status.service';
import { UserDataAsFriend, UsersCategOnlineStatus } from '@global-user/models/friend.model';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { ProfilePrivacyPolicy } from '@global-user/models/edit-profile-const';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss']
})
export class ProfileHeaderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject();
  mockedUserInfo = {
    city: '',
    status: 'online',
    rating: 0,
    userCredo: 'User credo'
  };
  socialNetworksList = ['facebook', 'instagram', 'linked', 'twitter', 'green-city', 'x'];
  userSocialNetworks: Array<any>;
  userId: number;
  profileUserId: number;
  private isCurrentUserProfile: boolean;
  icons: Record<string, string> = {};
  private userId$: Subscription;
  userAsFriend: UserDataAsFriend;

  @Input() public progress: ProfileStatistics;
  @Input() public userInfo: EditProfileModel;
  showEditButton: boolean;

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly route: ActivatedRoute,
    private readonly profileService: ProfileService,
    private readonly langService: LanguageService,
    private readonly userOnlineStatusService: UserOnlineStatusService,
    private readonly userFriendsService: UserFriendsService
  ) {}

  ngOnInit() {
    this.setupUserDetails();
    this.buildSocialNetworksChart();
    this.checkEditButtonVisibility();
    this.icons = this.profileService.icons;
  }

  private setupUserDetails() {
    this.userId$ = this.localStorageService.userIdBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((userId) => {
      this.userId = userId;
      this.profileUserId = +this.route.snapshot.params.userId;
      this.isCurrentUserProfile = !this.profileUserId || this.profileUserId === this.userId;

      this.handleUserOnlineStatus();
      this.fetchUserDataAsFriend();
    });
  }

  private checkEditButtonVisibility() {
    this.showEditButton = this.route.snapshot.params.userName === this.userInfo.name;
  }

  private handleUserOnlineStatus() {
    if (!this.isCurrentUserProfile) {
      this.userOnlineStatusService.addUsersId(UsersCategOnlineStatus.profile, [+this.route.snapshot.params.userId]);
    }
  }

  private fetchUserDataAsFriend() {
    if (this.profileUserId) {
      this.userFriendsService
        .getUserDataAsFriend(this.profileUserId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.userAsFriend = data;
        });
    }
  }

  checkIsOnline(): boolean {
    return this.isCurrentUserProfile || this.userOnlineStatusService.checkIsOnline(this.profileUserId);
  }

  get checkUserCredo(): number {
    if (this.userInfo?.userCredo) {
      return this.userInfo.userCredo.length;
    }
    return 0;
  }

  getSocialImage(socialNetwork: string): string {
    return this.profileService.getSocialImage(socialNetwork);
  }

  getUserCity(locationDto: UserLocationDto): string {
    if (locationDto) {
      const city = this.langService.getLangValue(locationDto?.cityUa, locationDto?.cityEn);
      const country = this.langService.getLangValue(locationDto?.countryUa, locationDto?.countryEn);
      return locationDto.cityUa && locationDto.cityEn ? `${city}, ${country}` : '';
    }
    return '';
  }

  private findNetwork(networkLink) {
    return this.socialNetworksList.reduce((result, current) => {
      if (networkLink.includes(current)) {
        result = current;
      }
      return result;
    }, 'green-city');
  }

  private buildSocialNetworksChart() {
    this.userSocialNetworks = this.userInfo.socialNetworks.map((item) => ({
      link: item.url,
      name: this.findNetwork(item.url)
    }));
  }

  isContentVisible(privacySetting: ProfilePrivacyPolicy): boolean {
    return this.profileService.isContentVisible(privacySetting, this.isCurrentUserProfile, this.userAsFriend);
  }

  ngOnDestroy() {
    this.userOnlineStatusService.removeUsersId(UsersCategOnlineStatus.profile);
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
