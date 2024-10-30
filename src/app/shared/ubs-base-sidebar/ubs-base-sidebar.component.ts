import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  AfterViewChecked
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDrawer } from '@angular/material/sidenav';
import { UserMessagesService } from '../../ubs/ubs-user/services/user-messages.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JwtService } from '@global-service/jwt/jwt.service';
import { Router } from '@angular/router';
import { listElements } from '../interface/ubs-base-sidebar-interface';

@Component({
  selector: 'app-ubs-base-sidebar',
  templateUrl: './ubs-base-sidebar.component.html',
  styleUrls: ['./ubs-base-sidebar.component.scss']
})
export class UbsBaseSidebarComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
  destroySub: Subject<boolean> = new Subject<boolean>();
  readonly bellsNoneNotification = 'assets/img/sidebarIcons/none_notification_Bell.svg';
  readonly bellsNotification = 'assets/img/sidebarIcons/notification_Bell.svg';
  private adminRoleValue = 'ROLE_UBS_EMPLOYEE';
  private sidebarChangeBreakpoint: number;
  isAdmin = false;
  destroy: Subject<boolean> = new Subject<boolean>();
  @Input() public listElements: listElements[] = [];
  @Input() public listElementsMobile: listElements[] = [];
  @ViewChild('drawer') drawer: MatDrawer;
  @ViewChild('sideBarIcons') sideBarIcons: ElementRef;
  @ViewChild('sidebarContainer') sidebarContainer: ElementRef;

  CUSTOM_BREAKPOINTS = {
    XSmall: '(max-width: 480px)'
  };

  constructor(
    public serviceUserMessages: UserMessagesService,
    public breakpointObserver: BreakpointObserver,
    public jwtService: JwtService,
    private router?: Router,
    private cdr?: ChangeDetectorRef
  ) {}

  isExpanded = false;

  navigateToPage(event: Event, routerLink: string): void {
    event.stopPropagation();
    const mainLink = this.isAdmin ? 'ubs-admin' : 'ubs-user';
    this.router.navigate([mainLink, ...routerLink.split('/')]);
  }

  setIndexToSidebarIcons(): void {
    if (this.drawer.opened) {
      this.sideBarIcons.nativeElement.style.zIndex = '0';
      this.sidebarContainer.nativeElement.style.marginLeft = '25px';
      this.sidebarContainer.nativeElement.style.width = 'calc(100% - 50px)';
    } else {
      this.sideBarIcons.nativeElement.style.zIndex = '2';
      this.sidebarContainer.nativeElement.style.marginLeft = '85px';
      this.sidebarContainer.nativeElement.style.width = 'calc(100% - 120px)';
    }
  }

  getIcon(listItem): string {
    return listItem.link === this.bellsNoneNotification && this.serviceUserMessages.countOfNoReadMessages
      ? this.bellsNotification
      : listItem.link;
  }

  toggleMenu() {
    this.isExpanded = !this.isExpanded;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.drawer) {
      this.isExpanded = event.target.innerWidth > this.sidebarChangeBreakpoint || window.innerWidth > this.sidebarChangeBreakpoint;
    }
  }

  getCountOfUnreadNotification() {
    this.jwtService.userRole$.pipe(takeUntil(this.destroySub)).subscribe((userRole) => {
      if (userRole !== this.adminRoleValue) {
        this.serviceUserMessages
          .getCountUnreadNotification()
          .pipe(takeUntil(this.destroy))
          .subscribe((response) => {
            this.serviceUserMessages.countOfNoReadMessages = response;
          });
      } else {
        this.isAdmin = true;
      }
    });
  }

  ngAfterViewInit(): void {
    this.sidebarChangeBreakpoint = 1266;
    if (window.innerWidth < this.sidebarChangeBreakpoint && this.drawer) {
      this.isExpanded = false;
    }
    setTimeout(() => {
      this.breakpointObserver.observe([this.CUSTOM_BREAKPOINTS.XSmall]).subscribe((result) => {
        if (this.drawer) {
          this.drawer.mode = 'side';
          this.drawer.opened = !result.matches;
        }
      });
    }, 0);
    this.getCountOfUnreadNotification();
  }

  ngAfterViewChecked(): void {
    this.cdr?.detectChanges();
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
