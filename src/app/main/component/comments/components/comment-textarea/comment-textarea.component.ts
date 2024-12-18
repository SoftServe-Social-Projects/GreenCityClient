import { SocketService } from '@global-service/socket/socket.service';
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Output,
  Input,
  EventEmitter,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  SecurityContext
} from '@angular/core';
import { EmojiEvent, TaggedUser } from '../../models/comments-model';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { FormControl, Validators } from '@angular/forms';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CHAT_ICONS } from 'src/app/chat/chat-icons';
import { insertEmoji } from '../add-emoji/add-emoji';

@Component({
  selector: 'app-comment-textarea',
  templateUrl: './comment-textarea.component.html',
  styleUrls: ['./comment-textarea.component.scss']
})
export class CommentTextareaComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  chatIcons = CHAT_ICONS;
  private userId: number;
  private searchQuery = '';
  private lastTagCharIndex: number;
  private charToTagUsers = ['@', '#'];
  private range: Range;
  aspectRatio: number;
  isImageUploaderOpen = false;
  showImageControls = false;
  isEmojiPickerOpen = false;
  emojiPickerWidth = '506px';
  uploadedImage: { url: string; file: File }[] = [];
  private widthMap = new Map<number, string>([
    [0, '100%'],
    [641, '475px'],
    [1025, '506px']
  ]);

  content: FormControl = new FormControl('', [Validators.required, this.innerHtmlMaxLengthValidator(8000)]);
  suggestedUsers: TaggedUser[] = [];
  cursorPosition: {
    top: number;
    left: number;
  };
  private destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('commentTextarea') commentTextarea: ElementRef;
  @ViewChild('dropdown') dropdown;
  @ViewChild('menuTrigger') menuTrigger;

  @Output() comment = new EventEmitter<{ text: string; innerHTML: string; imageFiles?: File[] }>();
  @Output() imageUploaderStatus = new EventEmitter<boolean>();
  @Input() commentTextToEdit: string;
  @Input() commentHtml: string;
  @Input() placeholder: string;

  constructor(
    public readonly socketService: SocketService,
    private readonly localStorageService: LocalStorageService,
    public readonly elementRef: ElementRef,
    private readonly sanitizer: DomSanitizer
  ) {
    this.socketService.initiateConnection(this.socketService.connection.greenCity);
  }

  ngOnInit(): void {
    this.localStorageService.userIdBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((id) => (this.userId = id));
    this.socketService
      .onMessage(this.socketService.connection.greenCity, `/topic/${this.userId}/searchUsers`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: TaggedUser[]) => {
        if (data.length) {
          this.suggestedUsers = data.filter((el) => el.userName.toLowerCase().includes(this.searchQuery.toLowerCase()));
          if (document.activeElement === this.commentTextarea.nativeElement) {
            this.menuTrigger.openMenu();
            this.refocusTextarea();
          }
        } else {
          this.menuTrigger.closeMenu();
          this.suggestedUsers = [];
        }
      });
  }

  ngAfterViewInit(): void {
    this.initializeTextareaContent();
    this.setupTextareaInputListener();
  }

  private initializeTextareaContent(): void {
    if (this.commentTextToEdit) {
      this.commentTextarea.nativeElement.innerHTML = this.commentTextToEdit;
    }
  }

  private setupTextareaInputListener(): void {
    fromEvent(this.commentTextarea.nativeElement, 'input')
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        tap(() => this.handleInputChange()),
        filter(() => this.checkForTagCharacters())
      )
      .subscribe(() => this.handleTagging());
  }

  private handleInputChange(): void {
    this.content.setValue(this.commentTextarea.nativeElement.textContent);
    this.emitComment();
    this.closeDropdownIfNoTag();
  }

  private closeDropdownIfNoTag(): void {
    const textContent = this.commentTextarea.nativeElement.textContent;
    if (!this.charToTagUsers.some((char) => textContent.includes(char))) {
      this.menuTrigger.closeMenu();
      this.suggestedUsers = [];
    }
  }

  private checkForTagCharacters(): boolean {
    this.getSelectionStart();
    if (this.range?.startContainer) {
      const textBeforeCaret = this.range.startContainer.textContent.slice(0, this.range.startOffset);
      this.lastTagCharIndex = Math.max(textBeforeCaret.lastIndexOf('@'), textBeforeCaret.lastIndexOf('#'));
      return this.lastTagCharIndex !== -1;
    }
    return false;
  }

  private handleTagging(): void {
    const textBeforeCaret = this.range.startContainer.textContent.slice(0, this.range.startOffset);
    this.searchQuery = textBeforeCaret.slice(this.lastTagCharIndex + 1);
    this.updateCursorPosition();

    if (!this.searchQuery.includes(' ')) {
      this.sendSocketMessage(this.searchQuery);
    } else {
      this.menuTrigger.closeMenu();
      this.suggestedUsers = [];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.commentHtml?.currentValue === '') {
      this.commentTextarea.nativeElement.innerHTML = '';
    }
    if (changes.isImageUploaderOpen) {
      this.toggleImageUploaderVisibility(changes.isImageUploaderOpen.currentValue);
    }
  }

  refocusTextarea(): void {
    setTimeout(() => {
      this.commentTextarea.nativeElement.focus();
    }, 0);
  }

  toggleEmojiPickerVisibility(): void {
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
    this.isImageUploaderOpen = false;

    if (this.isEmojiPickerOpen) {
      this.updateEmojiPickerWidth();
      window.addEventListener('resize', this.updateEmojiPickerWidth.bind(this));
    } else {
      window.removeEventListener('resize', this.updateEmojiPickerWidth.bind(this));
    }
  }

  updateEmojiPickerWidth(): void {
    const screenWidth = window.innerWidth;

    for (const [breakpoint, width] of this.widthMap) {
      if (screenWidth >= breakpoint) {
        this.emojiPickerWidth = width;
      }
    }
  }

  onEmojiClick(event: EmojiEvent): void {
    const newContent = insertEmoji(this.content.value, event.emoji.native);
    this.content.setValue(newContent);
    this.commentTextarea.nativeElement.textContent = newContent;
    this.emitComment();
  }

  onCommentTextareaFocus(): void {
    this.clearPlaceholderIfNeeded();
    const range = document.createRange();
    const nodeAmount = this.commentTextarea.nativeElement.childNodes.length;
    range.setStartAfter(this.commentTextarea.nativeElement.childNodes[nodeAmount - 1]);
    range.setEndAfter(this.commentTextarea.nativeElement.childNodes[nodeAmount - 1]);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  onCommentKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    this.insertTextAtCursor(text);
    this.content.setValue(this.commentTextarea.nativeElement.textContent);
    this.emitComment();
  }

  toggleImageUploaderVisibility(isOpen: boolean): void {
    this.isImageUploaderOpen = isOpen;
    this.showImageControls = !isOpen;
    this.imageUploaderStatus.emit(isOpen);
  }

  toggleImageUploader(): void {
    if (this.uploadedImage.length < 5) {
      this.isImageUploaderOpen = !this.isImageUploaderOpen;
      this.isEmojiPickerOpen = false;
      this.imageUploaderStatus.emit(this.isImageUploaderOpen);
    }
  }

  onImageSelected(fileHandle: { url: SafeUrl; file: File }): void {
    if (this.uploadedImage.length < 5) {
      this.uploadedImage.push({
        url: this.sanitizer.sanitize(SecurityContext.URL, fileHandle.url) || '',
        file: fileHandle.file
      });
    }

    this.clearPlaceholderIfNeeded();
    this.isImageUploaderOpen = false;
    this.showImageControls = true;
    this.emitComment();
  }

  removeImage(index: number): void {
    this.uploadedImage.splice(index, 1);
  }

  onCancelImage(): void {
    this.uploadedImage = [];
    this.showImageControls = false;
    this.isImageUploaderOpen = false;
    this.commentTextarea.nativeElement.innerHTML = '';
    this.comment.emit({
      text: this.content.value,
      innerHTML: this.commentTextarea.nativeElement.innerHTML,
      imageFiles: null
    });
  }

  private clearPlaceholderIfNeeded(): void {
    const currentText = this.commentTextarea.nativeElement.textContent.trim();
    if (this.isPlaceholderText(currentText)) {
      this.commentTextarea.nativeElement.textContent = '';
      this.content.setValue('');
    }
  }

  private isPlaceholderText(text: string): boolean {
    return text === 'Add a comment' || text === '';
  }

  private insertTextAtCursor(text: string): void {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
  }

  insertNodeAtCursor(user: TaggedUser, tagChar: string) {
    const selection = window.getSelection();

    const userTagNode = document.createElement('a');
    userTagNode.contentEditable = 'false';
    userTagNode.textContent = tagChar + user.userName;
    userTagNode.setAttribute('data-userId', user.userId.toString());
    userTagNode.style.fontWeight = '700';
    this.range.insertNode(userTagNode);

    this.range.setStartAfter(userTagNode);
    this.range.setEndAfter(userTagNode);
    selection.removeAllRanges();
    selection.addRange(this.range);
  }

  getSelectionStart(): void {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        this.range = selection.getRangeAt(0);
      }
    }
  }

  updateCursorPosition(): void {
    const selection = window.getSelection();
    if (selection) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      this.cursorPosition = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
      };
    }
  }

  sendSocketMessage(query: string): void {
    this.socketService.send(this.socketService.connection.greenCity, '/app/getUsersToTagInComment', {
      currentUserId: this.userId,
      searchQuery: query
    });
  }

  setFocusCommentTextarea(): void {
    const selection = window.getSelection();
    const range = document.createRange();
    const length = this.commentTextarea.nativeElement.childNodes.length;
    range.collapse(true);
    range.setStartAfter(this.commentTextarea.nativeElement.childNodes[length - 1]);
    range.setEndAfter(this.commentTextarea.nativeElement.childNodes[length - 1]);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  selectSuggestion(user: TaggedUser): void {
    const tagChar = this.range.startContainer.textContent[this.lastTagCharIndex];

    this.menuTrigger.closeMenu();
    this.removeSearchQuery();
    this.insertNodeAtCursor(user, tagChar);
    this.setFocusCommentTextarea();
    this.content.setValue(this.commentTextarea.nativeElement.textContent);
    this.emitComment();
    this.refocusTextarea();
  }

  private emitComment(): void {
    this.comment.emit({
      text: this.commentTextarea.nativeElement.textContent,
      innerHTML: this.commentTextarea.nativeElement.innerHTML,
      imageFiles: this.uploadedImage.map((image) => image.file)
    });
  }

  private removeSearchQuery(): void {
    const currentNode = this.range.startContainer;
    const currentStartOffset = this.range.startOffset;
    currentNode.textContent =
      currentNode.textContent.slice(0, currentStartOffset - this.searchQuery.length - 1) +
      currentNode.textContent.slice(currentStartOffset);

    this.range.setStart(this.range.startContainer, currentStartOffset - this.searchQuery.length - 1);
  }

  private innerHtmlMaxLengthValidator(maxLength: number) {
    return () => {
      if (this.commentTextarea) {
        const isValid = this.commentTextarea.nativeElement.innerHTML.length <= maxLength;
        return isValid ? null : { maxlength: true };
      } else {
        return null;
      }
    };
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
