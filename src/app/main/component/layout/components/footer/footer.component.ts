import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { footerIcons } from 'src/app/main/image-pathes/footer-icons';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  public actualYear = new Date().getFullYear();
  public footerImageList = footerIcons;
  private userId: number;
  private destroySub: Subject<boolean> = new Subject<boolean>();

  constructor(private localStorageService: LocalStorageService) {}

  ngOnInit() {
    this.localStorageService.userIdBehaviourSubject.pipe(takeUntil(this.destroySub)).subscribe((userId) => (this.userId = userId));
  }

  public getUserId(): number | string {
    return this.userId !== null && !isNaN(this.userId) ? this.userId : 'not_signed-in';
  }

  ngOnDestroy() {
    this.destroySub.next(true);
    this.destroySub.complete();
  }
}
