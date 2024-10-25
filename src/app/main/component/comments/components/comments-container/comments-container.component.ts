import { PaginationConfig, CommentsDTO, CommentsModel, AddedCommentDTO } from '../../models/comments-model';
import { Component, Input, OnInit, Output, EventEmitter, DoCheck } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-comments-container',
  templateUrl: './comments-container.component.html',
  styleUrls: ['./comments-container.component.scss']
})
export class CommentsContainerComponent implements OnInit, DoCheck {
  @Input() public entityId: number;
  @Input() public dataType = 'comment';
  @Input() public comment: CommentsDTO;
  @Input() public config: PaginationConfig = {
    id: 'comment',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  @Output() public repliesCounter = new EventEmitter<number>();
  elementsList: CommentsDTO[] = [];
  isLoggedIn: boolean;
  userId: number;
  totalElements = 0;
  elementsArePresent = true;
  userReplies: CommentsDTO[] = [];
  showAllReplies: boolean;

  constructor(
    private commentsService: CommentsService,
    private userOwnAuthService: UserOwnAuthService
  ) {}

  ngDoCheck(): void {
    if (this.dataType === 'reply') {
      if (!this.comment?.showAllRelies && this.showAllReplies) {
        this.userReplies = [];
      }
      if (this.comment?.showAllRelies && !this.showAllReplies) {
        this.initCommentsList();
      }
    }
    this.showAllReplies = this.comment?.showAllRelies;
  }

  ngOnInit() {
    this.checkUserSingIn();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.initCommentsList();
    if (this.dataType === 'reply') {
      this.config.id = this.comment.id.toString();
    }
  }

  initCommentsList(): void {
    this.dataType === 'comment' ? this.getComments() : this.getReplies();
  }

  updateRepliesList(commentId: number) {
    this.initCommentsList();
    this.userReplies = this.userReplies.filter((comment) => comment.id !== commentId);
  }

  updateElementsListReply(comment: AddedCommentDTO): void {
    const reply: CommentsDTO = {
      ...comment,
      currentUserLiked: false,
      likes: 0,
      replies: 0,
      status: 'ORIGINAL'
    };

    this.userReplies = [reply, ...this.userReplies];
    this.initCommentsList();
  }

  private getComments(): void {
    this.commentsService
      .getCommentsCount(this.entityId)
      .pipe(take(1))
      .subscribe((data: number) => {
        this.totalElements = data;
        if (data) {
          this.commentsService
            .getActiveCommentsByPage(this.entityId, this.config.currentPage - 1, this.config.itemsPerPage)
            .pipe(take(1))
            .subscribe((list: CommentsModel) => {
              this.elementsList = list.page;
              this.setData(list);
            });
        } else {
          this.setNoData();
        }
      });
  }

  private getReplies(): void {
    this.commentsService
      .getRepliesAmount(this.comment.id)
      .pipe(take(1))
      .subscribe((data: number) => {
        this.repliesCounter.emit(data);
        if (this.comment.showAllRelies) {
          if (data) {
            this.commentsService
              .getActiveRepliesByPage(this.comment.id, this.config.currentPage - 1, this.config.itemsPerPage)
              .subscribe((list: CommentsModel) => {
                this.elementsList = list.page;
                this.setData(list);
              });
          } else {
            this.setNoData();
          }
        }
      });
    this.commentsService
      .getCommentsCount(this.entityId)
      .pipe(take(1))
      .subscribe((data: number) => {
        this.totalElements = data;
        const totalCountParagraph = document.getElementById('total-count');
        if (totalCountParagraph) {
          totalCountParagraph.innerHTML = data.toString();
        }
      });
  }

  private setData(data: CommentsModel) {
    this.config.totalItems = data.totalElements;
    this.elementsArePresent = data.totalElements > 0;
    this.elementsList = [...data.page];
  }

  private setNoData() {
    this.config.totalItems = 0;
    this.elementsArePresent = false;
    this.elementsList = [];
  }

  private checkUserSingIn(): void {
    this.userOwnAuthService.credentialDataSubject.subscribe((data) => {
      this.isLoggedIn = data?.userId;
      this.userId = data?.userId;
    });
  }
}
