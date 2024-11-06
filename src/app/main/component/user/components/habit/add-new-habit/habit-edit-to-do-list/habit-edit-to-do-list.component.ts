import { Component, EventEmitter, OnDestroy, OnInit, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { ToDoList } from '../../../../models/to-do-list.interface';
import { TodoStatus } from '../../models/todo-status.enum';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { FIELD_SYMBOLS_LIMIT, HABIT_TO_DO_LIST_CHECK, TO_DO_ITEM_NAME_LIMIT } from '../../const/data.const';
import { MatDialog } from '@angular/material/dialog';
import { WarningPopUpComponent } from '@shared/components';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-habit-edit-to-do-list',
  templateUrl: './habit-edit-to-do-list.component.html',
  styleUrls: ['./habit-edit-to-do-list.component.scss'],
  providers: [MatSnackBarComponent]
})
export class HabitEditToDoListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() toDoList: ToDoList[] = [];
  @Input() isAcquired = false;

  private fieldSymbolsLimit = FIELD_SYMBOLS_LIMIT;
  itemForm = new FormGroup({
    item: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(this.fieldSymbolsLimit)])
  });
  subscription: Subscription;
  userId: number;
  private destroySub: Subject<boolean> = new Subject<boolean>();
  private langChangeSub: Subscription;
  toDoItemNameLimit = TO_DO_ITEM_NAME_LIMIT;
  todoStatus = TodoStatus;
  isEditMode = false;
  private toDoListBeforeEditing: ToDoList[] = [];
  isListChanged: boolean;
  private confirmDialogConfig = {
    hasBackdrop: true,
    closeOnNavigation: true,
    disableClose: true,
    panelClass: 'popup-dialog-container',
    data: {
      popupTitle: ``,
      popupConfirm: `user.habit.to-do.confirm`,
      popupCancel: `user.habit.to-do.cancel`
    }
  };
  private deleteItemTitle = `user.habit.to-do.item-delete-pop-up-title`;
  private cancelEditingTitle = `user.habit.to-do.cancel-pop-up-title`;

  img = HABIT_TO_DO_LIST_CHECK;

  @Output() newList = new EventEmitter<ToDoList[]>();

  constructor(
    private snackBar: MatSnackBarComponent,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.subscribeToLangChange();
    this.userId = this.localStorageService.getUserId();
    this.newList.emit(this.toDoList);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.toDoList) {
      this.toDoList.forEach((el) => (el.selected = el.status === TodoStatus.inprogress || el.status === TodoStatus.done));
      this.placeItemInOrder();
    }
  }

  get item(): AbstractControl {
    return this.itemForm.get('item');
  }

  private bindLang(lang: string): void {
    this.translate.setDefaultLang(lang);
  }

  private subscribeToLangChange(): void {
    this.langChangeSub = this.localStorageService.languageSubject.subscribe((lang) => {
      this.bindLang(lang);
    });
  }

  getCheckIcon(item: ToDoList): string {
    if (this.isAcquired) {
      return this.img.disableCheck;
    }
    if (item.status === TodoStatus.done) {
      return this.img.doneCheck;
    }
    return item.selected ? this.img.minusCheck : this.img.plusCheck;
  }

  addItem(value: string): void {
    this.isListChanged = true;
    const newItem = {
      id: null,
      status: TodoStatus.inprogress,
      text: value.trim(),
      custom: true,
      selected: true
    };
    if (newItem.text) {
      this.toDoList = [newItem, ...this.toDoList];
    }
    this.item.setValue('');
    this.placeItemInOrder();
    this.newList.emit(this.toDoList);
  }

  selectItem(item: ToDoList): void {
    this.isListChanged = true;
    this.toDoList.forEach((element) => {
      if (element.text === item.text) {
        element.selected = !item.selected;
        element.status = item.selected ? TodoStatus.inprogress : TodoStatus.active;
      }
    });
    if (item.selected) {
      const index = this.toDoList.indexOf(item);
      this.toDoList.splice(index, 1);
      this.toDoList = [item, ...this.toDoList];
    }
    this.placeItemInOrder();
    this.newList.emit(this.toDoList);
  }

  private placeItemInOrder(): void {
    const statusOrder = { DONE: 1, INPROGRESS: 2, ACTIVE: 3 };
    this.toDoList.sort((a, b) => {
      const statusDifference = statusOrder[a.status] - statusOrder[b.status];
      const orderCustom = a.custom && !b.custom ? -1 : 1;
      return statusDifference || orderCustom;
    });
  }

  deleteItem(text: string): void {
    this.isListChanged = true;
    this.confirmDialogConfig.data.popupTitle = this.deleteItemTitle;
    this.dialog
      .open(WarningPopUpComponent, this.confirmDialogConfig)
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirm) => {
        if (confirm) {
          this.toDoList = this.toDoList.filter((elem) => elem.text !== text);
          this.newList.emit(this.toDoList);
        }
      });
  }

  checkItemValidity(): void {
    if (!this.itemForm.valid && this.itemForm.get('item').value.length > this.fieldSymbolsLimit) {
      this.snackBar.openSnackBar('tooLongInput');
    }
  }

  changeEditMode(): void {
    if (!this.isEditMode) {
      this.isListChanged = false;
      this.toDoListBeforeEditing = [];
      this.toDoList.forEach((el) => this.toDoListBeforeEditing.push({ ...el }));
    }
    this.isEditMode = !this.isEditMode;
  }

  private isListItemsChanged(): boolean {
    const isItemsChanged = !this.toDoList.every((el) => {
      const itemBeforeEditing = this.toDoListBeforeEditing.find((item) => item.id === el.id);
      return itemBeforeEditing && Object.keys(el).every((key) => el[key] === itemBeforeEditing[key]);
    });
    const isLengthChanged = this.toDoList.length !== this.toDoListBeforeEditing.length;
    return isItemsChanged || isLengthChanged;
  }

  cancelEditing(): void {
    if (this.isListItemsChanged()) {
      this.confirmDialogConfig.data.popupTitle = this.cancelEditingTitle;
      this.dialog
        .open(WarningPopUpComponent, this.confirmDialogConfig)
        .afterClosed()
        .pipe(take(1))
        .subscribe((confirm) => {
          if (confirm) {
            this.toDoList = [];
            this.toDoListBeforeEditing.forEach((el) => {
              this.toDoList.push(el);
            });
            this.newList.emit(this.toDoList);
            this.isEditMode = false;
          }
        });
    } else {
      this.isEditMode = false;
    }
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
    this.destroySub.next(true);
    this.destroySub.complete();
  }
}
