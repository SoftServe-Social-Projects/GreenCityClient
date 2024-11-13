import { authImages, ubsAuthImages } from 'src/app/main/image-pathes/auth-images';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit, OnDestroy {
  private destroySub: Subject<boolean> = new Subject<boolean>();
  authImages: { mainImage: string; cross: string; hiddenEye: string; openEye: string; google: string };
  authPage: string;
  authImageValue: boolean;

  constructor(
    private announcer: LiveAnnouncer,
    private router: Router,
    public matDialogRef: MatDialogRef<AuthModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}
  isUbs;

  ngOnInit(): void {
    this.isUbs = Object.prototype.hasOwnProperty.call(this.data, 'isUbs') ? this.data.isUbs : this.router.url.includes('ubs');
    this.authImages = this.isUbs ? ubsAuthImages : authImages;
    this.setAuthPage();
    this.announce();
  }

  announce() {
    this.announcer.announce('Welcome to login page', 'assertive');
  }

  changeAuthPage(page: string): void {
    this.authPage = page;
  }

  closeWindow(): void {
    this.matDialogRef.close();
  }

  private setAuthPage(): void {
    this.authPage = this.data.popUpName;
  }

  ngOnDestroy() {
    this.destroySub.next(true);
    this.destroySub.unsubscribe();
  }
}
