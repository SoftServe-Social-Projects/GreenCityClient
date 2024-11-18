import { footerIcons } from 'src/app/main/image-pathes/footer-icons';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  actualYear = new Date().getFullYear();
  footerImageList = footerIcons;
  private userId: number;
  private destroySub: Subject<boolean> = new Subject<boolean>();

  constructor(private localStorageService: LocalStorageService) {}

  ngOnInit() {
    this.localStorageService.userIdBehaviourSubject.pipe(takeUntil(this.destroySub)).subscribe((userId) => (this.userId = userId));
  }

  getUserId(): number | string {
    return this.userId !== null && !isNaN(this.userId) ? this.userId : 'not_signed-in';
  }

  ngOnDestroy() {
    this.destroySub.next(true);
    this.destroySub.complete();
  }

  ubsSetRegValue() {
    this.localStorageService.setUbsRegistration(false);
  }
}
