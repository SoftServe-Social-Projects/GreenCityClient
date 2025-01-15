import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@environment/environment';
import { EventsCommentsService } from './events-comments.service';
import { CommentFormData } from '../../comments/models/comments-model';

describe('EventsCommentsService', () => {
  let service: EventsCommentsService;
  let httpTestingController: HttpTestingController;
  const url = environment.backendLink;

  const commentText = 'some';

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventsCommentsService]
    })
  );

  beforeEach(() => {
    service = TestBed.inject(EventsCommentsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    const serviceNew: EventsCommentsService = TestBed.inject(EventsCommentsService);
    expect(serviceNew).toBeTruthy();
  });

  it('should make POST request to add comment', () => {
    const commentBody: any = {
      author: {
        id: 1,
        name: 'Some Cool Person',
        profilePicturePath: 'path to cool persons img'
      },
      id: 2,
      modifiedDate: new Date('2021-05-27T15:37:15.661Z'),
      text: 'some cool content!'
    };
    const commentData: CommentFormData = {
      entityId: 1,
      text: commentText,
      imageFiles: []
    };

    service.addComment(commentData).subscribe((commentData: any) => {
      expect(commentData).toEqual(commentBody);
    });

    const req = httpTestingController.expectOne(`${url}events/1/comments`);
    expect(req.request.method).toEqual('POST');
    req.flush(commentBody);
  });

  it('should set id 0 if nothing was not send in parameters', () => {
    const commentBody: any = {
      author: {
        id: 1,
        name: 'Some Cool Person',
        profilePicturePath: 'path to cool persons img'
      },
      id: 0,
      modifiedDate: new Date('2021-05-27T15:37:15.661Z'),
      text: 'some cool content!'
    };

    const commentData: CommentFormData = {
      entityId: 1,
      text: commentText,
      imageFiles: []
    };

    service.addComment(commentData).subscribe((commentData: any) => {
      expect(commentData).toEqual(commentBody);
    });

    const req = httpTestingController.expectOne(`${url}events/1/comments`);
    expect(req.request.method).toEqual('POST');
    req.flush(commentBody);
  });

  it('should make GET request to get active comments by page', () => {
    const commentBody: any = {
      author: {
        id: 1,
        name: 'Some Cool Person',
        profilePicturePath: 'path to cool persons img'
      },
      id: 2,
      modifiedDate: new Date('2021-05-27T15:37:15.661Z'),
      text: 'some cool content!'
    };

    service.getActiveCommentsByPage(1, 3, 2).subscribe((commentData: any) => {
      expect(commentData).toEqual(commentBody);
    });

    const req = httpTestingController.expectOne(`${url}events/1/comments?statuses=ORIGINAL,EDITED&page=3&size=2`);
    expect(req.request.method).toEqual('GET');
    req.flush(commentBody);
    httpTestingController.verify();
  });

  it('should make GET request to get comments count', () => {
    const commentCount = 6;
    service.getCommentsCount(1).subscribe((commentData: number) => {
      expect(commentData).toEqual(commentCount);
    });

    const req = httpTestingController.expectOne(`${url}events/1/comments/count`);
    expect(req.request.method).toEqual('GET');
    req.flush(commentCount);
  });

  it('should make GET request to get active replies by page', () => {
    const commentBody: any = {
      currentPage: 0,
      page: [
        {
          author: {
            id: 1,
            name: 'Some Cool Person',
            profilePicturePath: 'path to cool persons img'
          },
          currentUserLiked: true,
          id: 0,
          likes: 0,
          modifiedDate: '2021-05-27T17:36:46.452Z',
          replies: 0,
          status: 'ORIGINAL',
          text: 'string'
        }
      ],
      totalElements: 0,
      totalPages: 0
    };

    service.getActiveRepliesByPage(1, 2, 3).subscribe((commentData: any) => {
      expect(commentData).toEqual(commentBody);
    });

    const req = httpTestingController.expectOne(`${url}events/comments/1/replies/active?statuses=ORIGINAL,EDITED&page=2&size=3`);
    expect(req.request.method).toEqual('GET');
    req.flush(commentBody);
  });

  it('should make DELETE request to deleteComments', () => {
    service.deleteComments(1).subscribe((deleted) => {
      expect(deleted).toBe(true);
    });

    const req = httpTestingController.expectOne(`${url}events/comments/1`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
  });

  it('should make GET request to get comment likes', () => {
    const commentLikes = 5;
    service.getCommentLikes(1).subscribe((commentData: number) => {
      expect(commentData).toEqual(commentLikes);
    });

    const req = httpTestingController.expectOne(`${url}events/comments/1/likes/count`);
    expect(req.request.method).toEqual('GET');
    req.flush(commentLikes);
  });

  it('should make GET request to get replies amount', () => {
    const commentReplies = 5;
    service.getRepliesAmount(1).subscribe((commentData: number) => {
      expect(commentData).toEqual(commentReplies);
    });

    const req = httpTestingController.expectOne(`${url}events/comments/1/replies/count`);
    expect(req.request.method).toEqual('GET');
    req.flush(commentReplies);
  });

  it('should make POST request to post Like', () => {
    service.postLike(1).subscribe((commentData: any) => {
      expect(commentData).toEqual({});
    });

    const req = httpTestingController.expectOne(`${url}events/comments/like/1`);
    expect(req.request.method).toEqual('POST');
    req.flush({});
  });

  it('should make PUT request to edit comment', () => {
    service.editComment(1, commentText).subscribe((commentData: any) => {
      expect(commentData).toEqual({});
    });

    const req = httpTestingController.expectOne(`${url}events/comments/1`);
    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(commentText);
    req.flush({});
  });
});
