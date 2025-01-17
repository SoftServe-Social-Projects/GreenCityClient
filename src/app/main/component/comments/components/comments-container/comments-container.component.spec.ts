import { ComponentFixture, fakeAsync, waitForAsync, flush, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentsContainerComponent } from './comments-container.component';
import { CommentsDTO, CommentsModel } from '../../models/comments-model';
import { of } from 'rxjs';
import { MOCK_COMMENTS_DTO } from '../../mocks/comments-mock';

const MOCK_COMMENTS_MODEL: CommentsModel = {
  currentPage: 0,
  page: [{ id: 1 } as CommentsDTO],
  totalElements: 0
};

describe('CommentsContainerComponent', () => {
  let component: CommentsContainerComponent;
  let fixture: ComponentFixture<CommentsContainerComponent>;

  const commentsServiceMock: jasmine.SpyObj<CommentsService> = jasmine.createSpyObj('CommentsService', [
    'getCommentsCount',
    'getActiveCommentsByPage',
    'getRepliesAmount',
    'getActiveRepliesByPage'
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CommentsContainerComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        RouterModule,
        TranslateModule.forRoot()
      ],
      providers: [{ provide: CommentsService, useValue: commentsServiceMock }, UserOwnAuthService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  describe('Tests with non zero amount', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CommentsContainerComponent);
      component = fixture.componentInstance;
      component.entityId = 1;
      component.comment = MOCK_COMMENTS_DTO;

      commentsServiceMock.getCommentsCount.and.returnValue(of(10));
      commentsServiceMock.getActiveCommentsByPage.and.returnValue(of(MOCK_COMMENTS_MODEL));
      commentsServiceMock.getRepliesAmount.and.returnValue(of(10));
      commentsServiceMock.getActiveRepliesByPage.and.returnValue(of(MOCK_COMMENTS_MODEL));
      commentsServiceMock.getActiveRepliesByPage.calls.reset();

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize when data type is comment', () => {
      component.dataType = 'comment';
      component.ngOnInit();

      expect(commentsServiceMock.getCommentsCount).toHaveBeenCalledWith(1);
      expect(commentsServiceMock.getActiveCommentsByPage).toHaveBeenCalledWith(1, 0, 10);
    });

    it('should initialize when data type is reply', () => {
      component.dataType = 'reply';
      component.comment.showAllRelies = true;
      component.ngOnInit();

      expect(commentsServiceMock.getRepliesAmount).toHaveBeenCalledWith(0);
      expect(commentsServiceMock.getActiveRepliesByPage).toHaveBeenCalledWith(0, 0, 10);
    });

    it('should not initialize reply untill it is not open', () => {
      component.dataType = 'reply';
      component.showAllReplies = false;
      component.comment.showAllRelies = false;
      component.ngOnInit();

      expect(commentsServiceMock.getRepliesAmount).toHaveBeenCalledWith(0);
      expect(commentsServiceMock.getActiveRepliesByPage).not.toHaveBeenCalled();

      component.comment.showAllRelies = true;
      fixture.detectChanges();

      expect(commentsServiceMock.getActiveRepliesByPage).toHaveBeenCalledWith(0, 0, 10);
    });

    it('should update elements list for reply', () => {
      const addedComment: any = { ...MOCK_COMMENTS_DTO, id: 1 };
      component.userReplies = [{ id: 2 } as CommentsDTO];

      component.updateElementsListReply(addedComment);
      expect(component.userReplies.length).toBe(2);
    });

    it('should clear userReplies when conditions are met', () => {
      component.dataType = 'reply';
      component.showAllReplies = true;
      component.comment.showAllRelies = false;
      component.userReplies = [{ id: 2 } as CommentsDTO];

      fixture.detectChanges();

      expect(component.userReplies.length).toBe(0);
    });

    it('should not clear userReplies when conditions are not met', () => {
      component.showAllReplies = false;
      component.userReplies = [{ id: 2 } as CommentsDTO];

      fixture.detectChanges();

      expect(component.userReplies.length).toBe(1);
    });

    it('should not clear userReplies when conditions are not met', () => {
      component.showAllReplies = true;
      component.comment = { ...component.comment, showAllRelies: true };
      component.userReplies = [{ id: 2 } as CommentsDTO];

      fixture.detectChanges();

      expect(component.userReplies.length).toBe(1);
    });
  });

  describe('Tests with zero amount', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CommentsContainerComponent);
      component = fixture.componentInstance;
      component.entityId = 1;
      component.comment = MOCK_COMMENTS_DTO;

      commentsServiceMock.getCommentsCount.and.returnValue(of(0));
      commentsServiceMock.getRepliesAmount.and.returnValue(of(0));
      commentsServiceMock.getActiveCommentsByPage.calls.reset();
      commentsServiceMock.getActiveRepliesByPage.calls.reset();

      fixture.detectChanges();
    });

    it('should not initialize comment when amount is 0', () => {
      component.dataType = 'comment';
      component.ngOnInit();

      expect(commentsServiceMock.getCommentsCount).toHaveBeenCalledWith(1);
      expect(commentsServiceMock.getActiveCommentsByPage).not.toHaveBeenCalled();
    });

    it('should not initialize reply when amount is 0', () => {
      component.dataType = 'reply';
      component.ngOnInit();

      expect(commentsServiceMock.getRepliesAmount).toHaveBeenCalledWith(0);
      expect(commentsServiceMock.getActiveCommentsByPage).not.toHaveBeenCalled();
    });

    it('should set replies to empty if amount became 0', fakeAsync(() => {
      component.elementsList = [MOCK_COMMENTS_DTO];
      component.elementsArePresent = true;
      component.comment.showAllRelies = true;

      component.dataType = 'reply';
      component.ngOnInit();
      flush();

      expect(component.elementsList.length).toBe(0);
      expect(component.elementsArePresent).toBeFalsy();
    }));

    it('should set comments to empty if amount became 0', fakeAsync(() => {
      component.elementsList = [MOCK_COMMENTS_DTO];
      component.elementsArePresent = true;

      component.dataType = 'comment';
      component.ngOnInit();
      flush();

      expect(component.elementsList.length).toBe(0);
      expect(component.elementsArePresent).toBeFalsy();
    }));
  });
});
