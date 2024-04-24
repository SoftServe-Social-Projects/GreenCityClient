import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-images-slider',
  templateUrl: './images-slider.component.html',
  styleUrls: ['./images-slider.component.scss']
})
export class ImagesSliderComponent {
  @Input() images: string[];
  public currentImageIdx = 0;

  public selectImage(ind: number): void {
    this.currentImageIdx = ind;
  }

  public moveRight(): void {
    this.currentImageIdx = this.currentImageIdx === this.images.length - 1 ? 0 : ++this.currentImageIdx;
  }

  public moveLeft(): void {
    this.currentImageIdx = this.currentImageIdx === 0 ? this.images.length - 1 : --this.currentImageIdx;
  }
}
