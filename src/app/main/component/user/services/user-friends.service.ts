import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { EditProfileModel } from '@global-user/models/edit-profile.model';
import { FriendArrayModel, FriendModel } from '@global-user/models/friend.model';
import { ProfileStatistics } from '@global-user/models/profile-statistiscs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserFriendsService {
  addedFriends: FriendModel[] = [];
  allUserFriends: FriendModel[] = [];
  private size = 10;
  public url: string = environment.backendUserLink;
  public urlFriend: string = environment.backendLink;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  public getUserInfo(id: number): Observable<EditProfileModel> {
    return this.http.get<EditProfileModel>(`${this.url}user/${id}/profile/`);
  }

  public getUserProfileStatistics(id: number) {
    return this.http.get<ProfileStatistics>(`${this.url}user/${id}/profileStatistics/`);
  }

  public isOnline(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}user/isOnline/${id}/`);
  }

  public getRequests(page = 0, size = this.size): Observable<FriendArrayModel> {
    return this.http.get<FriendArrayModel>(`${this.urlFriend}friends/friendRequests?page=${page}&size=${size}`);
  }

  public getAllFriends(page = 0, size = this.size): Observable<FriendArrayModel> {
    return this.http.get<FriendArrayModel>(`${this.urlFriend}friends?page=${page}&size=${size}`);
  }

  public getNewFriends(name = '', page = 0, size = this.size): Observable<FriendArrayModel> {
    return this.http.get<FriendArrayModel>(
      `${this.urlFriend}friends/not-friends-yet?name=${encodeURIComponent(name)}&page=${page}&size=${size}`
    );
  }

  public getFriendsByName(name: string, page = 0, size = this.size): Observable<FriendArrayModel> {
    return this.http.get<FriendArrayModel>(`${this.urlFriend}friends?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
  }

  public getUserFriends(userId: number, page = 0, size = this.size): Observable<FriendArrayModel> {
    return this.http.get<FriendArrayModel>(`${this.urlFriend}friends/${userId}/all-user-friends?page=${page}&size=${size}`);
  }

  public getMutualFriends(userId: number, page = 0, size = this.size): Observable<FriendArrayModel> {
    return this.http.get<FriendArrayModel>(`${this.urlFriend}friends/mutual-friends?friendId=${userId}&page=${page}&size=${size}`);
  }

  public addFriend(idFriend: number): Observable<object> {
    return this.http.post<object>(`${this.urlFriend}friends/${idFriend}`, {});
  }

  public acceptRequest(idFriend: number): Observable<object> {
    return this.http.patch<object>(`${this.urlFriend}friends/${idFriend}/acceptFriend`, {});
  }

  public declineRequest(idFriend: number): Observable<object> {
    return this.http.patch<object>(`${this.urlFriend}friends/${idFriend}/declineFriend`, {});
  }

  public deleteFriend(idFriend: number): Observable<object> {
    return this.http.delete<object>(`${this.urlFriend}friends/${idFriend}`, this.httpOptions);
  }

  public unsendFriendRequest(idFriend: number): Observable<object> {
    return this.http.delete<object>(`${this.urlFriend}friends/${idFriend}/cancelRequest`, {});
  }

  addedFriendsToHabit(friend) {
    this.addedFriends.push(friend);
  }
}
