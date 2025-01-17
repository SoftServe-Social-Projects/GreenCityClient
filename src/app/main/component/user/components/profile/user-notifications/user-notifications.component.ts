import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { UserService } from '@global-service/user/user.service';
import {
  NotificationFilter,
  NotificationModel,
  NotificationCriteria,
  FilterCriteria,
  filterCriteriaOptions,
  notificationCriteriaOptions,
  projects
} from '@global-user/models/notification.model';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { UserNotificationService } from '@global-user/services/user-notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { NotificationBody, Notifications } from '@ubs/ubs-admin/models/ubs-user.model';
import { HttpParams } from '@angular/common/http';
import { formatNotificationDate } from './format-notification-date/format-notification-date';
import { HabitService } from '@global-service/habit/habit.service';

@Component({
  selector: 'app-user-notifications',
  templateUrl: './user-notifications.component.html',
  styleUrls: ['./user-notifications.component.scss']
})
export class UserNotificationsComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  currentLang: string;
  filterCriteria = FilterCriteria;
  filterCriteriaOptions = filterCriteriaOptions;
  notificationCriteriaOptions = notificationCriteriaOptions;
  projects = projects;
  notificationFriendRequest = NotificationCriteria.FRIEND_REQUEST_RECEIVED;
  notificationHabitInvitation = NotificationCriteria.HABIT_INVITATION;

  notifications: NotificationModel[] = [];
  currentPage = 0;
  itemsPerPage = 10;
  hasNextPage: boolean;
  filterChangeSubs$: Subject<{ type: NotificationFilter; approach: string }> = new Subject();
  isFilterDisabled: boolean;
  isLoading = true;
  private filterAll = 'All';

  constructor(
    private readonly localStorageService: LocalStorageService,
    public readonly translate: TranslateService,
    private readonly userNotificationService: UserNotificationService,
    private readonly matSnackBar: MatSnackBarComponent,
    private readonly userFriendsService: UserFriendsService,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly habitService: HabitService
  ) {}

  ngOnInit() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((lang) => {
      this.currentLang = lang;
      this.translate.use(lang);
    });
    this.filterChangeSubs$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {
      this.notifications = [];
      this.currentPage = 0;
      this.hasNextPage = false;
      this.isLoading = true;
      this.getNotification(this.currentPage);
    });
    this.getNotification(this.currentPage);
  }

  changeFilterApproach(approach: string, event: Event): void {
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter')) {
      this.filterCriteriaOptions.forEach((el) => (el.isSelected = el.name === approach));
      this.notifications = [];
      this.currentPage = 0;
      this.getNotification(this.currentPage);
    }
  }

  changeFilter(type: NotificationFilter, approach: string, event: Event): void {
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter')) {
      this.filterChangeSubs$.next({ type, approach });
      const filterArr = approach === this.filterCriteria.TYPE ? notificationCriteriaOptions : projects;

      const notificationType = filterArr.find((el) => el.name === type.name);
      const notificationTypeAll = filterArr.find((el) => el.name === this.filterAll);

      const allSelected = filterArr.every((el) => el.isSelected);

      if (allSelected) {
        filterArr.forEach((el) => (el.isSelected = false));
        notificationType.isSelected = true;
      } else {
        notificationType.isSelected = !notificationType.isSelected;
      }

      if (notificationType.name === this.filterAll) {
        filterArr.forEach((el) => (el.isSelected = notificationType.isSelected));
      } else {
        notificationTypeAll.isSelected = filterArr.filter((el) => el.name !== this.filterAll).every((el) => el.isSelected);
      }
      const isTypeFiltered = this.getAllSelectedFilters(this.filterCriteria.TYPE).length !== notificationCriteriaOptions.length;
      const isProjectFiltered = this.getAllSelectedFilters(this.filterCriteria.TYPE).length !== projects.length;
      this.isFilterDisabled = !this.notifications.length && !isTypeFiltered && isProjectFiltered;
    }
  }

  checkSelectedFilter(approachType: string): boolean {
    return filterCriteriaOptions.find((el) => el.name === approachType).isSelected;
  }

  /* prettier-ignore */
  private getAllSelectedFilters(approach: string): NotificationFilter[] {
    const filterArr = approach === this.filterCriteria.TYPE ? notificationCriteriaOptions : projects;
    const allOption = filterArr.find((el) => el.name === this.filterAll);
    return allOption.isSelected ? [] : [...filterArr.filter((el) => { return el.isSelected === true && el.name !== this.filterAll; })];
  }

  getNotification(page: number): void {
    let filtersSelected = {
      projectName: [],
      notificationType: []
    };
    const selectedApproach = filterCriteriaOptions.find((el) => el.isSelected)?.name;

    if (selectedApproach === this.filterCriteria.TYPE) {
      filtersSelected = {
        notificationType: this.getAllSelectedFilters(this.filterCriteria.TYPE)
          .map((el) => (el.filterArr?.length ? el.filterArr : el.name))
          .flat(),
        projectName: []
      };
    } else if (selectedApproach === this.filterCriteria.ORIGIN) {
      filtersSelected = {
        projectName: this.getAllSelectedFilters(this.filterCriteria.ORIGIN).map((el) => el.name),
        notificationType: []
      };
    }

    if (filtersSelected.projectName.includes('PICKUP')) {
      this.fetchUBSNotifications(page);
    } else if (filtersSelected.projectName.includes('GREENCITY')) {
      this.fetchAllNotifications(page, filtersSelected);
    } else {
      !filtersSelected.notificationType.length && this.fetchUBSNotifications(page);
      this.fetchAllNotifications(page, filtersSelected);
    }
  }

  private fetchUBSNotifications(page: number): void {
    const params = new HttpParams().set('lang', 'en').set('page', page.toString()).set('size', this.itemsPerPage.toString());
    this.userNotificationService
      .getUBSNotification(params)
      .pipe(take(1))
      .subscribe((data: Notifications) => {
        this.notifications = [...this.notifications, ...data.page.map(this.mapNotificationBodyToModel)];
        this.currentPage = data.currentPage;
        this.isLoading = false;
      });
  }

  private fetchAllNotifications(page: number, filters: any): void {
    let params = new HttpParams().set('page', page.toString()).set('size', this.itemsPerPage.toString());

    if (filters && filters.projectName) {
      filters.projectName.forEach((project: string) => {
        params = params.append('project-name', project);
      });
    }

    if (filters && filters.notificationType) {
      filters.notificationType.forEach((type: string) => {
        params = params.append('notification-types', type);
      });
    }

    this.userNotificationService
      .getAllNotifications(params)
      .pipe(take(1))
      .subscribe((data) => {
        this.notifications = [...this.notifications, ...data.page];
        this.currentPage = data.currentPage;
        this.hasNextPage = data.hasNext;
        this.isLoading = false;
      });
  }

  mapNotificationBodyToModel(body: NotificationBody): NotificationModel {
    const parsedDate = new Date(body.notificationTime);
    const isValidDate = !isNaN(parsedDate.getTime());
    return {
      actionUserId: [],
      actionUserText: [],
      bodyText: body.body || '',
      message: body.body || '',
      notificationId: body.id,
      notificationType: '',
      projectName: 'PICKUP',
      secondMessage: '',
      secondMessageId: 0,
      targetId: body.orderId,
      time: isValidDate ? parsedDate : null,
      titleText: body.title,
      viewed: body.read
    };
  }

  readNotification(event: Event, notification: NotificationModel) {
    if ((event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter')) && !notification.viewed) {
      event.stopPropagation();
      this.userNotificationService
        .readNotification(notification.notificationId, notification.projectName === 'PICKUP')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.notifications.find((el) => el.notificationId === notification.notificationId).viewed = true;
        });
    }
  }

  unReadNotification(event: Event, notification: NotificationModel): void {
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter' && notification.viewed)) {
      event.stopPropagation();
      this.userNotificationService
        .unReadNotification(notification.notificationId, notification.projectName === 'PICKUP')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.notifications.filter((el) => el.notificationId === notification.notificationId)[0].viewed = false;
        });
    }
  }

  deleteNotification(event: Event, notification: NotificationModel): void {
    let isDeleted = false;
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter')) {
      this.readNotification(event, notification);
      event.stopPropagation();
      this.userNotificationService
        .deleteNotification(notification.notificationId, notification.projectName === 'PICKUP')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            isDeleted = true;
            this.notifications = this.notifications.filter((el) => el.notificationId !== notification.notificationId);
            if (this.notifications.length < this.itemsPerPage && this.hasNextPage) {
              this.getNotification(this.currentPage + 1);
            }
          },
          complete: () => {
            this.matSnackBar.openSnackBar(isDeleted ? 'deletedNotification' : 'error');
          }
        });
    }
  }

  onScroll(): void {
    this.isLoading = true;
    if (this.hasNextPage) {
      this.getNotification(this.currentPage + 1);
    }
  }

  isFriendRequest(notification: NotificationModel): boolean {
    return notification.notificationType === this.notificationFriendRequest;
  }

  isHabitInvitation(notification: NotificationModel): boolean {
    return notification.notificationType === this.notificationHabitInvitation;
  }

  acceptRequest(notification: NotificationModel): void {
    if (this.isFriendRequest(notification)) {
      this.handleFriendRequest(notification, 'accept');
    } else if (this.isHabitInvitation(notification)) {
      this.handleHabitInvitation(notification, 'accept');
    }
  }

  declineRequest(notification: NotificationModel): void {
    if (this.isFriendRequest(notification)) {
      this.handleFriendRequest(notification, 'decline');
    } else if (this.isHabitInvitation(notification)) {
      this.handleHabitInvitation(notification, 'decline');
    }
  }

  private handleFriendRequest(notification: NotificationModel, action: 'accept' | 'decline'): void {
    let isAccepted = true;

    const userId = notification.actionUserId[0];
    if (action === 'accept') {
      this.userFriendsService.acceptRequest(userId).subscribe({
        error: () => {
          isAccepted = false;
        },
        complete: () => {
          this.matSnackBar.openSnackBar(isAccepted ? 'friendRequestAccepted' : 'friendInValidRequest');
        }
      });
    } else {
      this.userFriendsService.declineRequest(userId).subscribe({
        error: () => {
          isAccepted = false;
        },
        complete: () => {
          this.matSnackBar.openSnackBar(isAccepted ? 'friendRequestDeclined' : 'friendInValidRequest');
        }
      });
    }
  }

  private handleHabitInvitation(notification: NotificationModel, action: 'accept' | 'decline'): void {
    let isAccepted = true;
    const invitationId = notification.secondMessageId;
    if (action === 'accept') {
      this.habitService.acceptHabitInvitation(invitationId).subscribe({
        error: () => {
          isAccepted = false;
        },
        complete: () => {
          this.matSnackBar.openSnackBar(isAccepted ? 'habitAcceptRequest' : 'habitAcceptInValidRequest');
        }
      });
    } else {
      this.habitService.declineHabitInvitation(invitationId).subscribe({
        error: () => {
          isAccepted = false;
        },
        complete: () => {
          this.matSnackBar.openSnackBar(isAccepted ? 'habitDeclineRequest' : 'habitDeclineInValidRequest');
        }
      });
    }
  }

  navigate(event: Event): void {
    const target = event.target as HTMLElement;
    const userId = this.userService.userId;
    const targetTextContent = target.textContent?.trim() || '';
    const targetUserId = Number(target.getAttribute('data-userId'));
    const notificationType = target.getAttribute('data-notificationType');
    const targetId = Number(target.getAttribute('data-targetId'));

    const isClickOrEnter = event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter');
    if (!isClickOrEnter) {
      return;
    }

    if (targetUserId === userId) {
      this.router.navigate(['profile', userId]);
      return;
    }
    if (targetUserId) {
      this.router.navigate(['profile', userId, 'users', targetTextContent, targetUserId]);
      return;
    }

    if (targetId && notificationType) {
      const routes = {
        EVENT: ['events', targetId],
        ECONEWS: ['news', targetId],
        HABIT: ['profile', userId, 'allhabits', 'addhabit', targetId]
      };

      for (const type in routes) {
        if (notificationType.includes(type)) {
          this.router.navigate(routes[type]);
          return;
        }
      }
    }
  }

  getFormattedNotificationTime(notification: NotificationModel): string {
    return formatNotificationDate(notification.time, this.translate);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
