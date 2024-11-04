import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { Router } from '@angular/router';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { HabitService } from '@global-service/habit/habit.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ProfileService } from '@global-user/components/profile/profile-service/profile.service';
import { TagInterface } from '@shared/components/tag-filter/tag-filter.model';
import { FilterOptions, FilterSelect } from 'src/app/main/interface/filter-select.interface';
import { singleNewsImages } from 'src/app/main/image-pathes/single-news-images';
import { HabitsFiltersList } from '../models/habits-filters-list';
import { HabitAssignInterface } from '@global-user/components/habit/models/interfaces/habit-assign.interface';
import { HabitInterface, HabitListInterface } from '../models/interfaces/habit.interface';
import { HttpParams } from '@angular/common/http';
import { SelectedFilters } from './all-habits.model';

@Component({
  selector: 'app-all-habits',
  templateUrl: './all-habits.component.html',
  styleUrls: ['./all-habits.component.scss']
})
export class AllHabitsComponent implements OnInit, OnDestroy {
  habitsList: HabitInterface[] = [];
  totalHabits = 0;
  galleryView = true;
  isFetching = true;
  tagList: TagInterface[] = [];
  activeFilters: SelectedFilters = {};
  filtersList: FilterSelect[] = HabitsFiltersList;
  windowSize: number;
  private currentPage = 0;
  private pageSize = 6;
  private isAllPages: boolean;
  private totalPages: number;
  private destroyed$: Subject<boolean> = new Subject<boolean>();

  private lang: string;
  images = singleNewsImages;

  cleanFilters: Subject<void> = new Subject<void>();

  constructor(
    private habitService: HabitService,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    public profileService: ProfileService,
    public habitAssignService: HabitAssignService,
    public router: Router
  ) {}

  ngOnInit() {
    this.onResize();
    this.checkHabitsView();
    this.getAllHabits(0, this.pageSize);

    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe((lang) => {
      this.translate.setDefaultLang(lang);
      this.lang = lang;
      this.getAllHabitsTags();
    });
  }

  private getAllHabitsTags(): void {
    this.habitService
      .getAllTags()
      .pipe(take(1))
      .subscribe((tagsArray: Array<TagInterface>) => {
        this.tagList = tagsArray;
        const options = [];
        this.tagList.forEach((tag: TagInterface) => {
          const item = {
            name: tag.name,
            nameUa: tag.nameUa,
            value: tag.name,
            isActive: false
          };
          options.push(item);
          this.filtersList[0].options = options;
        });
      });
  }

  checkHabitsView(): void {
    const galleryView = this.localStorageService.getHabitsGalleryView();
    this.galleryView = galleryView ?? this.galleryView;
  }

  private getAllHabits(page: number, size: number): void {
    this.habitService
      .getAllHabits(page, size)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.setHabitsList(page, res);
      });
  }

  private getHabitsByFilters(page: number, size: number, filters: SelectedFilters): void {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('lang', this.lang).set('sort', 'asc');

    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (Array.isArray(value)) {
        value.forEach((item) => {
          params = params.append(key, item);
        });
      } else if (value) {
        params = params.set(key, value.toString());
      }
    });

    this.habitService
      .getHabitsByFilters(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.setHabitsList(page, res);
      });
  }

  private setHabitsList(page: number, res: HabitListInterface): void {
    this.isFetching = false;
    this.habitsList = page ? [...this.habitsList, ...res.page] : res.page;
    this.totalHabits = res.totalElements;
    this.totalPages = res.totalPages;
    this.currentPage = res.currentPage;
    page += 1;
    this.isAllPages = this.totalPages === page;
    if (this.totalHabits) {
      this.checkIfAssigned();
    }
  }

  onDisplayModeChange(mode: boolean): void {
    this.galleryView = mode;
    this.localStorageService.setHabitsGalleryView(mode);
  }

  setFilters(filterChange: FilterSelect): void {
    this.activeFilters = {};

    const selectedInd = this.filtersList.findIndex((filt: FilterSelect) => filt.name === filterChange.name);
    if (selectedInd >= 0) {
      this.filtersList[selectedInd] = filterChange;
      const filtersActive = this.filtersList.filter((item: FilterSelect) => !item.isAllSelected);
      filtersActive.forEach((el: FilterSelect) => {
        const activeOptions = el.options.filter((option: FilterOptions) => option.isActive);

        if (Array.isArray(activeOptions) && activeOptions.length) {
          Object.assign(this.activeFilters, { [el.name]: activeOptions.map((option) => option.value) });
        }
      });

      filtersActive.length && Object.keys(this.activeFilters).length
        ? this.getHabitsByFilters(0, this.pageSize, this.activeFilters)
        : this.getAllHabits(0, this.pageSize);
    }
  }

  resetFilters(): void {
    this.filtersList.forEach((filter: FilterSelect) => {
      filter.isAllSelected = false;
      filter.options.forEach((option: FilterOptions) => (option.isActive = false));
    });
    this.getAllHabits(0, this.pageSize);
    this.cleanFilters.next();
  }

  onResize(): void {
    this.windowSize = window.innerWidth;
    this.galleryView = this.windowSize >= 576 ? this.galleryView : true;
  }

  onScroll(): void {
    this.isFetching = false;
    if (!this.isAllPages) {
      this.isFetching = true;
      this.currentPage += 1;
      Object.keys(this.activeFilters).length
        ? this.getHabitsByFilters(this.currentPage, this.pageSize, this.activeFilters)
        : this.getAllHabits(this.currentPage, this.pageSize);
    }
  }

  checkIfAssigned(): void {
    this.habitAssignService
      .getAssignedHabits()
      .pipe(take(1))
      .subscribe((response: Array<HabitAssignInterface>) => {
        response.forEach((assigned) => {
          this.habitsList.forEach((filtered) => {
            if (assigned.habit.id === filtered.id && assigned.status === 'INPROGRESS') {
              filtered.isAssigned = true;
              filtered.assignId = assigned.id;
            }
          });
        });
      });
  }

  goToCreateHabit(): void {
    const userId = localStorage.getItem('userId');
    this.router.navigate([`profile/${userId}/create-habit`]);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
