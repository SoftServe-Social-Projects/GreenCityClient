import { Directive, ElementRef, Renderer2, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCustomTooltip]'
})
export class CustomTooltipDirective {
  @Input('appCustomTooltip') tooltipContent = '';

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') onMouseOver() {
    const customTooltip = this.createTooltip();
    this.renderer.appendChild(this.elRef.nativeElement, customTooltip);
  }

  // @HostListener('mouseout') onMouseOut() {
  //   const tooltip = this.elRef.nativeElement.querySelector('.tooltipClass');
  //   this.renderer.removeChild(this.elRef.nativeElement, tooltip);
  // }

  createTooltip(): HTMLElement {
    const tooltip = this.renderer.createElement('div');
    const text = this.renderer.createText(this.tooltipContent);
    this.renderer.appendChild(tooltip, text);
    this.renderer.addClass(tooltip, 'tooltipClass');
    return tooltip;
  }
}
