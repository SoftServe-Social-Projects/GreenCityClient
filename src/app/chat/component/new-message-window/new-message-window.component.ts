import { Component, OnDestroy, OnInit, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { CHAT_ICONS } from '../../chat-icons';
import { FormControl, Validators } from '@angular/forms';
import { take, takeUntil } from 'rxjs/operators';
import { ChatsService } from '../../service/chats/chats.service';
import { Subject } from 'rxjs';
import { CommonService } from '../../service/common/common.service';
import { SocketService } from '../../service/socket/socket.service';
import { Message, MessageExtended } from '../../model/Message.model';
import { UserService } from '@global-service/user/user.service';
import { JwtService } from '@global-service/jwt/jwt.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { insertEmoji } from 'src/app/main/component/comments/components/add-emoji/add-emoji';
import { EmojiEvent } from 'src/app/main/component/comments/models/comments-model';

@Component({
  selector: 'app-new-message-window',
  templateUrl: './new-message-window.component.html',
  styleUrls: ['./new-message-window.component.scss']
})
export class NewMessageWindowComponent implements OnInit, AfterViewInit, OnDestroy {
  chatIcons = CHAT_ICONS;
  private onDestroy$ = new Subject();
  messageControl: FormControl = new FormControl('', [Validators.max(250)]);
  showEmojiPicker = false;
  isHaveMessages = true;
  isAdmin: boolean;
  isEditMode: boolean;
  messageToEdit: Message;
  currentChatMessages: Observable<MessageExtended[]>;
  currentPath = '';
  uploadedFile: File;
  isMessageSending: boolean;

  @Input() isModal: boolean;
  @ViewChild('chat') chat: ElementRef;
  @ViewChild('customInput', { static: true }) customInput: ElementRef;

  constructor(
    public readonly chatsService: ChatsService,
    private readonly commonService: CommonService,
    private readonly socketService: SocketService,
    public readonly userService: UserService,
    private readonly jwt: JwtService,
    public readonly dialog: MatDialog,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentPath = this.router.url;
    this.currentChatMessages = this.chatsService.currentChatMessages$;
    this.chatsService.currentChatStream$.pipe(takeUntil(this.onDestroy$)).subscribe((chat) => {
      if (chat) {
        this.socketService.subscribeToUpdateDeleteMessage(chat.id);
      }
    });

    this.chatsService.currentChatMessagesStream$.pipe(takeUntil(this.onDestroy$)).subscribe((messages) => {
      this.isHaveMessages = !!messages?.length;

      const chatElem = this.chat?.nativeElement;
      const chatHeight = chatElem?.scrollHeight;
      setTimeout(() => {
        if (chatElem && chatHeight < chatElem.scrollHeight) {
          chatElem.scrollTop = chatElem.scrollHeight - chatElem.clientHeight;
        }
      });
    });
    this.isAdmin = this.jwt.getUserRole() === 'ROLE_UBS_EMPLOYEE';
    this.chatsService.messageToEdit$.pipe(takeUntil(this.onDestroy$)).subscribe((message) => {
      this.isEditMode = !!message;
      this.uploadedFile = null;
      if (message) {
        const { id, roomId, senderId, content } = message;
        this.messageToEdit = { id, roomId, senderId, content };
      }
      this.messageControl.setValue(message ? message.content : '');
      if (this.customInput) {
        this.customInput.nativeElement.textContent = message ? message.content : '';
      }
    });
  }

  changeValue(event: Event): void {
    this.messageControl.setValue((event.target as HTMLDivElement).textContent.trim());
  }

  ngAfterViewInit(): void {
    const element: HTMLElement = this.chat?.nativeElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  close() {
    this.commonService.newMessageWindowRequireCloseStream$.next(true);
  }

  checkChat(friend: any) {
    if (friend.friendsChatDto.chatExists) {
      const userChat = this.chatsService.userChats.find((chat) => chat.id === friend.friendsChatDto.chatId);
      this.chatsService.setCurrentChat(userChat);
    } else {
      this.socketService.createNewChat(friend.id, false, true);
    }
  }

  sendMessage() {
    const message: Message = {
      roomId: this.chatsService.currentChat.id,
      senderId: this.userService.userId,
      content: this.messageControl.value
    };
    if (this.uploadedFile) {
      this.isMessageSending = true;
      this.chatsService
        .sendMessageWithFile(message, this.uploadedFile)
        .pipe(take(1))
        .subscribe((data: Message) => {
          this.uploadedFile = null;
          this.messageControl.setValue('');
          this.customInput.nativeElement.textContent = '';
          this.isMessageSending = false;
          const newMessage: Message = data;
          const messages = this.chatsService.currentChatMessages;
          if (messages) {
            messages.push(newMessage);
            this.chatsService.currentChatMessagesStream$.next([...messages]);
          }
        });
      return;
    }

    if (!this.isEditMode) {
      this.socketService.sendMessage(message);
    } else {
      this.socketService.updateMessage({ ...this.messageToEdit, ...{ content: this.messageControl.value } });
      this.isEditMode = false;
      this.messageToEdit = null;
    }

    this.messageControl.setValue('');
    this.customInput.nativeElement.textContent = '';
  }

  fileChanges(event: Event): void {
    this.uploadedFile = (event.target as HTMLInputElement).files[0];
    this.isEditMode = false;
    setTimeout(() => {
      const element: HTMLElement = this.chat?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 0);
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: EmojiEvent): void {
    const newValue = insertEmoji(this.messageControl.value, event.emoji.native);
    this.messageControl.setValue(newValue);
    this.customInput.nativeElement.textContent = newValue;
  }

  closeEditMode(): void {
    this.chatsService.messageToEdit$.next(null);
    const element: HTMLElement = this.chat?.nativeElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    if (this.socketService.updateDeleteMessageSubs) {
      this.socketService.updateDeleteMessageSubs.unsubscribe();
    }
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }
}
