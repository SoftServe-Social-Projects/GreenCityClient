import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ecoNewsIcons } from 'src/app/image-pathes/profile-icons';
import { NewsSearchModel } from '@global-models/search/newsSearch.model';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss'],
})


export class SearchItemComponent {
  @Input() searchModel: NewsSearchModel;
  @Output() closeSearch: EventEmitter<boolean> = new EventEmitter();
  profileIcons = ecoNewsIcons;

  public emitCloseSearch(): void {
    this.closeSearch.emit();
  }


}
