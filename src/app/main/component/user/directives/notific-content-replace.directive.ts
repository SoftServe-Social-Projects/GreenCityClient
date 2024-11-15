import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NotificationModel } from '@global-user/models/notification.model';

@Directive({
  selector: '[appNotificContentReplace]'
})
export class NotificContentReplaceDirective implements OnChanges {
  @Input() replacements: NotificationModel;
  replacementKeys = [
    { contentKey: 'user', replacementKey: 'actionUserText', idToNavigate: 'actionUserId' },
    { contentKey: 'user1', replacementKey: 'actionUserText', idToNavigate: 'actionUserId' },
    { contentKey: 'user2', replacementKey: 'actionUserText', idToNavigate: 'actionUserId' },
    { contentKey: 'message', replacementKey: 'message' },
    { contentKey: 'secondMessage', replacementKey: 'secondMessage' }
  ];
  constructor(
    private el: ElementRef,
    private domSanitizer: DomSanitizer,
    private renderer: Renderer2
  ) {}

  ngOnChanges() {
    if (this.replacements) {
      const replacedContent = this.replaceContent(this.replacements.bodyText, this.replacements);
      const safeHtml: SafeHtml = this.domSanitizer.bypassSecurityTrustHtml(replacedContent);
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.domSanitizer.sanitize(1, safeHtml));
    }
  }

  private replaceContent(content: string, replacements: NotificationModel): string {
    let result = content;

    this.replacementKeys.forEach(({ contentKey, replacementKey, idToNavigate }) => {
      if (contentKey === 'secondMessage' && replacements.notificationType) {
        result = this.buildReplacementString(result, contentKey, replacements[replacementKey], {
          targetId: replacements.targetId,
          notificationId: replacements.notificationId,
          notificationType: replacements.notificationType
        });
      } else if (['user1', 'user2'].includes(contentKey)) {
        const index = parseInt(contentKey.slice(-1)) - 1;
        if (replacements.actionUserText?.[index] && replacements.actionUserId?.[index]) {
          result = this.buildReplacementString(result, contentKey, replacements.actionUserText[index], {
            userId: replacements.actionUserId[index]
          });
        }
      } else if (contentKey === 'message' && replacements.notificationType) {
        const linkAttributes = replacements.targetId
          ? {
              targetId: replacements.targetId,
              notificationType: replacements.notificationType
            }
          : null;
        result = this.buildReplacementString(result, contentKey, replacements[replacementKey], linkAttributes);
      } else if (replacements.hasOwnProperty(replacementKey)) {
        const linkAttributes = idToNavigate ? { userId: replacements[idToNavigate] } : null;

        result = this.buildReplacementString(result, contentKey, replacements[replacementKey], linkAttributes);
        console.log('in 3');
      }
    });

    console.log(result);
    return result;
  }

  private buildReplacementString(
    content: string,
    placeholder: string,
    text: string,
    attributes: Record<string, string | number> | null
  ): string {
    if (!attributes) {
      return content.replace(`{${placeholder}}`, text);
    }

    const attrString = Object.entries(attributes)
      .map(([key, value]) => `data-${key}="${value}"`)
      .join(' ');

    return content.replace(`{${placeholder}}`, `<a ${attrString}>${text}</a>`);
  }
}
