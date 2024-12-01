import { CheckTokenService } from 'src/app/main/service/auth/check-token/check-token.service';
import { Component, OnDestroy, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, finalize, tap, concatMap, switchMap } from 'rxjs/operators';
import { ubsMainPageImages } from 'src/app/main/image-pathes/ubs-main-page-images';
import {
  Bag,
  OrderDetails,
  LocationsDtosList,
  ActiveCourierDto,
  AllActiveLocationsDtosResponse,
  ActiveRegionDto
} from '../../models/ubs.interface';
import { OrderService } from '../../services/order.service';
import { UbsOrderLocationPopupComponent } from '../ubs-order-details/ubs-order-location-popup/ubs-order-location-popup.component';
import { JwtService } from '@global-service/jwt/jwt.service';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { IAppState } from 'src/app/store/state/app.state';
import { Store } from '@ngrx/store';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ubs-main-page',
  templateUrl: './ubs-main-page.component.html',
  styleUrls: ['./ubs-main-page.component.scss']
})
export class UbsMainPageComponent implements OnInit, OnDestroy, AfterViewChecked {
  private subs = new Subscription();
  private destroy: Subject<boolean> = new Subject<boolean>();
  ubsMainPageImages = ubsMainPageImages;
  locations: ActiveRegionDto;
  selectedLocationId: number;
  isFetching: boolean;
  currentLocation: string;
  isAdmin = false;
  boxWidth: number;
  lineSize = Array(4).fill(0);
  screenWidth: number;
  selectedTariffId: number;
  activeCouriers;
  ubsCourierName = 'UBS';
  private userId: number;
  permissions$ = this.store.select((state: IAppState): Array<string> => state.employees.employeesPermissions);
  bags: Bag[];
  locationsToShowBags: LocationsDtosList[];
  locationToShow: LocationsDtosList;
  isTarriffLoading = true;

  perPackageTitle = 'ubs-homepage.ubs-courier.price.price-title';

  stepsOrderTitle = 'ubs-homepage.ubs-courier.price.caption-steps';
  stepsOrder = [
    {
      header: 'ubs-homepage.ubs-courier.price.steps-title.li_1',
      content: 'ubs-homepage.ubs-courier.price.steps-content.li_1'
    },
    {
      header: 'ubs-homepage.ubs-courier.price.steps-title.li_2',
      content: 'ubs-homepage.ubs-courier.price.steps-content.li_2'
    },
    {
      header: 'ubs-homepage.ubs-courier.price.steps-title.li_3',
      content: 'ubs-homepage.ubs-courier.price.steps-content.li_3'
    },
    {
      header: 'ubs-homepage.ubs-courier.price.steps-title.li_4',
      content: 'ubs-homepage.ubs-courier.price.steps-content.li_4'
    }
  ];

  preparingContent = [
    'ubs-homepage.ubs-courier.preparing.content.li_1',
    'ubs-homepage.ubs-courier.preparing.content.li_1.1',
    'ubs-homepage.ubs-courier.preparing.content.li_1.2',
    'ubs-homepage.ubs-courier.preparing.content.li_2',
    'ubs-homepage.ubs-courier.preparing.content.li_3',
    'ubs-homepage.ubs-courier.preparing.content.li_4',
    'ubs-homepage.ubs-courier.preparing.content.li_5'
  ];

  rules = [
    'ubs-homepage.ubs-courier.rules.content.li_1',
    'ubs-homepage.ubs-courier.rules.content.li_2',
    'ubs-homepage.ubs-courier.rules.content.li_2.1',
    'ubs-homepage.ubs-courier.rules.content.li_3'
  ];

  bonuses = [
    'ubs-homepage.ubs-courier.bonuses.content.li_1',
    'ubs-homepage.ubs-courier.bonuses.content.li_2',
    'ubs-homepage.ubs-courier.bonuses.content.li_3',
    'ubs-homepage.ubs-courier.bonuses.content.li_3.1'
  ];

  howWorksPickUp = [
    {
      header: 'ubs-homepage.ubs-courier.how-works.header.pre_1',
      content: 'ubs-homepage.ubs-courier.how-works.time.pre_1'
    },
    {
      header: 'ubs-homepage.ubs-courier.how-works.header.pre_2',
      content: 'ubs-homepage.ubs-courier.how-works.time.pre_2'
    }
  ];

  constructor(
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private checkTokenservice: CheckTokenService,
    private localStorageService: LocalStorageService,
    private orderService: OrderService,
    private jwtService: JwtService,
    private cdref: ChangeDetectorRef,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.userId = this.localStorageService.getUserId();
    this.isAdmin = this.checkIsAdmin();
    this.getActiveCouriers()
      .pipe(
        concatMap(() => this.getActiveLocationsToShow()),
        takeUntil(this.destroy)
      )
      .subscribe(() => {
        this.getBags();
      });
    this.screenWidth = document.documentElement.clientWidth;
    this.onCheckToken();
    this.boxWidth = document.querySelector('.main-container').getBoundingClientRect().width;
  }

  ngAfterViewChecked(): void {
    this.screenWidth = document.documentElement.clientWidth;
    this.boxWidth = document.querySelector('.main-container').getBoundingClientRect().width;
    this.calcLineSize();
    this.cdref.detectChanges();
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
    this.subs.unsubscribe();
  }

  getBags(locationId = 1): void {
    this.isTarriffLoading = true;
    this.locationToShow = this.locationsToShowBags.find((el) => el.locationId === locationId);
    const courierId = this.findCourierByName(this.ubsCourierName)?.courierId;

    this.orderService
      .getInfoAboutTariff(courierId, this.locationToShow.locationId)
      .pipe(
        switchMap((data) => {
          const tariffId = data.tariffsForLocationDto.tariffInfoId;
          return this.orderService.getOrderDetails(locationId, tariffId);
        }),
        takeUntil(this.destroy)
      )
      .subscribe((orderData: OrderDetails) => {
        this.bags = orderData.bags;
        this.isTarriffLoading = false;
      });
  }

  calcLineSize() {
    if (this.screenWidth >= 576) {
      const quantity = 4;
      const circleSize = 36;
      const circleMargin = 10;
      const sumOfIndents = quantity * (circleSize + 2 * circleMargin);
      this.lineSize[0] = (this.boxWidth - sumOfIndents) / (quantity * 2) - 3;
    } else {
      const boxes = document.getElementsByClassName('content-box');
      const halfCircleHeight = 11;
      const circleIndent = 6;
      const boxesIndent = 16;

      this.lineSize = Array.from(boxes, (box) => box.getBoundingClientRect().height / 2 - halfCircleHeight - circleIndent + boxesIndent);
    }
  }
  onCheckToken(): void {
    this.subs.add(this.checkTokenservice.onCheckToken());
  }

  redirectToOrder(): void {
    if (this.userId) {
      this.localStorageService.setUbsRegistration(true);
      this.getLocations(this.ubsCourierName);
    } else {
      this.openAuthModalWindow();
    }
    this.orderService.cleanPrevOrderState();
  }

  openAuthModalWindow(): void {
    this.dialog.open(AuthModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {
        popUpName: 'sign-in'
      }
    });
  }

  checkIsAdmin(): boolean {
    let isEmployeeHasAuthorities = true;
    const userRole = this.jwtService.getUserRole();
    this.permissions$.subscribe((employeeAuthorities) => {
      if (!employeeAuthorities.length) {
        isEmployeeHasAuthorities = false;
      }
    });
    return userRole === 'ROLE_UBS_EMPLOYEE' && isEmployeeHasAuthorities;
  }

  findCourierByName(name) {
    return this.activeCouriers?.find((courier) => courier.nameEn.includes(name));
  }

  getActiveCouriers(): Observable<ActiveCourierDto[]> {
    return this.orderService.getAllActiveCouriers().pipe(
      takeUntil(this.destroy),
      tap((res) => (this.activeCouriers = res))
    );
  }

  getLocations(courierName: string): void {
    const courier = this.findCourierByName(courierName);
    this.isFetching = true;
    this.orderService
      .getLocations(courier.courierId)
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.isFetching = false;
        })
      )
      .subscribe({
        next: (res: AllActiveLocationsDtosResponse) => {
          if (res.orderIsPresent) {
            this.saveLocation(res);
            this.router.navigate(['ubs', 'order']);
          } else {
            this.openLocationDialog(res);
          }
        },
        error: (e) => {
          console.error(e);
        }
      });
  }

  private getActiveLocationsToShow(): Observable<AllActiveLocationsDtosResponse> {
    const courier = this.findCourierByName(this.ubsCourierName);
    return this.orderService.getLocations(courier.courierId, true).pipe(
      takeUntil(this.destroy),
      tap((res) => {
        this.locationsToShowBags = res.allActiveLocationsDtos.reduce(
          (acc, region) => [
            ...acc,
            ...region.locations.map((city) => ({
              locationId: city.locationId,
              nameUk: city.nameUk + ', ' + region.nameUk,
              nameEn: city.nameEn + ', ' + region.nameEn
            }))
          ],
          []
        );
      })
    );
  }

  saveLocation(locationsData: AllActiveLocationsDtosResponse): void {
    this.locations = locationsData.allActiveLocationsDtos[0];
    this.selectedLocationId = locationsData.allActiveLocationsDtos[0].locations[0].locationId;
    this.selectedTariffId = locationsData.allActiveLocationsDtos[0].locations[0].tariffInfoDto.tariffInfoId;
    this.currentLocation = locationsData.allActiveLocationsDtos[0].nameEn;
    this.orderService.completedLocation(true);
    this.localStorageService.setLocationId(this.selectedLocationId);
    this.localStorageService.setTariffId(this.selectedTariffId);
  }

  openLocationDialog(locationsData: AllActiveLocationsDtosResponse): void {
    const dialogRef = this.dialog.open(UbsOrderLocationPopupComponent, {
      hasBackdrop: true,
      disableClose: false,
      closeOnNavigation: true,
      data: locationsData
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (res) => {
          if (res?.data) {
            this.router.navigate(['ubs', 'order']);
          }
        },
        error: (e) => {
          console.error(e);
        }
      });
  }

  getElementDescription(nameUk: string, nameEng: string, capacity: number): string {
    let nameUk1 = nameUk.toLowerCase();
    nameUk1 = nameUk1.charAt(0).toUpperCase() + nameUk1.slice(1);

    const ukrDescription = `${nameUk1} об'ємом ${capacity} л.`;
    const engDescription = `With ${nameEng.toLowerCase()} with a volume of ${capacity} l.`;
    return this.languageService.getLangValue(ukrDescription, engDescription);
  }

  openAuto(event: Event, trigger: MatAutocompleteTrigger): void {
    event.stopPropagation();
    trigger.openPanel();
  }
}
