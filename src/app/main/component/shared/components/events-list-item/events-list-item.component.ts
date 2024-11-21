import {
  AddAttenderEcoEventsByIdAction,
  DeleteEcoEventAction,
  EventsActions,
  RemoveAttenderEcoEventsByIdAction
} from 'src/app/store/actions/ecoEvents.actions';
import { IAppState } from 'src/app/store/state/app.state';
import { IEcoEventsState } from 'src/app/store/state/ecoEvents.state';
import { ActionsSubject, Store } from '@ngrx/store';
import { take, takeUntil } from 'rxjs/operators';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { typeFiltersData } from '../../../events/models/event-consts';
import {
  EventAttender,
  EventDatesResponse,
  EventListResponse,
  LocationResponse,
  TagDto,
  TagObj
} from '../../../events/models/events.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EventsListItemModalComponent } from './events-list-item-modal/events-list-item-modal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogPopUpComponent } from 'src/app/shared/dialog-pop-up/dialog-pop-up.component';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, Subscription } from 'rxjs';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { DatePipe } from '@angular/common';
import { EventsService } from '../../../events/services/events.service';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { userAssignedCardsIcons } from 'src/app/main/image-pathes/profile-icons';
import { JwtService } from '@global-service/jwt/jwt.service';
import { ofType } from '@ngrx/effects';
import { WarningPopUpComponent } from '@shared/components';
import { EventStoreService } from '../../../events/services/event-store.service';
import { habitImages } from 'src/app/main/image-pathes/habits-images';

@Component({
  selector: 'app-events-list-item',
  templateUrl: './events-list-item.component.html',
  styleUrls: ['./events-list-item.component.scss', './events-list-item-user.component.scss']
})
export class EventsListItemComponent implements OnInit, OnDestroy {
  @Input() event: EventListResponse;
  @Input() userId: number;
  @Input() isUserAssignList: boolean;
  @Input() isGalleryView: boolean;

  profileIcons = userAssignedCardsIcons;

  ecoEvents$ = this.store.select((state: IAppState): IEcoEventsState => state.ecoEventsState);
  itemTags: Array<TagObj>;
  activeTags: Array<TagObj>;
  author: string;
  isRegistered: boolean;
  isReadonly = false;
  isPosting: boolean;
  isEventFavorite: boolean;
  btnStyle: string;
  nameBtn: string;
  max = 3;
  bsModalRef: BsModalRef;
  langChangeSub: Subscription;
  currentLang: string;
  datePipe: DatePipe;
  newDate: string | null;
  address: LocationResponse;
  attenderError: string;
  isOnline: string;
  isOwner: boolean;
  isAdmin: boolean;
  isActive: boolean;
  attendees: EventAttender[] = [];
  attendeesAvatars = [];
  deleteDialogData = {
    popupTitle: 'homepage.events.delete-title-admin',
    popupConfirm: 'homepage.events.delete-yes',
    popupCancel: 'homepage.events.delete-no',
    style: 'green'
  };
  @Output() public isLoggedIn: boolean;
  @Output() idOfUnFavouriteEvent = new EventEmitter<number>();
  styleBtn = {
    secondary: 'secondary-global-button',
    primary: 'primary-global-button',
    hiden: 'event-button-hiden'
  };
  btnName = {
    edit: 'event.btn-edit',
    delete: 'event.btn-delete',
    rate: 'event.btn-rate',
    cancel: 'event.btn-cancel',
    join: 'event.btn-join',
    requestSent: 'event.btn-request-sent'
  };
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);
  private cancelationPopupData = {
    popupTitle: 'homepage.events.pop-up-cancelling-event',
    popupConfirm: 'homepage.events.events-popup.cancelling-event-request-btn',
    popupCancel: 'homepage.events.events-popup.reject-cancelling-event-btn',
    isUBS: false,
    isUbsOrderSubmit: false,
    isHabit: false
  };

  private dialogRef: MatDialogRef<unknown>;
  defaultImage = habitImages.defaultImage;

  constructor(
    public router: Router,
    private localStorageService: LocalStorageService,
    private userOwnAuthService: UserOwnAuthService,
    private modalService: BsModalService,
    private dialog: MatDialog,
    private store: Store,
    private eventService: EventsService,
    private eventStoreService: EventStoreService,
    private translate: TranslateService,
    private snackBar: MatSnackBarComponent,
    private jwtService: JwtService,
    private actionsSubj: ActionsSubject
  ) {
    this.actionsSubj
      .pipe(ofType(EventsActions.AddAttenderEcoEventsByIdSuccess), takeUntil(this.destroyed$))
      .subscribe((action: { id: number; type: string }) => {
        if (action.id === this.event.id) {
          this.nameBtn = this.btnName.cancel;
        }
      });

    this.actionsSubj
      .pipe(ofType(EventsActions.RemoveAttenderEcoEventsById), takeUntil(this.destroyed$))
      .subscribe((action: { id: number; type: string }) => {
        if (action.id === this.event.id) {
          this.nameBtn = this.btnName.join;
        }
      });
  }

  ngOnInit(): void {
    if (this.event.titleImage.startsWith('img/habits/')) {
      this.event.titleImage = 'assets/' + this.event.titleImage;
    }
    this.itemTags = typeFiltersData.reduce((ac, cur) => [...ac, { ...cur }], []);
    this.filterTags(this.event.tags);
    this.userOwnAuthService.getDataFromLocalStorage();
    this.subscribeToLangChange();
    this.getAllAttendees();
    this.bindLang(this.localStorageService.getCurrentLanguage());
    this.isRegistered = !!this.userId;
    this.checkButtonStatus();
    this.address = this.event.dates[this.event.dates.length - 1].coordinates;
    this.isOnline = this.event.dates[this.event.dates.length - 1].onlineLink;
    this.ecoEvents$.pipe(takeUntil(this.destroyed$)).subscribe((res: IEcoEventsState) => {
      this.attenderError = res.error;
    });
    this.getAddress();
    this.isEventFavorite = this.event.isFavorite;
  }

  routeToEvent(): void {
    this.router.navigate(['/events', this.event.id]);
  }

  filterTags(tags: Array<TagDto>) {
    this.itemTags.forEach((item) => (item.isActive = tags.some((name) => name.nameEn === item.nameEn)));
    this.activeTags = this.itemTags.filter((val) => val.isActive);
  }

  checkButtonStatus(): void {
    const { isSubscribed, isRelevant } = this.event;
    this.isActive = isRelevant;
    this.isOwner = Number(this.userId) === this.event.organizer.id;
    const isAdmin = this.jwtService.getUserRole() === 'ROLE_UBS_EMPLOYEE' || this.jwtService.getUserRole() === 'ROLE_ADMIN';
    this.isAdmin = isAdmin;
    switch (true) {
      case isAdmin && (!this.isOwner || !isRelevant):
        this.btnStyle = this.styleBtn.secondary;
        this.nameBtn = this.btnName.delete;
        break;
      case (isAdmin || this.isOwner) && isRelevant:
        this.btnStyle = this.styleBtn.secondary;
        this.nameBtn = this.btnName.edit;
        break;
      case isSubscribed && isRelevant && !this.isOwner:
        this.btnStyle = this.styleBtn.secondary;
        this.nameBtn = this.btnName.cancel;
        break;
      case !isSubscribed && isRelevant && !this.isOwner && !isAdmin:
        this.btnStyle = this.styleBtn.primary;
        this.nameBtn = this.btnName.join;
        break;
      case isSubscribed && !isRelevant && !this.isOwner:
        this.btnStyle = this.styleBtn.primary;
        this.nameBtn = this.btnName.rate;
        break;
      case !isSubscribed && !isRelevant && !this.isOwner:
        this.btnStyle = this.styleBtn.hiden;
        break;
    }
  }

  buttonAction(buttonName: string): void {
    this.eventService.setForm(null);
    switch (buttonName) {
      case this.btnName.cancel:
        this.openPopUp();
        break;
      case this.btnName.join:
        if (this.attenderError) {
          this.snackBar.openSnackBar('errorJoinEvent');
          this.attenderError = '';
        } else if (!this.isRegistered) {
          this.openAuthModalWindow('sign-in');
          this.dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((result) => {
              this.isRegistered = !!result;
              if (result) {
                this.router.navigate(['events']);
              }
            });
        } else if (!this.event.open && !this.event.isOrganizedByFriend) {
          this.snackBar.openSnackBar('jointEventRequest');
          this.nameBtn = this.btnName.requestSent;
        } else {
          this.joinEvent();
        }
        break;
      case this.btnName.rate:
        this.openModal();
        break;
      case this.btnName.delete:
        this.deleteEvent();
        break;
      case this.btnName.edit:
        this.localStorageService.setEditMode('canUserEdit', true);
        console.log('setting this event', this.event);
        this.eventStoreService.setEventListResponse(this.event);
        this.router.navigate(['/events', 'update-event', this.event.id]);
        break;
      default:
        break;
    }
  }

  submitEventCancelling() {
    this.store.dispatch(RemoveAttenderEcoEventsByIdAction({ id: this.event.id }));
  }

  openPopUp(): void {
    if (this.dialogRef) {
      return;
    }
    this.dialogRef = this.dialog.open(WarningPopUpComponent, {
      data: this.cancelationPopupData
    });

    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        this.dialogRef = null;
        if (result) {
          this.submitEventCancelling();
        }
      });
  }

  openModal(): void {
    const initialState = {
      id: this.event.id,
      isRegistered: this.isRegistered,
      max: this.max,
      isReadonly: this.isReadonly
    };

    this.bsModalRef = this.modalService.show(EventsListItemModalComponent, {
      class: 'modal-dialog-centered',
      initialState
    });
    this.bsModalRef.content.closeBtnName = 'event.btn-close';
  }

  deleteEvent(): void {
    const matDialogRef = this.dialog.open(DialogPopUpComponent, {
      data: this.deleteDialogData,
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: '',
      width: '300px'
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (res) {
          this.store.dispatch(DeleteEcoEventAction({ id: this.event.id }));
          this.isPosting = true;
        }
      });
  }

  bindLang(lang: string): void {
    this.translate.setDefaultLang(lang);
    this.currentLang = this.localStorageService.getCurrentLanguage();
  }

  subscribeToLangChange(): void {
    this.langChangeSub = this.localStorageService.languageSubject.pipe(takeUntil(this.destroyed$)).subscribe(this.bindLang.bind(this));
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe((lang: string) => {
      this.currentLang = lang;
      this.datePipe = new DatePipe(this.currentLang);
      this.newDate = this.datePipe.transform(this.event.creationDate, 'MMM dd, yyyy');
    });
  }

  getAllAttendees(): void {
    this.eventService
      .getAllAttendees(this.event.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((attendees) => {
        this.attendees = attendees;
        this.attendeesAvatars = attendees.filter((attendee) => attendee.imagePath).map((attendee) => attendee.imagePath);
      });
  }

  getAddress(): string {
    if (this.address) {
      return this.eventService.getFormattedAddressEventsList(this.address);
    }
  }

  changeFavouriteStatus(event?: Event) {
    event?.stopPropagation();
    if (!this.isRegistered) {
      this.openAuthModalWindow('sign-in');
      this.dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => {
          this.isRegistered = !!result;
          if (this.isRegistered) {
            this.changeFavouriteStatus();
          }
        });
    } else {
      this.isEventFavorite = !this.isEventFavorite;
      if (this.isEventFavorite) {
        this.eventService
          .addEventToFavourites(this.event.id)
          .pipe(takeUntil(this.destroyed$))
          .subscribe({
            error: () => {
              this.snackBar.openSnackBar('error');
              this.isEventFavorite = false;
            }
          });
      } else {
        this.eventService
          .removeEventFromFavourites(this.event.id)
          .pipe(takeUntil(this.destroyed$))
          .subscribe({
            next: () => {
              if (this.isUserAssignList) {
                this.idOfUnFavouriteEvent.emit(this.event.id);
              }
            },
            error: () => {
              this.snackBar.openSnackBar('error');
              this.isEventFavorite = true;
            }
          });
      }
    }
  }

  openAuthModalWindow(page: string): void {
    this.dialogRef = this.dialog.open(AuthModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {
        popUpName: page
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private joinEvent() {
    this.store.dispatch(AddAttenderEcoEventsByIdAction({ id: this.event.id }));
    this.snackBar.openSnackBar('joinedEvent');
  }

  isDateExpired(dates: EventDatesResponse[]): boolean {
    if (!dates || dates.length === 0) {
      return false;
    }
    return new Date(dates[dates.length - 1].startDate) < new Date();
  }
}
