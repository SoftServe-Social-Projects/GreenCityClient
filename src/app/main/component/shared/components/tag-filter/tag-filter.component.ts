import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FilterModel } from '@eco-news-models/filter.model';
import { NewsTagInterface } from '@eco-news-models/eco-news-model';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Component({
  selector: 'app-tag-filter',
  templateUrl: './tag-filter.component.html',
  styleUrls: ['./tag-filter.component.scss']
})
export class TagFilterComponent implements OnInit, OnChanges {
  public filters: Array<FilterModel> = [];
  @Input() private storageKey: string;
  @Input() public tagsListData = [];
  @Input() public header: string;
  @Output() tagsList = new EventEmitter<Array<string>>();
  constructor(public localStorageService: LocalStorageService) {}
  ngOnInit() {
    this.emitActiveFilters();
    sessionStorage.removeItem(this.storageKey);
  }

  ngOnChanges(changes) {
    if (changes.tagsListData?.currentValue) {
      this.setTags(changes.tagsListData.currentValue);
    }
  }

  public emitTrueFilterValues(): Array<string> {
    return this.filters
      .filter((active) => active.isActive)
      .map((filter) => {
        return this.localStorageService.getCurrentLanguage() === 'en' ? filter.name : filter.nameUa;
      });
  }

  public emitActiveFilters(): void {
    this.tagsList.emit(this.emitTrueFilterValues());
  }

  public toggleFilter(currentFilter: string): void {
    this.filters.forEach((el) => (el.isActive = el.name === currentFilter ? !el.isActive : el.isActive));
    this.emitActiveFilters();
    this.setSessionStorageFilters();
  }

  private setTags(tags: Array<NewsTagInterface>): void {
    const savedFilters = this.getSessionStorageFilters();
    if (!sessionStorage.getItem(this.storageKey)) {
      this.filters = tags.map((tag: NewsTagInterface) =>
        tag.name === savedFilters || tag.nameUa === savedFilters
          ? { name: tag.name, nameUa: tag.nameUa, isActive: true }
          : { name: tag.name, nameUa: tag.nameUa, isActive: false }
      );
    }
    this.emitActiveFilters();
  }

  private setSessionStorageFilters() {
    sessionStorage.setItem(this.storageKey, JSON.stringify(this.filters));
  }

  private getSessionStorageFilters() {
    const filters = sessionStorage.getItem(this.storageKey);
    return filters !== null ? JSON.parse(filters) : [];
  }
}
