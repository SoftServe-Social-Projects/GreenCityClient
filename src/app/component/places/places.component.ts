import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild, DoCheck } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { HttpClient } from '@angular/common/http';
import { MatDrawer } from '@angular/material';
import { AgmMarker } from '@agm/core';

import {markers} from './Data.js'
import {cards} from './Data.js'

@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.scss']
})
export class PlacesComponent implements OnInit, DoCheck {
  public lat = 49.84579567734425;
  public lng = 24.025124653312258;
  public zoom = 13;
  public cardsCollection: Array<object>;
  public tagList: Array<string> = [];
  public contentObj: any;
  public favoritePlaces: Array<number> = [];
  public stars: Array<string> = ['', '', '', '', ''];
  public markerList: Array<any> = [];
  public markerListCopy: Array<any> = [];
  public searchName = '';

  public redIcon = 'assets/img/places/red-marker.png';
  public greenIcon = 'assets/img/places/green-marker.png';
  public bookmark = 'assets/img/places/bookmark-default.svg';
  public bookmarkSaved = 'assets/img/places/bookmark-set.svg';
  public star = 'assets/img/places/star-1.png';
  public starHalf = 'assets/img/places/star-filled-half.png';
  public starUnfilled = 'assets/img/places/star-2.png';

  public apiKey = 'AIzaSyB3xs7Kczo46LFcQRFKPMdrE0lU4qsR_S4';

  @ViewChild('drawer', { static: false }) drawer: MatDrawer;

  constructor(private localStorageService: LocalStorageService, private translate: TranslateService, private http: HttpClient) {}

  ngOnInit() {
    this.tagList = ['Shops', 'Restaurants', 'Recycling points', 'Events', 'Saved places'];

    this.contentObj = {
      cardName: '',
      cardAddress: '',
      cardText: '',
      cardImgUrl: '',
      cardRating: 0,
      cardStars: []
    };

    this.cardsCollection = cards;
    this.markerList = markers;

    this.markerListCopy = this.markerList.slice();

    this.bindLang(this.localStorageService.getCurrentLanguage());
  }

  ngDoCheck(): void {
    this.startSearch();
  }

  public getFilterData(tags: Array<string>): void {
    if (tags.filter((item) => item === 'Saved places') && tags.length > 0) {
      this.markerListCopy = this.markerList.filter((item) => {
        return this.favoritePlaces.includes(item.card.id);
      });
    } else if (this.markerListCopy.length === 0) {
      this.markerListCopy = this.markerList.slice();
    }

    this.tagList = ['Shops', 'Restaurants', 'Recycling points', 'Events', 'Saved places'];
  }

  private bindLang(lang: string): void {
    this.translate.setDefaultLang(lang);
  }

  public getMarker(marker: AgmMarker): void {
    this.markerList.forEach((item) => {
      item.iconUrl = this.redIcon;
    });
    const clickedMarker = this.markerList.indexOf(
      this.markerList.filter((item) => {
        return item.lat === marker.latitude;
      })[0]
    );

    this.markerList[clickedMarker].iconUrl = this.greenIcon;
    this.contentObj = this.markerList[clickedMarker].card;
    this.contentObj.cardStars = this.getStars(this.contentObj.cardRating);
    this.drawer.toggle();
  }

  public moveToFavorite(event): void {
    if (!event.toElement.src.includes(this.bookmarkSaved)) {
      event.toElement.src = this.bookmarkSaved;
      this.favoritePlaces.push(+event.toElement.parentNode.parentNode.id);
    } else {
      const indexToDelete = this.favoritePlaces.indexOf(event.toElement.parentNode.parentNode.id);
      event.toElement.src = this.bookmark;
      this.favoritePlaces.splice(indexToDelete, 1);
    }
  }

  public startSearch(): void {
    const searchParams = this.searchName.toLowerCase();
    this.markerListCopy = this.markerList.filter((item) => {
      return item.card.cardName.toLowerCase().includes(searchParams);
    });
  }

  private getStars(rating: number): Array<string> {

    const maxRating = 5;
    const halfOfStar = 0.5;

    if (rating > maxRating) {
      rating = maxRating;
    }

    let counter = 1;

    if (rating < halfOfStar) {
      this.stars.fill(this.starUnfilled);
      return this.stars;
    }

    if (rating >= halfOfStar && rating < 1) {
      this.stars.fill(this.starUnfilled);
      this.stars[0] = this.starHalf;
      return this.stars;
    }

    if (counter <= rating) {
      this.stars.fill(this.starUnfilled);

      while (counter <= rating) {
        this.stars[counter - 1] = this.star;
        counter++;
      }

      const checkHalf = counter - 1 + halfOfStar;

      if (checkHalf <= rating) {
        this.stars[counter - 1] = this.starHalf;
      }

      return this.stars;
    }
  }
}
