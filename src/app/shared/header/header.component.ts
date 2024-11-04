import { LanguageService } from 'src/app/main/i18n/language.service';
import { Language } from '../../main/i18n/Language';
import { headerIcons, ubsHeaderIcons } from '../../main/image-pathes/header-icons';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Injector } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter, takeUntil, takeWhile } from 'rxjs/operators';
import { JwtService } from '@global-service/jwt/jwt.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { UserService } from '@global-service/user/user.service';
import { HabitStatisticService } from '@global-service/habit-statistic/habit-statistic.service';
import { SearchService } from '@global-service/search/search.service';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { LanguageModel } from '../../main/component/layout/components/models/languageModel';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { environment } from '@environment/environment';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HeaderService } from '@global-service/header/header.service';
import { OrderService } from 'src/app/ubs/ubs/services/order.service';
import { UbsPickUpServicePopUpComponent } from '@ubs/ubs/components/ubs-pick-up-service-pop-up/ubs-pick-up-service-pop-up.component';
import { ResetEmployeePermissions } from 'src/app/store/actions/employee.actions';
import { Store } from '@ngrx/store';
import { UserNotificationsPopUpComponent } from '@global-user/components/profile/user-notifications/user-notifications-pop-up/user-notifications-pop-up.component';
import { IAppState } from 'src/app/store/state/app.state';
import { ChatPopupComponent } from 'src/app/chat/component/chat-popup/chat-popup.component';
import { ResetFriends } from 'src/app/store/actions/friends.actions';
import { SocketService } from '@global-service/socket/socket.service';
import { SignOutAction } from 'src/app/store/actions/auth.actions';
import { CommonService } from 'src/app/chat/service/common/common.service';
import { ChatModalComponent } from 'src/app/chat/component/chat-modal/chat-modal.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  dropdownVisible = false;
  langDropdownVisible = false;
  name: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isGreenCityAdmin: boolean;
  managementLink: string;
  isAllSearchOpen = false;
  toggleBurgerMenu = false;
  arrayLang: Array<LanguageModel>;
  ariaStatus = 'profile options collapsed';
  isSearchClicked = false;
  private adminRoleValue = 'ROLE_UBS_EMPLOYEE';
  private adminRoleGreenCityValue = 'ROLE_ADMIN';
  private userRole: string;
  private userId: number;
  private backEndLink = environment.backendLink;
  private destroySub: Subject<boolean> = new Subject<boolean>();
  headerImageList;
  @ViewChild('signinref') signinref: ElementRef;
  @ViewChild('signupref') signupref: ElementRef;
  @ViewChild('serviceref') serviceref: ElementRef;
  @ViewChild('notificationIconRef') notificationIconRef: ElementRef;
  elementName;
  isUBS: boolean;
  ubsUrl = 'ubs';
  imageLogo;
  navLinks;
  selectedIndex: number = null;
  currentLanguage: string;
  imgAlt: string;
  private localeStorageService: LocalStorageService;
  private jwtService: JwtService;
  private router: Router;
  private userService: UserService;
  private habitStatisticService: HabitStatisticService;
  private languageService: LanguageService;
  private searchSearch: SearchService;
  private userOwnAuthService: UserOwnAuthService;
  private headerService: HeaderService;
  private orderService: OrderService;
  newMessagesCount: number;
  permissions$ = this.store.select((state: IAppState): Array<string> => state.employees.employeesPermissions);
  constructor(
    private dialog: MatDialog,
    injector: Injector,
    private store: Store,
    private socketService: SocketService,
    private commonChatService: CommonService
  ) {
    this.localeStorageService = injector.get(LocalStorageService);
    this.jwtService = injector.get(JwtService);
    this.router = injector.get(Router);
    this.userService = injector.get(UserService);
    this.habitStatisticService = injector.get(HabitStatisticService);
    this.languageService = injector.get(LanguageService);
    this.searchSearch = injector.get(SearchService);
    this.userOwnAuthService = injector.get(UserOwnAuthService);
    this.headerService = injector.get(HeaderService);
    this.orderService = injector.get(OrderService);
  }

  ngOnInit() {
    this.isUBS = this.router.url.includes(this.ubsUrl);
    this.imgAlt = this.isUBS ? 'Image ubs logo' : 'Image green city logo';
    this.localeStorageService.setUbsRegistration(this.isUBS);
    this.toggleHeader();
    this.dialog.afterAllClosed.pipe(takeUntil(this.destroySub)).subscribe(() => {
      this.focusDone();
    });

    this.searchSearch.searchSubject.pipe(takeUntil(this.destroySub)).subscribe((signal) => this.openSearchSubscription(signal));
    this.searchSearch.allSearchSubject.pipe(takeUntil(this.destroySub)).subscribe((signal) => this.openAllSearchSubscription(signal));

    this.localeStorageService.firstNameBehaviourSubject.pipe(takeUntil(this.destroySub)).subscribe((firstName) => {
      this.name = firstName;
    });

    this.initUser();
    this.jwtService.userRole$.pipe(takeUntil(this.destroySub)).subscribe((userRole) => {
      this.userRole = userRole;
      this.defineAuthorities();
      this.isGreenCityAdmin = this.userRole === this.adminRoleGreenCityValue;
    });
    this.autoOffBurgerBtn();
    this.userOwnAuthService.getDataFromLocalStorage();

    this.userOwnAuthService.isLoginUserSubject.pipe(takeUntil(this.destroySub)).subscribe((status) => (this.isLoggedIn = status));
    this.updateArrayLang();
    this.initLanguage();

    this.localeStorageService.accessTokenBehaviourSubject.pipe(takeUntil(this.destroySub)).subscribe((token) => {
      this.managementLink = `${this.backEndLink}token?accessToken=${token}`;
    });
  }

  onConnectedtoSocket(): void {
    this.socketService.initiateConnection();
    this.socketService
      .onMessage(this.socketService.connection.greenCity, `/topic/${this.userId}/notification`)
      .pipe(
        takeUntil(this.destroySub),
        takeWhile((el) => this.isLoggedIn)
      )
      .subscribe((msg) => {
        if (msg && !this.isUBS) {
          this.notificationIconRef.nativeElement.srcset = this.headerImageList.notificationHasNew;
        }
        if (!msg && !this.isUBS) {
          this.notificationIconRef.nativeElement.srcset = this.headerImageList.notification;
        }
        this.newMessagesCount = msg;
      });

    this.socketService.send(this.socketService.connection.greenCity, '/app/notifications', { userId: this.userId });
  }

  displayMessagesCount(): string {
    return this.newMessagesCount > 99 ? '99+' : this.newMessagesCount.toString();
  }

  defineAuthorities() {
    this.permissions$.subscribe((employeeAuthorities) => {
      this.isAdmin = this.userRole === this.adminRoleValue && !!employeeAuthorities.length;
    });

    if (this.userRole === this.adminRoleValue) {
      this.isAdmin = true;
    }
  }

  getHeaderClass(): string {
    if (this.isUBS) {
      return this.isAdmin ? 'header-for-admin' : 'header_navigation-menu-ubs';
    } else {
      return 'header_navigation-menu';
    }
  }

  getRouterLink(): string {
    if (this.isUBS && this.isAdmin) {
      return '/ubs-admin/orders';
    }
    if (this.isUBS && !this.isAdmin) {
      return '/ubs';
    }
    return '/greenCity';
  }

  private initLanguage(): void {
    const language = this.languageService.getCurrentLanguage();
    this.setCurrentLanguage(language || Language.UA);
  }

  private setCurrentLanguage(language: Language): void {
    this.currentLanguage = language;
    this.languageService.changeCurrentLanguage(language);
    this.setLangArr();
  }

  toggleHeader(): void {
    this.selectedIndex = this.headerService.getSelectedIndex();
    this.navLinks = this.headerService.getNavLinks(this.isUBS);
    this.headerImageList = this.isUBS ? ubsHeaderIcons : headerIcons;
    this.imageLogo = this.isUBS ? ubsHeaderIcons.ubsAdminLogo : headerIcons.greenCityLogo;
  }

  focusDone(): void {
    if (this.elementName === 'sign-up' && !this.isLoggedIn) {
      this.signupref.nativeElement.focus();
    }
    if (this.elementName === 'sign-in' && !this.isLoggedIn) {
      this.signinref.nativeElement.focus();
    }
  }

  ngOnDestroy() {
    this.destroySub.next(true);
    this.destroySub.unsubscribe();
  }

  private updateArrayLang() {
    this.arrayLang = [];
    this.arrayLang = this.headerService.getArrayLang(this.isUBS);
  }

  private setLangArr(): void {
    this.updateArrayLang();
    let mainLang = null;
    if (this.isUBS && this.currentLanguage === Language.RU) {
      this.languageService.changeCurrentLanguage(Language.UA.toLowerCase() as Language);
      this.currentLanguage = this.localeStorageService.getCurrentLanguage();
    }

    this.arrayLang.forEach((item, i, arr) => {
      if (arr[i].lang.toLowerCase() === this.currentLanguage) {
        mainLang = item;
        arr.splice(i, 1);
        arr.unshift(mainLang);
        mainLang = null;
      }
    });
  }

  private initUser(): void {
    this.localeStorageService.userIdBehaviourSubject
      .pipe(
        takeUntil(this.destroySub),
        filter((userId) => userId !== null && !isNaN(userId))
      )
      .subscribe((userId) => {
        this.assignData(userId);
        if (userId) {
          this.onConnectedtoSocket();
        }
      });
  }

  changeCurrentLanguage(language: string, index: number): void {
    this.languageService.changeCurrentLanguage(language.toLowerCase() as Language);
    const temporary = this.arrayLang[0].lang;
    this.arrayLang[0].lang = language;
    this.arrayLang[index].lang = temporary;
    this.langDropdownVisible = false;
    if (this.isLoggedIn) {
      const curLangId = this.languageService.getLanguageId(language.toLowerCase() as Language);
      this.userService.updateUserLanguage(curLangId).pipe(takeUntil(this.destroySub)).subscribe();
    }
  }

  getUserId(): number | string {
    if (this.userId !== null && !isNaN(this.userId)) {
      return this.userId;
    }

    return 'not_signed_in';
  }

  private autoOffBurgerBtn(): void {
    this.router.events
      .pipe(
        takeUntil(this.destroySub),
        filter((events) => events instanceof NavigationStart)
      )
      .subscribe(() => {
        this.toggleBurgerMenu = false;
        this.toggleScroll();
      });
  }

  private assignData(userId: number): void {
    this.userId = userId;
    this.userOwnAuthService.isLoginUserSubject.next(true);
  }

  toggleSearchPage(): void {
    this.searchSearch.toggleSearchModal();
  }

  private openSearchSubscription(signal: boolean): void {
    this.isSearchClicked = signal;
  }

  private openAllSearchSubscription(signal: boolean): void {
    this.isAllSearchOpen = signal;
  }

  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
    this.ariaStatus = this.dropdownVisible ? 'profile options expanded' : 'profile options collapsed';
  }

  autoCloseUserDropDown(event): void {
    this.dropdownVisible = event;
    this.ariaStatus = 'profile options collapsed';
  }

  autoCloseLangDropDown(event): void {
    this.langDropdownVisible = event;
  }

  onToggleBurgerMenu(): void {
    this.toggleBurgerMenu = !this.toggleBurgerMenu;
    this.toggleScroll();
  }

  openAuthModalWindow(page: string): void {
    this.elementName = page;
    const matDialogRef = this.dialog.open(AuthModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {
        popUpName: page
      }
    });

    matDialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroySub))
      .subscribe(() => {
        this.focusDone();
      });
  }

  onPressEnterAboutService(event: Event): void {
    //$Event KeyboardEvent
    event.preventDefault();
    this.openAboutServicePopUp(event);
  }

  openAboutServicePopUp(event: Event): void {
    event.preventDefault();
    const matDialogRef = this.dialog.open(UbsPickUpServicePopUpComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: 'custom-dialog-container',
      backdropClass: 'background-transparent',
      height: '640px'
    });

    matDialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroySub))
      .subscribe(() => {
        this.serviceref.nativeElement.focus();
      });
  }

  openNotificationsDialog(): void {
    this.dropdownVisible = false;
    this.router.navigate(['/profile', this.userId, 'notifications']);
  }

  openNotificationPopUp() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.closeOnNavigation = true;
    dialogConfig.panelClass = 'dialog-notification';
    dialogConfig.position = {
      top: 55 + 'px',
      right: 20 + 'px'
    };
    const matDialogRef = this.dialog.open(UserNotificationsPopUpComponent, dialogConfig);
    matDialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroySub))
      .subscribe((data) => {
        if (data?.openAll) {
          this.router.navigate(['/profile', this.userId, 'notifications']);
        }
      });
  }

  openChatPopUp() {
    this.commonChatService.isChatVisible$.next(true);
  }

  signOut(): void {
    this.dropdownVisible = false;

    this.jwtService.userRole$.next('');

    this.router.navigateByUrl(this.isUBS ? '/' : '/greenCity').then((isRedirected: boolean) => {
      this.userOwnAuthService.isLoginUserSubject.next(false);
      this.localeStorageService.clear();
      this.habitStatisticService.onLogout();
      this.orderService.cancelUBSwithoutSaving();
      this.userOwnAuthService.getDataFromLocalStorage();
    });

    this.store.dispatch(SignOutAction());
    this.store.dispatch(ResetEmployeePermissions());
    this.store.dispatch(ResetFriends());
  }

  toggleLangDropdown(event: Event): void {
    //$Event KeyboardEvent
    event.preventDefault();
    this.langDropdownVisible = !this.langDropdownVisible;
  }

  onKeydownLangOption(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.changeCurrentLanguage(this.arrayLang[index].lang, index);
    }
  }

  toggleScroll(): void {
    this.toggleBurgerMenu ? document.body.classList.add('modal-open') : document.body.classList.remove('modal-open');
  }
}
