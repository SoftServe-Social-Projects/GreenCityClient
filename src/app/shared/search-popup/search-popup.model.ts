import { EventsSearchModel } from '@global-models/search/eventsSearch.model';
import { NewsSearchModel } from '@global-models/search/newsSearch.model';
import { PlacesSearchModel } from '@global-models/search/placesSearch.model';
import { SearchDataModel } from '@global-models/search/search.model';

export interface PopupSearchResults {
  news: SearchDataModel<NewsSearchModel>;
  events: SearchDataModel<EventsSearchModel>;
  places: SearchDataModel<PlacesSearchModel>;
}
