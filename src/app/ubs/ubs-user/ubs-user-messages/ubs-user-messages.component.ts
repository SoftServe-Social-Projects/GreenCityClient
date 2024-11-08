import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserMessagesService } from '../services/user-messages.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { NotificationBody } from '@ubs/ubs-admin/models/ubs-user.model';
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
  isLoadBar: boolean;
  hasNextPage: boolean;
  images = [];
  currLang: string;
  private readonly destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  destroy: Subject<boolean> = new Subject<boolean>();
  localization = {
    title: 'ubs-user-notification.title',
    id: 'ubs-user-notification.title-table.number',
    themeMessages: 'ubs-user-notification.title-table.theme-messages',
    time: 'ubs-user-notification.title-table.time'
  };

  constructor(
    private readonly userMessagesService: UserMessagesService,
    private readonly localStorageService: LocalStorageService,
    private readonly matSnackBar: MatSnackBarComponent,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe((val) => {
      this.page = +this.route.snapshot.paramMap.get('pageId');
      this.subscribeToLangChange();
    });
  }

  private subscribeToLangChange() {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe((language) => {
      this.currLang = language;
      this.fetchNotification(language);
    });
  }

  fetchNotification(lang: string): void {
    this.isLoadBar = true;
    this.userMessagesService
      .getNotification(this.page - 1, this.pageSize, lang)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (response) => {
          this.notifications = response.page;
          this.count = response.totalElements;
          this.isAnyMessages = this.notifications.length > 0;
          this.isLoadSpinner = this.isLoadBar = false;

          this.hasNextPage = response.currentPage !== response.totalPages - 1;
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  setRead(notification: NotificationBody) {
    if (notification && !notification.read) {
      this.userMessagesService.countOfNoReadMessages >= 0 && this.userMessagesService.countOfNoReadMessages--;
      this.userMessagesService
        .markNotificationAsRead(notification.id)
        .pipe(takeUntil(this.destroy))
        .subscribe(() => {
          this.notifications.find((el) => el.id === notification.id).read = true;
        });
    }
  }

  deleteNotification(event: Event, notification: NotificationBody): void {
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && event.key === 'Enter')) {
      event.stopPropagation();
      this.userMessagesService
        .deleteNotification(notification.id)
        .pipe(takeUntil(this.destroy))
        .subscribe({
          next: () => {
            this.notifications = this.notifications.filter((el) => el.id !== notification.id);
            !notification.read && this.userMessagesService.countOfNoReadMessages--;
            if (this.notifications.length < this.pageSize && this.hasNextPage) {
              this.fetchNotification(this.currLang);
            } else if (this.notifications.length === 0 && this.page > 1) {
              this.page--;
              this.fetchNotification(this.currLang);
            }
            this.matSnackBar.openSnackBar('deletedNotification');
          },
          error: () => {
            this.matSnackBar.openSnackBar('error');
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
