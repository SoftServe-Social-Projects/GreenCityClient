import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chat } from '../../model/Chat.model';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Message } from '../../model/Message.model';
import { FriendArrayModel, FriendModel } from '@global-user/models/friend.model';
import { Messages } from './../../model/Message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  public userChatsStream$: BehaviorSubject<Chat[]> = new BehaviorSubject<Chat[]>([]);
  public currentChatsStream$: BehaviorSubject<Chat> = new BehaviorSubject<Chat>(null);
  public currentChatMessagesStream$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  public searchedFriendsStream$: BehaviorSubject<FriendModel[]> = new BehaviorSubject<FriendModel[]>([]);
  public locationChats$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public isChatUpdateStream$: Subject<boolean> = new Subject<boolean>();
  public chatsMessages: object = {};
  private messagesIsLoading = false;
  public isSupportChat$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAdminParticipant$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private httpClient: HttpClient) {}

  public get userChats() {
    return this.userChatsStream$.getValue();
  }

  public get locationChats() {
    return this.locationChats$.getValue();
  }

  public get currentChat() {
    return this.currentChatsStream$.getValue();
  }

  public get currentChatMessages() {
    return this.currentChatMessagesStream$.getValue();
  }

  public get isSupportChat() {
    return this.isSupportChat$.getValue();
  }

  public getAllUserChats(userId: number): void {
    this.httpClient.get<Chat[]>(`${environment.backendChatLink}chat/`).subscribe((chats: Chat[]) => {
      this.userChatsStream$.next(chats);
    });
  }

  public getAllSupportChats(): void {
    this.httpClient.get<any>(`${environment.backendChatLink}chat/chats/active`).subscribe((chats) => {
      this.userChatsStream$.next(chats.page);
    });
  }

  public updateChat(chat: Chat): void {
    this.httpClient.put<Chat>(`${environment.backendChatLink}chat/`, chat).subscribe();
  }

  public getAllChatMessages(chatId: number, page: number): Observable<Messages> {
    return this.httpClient.get<Messages>(`${environment.backendChatLink}chat/messages/${chatId}?size=20&&page=${page}`);
  }

  public setCurrentChat(chat: Chat | null): void {
    // If messages are already loading.
    if (this.messagesIsLoading) {
      return;
    }
    // If current chat needs to be null
    if (!chat) {
      this.currentChatsStream$.next(chat);
      return;
    }
    // If messages for this chat is already loaded.
    if (this.chatsMessages[chat.id]) {
      this.currentChatsStream$.next(chat);
      this.currentChatMessagesStream$.next(this.chatsMessages[chat.id].page);
      return;
    }

    this.messagesIsLoading = true;
    this.getAllChatMessages(chat.id, 0).subscribe((messages: Messages) => {
      this.currentChatsStream$.next(chat);
      this.currentChatMessagesStream$.next(messages.page);
      this.chatsMessages[chat.id] = messages;
      this.messagesIsLoading = false;
    });
  }

  public updateChatMessages(id: number, page: number) {
    this.messagesIsLoading = true;
    this.getAllChatMessages(id, page).subscribe((messages: Messages) => {
      this.chatsMessages[id].page.unshift(...messages.page);
      this.isChatUpdateStream$.next(true);
      this.messagesIsLoading = false;
    });
  }

  public openCurrentChat(chatId: number) {
    const currentChat = this.userChats.find((chat) => chat.id === chatId);
    this.setCurrentChat(currentChat);
  }

  public searchFriends(name: string) {
    this.httpClient
      .get(`${environment.backendUserLink}user/findUserByName?name=${name}&page=0&size=5`)
      .subscribe((data: FriendArrayModel) => {
        this.searchedFriendsStream$.next(data.page);
      });
  }

  public getLocationsChats(userId: number) {
    this.httpClient.get(`${environment.backendChatLink}chat/locations/${userId}`).subscribe((el) => {
      this.locationChats$.next(el);
    });
  }

  public addAdminToChat(adminId: number) {
    this.httpClient.post(`${environment.backendChatLink}chat/admin/${adminId}/${this.currentChat.id}`, {}).subscribe(() => {
      const newParticipant = {
        id: adminId,
        name: '',
        email: '',
        profilePicture: null,
        userStatus: '',
        rooms: null,
        role: ''
      };
      this.currentChat.participants.push(newParticipant);
      this.isAdminParticipant$.next(true);
      const chat = this.userChats.find((el) => el.id === this.currentChat.id);
      chat.participants.push(newParticipant);
    });
  }
}
