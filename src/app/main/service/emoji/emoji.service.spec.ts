import { TestBed } from '@angular/core/testing';
import { EmojiService } from './emoji.service';

describe('EmojiService', () => {
  let service: EmojiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmojiService]
    });
    service = TestBed.inject(EmojiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('insertEmoji', () => {
    it('should append an emoji to the current text', () => {
      const currentText = 'Hello';
      const emoji = '😊';
      const result = service.insertEmoji(currentText, emoji);
      expect(result).toBe('Hello😊');
    });

    it('should handle empty currentText correctly', () => {
      const currentText = '';
      const emoji = '😊';
      const result = service.insertEmoji(currentText, emoji);
      expect(result).toBe('😊');
    });

    it('should handle empty emoji correctly', () => {
      const currentText = 'Hello';
      const emoji = '';
      const result = service.insertEmoji(currentText, emoji);
      expect(result).toBe('Hello');
    });
  });
});
