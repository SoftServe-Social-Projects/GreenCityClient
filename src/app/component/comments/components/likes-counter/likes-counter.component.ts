import { Component, Input, OnInit } from '@angular/core';
import { CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-likes-counter',
  templateUrl: './likes-counter.component.html',
  styleUrls: ['./likes-counter.component.scss']
})
export class LikesCounterComponent implements OnInit {
  @Input() public likesAmount: number;
  @Input() public commentId: number;
  public likeImg = 'assets/img/comments/like.png';

  constructor(private commentsService: CommentsService) { }

  ngOnInit() {
    this.getLikesFromServer();
  }

  private getLikesFromServer(): void {
    this.commentsService.getCommentLikes(this.commentId)
      .subscribe((data: number) => this.likesAmount = data);
  }
}
