import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserMessagesService } from '../services/user-messages.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { NotificationBody } from '../../ubs-admin/models/ubs-user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ShowImgsPopUpComponent } from '../../../shared/show-imgs-pop-up/show-imgs-pop-up.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ubs-user-messages',
  templateUrl: './ubs-user-messages.component.html',
  styleUrls: ['./ubs-user-messages.component.scss']
})
export class UbsUserMessagesComponent implements OnInit, OnDestroy {
  isAnyMessages = true;
  notifications: NotificationBody[];
  panelOpenState = false;
  page = 1;
  count = 0;
  pageSize = 10;
  isLoadSpinner: boolean;
  isLoadSmallSpinner: boolean;
  isLoadBar: boolean;
  images = [];
  countOfMessages: number;
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  destroy: Subject<boolean> = new Subject<boolean>();
  localization = {
    title: 'ubs-user-notification.title',
    id: 'ubs-user-notification.title-table.number',
    themeMessages: 'ubs-user-notification.title-table.theme-messages',
    time: 'ubs-user-notification.title-table.time'
  };

  constructor(
    private userMessagesService: UserMessagesService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe((val) => {
      this.page = +this.route.snapshot.paramMap.get('pageId');
      this.subscribeToLangChange();
    });
  }

  private subscribeToLangChange() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe(() => this.fetchNotification());
  }

  fetchNotification(): void {
    this.isLoadBar = true;
    this.userMessagesService
      .getNotification(this.page - 1, this.pageSize)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (response) => {
          this.notifications = response.page;
          this.count = response.totalElements;
          this.isAnyMessages = this.notifications.length > 0;
          this.isLoadSpinner = this.isLoadBar = false;
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  setRead(notificationId: number, isRead: boolean) {
    let isGetNotificationBody = true;
    const notificationItem: NotificationBody = this.notifications.find((item) => item.id === notificationId);
    if (notificationItem.body) {
      isGetNotificationBody = false;
    }
    if (!notificationItem.read) {
      this.userMessagesService.countOfNoReadeMessages--;
    }
    if (isGetNotificationBody) {
      this.notifications.forEach((item) => {
        if (item.id === notificationId) {
          item.read = true;
        }
      });
      this.isLoadSmallSpinner = true;
      this.userMessagesService
        .setReadNotification(notificationId)
        .pipe(takeUntil(this.destroy))
        .subscribe((response) => {
          const findNotification = this.notifications.find((item) => item.id === notificationId);
          findNotification.body = response.body;
          findNotification.images = response.images;
          findNotification.isOpen = true;
          this.isLoadSmallSpinner = false;
          if (findNotification.images) {
            const images = response.images.map((url) => ({ src: url, label: null, name: null }));
            this.images.splice(0, response.images.length, ...images);
          }
        });
    }
  }

  onTableDataChange(event) {
    this.router.navigate(['/ubs-user/messages/' + event]);
  }

  openImg(index: number): void {
    this.dialog.open(ShowImgsPopUpComponent, {
      hasBackdrop: true,
      panelClass: 'custom-img-pop-up',
      data: {
        imgIndex: index,
        images: this.images
      }
    });
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }
}
