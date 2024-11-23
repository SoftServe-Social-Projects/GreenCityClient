import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { UserFriendsService } from './user-friends.service';
import { UserDataAsFriend } from '@global-user/models/friend.model';
import { FriendStatusValues } from '@global-user/models/friend.model';
import { FRIENDS } from '@global-user/mocks/friends-mock';

describe('UserFriendsService', () => {
  let injector: TestBed;
  let userFriendsService: UserFriendsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserFriendsService]
    });
    injector = getTestBed();
    userFriendsService = injector.inject(UserFriendsService);
    httpMock = injector.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const service: UserFriendsService = TestBed.inject(UserFriendsService);
    expect(service).toBeTruthy();
  });

  describe('getAllFriends', () => {
    it('should return an FriendArrayModel', () => {
      userFriendsService.getAllFriends().subscribe((users) => {
        expect(users.page.length).toBe(2);
      });

      const req = httpMock.expectOne(`${userFriendsService.urlFriend}friends?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(FRIENDS);
    });
  });

  describe('getNewFriends', () => {
    it('should return an object on calling getNewFriends', () => {
      userFriendsService.getNewFriends('', 0).subscribe((users) => {
        expect(users.page.length).toBe(2);
      });

      const req = httpMock.expectOne(`${userFriendsService.urlFriend}friends/not-friends-yet?name=&page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(FRIENDS);
    });
  });

  describe('getRequests', () => {
    it('should return a requests', () => {
      userFriendsService.getRequests().subscribe((users) => {
        expect(users.page.length).toBe(2);
      });

      const req = httpMock.expectOne(`${userFriendsService.urlFriend}friends/friendRequests?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(FRIENDS);
    });
  });

  describe('addFriend', () => {
    it('should return an object on calling addFriend', () => {
      let response;
      userFriendsService.addFriend(2).subscribe((data) => {
        response = data;
      });

      const req = httpMock.expectOne(`${userFriendsService.urlFriend}friends/2`);
      expect(req.request.method).toBe('POST');
    });
  });

  describe('acceptRequest', () => {
    it('should return an object on calling acceptRequest', () => {
      let response;
      userFriendsService.acceptRequest(2).subscribe((data) => {
        response = data;
      });

      const req = httpMock.expectOne(`${userFriendsService.urlFriend}friends/2/acceptFriend`);
      expect(req.request.method).toBe('PATCH');
    });
  });

  describe('declineRequest', () => {
    it('should return an object on calling declineRequest', () => {
      let response;
      userFriendsService.declineRequest(2).subscribe((data) => {
        response = data;
      });

      const req = httpMock.expectOne(`${userFriendsService.urlFriend}friends/2/declineFriend`);
      expect(req.request.method).toBe('PATCH');
    });
  });

  describe('deleteFriend', () => {
    it('should return an object on calling deleteFriend', () => {
      let response;
      userFriendsService.deleteFriend(2).subscribe((data) => {
        response = data;
      });

      const req = httpMock.expectOne(`${userFriendsService.urlFriend}friends/2`);
      expect(req.request.method).toBe('DELETE');
    });
  });

  describe('findNewFriendsByName', () => {
    it('should return an object on calling findNewFriendsByName', () => {
      userFriendsService.getNewFriends(FRIENDS.page[0].name, 0, 10).subscribe((users) => {
        expect(users.page.length).toBeGreaterThanOrEqual(2);
      });

      const req = httpMock.expectOne(`${userFriendsService.urlFriend}friends/not-friends-yet?name=${FRIENDS.page[0].name}&page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(FRIENDS);
    });
  });

  describe('getFriendsByName', () => {
    it('should return an object on calling getFriendsByName', () => {
      userFriendsService.getFriendsByName(FRIENDS.page[0].name).subscribe((users) => {
        expect(users).toBeTruthy();
      });

      const req = httpMock.expectOne(`${userFriendsService.urlFriend}friends?name=${FRIENDS.page[0].name}&page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(FRIENDS);
    });
  });

  it('userFriends', () => {
    userFriendsService.getUserFriends(1).subscribe((friends) => {
      expect(friends).toEqual(friends);
    });

    const req = httpMock.expectOne(
      `${userFriendsService.urlFriend}friends/1/all-user-friends?page=0&size=${(userFriendsService as any).size}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(FRIENDS);
  });

  it('mutual friends', () => {
    userFriendsService.getMutualFriends(1).subscribe((friends) => {
      expect(friends).toEqual(friends);
    });

    const req = httpMock.expectOne(
      `${userFriendsService.urlFriend}friends/mutual-friends?friendId=1&page=0&size=${(userFriendsService as any).size}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(FRIENDS);
  });

  it('should get User Data As Friend', () => {
    const userData: UserDataAsFriend = { id: 1, chatId: null, friendStatus: FriendStatusValues.REQUEST, requesterId: 1 };
    userFriendsService.getUserDataAsFriend(1).subscribe((data) => {
      expect(data).toEqual(userData);
    });

    const req = httpMock.expectOne(`${userFriendsService.urlFriend}friends/user-data-as-friend/1`);
    expect(req.request.method).toBe('GET');
    req.flush(userData);
  });
});
