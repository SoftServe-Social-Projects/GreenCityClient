import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Chat, ChatDto, LocationForChat } from '../../model/Chat.model';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Message, MessageExtended, MessagesToSave } from '../../model/Message.model';
import { FriendArrayModel, FriendModel } from '@global-user/models/friend.model';
import { Messages } from './../../model/Message.model';
import { concatMap, map } from 'rxjs/operators';
import { OrderService } from '@ubs/ubs/services/order.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  userChatsStream$: BehaviorSubject<Chat[]> = new BehaviorSubject<Chat[]>([]);
  currentChatStream$: BehaviorSubject<Chat> = new BehaviorSubject<Chat>(null);
  currentChatPageData$: BehaviorSubject<ChatDto> = new BehaviorSubject<ChatDto>(null);
  currentChatMessagesStream$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  searchedFriendsStream$: BehaviorSubject<FriendModel[]> = new BehaviorSubject<FriendModel[]>([]);
  isChatUpdateStream$: Subject<boolean> = new Subject<boolean>();
  locations$: BehaviorSubject<LocationForChat[]> = new BehaviorSubject([]);
  chatsMessages: { [key: string]: MessagesToSave } = {};
  messagesIsLoading = false;
  isSupportChat$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isAdminParticipant$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  messageToEdit$: BehaviorSubject<Message> = new BehaviorSubject<Message>(null);
  supportChatPageSize = 10;
  messagesPageSize = 20;

  constructor(
    private httpClient: HttpClient,
    private orderService: OrderService,
    private localStorageService: LocalStorageService
  ) {}

  get userChats() {
    return this.userChatsStream$.getValue();
  }

  get locations() {
    return this.locations$.getValue();
  }

  get currentChat() {
    return this.currentChatStream$.getValue();
  }

  get currentChatMessages() {
    return this.currentChatMessagesStream$.getValue();
  }

  get isSupportChat() {
    return this.isSupportChat$.getValue();
  }

  get currentChatMessages$(): Observable<MessageExtended[]> {
    return this.currentChatMessagesStream$.pipe(
      map((messages) => {
        return messages.map((message, index, array) => {
          const isFirstOfDay = index === 0 || !this.isSameDay(message.createDate, array[index - 1].createDate);
          const isLiked = message?.likes?.some((el) => el.id === this.localStorageService.getUserId());
          return { ...message, isFirstOfDay, isLiked: !!isLiked };
        });
      })
    );
  }

  private isSameDay(value1: string, value2: string): boolean {
    const date1 = new Date(value1);
    const date2 = new Date(value2);
    return date1.getDate() === date2.getDate() && date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
  }

  getAllUserChats(userId: number): void {
    this.httpClient.get<Chat[]>(`${environment.backendChatLink}chat`).subscribe((chats: Chat[]) => {
      this.userChatsStream$.next(chats);
    });
  }

  getAllSupportChats(page = 0, pageSize = this.supportChatPageSize): void {
    this.httpClient
      .get<ChatDto>(`${environment.backendChatLink}chat/chats/active?page=${page}&size=${pageSize}`)
      .subscribe((chats: ChatDto) => {
        const previousChats = this.userChatsStream$.getValue();
        const newChats = chats.page.filter((chat) => !previousChats?.find((el) => el.id === chat.id));
        const updatedChats = [...previousChats, ...newChats];
        this.currentChatPageData$.next(chats);
        this.userChatsStream$.next(updatedChats);
      });
  }

  updateChat(chat: Chat): void {
    this.httpClient.put<Chat>(`${environment.backendChatLink}chat/`, chat).subscribe();
  }

  getAllChatMessages(chatId: number, page: number, size = this.messagesPageSize): Observable<Messages> {
    return this.httpClient.get<Messages>(`${environment.backendChatLink}chat/messages/${chatId}?size=${size}&page=${page}`);
  }

  setCurrentChat(chat: Chat | null): void {
    this.messageToEdit$.next(null);
    // If messages are already loading.
    if (this.messagesIsLoading) {
      return;
    }
    // If current chat needs to be null
    if (!chat) {
      this.currentChatStream$.next(null);
      return;
    }
    // If messages for this chat is already loaded.
    if (this.chatsMessages[chat.id]) {
      this.currentChatStream$.next(chat);
      this.currentChatMessagesStream$.next(this.chatsMessages[chat.id].page);
      return;
    }

    this.messagesIsLoading = true;
    this.getAllChatMessages(chat.id, 0).subscribe((messages: Messages) => {
      this.currentChatStream$.next(chat);
      this.currentChatMessagesStream$.next(messages.page);
      this.chatsMessages[chat.id] = messages;
      this.chatsMessages[chat.id].newMessagesAmount = 0;
      this.messagesIsLoading = false;
    });
  }

  updateChatMessages(id: number, page: number) {
    this.messagesIsLoading = true;
    const numberOfVisibleMessages = this.chatsMessages[id].page.length;
    const pageToLoad = Math.floor(numberOfVisibleMessages / this.messagesPageSize);

    this.getAllChatMessages(id, pageToLoad).subscribe((messages: Messages) => {
      const filtredMessages = messages.page.filter((message) => {
        const isMessageAlreadyVisible = this.chatsMessages[id].page.some((el) => el.id === message.id);
        return !isMessageAlreadyVisible;
      });
      this.chatsMessages[id].page.unshift(...filtredMessages);
      this.messagesIsLoading = false;
    });
  }

  openCurrentChat(chatId: number): void {
    const currentChat = this.userChats.find((chat) => chat.id === chatId);
    this.setCurrentChat(currentChat);
  }

  searchFriends(name: string) {
    this.httpClient
      .get(`${environment.backendUserLink}user/findUserByName?name=${name}&page=0&size=5`)
      .subscribe((data: FriendArrayModel) => {
        this.searchedFriendsStream$.next(data.page);
      });
  }

  getLocationsChats(userId: number, courierId: number): Observable<LocationForChat[]> {
    return this.httpClient.get<LocationForChat[]>(`${environment.backendChatLink}chat/locationsByCourier/${userId}?courierId=${courierId}`);
  }

  addAdminToChat(adminId: number): void {
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

  sendMessageWithFile(message: Message, file: File): Observable<Message> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    const jsonBlob = new Blob([JSON.stringify(message)], { type: 'application/json' });
    formData.append('chatMessageDto', jsonBlob);
    const httpOptions = {
      headers: new HttpHeaders()
    };
    httpOptions.headers.append('Content-Type', 'multipart/form-data');

    return this.isImage(file)
      ? this.httpClient.post<Message>(`${environment.backendChatLink}chat/upload/image`, formData, httpOptions)
      : this.httpClient.post<Message>(`${environment.backendChatLink}chat/upload/file`, formData, httpOptions);
  }

  isImage(file: File): boolean {
    return file && file.type.split('/')[0] === 'image';
  }

  getFile(img: string): Observable<Blob> {
    return this.httpClient.get(img, { responseType: 'blob' });
  }

  loadChats(userId: number, isUbsAdmin?: boolean): void {
    if (isUbsAdmin) {
      this.getAllSupportChats();
      return;
    }

    this.orderService
      .getAllActiveCouriers()
      .pipe(
        concatMap((data) => {
          const courierId = data.find((courier) => courier.nameEn.includes('UBS')).courierId;
          return this.getLocationsChats(userId, courierId);
        })
      )
      .subscribe((locations: LocationForChat[]) => {
        this.locations$.next(locations);
      });

    this.getAllUserChats(userId);
  }

  resetData(): void {
    this.userChatsStream$.next([]);
    this.currentChatStream$.next(null);
    this.currentChatPageData$.next(null);
    this.currentChatMessagesStream$.next([]);
    this.locations$.next([]);
  }
}
