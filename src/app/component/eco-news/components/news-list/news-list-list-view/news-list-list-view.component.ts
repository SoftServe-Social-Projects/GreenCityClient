import { Component, Input, ViewChild, ElementRef, Renderer2, AfterViewChecked } from '@angular/core';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { ecoNewsIcons } from 'src/app/image-pathes/profile-icons';

import { possibleDescHeight, possibleTitleHeight } from './breakpoints';

@Component({
  selector: 'app-news-list-list-view',
  templateUrl: './news-list-list-view.component.html',
  styleUrls: ['./news-list-list-view.component.scss'],
  changeDetection: 0,
})
export class NewsListListViewComponent implements AfterViewChecked {
  @Input() ecoNewsModel: EcoNewsModel;
  @ViewChild('titleHeight', { static: true }) titleHeight: ElementRef;
  @ViewChild('textHeight', { static: true }) textHeight: ElementRef;

  private smallHeight = 'smallHeight';
  private bigHeight = 'bigHeight';
  // breakpoints for different line height and font size

  public profileIcons = ecoNewsIcons;
  public newsImage: string;

  constructor(private renderer: Renderer2) { }

  ngAfterViewChecked() {
    this.checkHeightOfTittle();
  }

  // the idea is to get the height of the header and based on it visualize the Description and Header by adding specific class names
  // another problem is that the line height and container height are different for different devices
  public checkHeightOfTittle(): void {
    const titleHeightOfElement = this.titleHeight.nativeElement.offsetHeight;
    const descCalss = this.getHeightOfDesc(titleHeightOfElement);
    const titleCalss = this.getHeightOfTitle(titleHeightOfElement);

    this.renderer.addClass(this.textHeight.nativeElement, descCalss);
    this.renderer.addClass(this.titleHeight.nativeElement, titleCalss);
  }

  public checkNewsImage(): string {
    return (this.newsImage =
      this.ecoNewsModel.imagePath && this.ecoNewsModel.imagePath !== ' '
        ? this.ecoNewsModel.imagePath
        : this.profileIcons.newsDefaultPictureList);
  }

  private getDomWidth(): string {
    return window.innerWidth <= 768 ? this.smallHeight : this.bigHeight;
  }

  private getHeightOfDesc(titleHeight: number): string {
    const result = possibleDescHeight[this.getDomWidth()][titleHeight];

    return result ? result : titleHeight > 78 ? 'd-none' : titleHeight > 52 ? 'one-row' : titleHeight > 26 ? 'two-row' : 'tree-row';
  }

  private getHeightOfTitle(titleHeight: number): string {

    const result = possibleTitleHeight[this.getDomWidth()][titleHeight];
    return result ? result : titleHeight > 78 ? 'four-row' : titleHeight > 52 ? 'tree-row' : titleHeight > 26 ? 'two-row' : 'one-row';
  }
}
