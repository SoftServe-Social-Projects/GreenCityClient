import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HabitCommentsService } from './habit-comments.service';
import { environment } from '@environment/environment';
import { MOCK_HABIT_ADDED_COMMENT, MOCK_HABIT_COMMENTS_MODEL } from 'src/app/main/component/user/components/habit/mocks/habit-mock';

describe('HabitCommentsService', () => {
  let service: HabitCommentsService;
  let httpTestingController: HttpTestingController;
  const url = environment.backendLink;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HabitCommentsService]
    });

    service = TestBed.inject(HabitCommentsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make POST request to add comment', () => {
    service.addComment(1, 'Test comment', 0).subscribe((commentData) => {
      expect(commentData).toEqual(MOCK_HABIT_ADDED_COMMENT);
    });

    const req = httpTestingController.expectOne(`${url}habits/1/comments`);
    expect(req.request.method).toEqual('POST');
    req.flush(MOCK_HABIT_ADDED_COMMENT);
  });

  it('should make GET request to get active comments by page', () => {
    service.getActiveCommentsByPage(1, 0, 5).subscribe((data) => {
      expect(data).toEqual(MOCK_HABIT_COMMENTS_MODEL);
    });

    const req = httpTestingController.expectOne(`${url}habits/comments/active?habitId=1&page=0&size=5`);
    expect(req.request.method).toEqual('GET');
    req.flush(MOCK_HABIT_COMMENTS_MODEL);
  });

  it('should make GET request to get comments count', () => {
    service.getCommentsCount(1).subscribe((data) => {
      expect(data).toEqual(10);
    });

    const req = httpTestingController.expectOne(`${url}habits/1/comments/count`);
    expect(req.request.method).toEqual('GET');
    req.flush(10);
  });

  it('should make DELETE request to delete comment', () => {
    service.deleteComments(2).subscribe((result) => {
      expect(result).toBeTrue();
    });

    const req = httpTestingController.expectOne(`${url}habits/comments/2`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should make GET request to get replies amount', () => {
    service.getRepliesAmount(2).subscribe((data) => {
      expect(data).toEqual(5);
    });

    const req = httpTestingController.expectOne(`${url}habits/comments/2/replies/active/count`);
    expect(req.request.method).toEqual('GET');
    req.flush(5);
  });

  it('should make PATCH request to edit a comment', () => {
    const updatedText = 'Updated comment';

    service.editComment(2, updatedText).subscribe(() => {});

    const req = httpTestingController.expectOne(`${url}habits/comments?id=2`);
    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ text: updatedText });
    req.flush({});
  });

  it('should make GET request to get active replies by page', () => {
    service.getActiveRepliesByPage(1, 0, 5).subscribe((data) => {
      expect(data).toEqual(MOCK_HABIT_COMMENTS_MODEL);
    });

    const req = httpTestingController.expectOne(`${url}habits/comments/1/replies/active?page=0&size=5`);
    expect(req.request.method).toEqual('GET');
    req.flush(MOCK_HABIT_COMMENTS_MODEL);
  });

  it('should make POST request to like a comment', () => {
    service.postLike(1).subscribe(() => {});
    const req = httpTestingController.expectOne(`${url}habits/comments/like?commentId=1`);
    expect(req.request.method).toEqual('POST');
    req.flush({});
  });

  it('should make GET request to get comment likes count', () => {
    const likesCount = 15;

    service.getCommentLikes(1).subscribe((data) => {
      expect(data).toEqual(likesCount);
    });

    const req = httpTestingController.expectOne(`${url}habits/comments/1/likes/count`);
    expect(req.request.method).toEqual('GET');
    req.flush(likesCount);
  });
});
