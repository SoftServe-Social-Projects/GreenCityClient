import { SocketService } from './../../../../service/socket/socket.service';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { CommentsDTO } from '../../models/comments-model';

@Component({
  selector: 'app-like-comment',
  templateUrl: './like-comment.component.html',
  styleUrls: ['./like-comment.component.scss']
})
export class LikeCommentComponent implements OnInit {
  @Input() private comment: CommentsDTO;
  @Output() public likesCounter = new EventEmitter();
  @ViewChild('like', { static: true }) like: ElementRef;
  public likeState: boolean;
  public error = false;
  public commentsImages = {
    like: 'assets/img/comments/like.png',
    liked: 'assets/img/comments/liked.png'
  };

  constructor( private commentsService: CommentsService,
              private socketService: SocketService ) {

    //socket to subscribe to chenges to comment id
    console.log('SOCKET', 'SUBSCRITE TO CHENGES FOR id', this.comment.id)
    this.socketService.onMessage('/app/econews/comment/likeAndCount?id='+this.comment.id)
  }

  ngOnInit() {
    this.likeState = this.comment.currentUserLiked;
    this.setStartingElements(this.likeState);
  }

  private setStartingElements(state: boolean) {
    const imgName = state ? 'liked' : 'like';
    this.like.nativeElement.srcset = this.commentsImages[imgName];
  }

  public pressLike(): void {
    this.commentsService.postLike(this.comment.id)
      .subscribe(() => {
        this.changeLkeBtn();
        this.getLikesFromServer();
      });
    // socket send like
    console.log('SOCKET', 'SEND LIKE for comment id', this.comment.id)
    this.socketService.onMessage('/app/econews/comment/likeAndCount?id='+this.comment.id)
  }

  public changeLkeBtn(): void {
    const cond = this.like.nativeElement.srcset === this.commentsImages.like;
    const imgName = cond ? 'liked' : 'like';
    this.like.nativeElement.srcset = this.commentsImages[imgName];
    this.likeState = !this.likeState;
  }

  private getLikesFromServer(): void {
    this.commentsService.getCommentLikes(this.comment.id)
      .subscribe((data: number) => this.likesCounter.emit(data),
      () => this.error = true);
  }
}
