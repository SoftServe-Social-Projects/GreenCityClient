import { Component, OnDestroy, OnInit } from '@angular/core';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { UserNotificationService } from '@global-user/services/user-notification.service';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NotificationFilter, NotificationModel, NotificationType } from '@global-user/models/notification.model';
import { FilterApproach } from '@global-user/models/notification.model';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { UserFriendsService } from '@global-user/services/user-friends.service';

@Component({
  selector: 'app-user-notifications',
  templateUrl: './user-notifications.component.html',
  styleUrls: ['./user-notifications.component.scss']
})
export class UserNotificationsComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  public currentLang: string;
  public filterApproach = FilterApproach;
  public notificationFriendRequest = NotificationType.FRIEND_REQUEST_RECEIVED;
  public filterApproaches = [
    { name: FilterApproach.ALL, isSelected: true, nameUa: 'Усі', nameEn: 'All' },
    { name: FilterApproach.TYPE, isSelected: false, nameUa: 'Типом', nameEn: 'Type' },
    { name: FilterApproach.ORIGIN, isSelected: false, nameUa: 'Джерелом', nameEn: 'Origin' }
  ];
  public notificationTypesFilter: NotificationFilter[] = [
    {
      name: 'All',
      nameEn: 'All',
      nameUa: 'Усі',
      isSelected: true
    },
    {
      name: NotificationType.COMMENT_LIKE,
      nameEn: 'Comment like',
      nameUa: 'Вподобання коментаря',
      filterArr: ['ECONEWS_COMMENT_LIKE', 'EVENT_COMMENT_LIKE'],
      isSelected: true
    },
    {
      name: NotificationType.COMMENT_REPLY,
      nameEn: 'Comment reply',
      nameUa: 'Відповідь на коментар',
      filterArr: ['ECONEWS_COMMENT_REPLY', 'EVENT_COMMENT_REPLY'],
      isSelected: true
    },
    { name: NotificationType.ECONEWS_LIKE, nameEn: ' News Like', nameUa: 'Вподобання новини', isSelected: true },
    { name: NotificationType.ECONEWS_CREATED, nameEn: ' News Created', nameUa: 'Створення новини', isSelected: true },
    { name: NotificationType.ECONEWS_COMMENT, nameEn: ' News Commented', nameUa: 'Коментарі новин', isSelected: true },
    { name: NotificationType.EVENT_CREATED, nameEn: 'Event created', nameUa: 'Створення події', isSelected: true },
    { name: NotificationType.EVENT_CANCELED, nameEn: 'Event canceled', nameUa: 'Скасування події', isSelected: true },
    { name: NotificationType.EVENT_UPDATED, nameEn: 'Event updated', nameUa: 'Зміни у подіях', isSelected: true },
    { name: NotificationType.EVENT_JOINED, nameEn: 'Event joined', nameUa: 'приєднання до події', isSelected: true },
    { name: NotificationType.EVENT_COMMENT, nameEn: 'Event commented', nameUa: 'Коментарі подій', isSelected: true },
    { name: NotificationType.FRIEND_REQUEST_RECEIVED, nameEn: 'Friend request received', nameUa: 'Нові запити дружити', isSelected: true },
    {
      name: NotificationType.FRIEND_REQUEST_ACCEPTED,
      nameEn: 'Friend request accepted',
      nameUa: 'Підтверджені запити дружити',
      isSelected: true
    }
  ];
  public projects: NotificationFilter[] = [
    { name: 'All', nameEn: 'All', nameUa: 'Усі', isSelected: true },
    { name: 'GREENCITY', nameEn: 'GreenCity', isSelected: false },
    { name: 'PICKUP', nameEn: 'Pick up', isSelected: false }
  ];

  public notifications: NotificationModel[] = [];
  public currentPage = 0;
  public itemsPerPage = 10;
  public hasNextPage: boolean;
  private filterChangeSubs$: Subject<{ type: NotificationFilter; approach: string }> = new Subject();
  public isFilterDisabled: boolean;

  public isLoading = true;
  public isSmallSpinnerVisible = false;
  private filterAll = 'All';
  public deleteIcon = 'assets/img/comments/delete.png';
  public markAsReadIcon = 'assets/img/comments/mark-read.svg';

  constructor(
    private languageService: LanguageService,
    private localStorageService: LocalStorageService,
    public translate: TranslateService,
    private userNotificationService: UserNotificationService,
    private matSnackBar: MatSnackBarComponent,
    private userFriendsService: UserFriendsService
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
      this.getNotification();
    });
    this.getNotification();
  }

  changefilterApproach(approach: string, event: Event): void {
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter')) {
      this.filterApproaches.forEach((el) => (el.isSelected = el.name === approach));
      if (approach === this.filterAll) {
        this.notificationTypesFilter.forEach((el) => (el.isSelected = true));
        this.projects.forEach((el) => (el.isSelected = true));
      }
    }
  }

  changeFilter(type: NotificationFilter, approach: string, event: Event): void {
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter')) {
      this.filterChangeSubs$.next({ type, approach });
      const filterArr = approach === this.filterApproach.TYPE ? this.notificationTypesFilter : this.projects;

      const notificationType = filterArr.find((el) => el.name === type.name);
      const notificationTypeAll = filterArr.find((el) => el.name === this.filterAll);
      notificationType.isSelected = !notificationType.isSelected;

      if (notificationType.name === this.filterAll) {
        filterArr.forEach((el) => (el.isSelected = notificationType.isSelected));
      } else {
        notificationTypeAll.isSelected = filterArr.filter((el) => el.name !== this.filterAll).every((el) => el.isSelected);
      }
      const isTypeFiltered = this.getAllSelectedFilters(this.filterApproach.TYPE).length !== this.notificationTypesFilter.length;
      const isProjectFiltered = this.getAllSelectedFilters(this.filterApproach.TYPE).length !== this.projects.length;
      this.isFilterDisabled = this.isLoading || (!this.notifications.length && !isTypeFiltered && isProjectFiltered);
    }
  }

  checkSelectedFilter(approachType: string): boolean {
    return this.filterApproaches.find((el) => el.name === approachType).isSelected;
  }

  private getAllSelectedFilters(approach: string): NotificationFilter[] {
    const filterArr = approach === this.filterApproach.TYPE ? this.notificationTypesFilter : this.projects;
    const allOption = filterArr.filter((el) => el.name === this.filterAll)[0];
    return allOption.isSelected
      ? []
      : [
          ...filterArr.filter((el) => {
            return el.isSelected === true && el.name !== this.filterAll;
          })
        ];
  }

  getNotification(page?: number): void {
    const filtersSelected = {
      projectName: this.getAllSelectedFilters(this.filterApproach.ORIGIN),
      notificationType: this.getAllSelectedFilters(this.filterApproach.TYPE)
    };
    this.userNotificationService
      .getAllNotification(page, this.itemsPerPage, filtersSelected)
      .pipe(take(1))
      .subscribe((data) => {
        this.notifications = [...this.notifications, ...data.page];
        this.currentPage = data.currentPage;
        this.hasNextPage = data.hasNext;

        this.isLoading = false;
      });
  }

  getLangValue(uaValue: string, enValue: string): string {
    return this.languageService.getLangValue(uaValue, enValue) as string;
  }

  readNotification(event: Event, notification: NotificationModel) {
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter')) {
      event.stopPropagation();
      if (!notification.viewed) {
        this.userNotificationService
          .readNotification(notification.notificationId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.notifications.filter((el) => el.notificationId === notification.notificationId)[0].viewed = true;
          });
      }
    }
  }

  unReadNotification(event: Event, notification: NotificationModel) {
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter')) {
      event.stopPropagation();
      if (notification.viewed) {
        this.userNotificationService
          .unReadNotification(notification.notificationId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.notifications.filter((el) => el.notificationId === notification.notificationId)[0].viewed = false;
          });
      }
    }
  }

  deleteNotification(event: Event, notification: NotificationModel): void {
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter')) {
      event.stopPropagation();
      this.userNotificationService
        .deleteNotification(notification.notificationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          () => {
            this.notifications = this.notifications.filter((el) => {
              return el.notificationId !== notification.notificationId;
            });
            if (this.notifications.length < this.itemsPerPage && this.hasNextPage) {
              this.getNotification(this.currentPage + 1);
            }
          },
          () => {
            this.matSnackBar.openSnackBar('error');
          }
        );
    }
  }

  onScroll(): void {
    this.isLoading = true;
    if (this.hasNextPage) {
      this.getNotification(this.currentPage + 1);
    }
  }

  acceptRequest(userId: number): void {
    this.userFriendsService.acceptRequest(userId).subscribe();
  }

  declineRequest(userId: number): void {
    this.userFriendsService.declineRequest(userId).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
