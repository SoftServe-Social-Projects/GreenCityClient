import { Component, OnInit, Injector } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormBaseComponent } from '@shared/components/form-base/form-base.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Quill from 'quill';
import 'quill-emoji/dist/quill-emoji.js';
import ImageResize from 'quill-image-resize-module';
import { HabitService } from '@global-service/habit/habit.service';
import { TagInterface } from '@shared/components/tag-filter/tag-filter.model';
import { quillConfig } from 'src/app/main/component/events/components/create-edit-events/quillEditorFunc';
import { ShoppingList } from '../../../models/shoppinglist.interface';
import { FileHandle } from '@eco-news-models/create-news-interface';
import { UserFriendsService } from '@global-user/services/user-friends.service';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { TodoStatus } from '../models/todo-status.enum';

@Component({
  selector: 'app-add-edit-custom-habit',
  templateUrl: './add-edit-custom-habit.component.html',
  styleUrls: ['./add-edit-custom-habit.component.scss']
})
export class AddEditCustomHabitComponent extends FormBaseComponent implements OnInit {
  habitForm: FormGroup;
  habit: any;
  complexityList = [
    { value: 1, name: 'user.habit.add-new-habit.difficulty.easy', alt: 'Easy difficulty' },
    { value: 2, name: 'user.habit.add-new-habit.difficulty.medium', alt: 'Medium difficulty' },
    { value: 3, name: 'user.habit.add-new-habit.difficulty.hard', alt: 'Hard difficulty' }
  ];
  habitImages = [
    { src: 'assets/img/habits/habit-1.png', alt: 'Man with papers around on green background' },
    { src: 'assets/img/habits/habit-2.png', alt: 'Man with cup of cofee on green background' },
    { src: 'assets/img/habits/habit-3.png', alt: 'Woman on green background' }
  ];
  lineStar = 'assets/img/icon/star-2.png';
  greenStar = 'assets/img/icon/star-1.png';
  initialDuration = 7;
  shopList: ShoppingList[] = [];
  newList: ShoppingList[] = [];
  tagsList: TagInterface[];
  tagMaxLength = 3;
  selectedTagsList: number[];

  quillModules = {};
  isEditing = false;

  private habitId: number;
  private userId: number;
  private currentLang: string;
  private destroyed$: Subject<boolean> = new Subject<boolean>();

  public previousPath: string;
  public popupConfig = {
    hasBackdrop: true,
    closeOnNavigation: true,
    disableClose: true,
    panelClass: 'popup-dialog-container',
    data: {
      popupTitle: 'user.habit.all-habits.habits-popup.title',
      popupSubtitle: 'user.habit.all-habits.habits-popup.subtitle',
      popupConfirm: 'user.habit.all-habits.habits-popup.confirm',
      popupCancel: 'user.habit.all-habits.habits-popup.cancel'
    }
  };

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    public router: Router,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private habitService: HabitService,
    private userFriendsService: UserFriendsService,
    private store: Store<IAppState>
  ) {
    super(router, dialog);

    this.quillModules = quillConfig;
    Quill.register('modules/imageResize', ImageResize);
  }

  ngOnInit(): void {
    this.getUserId();
    this.initForm();
    this.subscribeToLangChange();
    this.previousPath = `/profile/${this.userId}/allhabits`;
    this.userFriendsService.addedFriends.length = 0;
    this.isEditing = this.router.url?.includes('edit-habit');
    if (this.isEditing) {
      this.store
        .select((state) => state.habit)
        .pipe(take(1))
        .subscribe((habitState) => {
          this.habit = habitState;
          this.setEditHabit();
        });
    } else {
      this.getHabitTags();
    }
  }

  private getUserId() {
    this.userId = this.localStorageService.getUserId();
  }

  private initForm(): void {
    this.habitForm = this.fb.group({
      title: new FormControl('', [Validators.required, Validators.maxLength(70)]),
      description: new FormControl('', [Validators.required, Validators.minLength(20), Validators.maxLength(63206)]),
      complexity: new FormControl(1, [Validators.required, Validators.max(3)]),
      duration: new FormControl(null, [Validators.required, Validators.min(7), Validators.max(56)]),
      tagIds: new FormControl([], Validators.required),
      image: new FormControl(''),
      shopList: new FormControl([])
    });
  }

  private setEditHabit(): void {
    this.habitForm.addControl('id', new FormControl(null));
    this.habitForm.patchValue({
      title: this.habit.habitTranslation.name,
      description: this.habit.habitTranslation.description,
      complexity: this.habit.complexity,
      duration: this.habit.defaultDuration,
      tagIds: this.habit.tags,
      image: this.habit.image,
      shopList: this.habit.customShoppingListItems
    });
    this.getHabitTags();
    this.habitId = this.habit.id;
    if (this.habit.customShoppingListItems.length) {
      this.shopList = [...this.habit.customShoppingListItems];
    } else {
      this.shopList = [...this.habit.customShoppingListItems, ...this.habit.shoppingListItems];
    }
    this.shopList = this.shopList.map((el) => ({ ...el, selected: el.status === TodoStatus.inprogress }));
    this.initialDuration = this.habit.defaultDuration;
  }

  public trimValue(control: AbstractControl): void {
    control.setValue(control.value.trim());
  }

  getControl(control: string): AbstractControl {
    return this.habitForm.get(control);
  }

  public setComplexity(i: number): void {
    this.habitForm.patchValue({ complexity: i + 1 });
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe((lang) => {
      this.translate.setDefaultLang(lang);
      this.currentLang = lang;
    });
  }

  getStars(value: number, complexity: number): string {
    return value <= complexity ? this.greenStar : this.lineStar;
  }

  getDuration(newDuration: number): void {
    this.getControl('duration').setValue(newDuration);
  }

  getShopList(list: ShoppingList[]): void {
    this.newList = list.map((item) => {
      return {
        id: item.id,
        status: item.status,
        text: item.text
      };
    });
    this.getControl('shopList').setValue(this.newList);
  }

  getTagsList(list: TagInterface[]): void {
    this.selectedTagsList = list.map((el) => el.id);
    this.getControl('tagIds').setValue(this.selectedTagsList);
  }

  getFile(image: FileHandle[]): void {
    this.getControl('image').setValue(image[0].file);
  }

  goToAllHabits(): void {
    this.userFriendsService.addedFriends.length = 0;
    this.router.navigate([`/profile/${this.userId}/allhabits`]);
  }

  private getHabitTags(): void {
    this.habitService
      .getAllTags()
      .pipe(take(1))
      .subscribe((tags: TagInterface[]) => {
        this.tagsList = tags;
        this.tagsList.forEach((tag) => (tag.isActive = this.habitForm.value.tagIds.some((el) => el === tag.name || el === tag.nameUa)));
        if (this.isEditing) {
          const newList = this.tagsList.filter((el) => {
            return this.habitForm.value.tagIds.includes(el.name) || this.habitForm.value.tagIds.includes(el.nameUa);
          });
          this.getTagsList(newList);
        }
      });
  }

  addHabit(): void {
    this.habitService
      .addCustomHabit(this.habitForm.value, this.currentLang)
      .pipe(take(1))
      .subscribe(() => {
        this.goToAllHabits();
      });
  }

  saveHabit(): void {
    this.habitService
      .changeCustomHabit(this.habitForm.value, this.currentLang, this.habitId)
      .pipe(take(1))
      .subscribe(() => {
        this.goToAllHabits();
      });
  }
}
