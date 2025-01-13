import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageComponent } from './chat-message.component';
import { UserService } from '@global-service/user/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StoreModule } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('ChatMessageComponent', () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;
  const mockTranslateService = {
    get: jasmine.createSpy('get').and.returnValue(of('mockTranslation')),
    instant: jasmine.createSpy('instant').and.returnValue('mockTranslation')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatMessageComponent],
      imports: [HttpClientTestingModule, MatDialogModule, StoreModule.forRoot({})],
      providers: [{ provide: UserService, useValue: {} }, { provide: TranslateService, useValue: mockTranslateService }, MatDialog]
    });
    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
    component.message = {
      id: 1,
      roomId: 2,
      senderId: 81,
      content: 'string',
      createDate: '',
      fileName: '',
      fileType: null,
      fileUrl: null,
      likes: [],
      isFirstOfDay: true,
      isLiked: true
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
