import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfileService } from '@global-user/components/profile/profile-service/profile.service';
import { Observable, of } from 'rxjs';

import { AddCommentComponent } from './add-comment.component';
import { UserProfileImageComponent } from '@global-user/components/shared/components/user-profile-image/user-profile-image.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommentsService } from '../../services/comments.service';
import { EditProfileModel } from '@global-user/models/edit-profile.model';
import { CommentTextareaComponent } from '../comment-textarea/comment-textarea.component';
import { PlaceholderForDivDirective } from '../../directives/placeholder-for-div.directive';
import { SocketService } from '@global-service/socket/socket.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommentFormData } from '../../models/comments-model';

const COMMENT_MOCK = {
  author: {
    name: 'username',
    id: 1,
    userProfilePicturePath: null
  },
  id: 1,
  modifiedDate: '01.12.2022',
  text: 'some text'
};

describe('AddCommentComponent', () => {
  let component: AddCommentComponent;
  let fixture: ComponentFixture<AddCommentComponent>;

  const defaultImagePath =
    'https://csb10032000a548f571.blob.core.windows.net/allfiles/90370622-3311-4ff1-9462-20cc98a64d1ddefault_image.jpg';

  const userData = {
    userLocationDto: {
      cityUa: 'Місто',
      cityEn: 'City'
    },
    name: 'string',
    userCredo: 'string',
    profilePicturePath: defaultImagePath,
    rating: null,
    showEcoPlace: 'PUBLIC',
    showLocation: 'PUBLIC',
    showToDoList: 'PUBLIC',
    socialNetworks: [{ id: 1, url: defaultImagePath }]
  } as EditProfileModel;

  const profileServiceMock: ProfileService = jasmine.createSpyObj('ProfileService', ['getUserInfo']);
  profileServiceMock.getUserInfo = () => of(userData);

  const commentsServiceMock: jasmine.SpyObj<CommentsService> = jasmine.createSpyObj('CommentsService', ['addComment']);
  commentsServiceMock.addComment.and.returnValue(of(COMMENT_MOCK));

  const socketServiceMock: SocketService = jasmine.createSpyObj('SocketService', ['onMessage', 'send', 'initiateConnection']);
  socketServiceMock.onMessage = () => new Observable();
  socketServiceMock.send = () => new Observable();
  socketServiceMock.connection = {
    greenCity: { url: '', socket: null, state: null },
    greenCityUser: { url: '', socket: null, state: null }
  };
  socketServiceMock.initiateConnection = () => {};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddCommentComponent, UserProfileImageComponent, CommentTextareaComponent, PlaceholderForDivDirective],
      imports: [FormsModule, ReactiveFormsModule, TranslateModule.forRoot(), HttpClientTestingModule, MatMenuModule, MatIconModule],
      providers: [
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: CommentsService, useValue: commentsServiceMock },
        { provide: SocketService, useValue: socketServiceMock },
        FormBuilder
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset form and emit event ', () => {
    const spy = spyOn(component.updateList, 'emit');
    const spy2 = spyOn(component.addCommentForm, 'reset');

    component.onSubmit();
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should check does textarea contain only spaces', () => {
    const key = 'content';
    component.addCommentForm.controls[key].setValue('   ');
    fixture.detectChanges();
    expect(component.addCommentForm.valid).toBe(false);
  });

  it('should call onSubmit method and emit updateList event', fakeAsync(() => {
    component.entityId = 1;
    component.commentId = 1;

    const updateListSpy = spyOn(component.updateList, 'emit');
    component.setContent({
      text: 'test text',
      innerHTML: 'test html',
      imageFiles: []
    });

    const commentData: CommentFormData = {
      entityId: component.entityId,
      text: 'test html',
      imageFiles: [],
      parentCommentId: component.commentId
    };

    component.onSubmit();

    flush();
    expect(commentsServiceMock.addComment).toHaveBeenCalledWith(commentData);
    expect(updateListSpy).toHaveBeenCalledWith(COMMENT_MOCK);
    expect(component.addCommentForm.value.content).toBe('');
  }));

  it('should update content and uploaded image in setContent', () => {
    const mockData = { text: 'Test Comment', innerHTML: '<p>Test Comment</p>', imageFiles: [new File([], 'test.jpg')] };
    component.setContent(mockData);

    expect(component.addCommentForm.controls.content.value).toBe('Test Comment');
    expect(component.commentHtml).toBe('<p>Test Comment</p>');
    expect(component.uploadedImage).toEqual(mockData.imageFiles[0]);
    expect(component.showImageControls).toBeTrue();
  });
});
