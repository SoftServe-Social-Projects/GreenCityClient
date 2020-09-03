import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormControl, FormGroup, FormArray } from '@angular/forms';
import { UserOwnAuthService } from '@global-service/auth/user-own-auth.service';
import { CommentsService } from '../../services/comments.service';
import { CommentsModel } from '../../models/comments-model';
import { CommentsDTO } from '../../models/comments-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})
export class AddCommentComponent implements OnInit {
  @Input() commentId: number;
  @Input() dataSet = {
    placeholder: 'Add a comment',
    btnText: 'Comment',
    type: 'comment'
  };

  constructor(private commentsService: CommentsService,
              private fb: FormBuilder,
              private route: ActivatedRoute,
              private userOwnAuthService: UserOwnAuthService) { }

  public avatarImage = 'assets/img/comment-avatar.png';
  public repliesVisibility = false;
  public addCommentForm: FormGroup = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(8000)]],
  });
  public commentsSubscription: Subscription;
  public elements = [];
  public totalElements: number;
  public isLoggedIn: boolean;
  private newsId: number;
  private commentsAmount = 10;
  public elementsArePresent = true;

  ngOnInit() {
    this.newsId = this.route.snapshot.params.id;
    if (this.dataSet.type === 'comment') {
      this.addElementsByPagination();
    } else if (this.dataSet.type === 'reply') {
      this.addElemsToRepliesList();
    }
    this.checkUserSingIn();
    this.getCommentsTotalElements();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.setRepliesVisibility();
  }

  public addElementsByPagination(page = 0): void {
    this.route.url.subscribe(url => this.commentsService.ecoNewsId = url[0].path);
    this.commentsService.getActiveCommentsByPage(page, this.commentsAmount)
      .subscribe((list: CommentsModel) => this.setList(list));
  }

  private setRepliesVisibility(): void {
    this.commentsService.repliesSubject
      .subscribe((data: boolean) => {
        this.repliesVisibility = data;
      });
  }

  private addElemsToRepliesList(): void {
    this.commentsSubscription = this.commentsService.getAllReplies(this.commentId)
      .subscribe((list: CommentsModel) => {
        this.setRepliesList(list.page.filter(item => item.status !== 'DELETED'));
      });
  }

  public setList(data: CommentsModel): void {
    this.elements = [...data.page];
    this.elementsArePresent = this.elements.length > 0;
  }

  private setRepliesList(data): void {
    this.elements = [...this.elements, ...data];
  }

  public onSubmit(): void {
    this.commentsService.addComment(this.commentId, this.addCommentForm).subscribe(
      (successRes: CommentsDTO) => {
        this.elements = [successRes, ...this.elements];
        this.getCommentsTotalElements();
        this.addCommentForm.reset();
      }
    );
  }

  public getCommentsTotalElements(): void {
    this.commentsService.getCommentsCount(this.newsId)
      .subscribe((data: number) => this.totalElements = data);
  }

  private checkUserSingIn(): void {
    this.userOwnAuthService.credentialDataSubject
      .subscribe((data) => this.isLoggedIn = data && data.userId);
  }
}
