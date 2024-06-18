import { Injectable, OnDestroy } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { SocketService } from '@global-service/socket/socket.service';
import { UserCateg, UserOnlineStatus, UsersCategOnlineStatus } from '@global-user/models/friend.model';
import { BehaviorSubject, Subject, interval, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserOnlineStatusService implements OnDestroy {
  private destroy$ = new Subject();
  usersToCheckOnlineStatus = {
    [UsersCategOnlineStatus.profile]: [],
    [UsersCategOnlineStatus.allFriends]: [],
    [UsersCategOnlineStatus.recommendedFriends]: [],
    [UsersCategOnlineStatus.friendsRequests]: [],
    [UsersCategOnlineStatus.usersFriends]: [],
    [UsersCategOnlineStatus.mutualFriends]: []
  };
  private timeInterval = 60000;
  timer$ = interval(this.timeInterval);
  usersIdToCheck$ = new BehaviorSubject({});
  usersOnlineStatus$: BehaviorSubject<UserOnlineStatus[]> = new BehaviorSubject([]);
  private userId: number;

  constructor(
    private localStorageService: LocalStorageService,
    private socketService: SocketService
  ) {
    this.socketService.initiateConnection(this.socketService.connection.greenCityUser);
    this.localStorageService.userIdBehaviourSubject.subscribe((userId) => {
      this.userId = userId;
      this.subscribeToSocketResponse();
      this.sendRequestMessage();
    });
  }

  sendRequestMessage(): void {
    merge(this.timer$, this.usersIdToCheck$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const usersIdArray = Object.values(this.usersToCheckOnlineStatus).flat();
        const uniqueIdSet = [...new Set(usersIdArray)];
        if (uniqueIdSet.length) {
          this.socketService.send(this.socketService.connection.greenCityUser, `/app/usersOnlineStatus`, {
            currentUserId: this.userId,
            usersId: uniqueIdSet
          });
        }
      });
  }
  subscribeToSocketResponse(): void {
    this.socketService
      .onMessage(this.socketService.connection.greenCityUser, `/topic/${this.userId}/usersOnlineStatus`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: UserOnlineStatus[]) => {
        this.usersOnlineStatus$.next(res);
      });
  }
  checkIsOnline(friendId: number): boolean {
    const usersOnlineStatus = this.usersOnlineStatus$.getValue();
    const user = usersOnlineStatus.find((el) => el.id === friendId);
    return user ? user.onlineStatus : false;
  }

  addUsersId(type: UserCateg, value: Array<number>): void {
    this.usersToCheckOnlineStatus[type] = [...new Set([...this.usersToCheckOnlineStatus[type], ...value])];
    this.usersIdToCheck$.next(this.usersToCheckOnlineStatus);
  }

  removeUsersId(type: UserCateg): void {
    this.usersToCheckOnlineStatus[type] = [];
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
