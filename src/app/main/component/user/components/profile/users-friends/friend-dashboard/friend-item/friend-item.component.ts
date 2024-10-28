import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FriendModel, UserDashboardTab, UserDataAsFriend } from '@global-user/models/friend.model';
import { SocketService } from 'src/app/chat/service/socket/socket.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { UserLocationDto } from '@global-user/models/edit-profile.model';
import { Subject } from 'rxjs';
import { UserOnlineStatusService } from '@global-user/services/user-online-status.service';

@Component({
  selector: 'app-friend-item',
  templateUrl: './friend-item.component.html',
  styleUrls: ['./friend-item.component.scss']
})
export class FriendItemComponent implements OnInit {
  private destroy$ = new Subject();
  currentLang: string;
  userId: number;
  currentUserId: number;
  userDataAsFriend: UserDataAsFriend;

  @Input() friend: FriendModel;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private langService: LanguageService,
    private userOnlineStatusService: UserOnlineStatusService,
    private socketService: SocketService
  ) {
    this.userId = +this.route.snapshot.params.userId;
  }

  ngOnInit() {
    const { id, friendStatus, requesterId, chatId } = this.friend;
    this.userDataAsFriend = { id, friendStatus, requesterId, chatId };
    this.socketService.updateFriendsChatsStream$.subscribe((chatInfo) => {
      if (this.friend.id === chatInfo.friendId) {
        this.friend.chatId = chatInfo.chatId;
        this.userDataAsFriend.chatId = chatInfo.chatId;
      }
    });
    this.localStorageService.userIdBehaviourSubject.subscribe((id) => {
      this.currentUserId = id;
    });
    this.getLangChange();
  }

  private getLangChange(): void {
    this.localStorageService.languageBehaviourSubject.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  private toUsersInfo(tab = UserDashboardTab.allHabits): void {
    if (this.currentUserId === this.friend.id) {
      this.router.navigate(['profile', this.currentUserId], {
        queryParams: { tab }
      });
      return;
    }
    if (this.userId) {
      this.router.navigate(['profile', this.currentUserId, 'users', this.friend.name, this.friend.id], {
        queryParams: { tab }
      });
    }

    if (!this.userId) {
      this.router.navigate([this.friend.name, this.friend.id], { relativeTo: this.route, queryParams: { tab } });
    }
  }

  clickHandler(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'BUTTON') {
      target.classList.contains('friend-mutual-link') ? this.toUsersInfo(UserDashboardTab.mutualFriends) : this.toUsersInfo();
    }
  }

  getFriendCity(locationDto: UserLocationDto): string {
    return this.langService.getLangValue(locationDto?.cityUa, locationDto?.cityEn);
  }

  checkIsOnline(friendId: number): boolean {
    return this.userOnlineStatusService.checkIsOnline(friendId);
  }
}
