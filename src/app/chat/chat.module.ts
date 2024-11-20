import { NgModule } from '@angular/core';
import { ChatPopupComponent } from './component/chat-popup/chat-popup.component';
import { ChatsListComponent } from './component/chats-list/chats-list.component';
import { ChatsSearchPipe } from './pipe/chats-search/chats-search.pipe';
import { NewMessageWindowComponent } from './component/new-message-window/new-message-window.component';
import { ReferenceDirective } from './directive/reference/reference.directive';
import { ChatModalComponent } from './component/chat-modal/chat-modal.component';
import { CurrentChatComponent } from './component/current-chat/current-chat.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ChatMessageComponent } from './component/chat-message/chat-message.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ChatPopupComponent,
    ChatsListComponent,
    ChatsSearchPipe,
    NewMessageWindowComponent,
    ReferenceDirective,
    ChatModalComponent,
    CurrentChatComponent,
    ChatMessageComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    InfiniteScrollModule,
    PickerModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    CommonModule,
    MatTabsModule,
    SharedModule
  ],
  exports: [ChatPopupComponent]
})
export class ChatModule {}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
