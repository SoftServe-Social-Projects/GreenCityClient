import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-remaining-count',
  templateUrl: './remaining-count.component.html',
  styleUrls: ['./remaining-count.component.scss'],
})
export class RemainingCountComponent {
  @Input() public remainingCount = 0;
}
