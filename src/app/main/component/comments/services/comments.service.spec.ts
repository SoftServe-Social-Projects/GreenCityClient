import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { CommentsService } from './comments.service';
import { HttpResponse } from '@angular/common/http';

describe('CommentsService', () => {
  let service: CommentsService;
  let httpTestingController: HttpTestingController;

  const form = new FormGroup({
    content: new FormControl('some')
  });

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentsService]
    })
  );

  beforeEach(() => {
    service = TestBed.get(CommentsService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    const service: CommentsService = TestBed.get(CommentsService);
    expect(service).toBeTruthy();
  });

  it('should change ecoNewId value', () => {
    service.ecoNewsId = '1';
    expect(service.ecoNewsId).toEqual('1');
  });

  it('should make POST request to add comment', () => {
    service.ecoNewsId = '1';
    service.addComment(form, 1).subscribe((commentData: object) => {
      expect(commentData).toEqual(commentBody);
    });

    let commentBody: object = {
      author: {
        id: 1,
        name: 'Some Cool Person',
        userProfilePicturePath: "path to cool person's img"
      },
      id: 2,
      modifiedDate: new Date('2021-05-27T15:37:15.661Z'),
      text: 'some cool content!'
    };

    const req = httpTestingController.expectOne('https://greencity.azurewebsites.net/econews/comments/1');
    expect(req.request.method).toEqual('POST');
    req.flush(commentBody);
  });

  it("should set id 0 if nothing wasn't send in parameters ", () => {
    service.ecoNewsId = '1';
    service.addComment(form).subscribe((commentData: object) => {
      expect(commentData).toEqual(commentBody);
    });

    let commentBody: object = {
      author: {
        id: 1,
        name: 'Some Cool Person',
        userProfilePicturePath: "path to cool person's img"
      },
      id: 0,
      modifiedDate: new Date('2021-05-27T15:37:15.661Z'),
      text: 'some cool content!'
    };

    const req = httpTestingController.expectOne('https://greencity.azurewebsites.net/econews/comments/1');
    expect(req.request.method).toEqual('POST');
    req.flush(commentBody);
  });

  it('should make GET request to get active comments by page', () => {
    service.ecoNewsId = '1';
    service.getActiveCommentsByPage(3, 2).subscribe((commentData: object) => {
      expect(commentData).toEqual(commentBody);
    });

    let commentBody: object = {
      author: {
        id: 1,
        name: 'Some Cool Person',
        userProfilePicturePath: "path to cool person's img"
      },
      id: 2,
      modifiedDate: new Date('2021-05-27T15:37:15.661Z'),
      text: 'some cool content!'
    };

    const req = httpTestingController.expectOne('https://greencity.azurewebsites.net/econews/comments/active?ecoNewsId=1&page=3&size=2');
    expect(req.request.method).toEqual('GET');
    req.flush(commentBody);
  });

  it('should make GET request to get comments count', () => {
    service.ecoNewsId = '1';
    let commentCount = 6;
    service.getCommentsCount(1).subscribe((commentData: number) => {
      expect(commentData).toEqual(commentCount);
    });

    const req = httpTestingController.expectOne('https://greencity.azurewebsites.net/econews/comments/count/comments/1');
    expect(req.request.method).toEqual('GET');
    req.flush(commentCount);
  });

  it('should make GET request to get active replies by page', () => {
    service.ecoNewsId = '1';
    service.getActiveRepliesByPage(1, 2, 3).subscribe((commentData: object) => {
      expect(commentData).toEqual(commentBody);
    });

    let commentBody: object = {
      currentPage: 0,
      page: [
        {
          author: {
            id: 1,
            name: 'Some Cool Person',
            userProfilePicturePath: "path to cool person's img"
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

    const req = httpTestingController.expectOne('https://greencity.azurewebsites.net/econews/comments/replies/active/1?page=2&size=3');
    expect(req.request.method).toEqual('GET');
    req.flush(commentBody);
  });

  it('should make DELETE request to deleteComments', () => {
    service.ecoNewsId = '1';
    service.deleteComments(1).subscribe((commentData: HttpResponse<object>) => {
      console.log(commentData);
      expect(commentData.status).toEqual(200);
    });

    const req = httpTestingController.expectOne('https://greencity.azurewebsites.net/econews/comments?id=1');
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
  });

  it('should make GET request to get comment likes', () => {
    service.ecoNewsId = '1';
    let commentLikes = 5;
    service.getCommentLikes(1).subscribe((commentData: number) => {
      expect(commentData).toEqual(commentLikes);
    });

    const req = httpTestingController.expectOne('https://greencity.azurewebsites.net/econews/comments/count/likes?id=1');
    expect(req.request.method).toEqual('GET');
    req.flush(commentLikes);
  });

  it('should make GET request to get replies amount', () => {
    service.ecoNewsId = '1';
    let commentReplies = 5;
    service.getRepliesAmount(1).subscribe((commentData: number) => {
      expect(commentData).toEqual(commentReplies);
    });

    const req = httpTestingController.expectOne('https://greencity.azurewebsites.net/econews/comments/count/replies/1');
    expect(req.request.method).toEqual('GET');
    req.flush(commentReplies);
  });

  it('should make POST request to post Like', () => {
    service.ecoNewsId = '1';
    service.postLike(1).subscribe((commentData: object) => {
      expect(commentData).toEqual({});
    });

    const req = httpTestingController.expectOne('https://greencity.azurewebsites.net/econews/comments/like?id=1');
    expect(req.request.method).toEqual('POST');
    req.flush({});
  });

  it('should make PATCH request to edit comment', () => {
    service.ecoNewsId = '1';
    service.editComment(1, form.value).subscribe((commentData: object) => {
      expect(commentData).toEqual({});
    });

    const req = httpTestingController.expectOne(
      `https://greencity.azurewebsites.net/econews/comments?id=1&text=${form.value.content.value}`
    );
    expect(req.request.method).toEqual('PATCH');
    req.flush({});
  });
});
