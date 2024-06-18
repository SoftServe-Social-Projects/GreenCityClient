import { Component } from '@angular/core';
import { ChatsService } from '../../service/chats/chats.service';
import { CHAT_ICONS } from '../../chat-icons';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chat-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss']
})
export class ChatModalComponent {
  chatIcons = CHAT_ICONS;

  constructor(
    private dialogRef: MatDialogRef<ChatModalComponent>,
    private chatsService: ChatsService
  ) {}

  close() {
    this.chatsService.setCurrentChat(null);
    this.chatsService.chatsMessages = {};
    this.dialogRef.close();
  }
}
