import { LocalStorageService } from '../../../../service/localstorage/local-storage.service';
import { SharedMainModule } from '../../../shared/shared-main.module';
import { SocketService } from '../../../../service/socket/socket.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { CommentsService } from '../../services/comments.service';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LikeCommentComponent } from './like-comment.component';
import { Router } from '@angular/router';

describe('LikeCommentComponent', () => {
  let component: LikeCommentComponent;
  let fixture: ComponentFixture<LikeCommentComponent>;

  const commentsServiceMock: CommentsService = jasmine.createSpyObj('CommentsService', ['postLike']);
  commentsServiceMock.postLike = () => new Observable();

  const socketServiceMock: SocketService = jasmine.createSpyObj('SocketService', ['onMessage', 'send']);
  socketServiceMock.onMessage = () => new Observable();
  socketServiceMock.send = () => {};
  socketServiceMock.connection = {
    greenCity: { url: '', socket: null, state: null },
    greenCityUser: { url: '', socket: null, state: null }
  };
  socketServiceMock.initiateConnection = () => {};

  const localStorageServiceMock: LocalStorageService = jasmine.createSpyObj('LocalStorageService', ['userIdBehaviourSubject']);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);

  const routerMock = { url: '' };

  const commentData = {
    author: {
      id: 1,
      name: 'Test',
      userProfilePicturePath: null
    },
    currentUserLiked: true,
    id: 1,
    likes: 0,
    modifiedDate: '111',
    replies: 1,
    status: 'EDITED',
    text: 'string'
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LikeCommentComponent],
      imports: [SharedMainModule, HttpClientTestingModule],
      providers: [
        { provide: CommentsService, useValue: commentsServiceMock },
        { provide: SocketService, useValue: socketServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LikeCommentComponent);
    component = fixture.componentInstance;
    (component as any).comment = commentData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check ', () => {
    const spy = spyOn(component, 'checkSocketMessageToSubscribe');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should change view of like button', () => {
    const msg = {
      id: 8877,
      amountLikes: 1,
      liked: true,
      userId: 1111
    };
    component.changeLkeBtn(msg);
    expect(component.likeState).toBeTruthy();
    expect(component.like.nativeElement.srcset).toEqual(component.commentsImages.liked);
  });
});
