import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NotificContentReplaceDirective } from './notific-content-replace.directive';

@Component({
  template: `<p appNotificContentReplace [replacements]="notification"></p>`
})
class TestComponent {
  notification = null;
}

describe('NotificContentReplaceDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let paragrEl: HTMLElement;
  let component: TestComponent;

  const notification = {
    actionUserId: [2, 3],
    actionUserText: ['testUser1', 'testUser2'],
    bodyText: 'test texts',
    message: 'test message',
    notificationId: 5,
    notificationType: 'Eco_NEWS',
    projectName: 'GreenCity',
    secondMessage: 'secondMessageTest',
    secondMessageId: 'secondMessageId',
    targetId: 10,
    time: '',
    titleText: 'test title',
    viewed: false
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, NotificContentReplaceDirective]
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    paragrEl = fixture.nativeElement.querySelector('p');
  }));

  it('should display multiple user replacements', () => {
    component.notification = { ...notification, ...{ bodyText: '{user1} and {user2} liked your post' } };
    fixture.detectChanges();
    expect(paragrEl.textContent).toBe('testUser1 and testUser2 liked your post');
    expect(paragrEl.innerHTML).toBe(
      `<a data-userid="2" style="font-family: var(--tertiary-font);">testUser1</a> and <a data-userid="3" style="font-family: var(--tertiary-font);">testUser2</a> liked your post`
    );
  });

  it('should leave placeholders as is if replacements are missing', () => {
    component.notification = { ...notification, ...{ bodyText: 'Hello {missingKey}' } };
    fixture.detectChanges();
    expect(paragrEl.textContent).toBe('Hello {missingKey}');
  });

  it('should handle multiple users in a single string replacement', () => {
    component.notification = {
      ...notification,
      ...{ bodyText: '{user1},{user2} interacted with your post', actionUserId: [2, 3], actionUserText: ['testUser1', 'testUser2'] }
    };
    fixture.detectChanges();
    expect(paragrEl.textContent).toBe('testUser1,testUser2 interacted with your post');
    expect(paragrEl.innerHTML).toBe(
      '<a data-userid="2" style="font-family: var(--tertiary-font);">testUser1</a>,<a data-userid="3" style="font-family: var(--tertiary-font);">testUser2</a> interacted with your post'
    );
  });

  it('should use body text when there are no property to set', () => {
    component.notification = notification;
    fixture.detectChanges();
    expect(paragrEl.textContent).toBe('test texts');
  });

  it('should change text content', () => {
    component.notification = { ...notification, ...{ bodyText: 'commented event {message}' } };
    fixture.detectChanges();
    expect(paragrEl.textContent).toBe('commented event test message');
    expect(paragrEl.innerHTML).toBe('commented event <span style="font-family: var(--tertiary-font);">test message</span>');
  });

  it('should add property value to the content and anchor tag', () => {
    component.notification = {
      ...notification,
      ...{ bodyText: '{user1},{user2} commented event {message}', actionUserId: [2, 3], actionUserText: ['testUser1', 'testUser2'] }
    };
    fixture.detectChanges();
    expect(paragrEl.textContent).toBe('testUser1,testUser2 commented event test message');
    expect(paragrEl.innerHTML).toBe(
      '<a data-userid="2" style="font-family: var(--tertiary-font);">testUser1</a>,<a data-userid="3" style="font-family: var(--tertiary-font);">testUser2</a> commented event <span style="font-family: var(--tertiary-font);">test message</span>'
    );
  });
});
