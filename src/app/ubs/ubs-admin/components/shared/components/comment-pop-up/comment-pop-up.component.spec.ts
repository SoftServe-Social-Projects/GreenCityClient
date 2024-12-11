import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentPopUpComponent } from './comment-pop-up.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

describe('CommentPopUpComponent', () => {
  let component: CommentPopUpComponent;
  let fixture: ComponentFixture<CommentPopUpComponent>;

  const MatDialogRefMock = {
    close: () => {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentPopUpComponent],
      imports: [MatDialogModule, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [{ provide: MatDialogRef, useValue: MatDialogRefMock }]
    });
    fixture = TestBed.createComponent(CommentPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
