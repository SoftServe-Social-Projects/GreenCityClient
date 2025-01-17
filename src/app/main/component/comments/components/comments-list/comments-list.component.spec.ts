import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CUSTOM_ELEMENTS_SCHEMA, Renderer2 } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommentsListComponent } from './comments-list.component';
import { CommentsService } from '../../services/comments.service';
import { of } from 'rxjs';
import { DateLocalisationPipe } from '@pipe/date-localisation-pipe/date-localisation.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

describe('CommentsListComponent', () => {
  let component: CommentsListComponent;
  let fixture: ComponentFixture<CommentsListComponent>;

  const commentsServiceMock: any = {
    editComment: jasmine.createSpy('editComment').and.returnValue(of()),

    getActiveRepliesByPage: jasmine.createSpy('getActiveRepliesByPage').and.returnValue(
      of({
        currentPage: 1,
        page: [
          {
            author: { id: 1, name: 'Test', profilePicturePath: null },
            currentUserLiked: false,
            id: 1,
            likes: 5,
            modifiedDate: '2022-01-01',
            replies: 2,
            status: 'ACTIVE',
            text: 'Test reply',
            showAllRelies: true
          }
        ],
        totalElements: 1
      })
    )
  };
  commentsServiceMock.editComment = () => of();
  const matDialogMock = {
    open() {
      return {
        afterClosed: () => of(true)
      };
    }
  };

  const matDialogRefMock = jasmine.createSpyObj(['close', 'afterClosed']);
  matDialogRefMock.afterClosed.and.returnValue(of(true));

  const commentData = {
    author: {
      id: 1,
      name: 'Test',
      profilePicturePath: null
    },
    currentUserLiked: true,
    id: 1,
    likes: 0,
    modifiedDate: '111',
    replies: 1,
    status: 'EDITED',
    text: 'string',
    isEdit: true,
    showRelyButton: true
  };

  const routerMock = jasmine.createSpyObj('router', ['navigate']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CommentsListComponent, DateLocalisationPipe],
      imports: [HttpClientTestingModule, NgxPaginationModule, ReactiveFormsModule, TranslateModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: CommentsService, useValue: commentsServiceMock },
        { provide: Renderer2, useValue: {} },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: Router, useValue: routerMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentsListComponent);
    component = fixture.componentInstance;
    component.config = {
      id: 'string',
      itemsPerPage: 1,
      currentPage: 1,
      totalItems: 1
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize property ', () => {
    expect(component.types).toBeDefined();
    expect(component.content).toBeDefined();
    expect(component.content instanceof FormControl).toBe(true);
    expect(component.content.errors).toEqual({ required: true });
    expect((component as any).commentHtml).toBe('');
  });

  it('should emit event when user delete comment', () => {
    const spy = spyOn(component.changedList, 'emit');
    component.deleteComment(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should return comments status', () => {
    expect(component.isCommentEdited(commentData)).toBeTruthy();
  });

  it('should send data when user save edited content', () => {
    component.content.setValue('Updated comment text');

    component['commentHtml'] = 'Updated comment text';

    const spy = spyOn((component as any).commentsService, 'editComment').and.returnValue(of());

    component.saveEditedComment(commentData);
    expect(spy).toHaveBeenCalled();
  });

  it('should cancel edit comment', () => {
    component.cancelEditedComment(commentData);
    expect(commentData.isEdit).toBeFalsy();
  });

  it('should cancel edited comment when user confirms', () => {
    spyOn((component as any).dialog, 'open').and.returnValue({ afterClosed: () => of(true) });

    component.cancelEditedComment(commentData);

    expect((component as any).isEdit).toBeFalsy();
  });

  it('should not cancel edited comment when user cancels', () => {
    (component as any).isEdit = true;
    spyOn((component as any).dialog, 'open').and.returnValue({
      afterClosed: () => of(false)
    } as any);
    component.cancelEditedComment(commentData);

    expect((component as any).isEdit).toBeTruthy();
  });

  it('should change counter if user clicks like', () => {
    const spy = spyOn(component.elementsList, 'map').and.returnValues([commentData]);
    component.changeCounter(1, commentData.id, 'likes');
    fixture.debugElement.triggerEventHandler('click', commentData.likes++);
    expect(spy).toHaveBeenCalled();
    expect(commentData.likes).toBe(1);
  });

  it('should show page elements if user clicks reply', () => {
    const spyMap = spyOn(component.elementsList, 'map').and.returnValue([commentData]);
    const spyFilter = spyOn(component.elementsList, 'filter').and.returnValue([commentData]);
    const spyUpdateControl = spyOn(component, 'updateContentControl');
    component.showElements(1, 'showRelyButton');
    expect(spyMap).toHaveBeenCalled();
    expect(spyUpdateControl).toHaveBeenCalledWith(1);
    expect(spyMap.length).toBe(1);
  });

  it('should update content form controls when user reply', () => {
    component.content.setValue('old value');
    const spyFilter = spyOn(component.elementsList, 'filter').and.returnValue([commentData]);
    component.showElements(1, 'showRelyButton');
    expect(component.content.value).toBe(commentData.text);
    expect(component.isEditTextValid).toBeTruthy();
  });

  it('should check is current user an author', () => {
    const userId = 1;
    component.checkCommentAuthor(commentData.author.id);
    expect(commentData.author.id).toEqual(userId);
  });

  it('should check textarea length', () => {
    const spyFilter = spyOn(component.elementsList, 'filter').and.returnValue([commentData]);
    component.updateContentControl(1);
    expect(component.content.value).toBe(commentData.text);
    expect(component.isEditTextValid).toBeTruthy();
  });

  it('should call router navigate if onComment click event is user-tag', async () => {
    component.userId = 1;
    const target = document.createElement('a');
    target.setAttribute('data-userid', '5');
    const event = {
      target: target as HTMLElement
    } as unknown as MouseEvent;

    component.onCommentClick(event);
    expect(routerMock.navigate).toHaveBeenCalled();
  });

  it('should not change the isAddingReply property', () => {
    component.isAddingReply = false;
    component.showElements(1, 'showAllRelies');
    expect(component.isAddingReply).toBe(false);
  });

  it('should change the isAddingReply property', () => {
    component.isAddingReply = false;
    const spyMap = spyOn(component.elementsList, 'map').and.returnValue([commentData]);
    const spyFilter = spyOn(component.elementsList, 'filter').and.returnValue([commentData]);
    const spyUpdateControl = spyOn(component, 'updateContentControl');
    component.showElements(1, 'showRelyButton');
    expect(component.isAddingReply).toBe(true);
  });

  it('should toggle the isAddingReply property', () => {
    component.isAddingReply = false;
    const spyMap = spyOn(component.elementsList, 'map').and.returnValue([commentData]);
    const spyFilter = spyOn(component.elementsList, 'filter').and.returnValue([commentData]);
    const spyUpdateControl = spyOn(component, 'updateContentControl');
    component.showElements(2, 'showRelyButton');
    expect(component.isAddingReply).toBe(true);
    component.showElements(2, 'showRelyButton');
    expect(component.isAddingReply).toBe(false);
  });

  it('should call updateContentControl method ', () => {
    const spyMap = spyOn(component.elementsList, 'map').and.returnValue([commentData]);
    const spyFilter = spyOn(component.elementsList, 'filter').and.returnValue([commentData]);
    const spyUpdateControl = spyOn(component, 'updateContentControl');
    component.showElements(2, 'showRelyButton');
    expect(spyUpdateControl).toHaveBeenCalled();
  });
});
