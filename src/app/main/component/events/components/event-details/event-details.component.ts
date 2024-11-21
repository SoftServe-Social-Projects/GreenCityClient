import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ActionsSubject, Store } from '@ngrx/store';
import { take, takeUntil } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DialogPopUpComponent } from 'src/app/shared/dialog-pop-up/dialog-pop-up.component';
import {
  AddAttenderEcoEventsByIdAction,
  CreateEcoEventAction,
  DeleteEcoEventAction,
  EditEcoEventAction,
  EventsActions,
  RemoveAttenderEcoEventsByIdAction
} from 'src/app/store/actions/ecoEvents.actions';
import { EventAttender, EventForm, EventResponse, LocationResponse, PagePreviewDTO } from '../../models/events.interface';
import { EventsService } from '../../services/events.service';
import { JwtService } from '@global-service/jwt/jwt.service';
import { Subject } from 'rxjs';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { IEcoEventsState } from 'src/app/store/state/ecoEvents.state';
import { IAppState } from 'src/app/store/state/app.state';
import { EventsListItemModalComponent } from '@shared/components/events-list-item/events-list-item-modal/events-list-item-modal.component';
import { ofType } from '@ngrx/effects';
import { ICONS } from '../../models/event-consts';
import { WarningPopUpComponent } from '@shared/components';
import { MetaService } from 'src/app/shared/services/meta/meta.service';
import { EventStoreService } from '../../services/event-store.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  icons = ICONS;
  eventId: number;
  roles = {
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    USER: 'USER',
    ORGANIZER: 'ORGANIZER',
    ADMIN: 'ADMIN'
  };
  ecoEvents$ = this.store.select((state: IAppState): IEcoEventsState => state.ecoEventsState);
  bsModalRef: BsModalRef;
  role = this.roles.UNAUTHENTICATED;
  isEventFavorite: boolean;
  attendees: EventAttender[] = [];
  attendeesAvatars = [];
  organizerName: string;
  isLiked: boolean;
  event: EventResponse | PagePreviewDTO;
  eventForm: EventForm;
  locationLink: string;
  locationCoordinates: LocationResponse;
  place: string;
  images: string[] = [];
  isPosting: boolean;
  isActive: boolean;
  isUpdating: boolean;
  currentDate = new Date();
  isPreview = false;
  max = 5;
  rate: number;
  likesType = {
    like: 'assets/img/comments/like.png',
    liked: 'assets/img/comments/liked.png'
  };
  deleteDialogData = {
    popupTitle: 'homepage.events.delete-title-admin',
    popupConfirm: 'homepage.events.delete-yes',
    popupCancel: 'homepage.events.delete-no',
    style: 'green'
  };
  mapDialogData: any;
  address = 'Should be address';
  backRoute: string;
  routedFromProfile: boolean;
  isUserCanJoin = false;
  isUserCanRate = false;
  isSubscribed = false;
  attenderError: string;
  isRegistered: boolean;
  isReadonly = false;
  googleMapLink: string;
  private dialogRef: MatDialogRef<WarningPopUpComponent>;
  private cancelationPopupData = {
    popupTitle: 'homepage.events.pop-up-cancelling-event',
    popupConfirm: 'homepage.events.events-popup.cancelling-event-request-btn',
    popupCancel: 'homepage.events.events-popup.reject-cancelling-event-btn',
    isUBS: false,
    isUbsOrderSubmit: false,
    isHabit: false
  };
  userId: number;
  private destroy: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    public eventService: EventsService,
    private eventStoreService: EventStoreService,
    public router: Router,
    public localStorageService: LocalStorageService,
    private dialog: MatDialog,
    private store: Store,
    private actionsSubj: ActionsSubject,
    private jwtService: JwtService,
    private snackBar: MatSnackBarComponent,
    private readonly modalService: BsModalService,
    private readonly metaService: MetaService
  ) {}

  ngOnInit(): void {
    this.isUpdating = !this.eventService.getIsFromCreateEvent();
    if (this.route.snapshot.params.id) {
      this.eventId = this.route.snapshot.params.id;

      this.eventStoreService.setEventId(this.eventId);

      this.isPreview = false;
      this.localStorageService.userIdBehaviourSubject.subscribe((id) => {
        this.userId = Number(id);
      });
      this.getEventById();
      this.localStorageService.setEditMode('canUserEdit', true);
      this.getAllAttendees();
      this.navigateBackOnEventDeleteListener();

      this.routedFromProfile = this.localStorageService.getPreviousPage() === '/profile';
      this.backRoute = this.localStorageService.getPreviousPage();
      this.getIsLiked();
    } else {
      this.isPreview = true;
      this.eventForm = this.eventStoreService.getEditorValues();
      if (!this.eventForm.eventInformation) {
        this.router.navigate(['/events']);
      }
      this.event = this.eventService.getEventPreview(this.eventForm);
      this.locationLink = this.event.dates[this.event.dates.length - 1].onlineLink;
      this.place = this.event.location as string;
      this.images = this.event.imgArrayToPreview;

      this.bindUserName();
      this.setGoogleMapLink();
    }
  }

  private getIsLiked(): void {
    this.eventService
      .getIsLikedByUser(this.eventId)
      .pipe(take(1))
      .subscribe((isLiked: boolean) => {
        this.isLiked = isLiked;
      });
  }

  onLikeEvent(): void {
    const updatedLikes = this.event.likes + (this.isLiked ? -1 : 1);
    this.isLiked = !this.isLiked;
    this.postToggleEventLike(updatedLikes);
  }

  private postToggleEventLike(updatedLikes: number): void {
    this.eventService
      .postToggleLike(this.eventId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.event.likes = updatedLikes;
        },
        error: () => {
          this.snackBar.openSnackBar('errorLiked');
          this.isLiked = !this.isLiked;
        }
      });
  }

  navigateBackOnEventDeleteListener(): void {
    this.actionsSubj.pipe(ofType(EventsActions.DeleteEcoEventSuccess)).subscribe(() => {
      this.router.navigate(['/events']);
    });
  }

  setGoogleMapLink(): void {
    const coords = this.event.dates[0].coordinates;
    this.googleMapLink = `https://www.google.com.ua/maps/@${coords.longitude},${coords.latitude}`;
  }

  bindUserName(): void {
    this.localStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.destroy)).subscribe((name) => (this.organizerName = name));
  }

  getAllAttendees(): void {
    this.eventService.getAllAttendees(this.eventId).subscribe((attendees) => {
      this.attendees = attendees;
      this.attendeesAvatars = attendees.filter((attendee) => attendee.imagePath).map((attendee) => attendee.imagePath);
    });
  }

  getEventById(): void {
    this.eventService.getEventById(this.eventId).subscribe((res: EventResponse) => {
      this.event = res;
      this.metaService.setMeta('oneEventArticle', { title: res.title, description: res.description.slice(0, 150) });
      this.organizerName = this.event.organizer.name;
      this.locationLink = this.event.dates[this.event.dates.length - 1].onlineLink;
      this.locationCoordinates = this.event.dates[this.event.dates.length - 1].coordinates;
      this.images = [res.titleImage, ...res.additionalImages];
      this.rate = Math.round(this.event.organizer.organizerRating);
      this.mapDialogData = {
        lat: this.event.dates[this.event.dates.length - 1].coordinates?.latitude,
        lng: this.event.dates[this.event.dates.length - 1].coordinates?.longitude
      };
      this.isEventFavorite = this.event.isFavorite;
      this.isRegistered = !!this.userId;
      this.isSubscribed = this.event.isSubscribed;
      const isOwner = Number(this.userId) === this.event.organizer.id;
      this.isActive = this.event.isRelevant;
      this.isUserCanRate = this.isSubscribed && !this.isActive && !isOwner;
      this.isUserCanJoin = this.isActive && !isOwner;
      this.role = this.verifyRole();
      this.addAttenderError();
      this.setGoogleMapLink();
    });
  }

  addAttenderError() {
    this.ecoEvents$.subscribe((result: IEcoEventsState) => {
      this.attenderError = result.error;
    });
  }

  getAddress(): string {
    return this.eventService.getFormattedAddress(this.locationCoordinates);
  }

  navigateToEditEvent(): void {
    this.router.navigate(['/events', 'update-event', this.eventId]);
  }

  backToEditEvent(): void {
    if (!this.isUpdating) {
      this.router.navigate(['/events', 'create-event']);
    } else {
      this.localStorageService.setEditMode('canUserEdit', true);
      const id = this.eventId || this.eventStoreService.getEventId();
      this.router.navigate(['/events', 'update-event', id]);
    }
  }

  onPublish() {
    this.isPosting = true;
    const id = this.eventId || this.eventStoreService.getEventId();
    const formEvent = this.eventService.convertEventToFormEvent(this.eventForm).value;
    const sendData = this.eventService.prepareEventForSubmit(formEvent, id, this.isUpdating);

    this.isUpdating
      ? this.store.dispatch(EditEcoEventAction({ data: sendData, id: id }))
      : this.store.dispatch(CreateEcoEventAction({ data: sendData }));
    this.actionsSubj.pipe(ofType(EventsActions.CreateEcoEventSuccess, EventsActions.EditEcoEventSuccess), take(1)).subscribe(() => {
      this.isPosting = false;
      this.eventStoreService.setEventListResponse(null);
    });
    this.escapeFromCreateEvent();
  }

  escapeFromCreateEvent(): void {
    this.router.navigate(['/events']);
    this.eventSuccessfullyAdded();
  }

  private eventSuccessfullyAdded(): void {
    const isUpdating = !this.isUpdating;
    if (isUpdating) {
      this.snackBar.openSnackBar('updatedEvent');
    } else {
      this.snackBar.openSnackBar('addedEvent');
    }
  }

  submitEventCancelling() {
    this.store.dispatch(RemoveAttenderEcoEventsByIdAction({ id: this.event.id }));
    this.isSubscribed = !this.isSubscribed;
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
          this.store.dispatch(DeleteEcoEventAction({ id: this.eventId }));
          this.isPosting = true;
        }
      });
  }

  changeFavouriteStatus(event?: Event) {
    event?.stopPropagation();
    if (!this.isRegistered) {
      this.openAuthModalWindow('sign-in');
      return;
    }

    this.isEventFavorite = !this.isEventFavorite;
    const operation$ = this.isEventFavorite
      ? this.eventService.addEventToFavourites(this.event.id)
      : this.eventService.removeEventFromFavourites(this.event.id);

    operation$.subscribe({
      error: () => {
        this.snackBar.openSnackBar('error');
        this.isEventFavorite = !this.isEventFavorite;
      }
    });
    const buttonElement = event.target as HTMLButtonElement;
    buttonElement.blur();
  }

  buttonAction(event: Event): void {
    if (this.role === this.roles.UNAUTHENTICATED) {
      this.openAuthModalWindow('sign-in');
      return;
    }
    if (this.isUserCanJoin && this.attenderError) {
      this.snackBar.openSnackBar('errorJoinEvent');
      this.attenderError = '';
    }
    if (!this.isSubscribed && !this.attenderError) {
      this.snackBar.openSnackBar('joinedEvent');
      this.userId ? this.store.dispatch(AddAttenderEcoEventsByIdAction({ id: this.event.id })) : this.openAuthModalWindow('sign-in');
      this.isSubscribed = !this.isSubscribed;
    } else {
      this.openPopUp();
    }
  }

  openAuthModalWindow(page: string): void {
    const matDialogRef = this.dialog.open(AuthModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {
        popUpName: page
      }
    });
    matDialogRef.afterClosed().subscribe((res) => {
      if (this.userId) {
        this.router.navigate(['/events', this.eventId]);
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

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.complete();
  }

  private verifyRole(): string {
    let role = this.roles.UNAUTHENTICATED;
    role = this.jwtService.getUserRole() === 'ROLE_USER' ? this.roles.USER : role;
    role = this.userId === this.event.organizer.id ? this.roles.ORGANIZER : role;
    role = this.jwtService.getUserRole() === 'ROLE_ADMIN' ? this.roles.ADMIN : role;
    return role;
  }
}
