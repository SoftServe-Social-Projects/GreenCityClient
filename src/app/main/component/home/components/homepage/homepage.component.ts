import { CheckTokenService } from 'src/app/main/service/auth/check-token/check-token.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { UserService } from '@global-service/user/user.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy {
  usersAmount: number;
  readonly guyImage = 'assets/img/guy.png';
  readonly path2 = 'assets/img/path-2.svg';
  readonly path4 = 'assets/img/path-4_3.png';
  readonly path5 = 'assets/img/path-5.png';
  private subs = new Subscription();
  userId: number;

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private userService: UserService,
    public dialog: MatDialog,
    private checkTokenservice: CheckTokenService
  ) {}

  ngOnInit() {
    this.subs.add(this.localStorageService.userIdBehaviourSubject.subscribe((userId) => (this.userId = userId)));
    this.subs.add(this.userService.countActivatedUsers().subscribe((num) => (this.usersAmount = num)));
    this.onCheckToken();
  }

  startHabit() {
    this.userId ? this.router.navigate(['/profile', this.userId]) : this.checkTokenservice.openAuthModalWindow();
  }

  private onCheckToken(): void {
    this.subs.add(this.checkTokenservice.onCheckToken());
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
