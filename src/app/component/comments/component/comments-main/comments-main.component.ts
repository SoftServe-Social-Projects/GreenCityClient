import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommentService } from '../../services/comment.service';
import { UserOwnAuthService } from '@global-service/auth/user-own-auth.service';
import { CommentsDTO, CommentsModel } from '../../models/comments-model';

@Component({
  selector: 'app-comments-main',
  templateUrl: './comments-main.component.html',
  styleUrls: ['./comments-main.component.scss']
})
export class CommentsMainComponent implements OnInit, OnDestroy {
  public elementsList: CommentsDTO[] = [];
  public commentsSubscription: Subscription;
  public isLoggedIn: boolean;
  public userId: number;
  public dataType = 'comment';
  public totalElements: number;
  private newsId: number;
  public elementsArePresent = true;
  public config = {
    id: 'comment',
    itemsPerPage: 10,
    currentPage: 0,
    totalItems: 0
  };

  constructor(private commentService: CommentService,
    private route: ActivatedRoute,
    private userOwnAuthService: UserOwnAuthService) { }

  ngOnInit() {
    this.checkUserSingIn();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.newsId = this.route.snapshot.params.id;
    this.addEcoNewsId();
    this.addCommentByPagination();
    this.getActiveComments();
    this.getCommentsTotalElements();
  }

  public addEcoNewsId(): void {
    this.route.url.subscribe(url => this.commentService.ecoNewsId = url[0].path);
  }

  public addCommentByPagination(page = 0): void {
    this.commentsSubscription = this.commentService.getActiveCommentsByPage(page, this.config.itemsPerPage)
      .subscribe((list: CommentsModel) => this.setCommentsList(list));
  }

  public setCommentsList(data: CommentsModel): void {
    this.elementsList = [...data.page];
    this.elementsArePresent = this.elementsList.length > 0;
  }

  private checkUserSingIn(): void {
    this.userOwnAuthService.credentialDataSubject
      .subscribe((data) => {
        this.isLoggedIn = data && data.userId;
        this.userId = data.userId;
      });
  }

  public addComment(data): void {
    this.elementsList = [data, ...this.elementsList];
    this.getCommentsTotalElements();
  }

  public deleteComment(data: CommentsDTO[]): void {
    this.elementsList = data;
    this.getCommentsTotalElements();
  }

  public getCommentsTotalElements(): void {
    this.commentService.getCommentsCount(this.newsId)
      .subscribe((data: number) => this.totalElements = data);
  }

  public getActiveComments(): void {
    this.commentService.getActiveCommentsByPage(0, this.config.itemsPerPage)
      .subscribe((el: CommentsModel) => {
        this.setData(el.currentPage, el.totalElements);
      });
  }

  public setData(currentPage: number, totalElements: number) {
    this.config.currentPage = currentPage;
    this.config.totalItems = totalElements;
  }

  ngOnDestroy() {
    this.commentsSubscription.unsubscribe();
  }
}
