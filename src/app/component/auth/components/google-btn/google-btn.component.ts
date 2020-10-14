import { SignInIcons } from 'src/app/image-pathes/sign-in-icons';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-google-btn',
  templateUrl: './google-btn.component.html',
  styleUrls: ['./google-btn.component.scss']
})
export class GoogleBtnComponent {
  @Input() text:string;
  public googleImage = SignInIcons;

  constructor() { }
}
