import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Component, ComponentFactoryResolver, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CHAT_ICONS } from '../../chat-icons';
import { ChatsService } from '../../service/chats/chats.service';
import { NewMessageWindowComponent } from '../new-message-window/new-message-window.component';
import { ReferenceDirective } from '../../directive/reference/reference.directive';
import { CommonService } from '../../service/common/common.service';
import { Subject } from 'rxjs';
import { concatMap, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { SocketService } from '../../service/socket/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatModalComponent } from '../chat-modal/chat-modal.component';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { JwtService } from '@global-service/jwt/jwt.service';

import { OrderService } from 'src/app/ubs/ubs/services/order.service';
import { LocationForChat } from '../../model/Chat.model';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-chat-popup',
  templateUrl: './chat-popup.component.html',
  styleUrls: ['./chat-popup.component.scss']
})
export class ChatPopupComponent implements OnInit, OnDestroy {
  chatIcons = CHAT_ICONS;
  isOpen = false;

  private onDestroy$ = new Subject();
  private userId: number;
  private courierUBSName = 'UBS';
  isUbsAdmin: boolean;
  breakpoint = 575;
  isSupportChat: boolean;

  @Input() chatClass: string;

  @ViewChild(ReferenceDirective) elementRef: ReferenceDirective;
  private dialogConfig = {
    hasBackdrop: true,
    closeOnNavigation: true,
    disableClose: true,
    panelClass: ['custom-dialog-container', 'chat-dialog-container']
  };

  constructor(
    public chatsService: ChatsService,
    private commonService: CommonService,
    private factory: ComponentFactoryResolver,
    private socketService: SocketService,
    private dialog: MatDialog,
    private localStorageService: LocalStorageService,
    private jwt: JwtService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.localStorageService.userIdBehaviourSubject.pipe(takeUntil(this.onDestroy$)).subscribe((id) => {
      this.userId = id;
      this.isUbsAdmin = this.jwt.getUserRole() === 'ROLE_UBS_EMPLOYEE';
      if (id) {
        this.socketService.connect();

        this.loadChats();
      } else {
        this.socketService.unsubscribeAll();
        this.chatsService.resetData();
        this.isOpen = false;
        this.commonService.newMessageWindowRequireCloseStream$.next(true);
      }
    });

    this.chatsService.isSupportChat$.pipe(takeUntil(this.onDestroy$)).subscribe((value) => {
      this.isSupportChat = value;
    });

    this.commonService.newMessageWindowRequireCloseStream$.pipe(takeUntil(this.onDestroy$)).subscribe(() => this.closeNewMessageWindow());
  }

  loadChats(): void {
    if (this.isUbsAdmin) {
      this.chatsService.getAllSupportChats();
      return;
    }

    this.orderService
      .getAllActiveCouriers()
      .pipe(
        concatMap((data) => {
          const courierId = data.find((courier) => courier.nameEn.includes(this.courierUBSName)).courierId;
          return this.chatsService.getLocationsChats(this.userId, courierId);
        }),
        takeUntil(this.onDestroy$)
      )
      .subscribe((locations: LocationForChat[]) => {
        this.chatsService.locations$.next(locations);
      });

    this.chatsService.getAllUserChats(this.userId);
  }

  openAuthModalWindow(): void {
    this.dialog.open(AuthModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {
        popUpName: 'sign-in'
      }
    });
  }

  handlePanelClick(): void {
    if (this.userId) {
      this.isOpen = !this.isOpen;
    } else {
      this.openAuthModalWindow();
    }
  }

  openNewMessageWindow(isEmpty: boolean) {
    if (isEmpty) {
      this.chatsService.setCurrentChat(null);
    }
    const newMsgComponent = this.factory.resolveComponentFactory(NewMessageWindowComponent);
    this.elementRef.containerRef.clear();
    this.elementRef.containerRef.createComponent(newMsgComponent);
  }

  private closeNewMessageWindow() {
    this.elementRef.containerRef.clear();
  }

  openChatModal() {
    this.commonService.newMessageWindowRequireCloseStream$.next(true);
    this.dialog.closeAll();
    this.dialog.open(ChatModalComponent, this.dialogConfig);
  }

  hideChat(): void {
    this.commonService.isChatVisible$.next(false);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }
}
