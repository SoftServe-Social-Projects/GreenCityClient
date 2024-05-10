import { Component, OnDestroy, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CHAT_ICONS } from '../../chat-icons';
import { FormControl, Validators } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ChatsService } from '../../service/chats/chats.service';
import { Subject } from 'rxjs';
import { CommonService } from '../../service/common/common.service';
import { SocketService } from '../../service/socket/socket.service';
import { Message } from '../../model/Message.model';
import { UserService } from '@global-service/user/user.service';
import { FriendModel } from '@global-user/models/friend.model';
import { JwtService } from '@global-service/jwt/jwt.service';
import { Role } from '@global-models/user/roles.model';

@Component({
  selector: 'app-new-message-window',
  templateUrl: './new-message-window.component.html',
  styleUrls: ['./new-message-window.component.scss']
})
export class NewMessageWindowComponent implements OnInit, AfterViewInit, OnDestroy {
  public chatIcons = CHAT_ICONS;
  public userSearchField = '';
  private onDestroy$ = new Subject();
  public userSearchControl: FormControl = new FormControl();
  public messageControl: FormControl = new FormControl('', [Validators.max(250)]);
  public showEmojiPicker = false;
  public isHaveMessages = true;
  public isAdmin: boolean;
  public isAdminParticipant: boolean;
  @ViewChild('chat') chat: ElementRef;

  constructor(
    public chatsService: ChatsService,
    private commonService: CommonService,
    private socketService: SocketService,
    public userService: UserService,
    private jwt: JwtService
  ) {}

  ngOnInit(): void {
    this.userSearchControl.valueChanges.pipe(debounceTime(500), takeUntil(this.onDestroy$)).subscribe((newInput) => {
      this.userSearchField = newInput;
      this.chatsService.searchFriends(newInput);
    });

    this.chatsService.currentChatMessagesStream$.subscribe((messages) => {
      this.isHaveMessages = messages.length !== 0;
    });
    this.isAdmin = this.jwt.getUserRole() === Role.UBS_EMPLOYEE || this.jwt.getUserRole() === Role.ADMIN;
  }

  ngAfterViewInit(): void {
    const element: HTMLElement = this.chat.nativeElement;
    element.scrollTop = element.scrollHeight;
  }

  public close() {
    this.commonService.newMessageWindowRequireCloseStream$.next(true);
  }

  public checkChat(friend: any) {
    if (friend.friendsChatDto.chatExists) {
      const userChat = this.chatsService.userChats.find((chat) => chat.id === friend.friendsChatDto.chatId);
      this.chatsService.setCurrentChat(userChat);
    } else {
      this.socketService.createNewChat(friend.id, false, true);
    }
  }

  public sendMessage() {
    const message: Message = {
      roomId: this.chatsService.currentChat.id,
      senderId: this.userService.userId,
      content: this.messageControl.value
    };
    this.socketService.sendMessage(message);
    this.messageControl.setValue('');
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event) {
    const newValue = this.messageControl.value ? this.messageControl.value + event.emoji.native : event.emoji.native;
    this.messageControl.setValue(newValue);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
