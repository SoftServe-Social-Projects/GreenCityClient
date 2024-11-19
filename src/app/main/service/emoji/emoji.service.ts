import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  insertEmoji(currentText: string, emoji: string): string {
    return `${currentText}${emoji}`;
  }
}
