import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { UbsAdminNotificationSettingsComponent } from './ubs-admin-notification-settings/ubs-admin-notification-settings.component';
import { UbsAdminNotificationEditFormComponent } from './ubs-admin-notification-edit-form/ubs-admin-notification-edit-form.component';
import { NotificationTemplate, NotificationTemplateUpdate } from '../../models/notifications.model';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationsService, notificationTriggerTimeMock, notificationTriggersMock } from '../../services/notifications.service';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { abilityDelAuthorities, abilityEditAuthorities } from '../../models/ubs-admin.interface';
import { formatSpringCron, formatUnixCron } from 'src/app/shared/cron/cron.service';

@Component({
  selector: 'app-ubs-admin-notification',
  templateUrl: './ubs-admin-notification.component.html',
  styleUrls: ['./ubs-admin-notification.component.scss']
})
export class UbsAdminNotificationComponent implements OnInit, OnDestroy {
  private destroy = new Subject<void>();

  icons = {
    back: 'assets/img/ubs-admin-notifications/back.svg',
    edit: 'assets/img/ubs-admin-notifications/pencil.svg',
    delete: './assets/img/ubs-admin-notifications/trashcan.svg',
    activate: './assets/img/ubs-admin-notifications/counterclockwise.svg'
  };
  currentLanguage: string;
  notification: NotificationTemplate;
  notificationTriggerTime = notificationTriggerTimeMock;
  notificationTriggers = notificationTriggersMock;
  notificationId: number;
  isThisEmployeeCanEditNotification: boolean;
  isThisEmployeeCanActivateNotification: boolean;
  isThisEmployeeHasRights: boolean;
  permissions$ = this.store.select((state): Array<string> => state.employees.employeesPermissions);
  isLangUa: boolean;
  private employeeAuthorities: string[];

  constructor(
    private notificationsService: NotificationsService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private snackBar: MatSnackBarComponent,
    private store: Store<IAppState>
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.localStorageService.getCurrentLanguage();
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy)).subscribe((lang) => {
      this.currentLanguage = lang;
      this.isLangUa = this.currentLanguage === 'ua';
    });
    this.isLangUa = this.currentLanguage === 'ua';
    this.route.params.pipe(takeUntil(this.destroy)).subscribe((params) => {
      this.notificationId = Number(params.id);
      this.loadNotification(this.notificationId);
    });
    this.authoritiesSubscription();
  }

  private authoritiesSubscription() {
    this.permissions$.subscribe((authorities) => {
      if (authorities.length) {
        this.definedIsEmployeeCanEditNotifications(authorities);
      }
    });
  }

  definedIsEmployeeCanEditNotifications(employeeRights: string[]): void {
    this.employeeAuthorities = employeeRights;
    this.isThisEmployeeCanEditNotification = this.employeeAuthorities.includes(abilityEditAuthorities.notifications);
    this.isThisEmployeeCanActivateNotification = this.employeeAuthorities.includes(abilityDelAuthorities.notifications);
    this.isThisEmployeeHasRights = this.isThisEmployeeCanEditNotification || this.isThisEmployeeCanActivateNotification;
  }

  loadNotification(id: number): void {
    this.notificationsService
      .getNotificationTemplate(id)
      .pipe(take(1))
      .subscribe({
        next: (notification: NotificationTemplate) => {
          this.notification = formatUnixCron(notification);
        },
        error: () => this.navigateToNotificationList()
      });
  }

  navigateToNotificationList(): void {
    this.router.navigate(['../../notifications'], { relativeTo: this.route });
  }

  onGoBack(): void {
    this.location.back();
  }

  onEditNotificationText(platform: string): void {
    const platformToUpdate = this.notification.platforms.find((pf) => pf.nameEng === platform);

    this.dialog
      .open(UbsAdminNotificationEditFormComponent, {
        hasBackdrop: true,
        data: {
          platform,
          text: {
            ua: platformToUpdate.body,
            en: platformToUpdate.bodyEng
          }
        }
      })
      .afterClosed()
      .subscribe((updates: { text: { ua: string; en: string } }) => {
        if (!updates) {
          return;
        }
        platformToUpdate.body = updates.text.ua;
        platformToUpdate.bodyEng = updates.text.en;
      });
  }

  onEditNotificationSettings(): void {
    this.dialog
      .open(UbsAdminNotificationSettingsComponent, {
        hasBackdrop: true,
        data: {
          title: {
            en: this.notification.notificationTemplateMainInfoDto.titleEng,
            ua: this.notification.notificationTemplateMainInfoDto.title
          },
          trigger: this.notification.notificationTemplateMainInfoDto.trigger,
          time: this.notification.notificationTemplateMainInfoDto.time,
          schedule: this.notification.notificationTemplateMainInfoDto.schedule
        }
      })
      .afterClosed()
      .subscribe((updates: { title: { en: string; ua: string }; trigger: string; time: string; schedule: string }) => {
        if (!updates) {
          return;
        }
        this.findNewDescription(updates);
        this.notification.notificationTemplateMainInfoDto.title = updates.title.ua;
        this.notification.notificationTemplateMainInfoDto.titleEng = updates.title.en;
        this.notification.notificationTemplateMainInfoDto.trigger = updates.trigger;
        this.notification.notificationTemplateMainInfoDto.time = updates.time;
        this.notification.notificationTemplateMainInfoDto.schedule = updates.schedule;
      });
  }

  private findNewDescription(updatedNotification): void {
    const indexTrigger = this.notificationTriggers.findIndex((item) => item.trigger === updatedNotification.trigger);
    const indexTime = this.notificationTriggerTime.findIndex((item) => item.time === updatedNotification.time);

    if (indexTrigger !== -1 && this.notification.notificationTemplateMainInfoDto) {
      this.notification.notificationTemplateMainInfoDto.triggerDescription = this.notificationTriggers[indexTrigger]?.triggerDescription;
      this.notification.notificationTemplateMainInfoDto.triggerDescriptionEng =
        this.notificationTriggers[indexTrigger]?.triggerDescriptionEng;
    }

    if (indexTime !== -1 && this.notification.notificationTemplateMainInfoDto) {
      this.notification.notificationTemplateMainInfoDto.timeDescription = this.notificationTriggerTime[indexTime]?.timeDescription;
      this.notification.notificationTemplateMainInfoDto.timeDescriptionEng = this.notificationTriggerTime[indexTime]?.timeDescriptionEng;
    }
  }

  onActivatePlatform(platform: string): void {
    this.notification.platforms.find((pf) => pf.nameEng === platform).status = 'ACTIVE';
  }

  onDeactivatePlatform(platform: string): void {
    this.notification.platforms.find((pf) => pf.nameEng === platform).status = 'INACTIVE';
  }

  onDeactivateNotification() {
    const translationKeys = {
      title: 'ubs-notifications.deactivation-popup.title',
      text: 'ubs-notifications.deactivation-popup.text',
      confirm: 'ubs-notifications.deactivation-popup.buttons.confirm',
      cancel: 'ubs-notifications.deactivation-popup.buttons.cancel'
    };
    this.dialog
      .open(ConfirmationDialogComponent, { hasBackdrop: true, data: translationKeys })
      .afterClosed()
      .subscribe((deactivate) => {
        if (!deactivate) {
          return;
        }

        this.notificationsService
          .changeStatusOfNotificationTemplate(this.notificationId, 'INACTIVE')
          .pipe(takeUntil(this.destroy))
          .subscribe();
        this.navigateToNotificationList();
      });
  }

  onActivateNotification() {
    const translationKeys = {
      title: 'ubs-notifications.activation-popup.title',
      text: 'ubs-notifications.activation-popup.text',
      confirm: 'ubs-notifications.activation-popup.buttons.confirm',
      cancel: 'ubs-notifications.activation-popup.buttons.cancel'
    };
    this.dialog
      .open(ConfirmationDialogComponent, { hasBackdrop: true, data: translationKeys })
      .afterClosed()
      .subscribe((activate) => {
        if (!activate) {
          return;
        }

        this.notificationsService
          .changeStatusOfNotificationTemplate(this.notificationId, 'ACTIVE')
          .pipe(takeUntil(this.destroy))
          .subscribe();
        this.notification.notificationTemplateMainInfoDto.notificationStatus = 'ACTIVE';
      });
  }

  onCancel(): void {
    this.navigateToNotificationList();
  }

  onSaveChanges(): void {
    this.notificationsService
      .updateNotificationTemplate(this.notificationId, this.mapNotification(this.notification))
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.snackBar.openSnackBar('updatedNotification'));
  }

  mapNotification(notification: NotificationTemplate): NotificationTemplateUpdate {
    const { title, titleEng, trigger, type, time, schedule } = notification.notificationTemplateMainInfoDto;
    return {
      notificationTemplateUpdateInfo: { title, titleEng, trigger, type, time, schedule: formatSpringCron(schedule) },
      platforms: notification.platforms
    };
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
