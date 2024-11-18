import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  private isPickerVisible = false;

  toggleEmojiPicker(): boolean {
    this.isPickerVisible = !this.isPickerVisible;
    return this.isPickerVisible;
  }

  insertEmoji(currentText: string, emoji: string): string {
    return `${currentText}${emoji}`;
  }
}
