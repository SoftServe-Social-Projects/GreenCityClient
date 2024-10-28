import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { take, takeUntil } from 'rxjs/operators';
import { HabitService } from '@global-service/habit/habit.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { ShoppingListService } from './habit-edit-shopping-list/shopping-list.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WarningPopUpComponent } from '@shared/components';
import { Location } from '@angular/common';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { habitImages } from 'src/app/main/image-pathes/habits-images';
import { EcoNewsDto } from '@eco-news-models/eco-news-dto';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { HabitAcquireConfirm, HabitCongratulation, HabitGiveUp, HabitLeavePage } from '@global-user/components/habit/models/habit-warnings';
import { WarningDialog } from '@global-user/models/warning-dialog.inteface';
import { HabitAssignInterface } from '../models/interfaces/habit-assign.interface';
import { HabitInterface, HabitListInterface } from '../models/interfaces/habit.interface';
import { AllShoppingLists, HabitUpdateShopList, ShoppingList } from '@user-models/shoppinglist.interface';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { HabitAssignCustomPropertiesDto, HabitAssignPropertiesDto } from '@global-models/goal/HabitAssignCustomPropertiesDto';
import { singleNewsImages } from 'src/app/main/image-pathes/single-news-images';
import { STAR_IMAGES } from '../const/data.const';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-add-new-habit',
  templateUrl: './add-new-habit.component.html',
  styleUrls: ['./add-new-habit.component.scss']
})
export class AddNewHabitComponent implements OnInit, OnDestroy {
  assignedHabit: HabitAssignInterface;
  habitResponse: HabitInterface;
  recommendedHabits: HabitInterface[];
  recommendedNews: EcoNewsModel[];
  initialShoppingList: ShoppingList[] = [];
  standardShopList: ShoppingList[] = [];
  customShopList: ShoppingList[] = [];
  friendsIdsList: number[] = [];
  newDuration = 7;
  initialDuration: number;
  habitAssignId: number;
  habitId: number;
  userId: number;
  star: number;
  habitImage: string;
  isCustomHabit = false;
  isEditing = false;
  canAcquire = false;
  isAcquired = false;
  wasCustomHabitCreatedByUser = false;
  setStatus = HabitStatus.ACQUIRED;
  defaultImage = habitImages.defaultImage;
  images = singleNewsImages;
  stars = [STAR_IMAGES.WHITE, STAR_IMAGES.WHITE, STAR_IMAGES.WHITE];
  private enoughToAcquire = 80;
  private currentLang: string;
  private page = 0;
  private size = 3;
  private destroyed$: Subject<boolean> = new Subject<boolean>();
  scope = 'private';
  isPrivate = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private habitService: HabitService,
    private snackBar: MatSnackBarComponent,
    private habitAssignService: HabitAssignService,
    private newsService: EcoNewsService,
    private shopListService: ShoppingListService,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private location: Location,
    public userFriendsService: UserFriendsService
  ) {}

  ngOnInit() {
    this.userId = this.localStorageService.getUserId();
    this.subscribeToLangChange();
    this.bindLang(this.localStorageService.getCurrentLanguage());
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      if (this.router.url.includes('add')) {
        this.habitId = Number(params.habitId);
      } else {
        this.isEditing = true;
        this.habitAssignId = Number(params.habitAssignId);
      }
    });
    this.checkIfAssigned();
    this.getRecommendedNews(this.page, this.size);
    this.userFriendsService.addedFriends.length = 0;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private bindLang(lang: string): void {
    this.translate.setDefaultLang(lang);
    this.currentLang = lang;
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageSubject.pipe(takeUntil(this.destroyed$)).subscribe((lang: string) => {
      this.bindLang(lang);
    });
  }

  private checkIfAssigned(): void {
    if (this.isEditing && this.userId) {
      this.habitAssignService
        .getHabitByAssignId(this.habitAssignId, this.currentLang)
        .pipe(take(1))
        .subscribe((res: HabitAssignInterface) => {
          this.assignedHabit = res;
          this.habitId = this.assignedHabit.habit.id;
          this.isAcquired = this.assignedHabit.status === HabitStatus.ACQUIRED;
          this.initialDuration = res.duration || res.habit.defaultDuration;
          this.initHabitData(res.habit, res.duration || res.habit.defaultDuration);
          this.getCustomShopList();
        });
    } else {
      this.getDefaultHabit();
    }
  }

  private getRecommendedHabits(page: number, size: number, tags: string[]): void {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('lang', this.currentLang)
      .set('sort', 'asc')
      .set('excludeAssigned', 'true');
    tags.forEach((tag) => {
      params = params.append('tags', tag);
    });

    if (this.userId) {
      this.habitService
        .getHabitsByFilters(params)
        .pipe(take(1))
        .subscribe((data: HabitListInterface) => {
          this.recommendedHabits = data.page;
        });
    }
  }

  private getRecommendedNews(page: number, size: number): void {
    this.newsService
      .getEcoNewsListByPage(page, size)
      .pipe(take(1))
      .subscribe((res: EcoNewsDto) => {
        this.recommendedNews = res.page;
      });
  }

  private getDefaultHabit(): void {
    this.habitService
      .getHabitById(this.habitId)
      .pipe(take(1))
      .subscribe((data: HabitInterface) => {
        this.initHabitData(data);
        this.isCustomHabit = data.isCustomHabit;
        if (data.isCustomHabit) {
          data.customShoppingListItems?.forEach((item) => (item.custom = true));
          this.initialShoppingList = data.customShoppingListItems;
        } else {
          this.getStandardShopList();
        }
      });
  }

  private initHabitData(habit: HabitInterface, customDuration = this.initialDuration): void {
    this.habitResponse = habit;
    this.initialDuration = customDuration || habit.defaultDuration;
    this.wasCustomHabitCreatedByUser = habit.usersIdWhoCreatedCustomHabit === this.userId;
    this.habitImage = this.habitResponse.image ? this.habitResponse.image : this.defaultImage;
    this.isCustomHabit = habit.isCustomHabit;
    this.getStars(habit.complexity);
    if (this.habitResponse.tags?.length) {
      this.getRecommendedHabits(this.page, this.size, [this.habitResponse.tags[0]]);
    }
  }

  private getStars(complexity: number): void {
    for (this.star = 0; this.star < complexity; this.star++) {
      this.stars[this.star] = STAR_IMAGES.GREEN;
    }
  }

  onGoBack(): void {
    const isHabitWasEdited = this.initialDuration !== this.newDuration || this.standardShopList || this.customShopList;
    if (isHabitWasEdited) {
      const dialogRef = this.getOpenDialog(HabitLeavePage, false);
      if (!dialogRef) {
        return;
      }
      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((confirm) => {
          if (confirm) {
            this.location.back();
          }
        });
    } else {
      this.location.back();
    }
  }

  getDuration(newDuration: number): void {
    setTimeout(() => {
      this.newDuration = newDuration;
    });
  }

  getProgressValue(progress: number): void {
    this.canAcquire = progress >= this.enoughToAcquire;
    if (this.canAcquire && !this.assignedHabit.progressNotificationHasDisplayed && !this.isAcquired) {
      const dialogRef = this.getOpenDialog(HabitCongratulation, true);
      this.afterDialogClosed(dialogRef);
      this.habitAssignService.progressNotificationHasDisplayed(this.habitAssignId).pipe(take(1)).subscribe();
    }
  }

  getList(list: ShoppingList[]): void {
    this.standardShopList = list.filter((item) => !item.custom);
    this.customShopList = list.filter((item) => item.custom);
  }

  private getStandardShopList(): void {
    this.shopListService
      .getHabitShopList(this.habitId)
      .pipe(take(1))
      .subscribe((res) => {
        this.initialShoppingList = res;
      });
  }

  private getCustomShopList(): void {
    this.shopListService
      .getHabitAllShopLists(this.habitAssignId, this.currentLang)
      .pipe(take(1))
      .subscribe((res: AllShoppingLists) => {
        res.customShoppingListItemDto?.forEach((item) => (item.custom = true));
        this.initialShoppingList = [...res.customShoppingListItemDto, ...res.userShoppingListItemDto];
        this.getList(this.initialShoppingList);
      });
  }

  giveUpHabit(): void {
    const dialogRef = this.getOpenDialog(HabitGiveUp, true);
    if (!dialogRef) {
      return;
    }
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirm) => {
        if (confirm) {
          this.habitAssignService
            .deleteHabitById(this.habitAssignId)
            .pipe(take(1))
            .subscribe(() => {
              this.afterHabitWasChanged('habitDeleted');
            });
        } else {
          this.snackBar.openSnackBar('habitDidNotGiveUp');
        }
      });
  }

  editUsersCustomHabit(url: string, id: number): void {
    this.localStorageService.setEditMode('canUserEdit', true);
    this.router.navigate([`profile/${this.userId}/allhabits/${url}/${id}/edit-habit`]);
  }

  goToProfile(): void {
    this.router.navigate(['profile', this.userId]);
  }

  assignCustomHabit(): void {
    this.friendsIdsList = this.userFriendsService.addedFriends?.map((friend) => friend.id);
    const habitAssignPropertiesDto: HabitAssignPropertiesDto = {
      defaultShoppingListItems: this.standardShopList.filter((item) => item.selected === true).map((item) => item.id),
      duration: this.newDuration,
      isPrivate: this.isPrivate
    };
    const body: HabitAssignCustomPropertiesDto = {
      friendsIdsList: this.friendsIdsList,
      habitAssignPropertiesDto,
      customShoppingListItemList: this.customShopList.map((item) => ({ text: item.text }))
    };

    this.habitAssignService
      .assignCustomHabit(this.habitId, body)
      .pipe(take(1))
      .subscribe(() => {
        this.afterHabitWasChanged('habitAdded');
      });
  }

  updateHabit(): void {
    this.habitAssignService
      .updateHabitDuration(this.habitAssignId, this.newDuration)
      .pipe(take(1))
      .subscribe(() => {
        if (this.customShopList || this.standardShopList) {
          this.convertShopLists();
          this.shopListService.updateHabitShopList(this.setHabitListForUpdate());
        }
        this.afterHabitWasChanged('habitUpdated');
      });
  }

  goToAllHabits(): void {
    this.router.navigate([`/profile/${this.userId}/allhabits`]);
  }

  deleteHabit(): void {
    this.habitService
      .deleteCustomHabit(this.habitId)
      .pipe(take(1))
      .subscribe((res) => {
        this.goToAllHabits();
        this.snackBar.openSnackBar('habitDeleted');
      });
  }

  private convertShopLists(): void {
    this.customShopList?.forEach((el) => {
      delete el.custom;
      delete el.selected;
    });
    this.standardShopList?.forEach((el) => {
      delete el.custom;
      delete el.selected;
    });
  }

  private afterHabitWasChanged(kindOfChanges: string): void {
    this.goToProfile();
    this.snackBar.openSnackBar(kindOfChanges);
  }

  private setHabitListForUpdate(): HabitUpdateShopList {
    return {
      habitAssignId: this.habitAssignId,
      customShopList: this.customShopList,
      standardShopList: this.standardShopList,
      lang: this.currentLang
    };
  }

  openAcquireConfirm(): void {
    const dialogRef = this.getOpenDialog(HabitAcquireConfirm, true);
    this.afterDialogClosed(dialogRef);
  }

  getOpenDialog(dialogConfig: WarningDialog, isHabitNameNeeded: boolean): MatDialogRef<WarningPopUpComponent> {
    return this.dialog.open(WarningPopUpComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'popup-dialog-container',
      data: {
        popupTitle: dialogConfig.title,
        popupSubtitle: dialogConfig.subtitle,
        popupConfirm: dialogConfig.confirm,
        popupCancel: dialogConfig.cancel,
        isHabit: isHabitNameNeeded,
        habitName: this.habitResponse?.habitTranslation?.name || ''
      }
    });
  }

  afterDialogClosed(dialogRef: MatDialogRef<WarningPopUpComponent>) {
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirm) => {
        if (confirm) {
          this.acquireHabit();
        } else {
          this.snackBar.openSnackBar('habitDidNotGiveUp');
        }
      });
  }

  acquireHabit(): void {
    this.habitAssignService
      .setHabitStatus(this.habitAssignId, this.setStatus)
      .pipe(take(1))
      .subscribe(() => {
        this.afterHabitWasChanged('habitAcquired');
      });
  }

  onChange(): void {
    this.isPrivate = !this.isPrivate;
    this.scope = this.isPrivate ? 'private' : 'public';
  }
}
