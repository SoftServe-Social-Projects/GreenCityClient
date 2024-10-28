import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { CommentsDTO, SocketAmountLikes } from '../../models/comments-model';
import { Router } from '@angular/router';
import { SocketService } from '@global-service/socket/socket.service';

@Component({
  selector: 'app-like-comment',
  templateUrl: './like-comment.component.html',
  styleUrls: ['./like-comment.component.scss']
})
export class LikeCommentComponent implements OnInit {
  @Input() public entityId: number;
  @Input() private comment: CommentsDTO;
  @Output() public likesCounter = new EventEmitter();
  @ViewChild('like', { static: true }) like: ElementRef;
  likeState: boolean;
  private userId: number;
  error = false;
  commentsImages = {
    like: 'assets/img/comments/like.png',
    liked: 'assets/img/comments/liked.png'
  };
  socketMessageToSubscribe: string;
  socketMessageToSend: string;

  constructor(
    private commentsService: CommentsService,
    private socketService: SocketService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {
    this.socketService.initiateConnection(this.socketService.connection.greenCity);
  }

  ngOnInit() {
    this.likeState = this.comment.currentUserLiked;
    this.setStartingElements(this.likeState);
    this.checkSocketMessageToSubscribe();
    this.onConnectedtoSocket();
  }

  checkSocketMessageToSubscribe() {
    const routes = ['news', 'events', 'allhabits'];

    const matchingRoute = routes.find((route) => this.router.url.includes(route));

    if (matchingRoute) {
      this.socketMessageToSubscribe = `/topic/${this.comment.id}/comment`;
      this.socketMessageToSend = '/app/likeAndCount';
    }
  }

  onConnectedtoSocket(): void {
    this.socketService.onMessage(this.socketService.connection.greenCity, this.socketMessageToSubscribe).subscribe((msg) => {
      this.changeLkeBtn(msg);
      this.likesCounter.emit(msg.amountLikes);
    });
  }

  private setStartingElements(state: boolean) {
    const imgName = state ? 'liked' : 'like';
    this.like.nativeElement.srcset = this.commentsImages[imgName];
  }

  getUserId(): void {
    this.localStorageService.userIdBehaviourSubject.subscribe((id) => (this.userId = id));
  }

  pressLike(): void {
    this.commentsService.postLike(this.comment.id).subscribe(() => {
      this.getUserId();
      this.socketService.send(this.socketService.connection.greenCity, this.socketMessageToSend, {
        id: this.comment.id,
        amountLikes: this.likeState ? 0 : 1,
        userId: this.userId
      });
    });
  }

  changeLkeBtn(msg: SocketAmountLikes): void {
    if (msg.liked) {
      this.likeState = true;
      this.like.nativeElement.srcset = this.commentsImages.liked;
    } else {
      this.likeState = false;
      this.like.nativeElement.srcset = this.commentsImages.like;
    }
  }
}
