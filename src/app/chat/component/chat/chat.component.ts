import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatsService } from '../../service/chats/chats.service';
import { CHAT_ICONS } from '../../chat-icons';
import { Message } from '../../model/Message.model';
import { FormControl } from '@angular/forms';
import { SocketService } from '../../service/socket/socket.service';
import { UserService } from '@global-service/user/user.service';
import { insertEmoji } from 'src/app/main/component/comments/components/add-emoji/add-emoji';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  chatIcons = CHAT_ICONS;
  shouldNotBeScrolled = false;
  @ViewChild('chat') chat: ElementRef;
  messageControl: FormControl = new FormControl();
  isHaveMessages = true;
  showEmojiPicker = false;

  private page = 0;
  private oldScrollHeight: number;
  private isChatUpdate = false;

  constructor(
    public readonly chatsService: ChatsService,
    private readonly socketService: SocketService,
    public readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.chatsService.currentChatMessagesStream$.subscribe((messages) => {
      this.shouldNotBeScrolled = false;
      this.isHaveMessages = messages.length !== 0;
    });
    this.chatsService.isChatUpdateStream$.subscribe((isUpdate) => {
      this.isChatUpdate = isUpdate;
    });
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.chat.nativeElement;
    if (this.isChatUpdate) {
      element.scrollTop = element.scrollHeight - this.oldScrollHeight + element.scrollTop;
      this.isChatUpdate = false;
    }
    if (!this.shouldNotBeScrolled) {
      element.scrollTop = element.scrollHeight;
      this.shouldNotBeScrolled = true;
    }
  }

  sendMessage() {
    const messageContent = this.messageControl.value.trim();
    if (messageContent) {
      const message: Message = {
        roomId: this.chatsService.currentChat.id,
        senderId: this.userService.userId,
        content: this.messageControl.value
      };
      this.messageControl.reset();
      this.socketService.sendMessage(message);
    }
  }

  onScroll() {
    this.oldScrollHeight = this.chat.nativeElement.scrollHeight;
    this.page += 1;
    this.chatsService.updateChatMessages(this.chatsService.currentChat.id, this.page);
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event): void {
    const newValue = insertEmoji(this.messageControl.value, event.emoji.native);
    this.messageControl.setValue(newValue);
  }
}
