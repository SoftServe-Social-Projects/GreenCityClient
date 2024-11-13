import { catchError, takeUntil } from 'rxjs/operators';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { of, Subject } from 'rxjs';
import { Patterns } from 'src/assets/patterns/patterns';
import { ToDoListService } from '@global-user/components/habit/add-new-habit/habit-edit-to-do-list/to-do-list.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Subscription } from 'stompjs';
import { AllToDoLists, ToDoList } from '@global-user/models/to-do-list.interface';
import { TodoStatus } from '@global-user/components/habit/models/todo-status.enum';

@Component({
  selector: 'app-to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.scss']
})
export class ToDoListComponent implements OnInit {
  toDoList: ToDoList[] = [];
  toggle: boolean;
  private userId: number;
  currentLang: string;
  profileSubscription: Subscription;
  private toDoListCache: AllToDoLists[] | null = null;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private localStorageService: LocalStorageService,
    private toDoListService: ToDoListService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = this.localStorageService.getUserId();
    this.subscribeToLangChange();
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageBehaviourSubject.subscribe((lang: string) => {
      this.currentLang = lang;
      if (this.localStorageService.getUserId()) {
        this.getAllToDoLists();
      }
    });
  }

  private getAllToDoLists(): void {
    if (this.toDoListCache) {
      this.updateAllToDoList(this.toDoListCache);
      return;
    }

    this.toDoListService
      .getUserToDoLists(this.currentLang)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([]))
      )
      .subscribe((list) => {
        this.toDoListCache = list;
        this.updateAllToDoList(list);
      });
  }

  private updateAllToDoList(list: AllToDoLists[]): void {
    const customToDoList = this.convertToDoList(list, 'custom');
    const standardToDoList = this.convertToDoList(list, 'standard');
    customToDoList.forEach((el) => (el.custom = true));
    this.toDoList = [...customToDoList, ...standardToDoList];
  }

  convertToDoList(list: AllToDoLists[], type: string): ToDoList[] {
    return list.reduce((acc, obj) => acc.concat(type === 'custom' ? obj.customToDoListItemDto : obj.userToDoListItemDto), []);
  }

  isValidURL(url: string): boolean {
    return Patterns.isValidURL.test(url);
  }

  openCloseList(): void {
    this.toggle = !this.toggle;
  }

  toggleDone(item: ToDoList): void {
    item.status = item.status === TodoStatus.inprogress ? TodoStatus.done : TodoStatus.inprogress;
    item.custom ? this.updateStatusCustomItem(item) : this.updateStatusItem(item);
  }

  private updateStatusItem(item: ToDoList): void {
    this.toDoListService
      .updateStandardToDoItemStatus(item, this.currentLang)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateToDoList(item);
      });
  }

  private updateStatusCustomItem(item: ToDoList): void {
    this.toDoListService
      .updateCustomToDoItemStatus(this.userId, item)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateToDoList(item);
      });
  }

  private updateToDoList(item: ToDoList): void {
    this.toDoList = this.toDoList.map((el) => (el.id === item.id ? { ...el, status: item.status } : el));
    this.cdr.detectChanges();
  }
}
