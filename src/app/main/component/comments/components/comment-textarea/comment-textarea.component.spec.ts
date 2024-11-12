import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommentTextareaComponent } from './comment-textarea.component';
import { Router } from '@angular/router';
import { SocketService } from '@global-service/socket/socket.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { PlaceholderForDivDirective } from 'src/app/main/component/comments/directives/placeholder-for-div.directive';
import { MatSelectModule } from '@angular/material/select';
import { UserProfileImageComponent } from '@global-user/components/shared/components/user-profile-image/user-profile-image.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CommentTextareaComponent', () => {
  let component: CommentTextareaComponent;
  let fixture: ComponentFixture<CommentTextareaComponent>;

  const socketServiceMock: SocketService = jasmine.createSpyObj('SocketService', ['onMessage', 'send', 'initiateConnection']);
  socketServiceMock.onMessage = () => new Observable();
  socketServiceMock.send = () => new Observable();
  socketServiceMock.connection = {
    greenCity: { url: '', socket: null, state: null },
    greenCityUser: { url: '', socket: null, state: null }
  };
  socketServiceMock.initiateConnection = () => {};

  const localStorageServiceMock: jasmine.SpyObj<LocalStorageService> = jasmine.createSpyObj('LocalStorageService', [
    'userIdBehaviourSubject'
  ]);
  localStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1);

  const users = [
    {
      userId: 1,
      userName: 'User Name 1',
      profilePicture: null
    },
    {
      userId: 2,
      userName: 'User Name 2',
      profilePicture: null
    }
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CommentTextareaComponent, PlaceholderForDivDirective, UserProfileImageComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: SocketService, useValue: socketServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock }
      ],
      imports: [MatSelectModule, TranslateModule.forRoot(), BrowserAnimationsModule, MatMenuModule, MatIconModule]
    }).compileComponents();
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.style.overflow = 'visible';
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should define elementRef', () => {
    component.suggestedUsers = users;
    component.menuTrigger.openMenu();
    fixture.detectChanges();
    expect(component.commentTextarea).toBeDefined();
    expect(component.dropdown).toBeDefined();
    expect(fixture.debugElement.queryAll(By.css('.mat-menu-item')).length).toBe(2);
  });

  describe('ngAfterViewInit', () => {
    it('should set innerHTML if commentTextToEdit is provided', () => {
      component.commentTextToEdit = '<p>This is some edited text.</p>';
      component.ngAfterViewInit();
      expect(component.commentTextarea.nativeElement.innerHTML).toBe('<p>This is some edited text.</p>');
    });

    it('should not set innerHTML if commentTextToEdit is provided', () => {
      const placeholderPattern = /<span[^>]*>.*?<\/span>/g;
      component.commentTextToEdit = null;
      component.ngAfterViewInit();
      const innerHTML = component.commentTextarea.nativeElement.innerHTML.replace(placeholderPattern, '');
      expect(innerHTML).toBe('');
    });

    it('should set initial text content', () => {
      component.commentTextToEdit = 'Initial text';
      component.ngAfterViewInit();
      fixture.detectChanges();

      expect(component.commentTextarea.nativeElement.textContent).toBe('Initial text');
    });
  });

  describe('ngOnChanges', () => {
    it('should clear innerHTML if commentHtml is an empty string', () => {
      component.commentTextarea.nativeElement.innerHTML = '<p>Existing HTML content.</p>';
      fixture.detectChanges();
      component.ngOnChanges({ commentHtml: { currentValue: '' } as any });
      const textareaElement = component.commentTextarea.nativeElement;
      expect(textareaElement.innerHTML).toBe('');
    });

    it('should clear innerHTML if commentHtml is an empty string', () => {
      const innerHTML = '<p>Existing HTML content.</p>';
      component.commentTextarea.nativeElement.innerHTML = innerHTML;
      fixture.detectChanges();
      component.ngOnChanges({});
      const textareaElement = component.commentTextarea.nativeElement;
      expect(textareaElement.innerHTML).toBe(innerHTML);
    });

    it('should not clear innerHTML if commentHtml has a non-empty value', () => {
      const innerHTML = '<p>Existing HTML content.</p>';
      component.commentTextarea.nativeElement.innerHTML = innerHTML;
      fixture.detectChanges();
      component.ngOnChanges({ commentHtml: { currentValue: 'a' } as any });
      const textareaElement = component.commentTextarea.nativeElement;
      expect(textareaElement.innerHTML).toBe(innerHTML);
    });
  });

  it('should be valid when inner HTML length is within limit', () => {
    component.content.patchValue('a');
    component.commentTextarea.nativeElement.innerHTML = 'a';
    component.content.updateValueAndValidity();
    expect(component.content.hasError('maxlength')).toBeFalsy();
    expect(component.content.valid).toBeTruthy();

    component.content.patchValue('a'.repeat(8000));
    component.commentTextarea.nativeElement.innerHTML = 'a'.repeat(8000);
    component.content.updateValueAndValidity();
    expect(component.content.hasError('maxlength')).toBeFalsy();
    expect(component.content.valid).toBeTruthy();
  });

  it('should be invalid when inner HTML length exceeds the limit', () => {
    component.content.patchValue('a'.repeat(8001));
    component.commentTextarea.nativeElement.innerHTML = 'a'.repeat(8001);
    component.content.updateValueAndValidity();
    expect(component.content.hasError('maxlength')).toBeTruthy();
  });

  it('should prevent default when Enter key is pressed', () => {
    const fakeEvent = { key: 'Enter', preventDefault: () => {} } as KeyboardEvent;
    spyOn(fakeEvent, 'preventDefault');

    component.onCommentKeyDown(fakeEvent);

    expect(fakeEvent.preventDefault).toHaveBeenCalled();
  });

  it('should unsubscribe from the subscription on ngOnDestroy', () => {
    const destroy$ = 'destroy$';
    const nextSpy = spyOn(component[destroy$], 'next');
    const completeSpy = spyOn(component[destroy$], 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should correctly toggle image uploader visibility', () => {
    spyOn(component.imageUploaderStatus, 'emit');

    component.toggleImageUploaderVisibility(true);
    expect(component.isImageUploaderOpen).toBeTrue();
    expect(component.showImageControls).toBeFalse();
    expect(component.imageUploaderStatus.emit).toHaveBeenCalledWith(true);

    component.toggleImageUploaderVisibility(false);
    expect(component.isImageUploaderOpen).toBeFalse();
    expect(component.showImageControls).toBeTrue();
    expect(component.imageUploaderStatus.emit).toHaveBeenCalledWith(false);
  });

  it('should toggle image uploader when there are less than 5 uploaded images', () => {
    spyOn(component.imageUploaderStatus, 'emit');
    component.uploadedImage = [{ url: '', file: new File([], 'file1') }];

    component.toggleImageUploader();
    expect(component.isImageUploaderOpen).toBeTrue();
    expect(component.imageUploaderStatus.emit).toHaveBeenCalledWith(true);

    component.toggleImageUploader();
    expect(component.isImageUploaderOpen).toBeFalse();
    expect(component.imageUploaderStatus.emit).toHaveBeenCalledWith(false);
  });

  it('should not toggle image uploader when there are 5 or more uploaded images', () => {
    component.uploadedImage = new Array(5).fill({ url: '', file: new File([], 'file') });

    component.isImageUploaderOpen = false;
    component.toggleImageUploader();

    expect(component.isImageUploaderOpen).toBeFalse();
  });

  it('should not add image when there are already 5 images', () => {
    component.uploadedImage = new Array(5).fill({ url: '', file: new File([], 'file') });

    const fileHandle = { url: 'unsafeUrl', file: new File([], 'image.png') };
    component.onImageSelected(fileHandle);

    expect(component.uploadedImage.length).toBe(5);
  });

  it('should remove the image at the specified index', () => {
    component.uploadedImage = [
      { url: 'image1', file: new File([], 'file1') },
      { url: 'image2', file: new File([], 'file2') }
    ];

    component.removeImage(0);

    expect(component.uploadedImage.length).toBe(1);
    expect(component.uploadedImage[0].url).toBe('image2');
  });

  it('should not remove anything if index is out of bounds', () => {
    component.uploadedImage = [{ url: 'image1', file: new File([], 'file1') }];

    component.removeImage(5);

    expect(component.uploadedImage.length).toBe(1);
  });

  it('should clear uploaded images, hide controls and emit comment with null image files', () => {
    spyOn(component.comment, 'emit');
    component.uploadedImage = [{ url: 'image1', file: new File([], 'file1') }];
    component.showImageControls = true;
    component.isImageUploaderOpen = true;

    component.onCancelImage();

    expect(component.uploadedImage.length).toBe(0);
    expect(component.showImageControls).toBeFalse();
    expect(component.isImageUploaderOpen).toBeFalse();
    expect(component.comment.emit).toHaveBeenCalledWith({
      text: component.content.value,
      innerHTML: '',
      imageFiles: null
    });
  });

  it('should toggle isEmojiPickerOpen state correctly', () => {
    component.isEmojiPickerOpen = false;
    component.toggleEmojiPickerVisibility();
    expect(component.isEmojiPickerOpen).toBe(true);
    component.toggleEmojiPickerVisibility();
    expect(component.isEmojiPickerOpen).toBe(false);
  });
});
