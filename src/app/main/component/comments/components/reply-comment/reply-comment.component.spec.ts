import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ReplyCommentComponent } from './reply-comment.component';

describe('ReplyCommentComponent', () => {
  let component: ReplyCommentComponent;
  let fixture: ComponentFixture<ReplyCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReplyCommentComponent],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplyCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the srcset to reply image when isAddingReply is true', () => {
    component.isAddingReply = true;
    component.writeReply();

    expect(component.reply.nativeElement.srcset).toBe(component.commentsImages['reply']);
  });

  it('should set the srcset to replying image when isAddingReply is false', () => {
    component.isAddingReply = false;
    component.writeReply();

    expect(component.reply.nativeElement.srcset).toBe(component.commentsImages['replying']);
  });
});
