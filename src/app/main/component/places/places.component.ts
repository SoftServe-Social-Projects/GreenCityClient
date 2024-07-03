import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { MatDrawer } from '@angular/material/sidenav';
import { PlaceService } from '@global-service/place/place.service';
import { greenIcon, notification, redIcon, searchIcon, share, star, starHalf, starUnfilled } from '../../image-pathes/places-icons';
import { AllAboutPlace, Place } from './models/place';
import { FilterPlaceService } from '@global-service/filtering/filter-place.service';
import { debounceTime, take } from 'rxjs/operators';
import { MapBoundsDto } from './models/map-bounds-dto';
import { MoreOptionsFormValue } from './models/more-options-filter.model';
import { FavoritePlaceService } from '@global-service/favorite-place/favorite-place.service';
import { combineLatest, Subscription } from 'rxjs';
import { initialMoreOptionsFormValue } from './components/more-options-filter/more-options-filter.constant';
import { MatDialog } from '@angular/material/dialog';
import { AddPlaceComponent } from './components/add-place/add-place.component';
import { UserOwnAuthService } from '@global-service/auth/user-own-auth.service';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { FilterModel } from '@shared/components/tag-filter/tag-filter.model';
import { tagsListPlacesData } from './models/places-consts';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.scss']
})
export class PlacesComponent implements OnInit, OnDestroy {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  position: any = {};
  zoom = 13;
  tagList: FilterModel[] = tagsListPlacesData;
  searchName = '';
  moreOptionsFilters: MoreOptionsFormValue;
  searchIcon = searchIcon;
  notification = notification;
  share = share;
  basicFilters: string[];
  mapBoundsDto: MapBoundsDto;
  places: Place[] = [];
  readonly redIconUrl: string = redIcon;
  readonly greenIconUrl: string = greenIcon;
  activePlace: Place;
  activePlaceDetails: google.maps.places.PlaceResult;
  favoritePlaces: Place[] = [];
  isActivePlaceFavorite = false;
  readonly tagFilterStorageKey = 'placesTagFilter';
  readonly moreOptionsStorageKey = 'moreOptionsFilter';
  placesList: Array<AllAboutPlace>;
  mapOptions: google.maps.MapOptions = {
    center: { lat: 50.450001, lng: 30.523333 },
    zoom: 8,
    gestureHandling: 'greedy',
    minZoom: 4,
    maxZoom: 20
  };
  @ViewChild('drawer') drawer: MatDrawer;
  userId: number;
  loaded = false;
  // }
  protected readonly event = event;
  private googlePlacesService: google.maps.places.PlacesService;
  private langChangeSub: Subscription;
  private page = 0;
  private totalPages: number;
  private size = 6;

  constructor(
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private placeService: PlaceService,
    private filterPlaceService: FilterPlaceService,
    private favoritePlaceService: FavoritePlaceService,
    private dialog: MatDialog,
    private userOwnAuthService: UserOwnAuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const loader = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (google && google.maps && google.maps.Map) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });

    loader.then(() => {
      this.loaded = true;
    });
    this.checkUserSingIn();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.getPlaceList();
    if (!this.userId) {
      this.tagList = this.tagList.filter((item) => item.name !== 'Saved places');
    }
    this.filterPlaceService.filtersDto$.pipe(debounceTime(300)).subscribe((filtersDto: any) => {
      this.placeService.updatePlaces(filtersDto);
    });

    this.getMoreOptionsValueFromSessionStorage();

    combineLatest([
      this.placeService.places$,
      this.filterPlaceService.isFavoriteFilter$,
      this.favoritePlaceService.favoritePlaces$
    ]).subscribe(([places, isFavoriteFilter, favoritePlaces]: [Place[], boolean, Place[]]) => {
      this.favoritePlaces = favoritePlaces;
      this.updateIsActivePlaceFavorite();

      if (isFavoriteFilter) {
        this.places = places.filter((place: Place) =>
          this.favoritePlaces.some((favoritePlace: Place) => favoritePlace.location.id === place.location.id)
        );
      } else {
        this.places = places;
      }
    });

    // eslint-disable-next-line no-extra-boolean-cast
    if (!!this.userId) {
      this.favoritePlaceService.updateFavoritePlaces(false);
    }

    this.bindLang(this.localStorageService.getCurrentLanguage());
    this.subscribeToLangChange();
  }

  mapCenterChange(newValue: any): void {
    this.position = {
      latitude: newValue.lat,
      longitude: newValue.lng
    };
  }

  mapBoundsChange(newValue: any): void {
    this.mapBoundsDto = {
      northEastLat: newValue.getNorthEast().lat(),
      northEastLng: newValue.getNorthEast().lng(),
      southWestLat: newValue.getSouthWest().lat(),
      southWestLng: newValue.getSouthWest().lng()
    };
  }

  moreOptionsChange(newValue: MoreOptionsFormValue): void {
    this.moreOptionsFilters = newValue;
    this.setMoreOptionsValueToSessionStorage(this.moreOptionsFilters);
    this.updateFilters();
  }

  basicFiltersChange(newValue: string[]) {
    this.basicFilters = newValue;
    this.updateFilters();
  }

  searchNameChange(newValue: string): void {
    this.searchName = newValue;
    this.updateFilters();
  }

  updateFilters(): void {
    this.filterPlaceService.updateFiltersDto({
      searchName: this.searchName,
      moreOptionsFilters: this.moreOptionsFilters,
      basicFilters: this.basicFilters,
      mapBoundsDto: this.mapBoundsDto,
      position: this.position
    });
  }

  toggleFavoriteFromSideBar(place) {
    if (!this.userId) {
      this.dialog
        .open(AuthModalComponent, {
          hasBackdrop: true,
          closeOnNavigation: true,
          panelClass: ['custom-dialog-container'],
          data: {
            popUpName: 'sign-in'
          }
        })
        .afterClosed()
        .subscribe((data) => {
          this.userId = data;
          // eslint-disable-next-line no-extra-boolean-cast
          if (!!data) {
            this.toggleFavoriteFromSideBar(place);
          }
        });
    } else {
      if (place.isFavorite) {
        this.favoritePlaceService.deleteFavoritePlace(place.id, true);
      } else {
        this.favoritePlaceService.addFavoritePlace({ placeId: place.id, name: place.name }, true);
      }
      place.isFavorite = !place.isFavorite;
    }
  }

  updatePlaceList(isAfterClose: boolean): void {
    if (isAfterClose) {
      this.page = 0;
    } else if (this.totalPages === this.page) {
      return;
    }
    this.getPlaceList();
  }

  toggleFavorite(): void {
    if (this.isActivePlaceFavorite) {
      this.favoritePlaceService.deleteFavoritePlace(this.activePlace.id);
    } else {
      this.favoritePlaceService.addFavoritePlace({ placeId: this.activePlace.id, name: this.activePlace.name });
    }
  }

  selectPlace(place: Place): void {
    console.log(place);
    this.activePlace = place;
    this.updateIsActivePlaceFavorite();
    this.getPlaceInfoFromGoogleApi(place);
  }

  selectPlaceFromSideBar(place: AllAboutPlace) {
    const sendingPlace = {
      id: place.id,
      name: place.name,
      location: place.location
    };
    this.selectPlace(sendingPlace);
  }

  getStars(rating: number): Array<string> {
    const stars = [];
    const maxRating = 5;
    const validRating = Math.min(rating, maxRating);
    for (let i = 0; i <= validRating - 1; i++) {
      stars.push(star);
    }
    if (Math.trunc(validRating) < validRating) {
      stars.push(starHalf);
    }
    for (let i = stars.length; i < maxRating; i++) {
      stars.push(starUnfilled);
    }
    return stars;
  }

  onLocationSelected(event: Event | Location) {
    return;
  }

  mapInitialized(map: google.maps.Map) {
    this.googlePlacesService = new google.maps.places.PlacesService(map);
  }

  openTimePickerPopUp() {
    this.dialog
      .open(AddPlaceComponent, {
        hasBackdrop: true,
        closeOnNavigation: true,
        disableClose: true,
        panelClass: 'add-place-wrapper-class'
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((value) => {
        console.log(value);
        if (value) {
          this.placeService.createPlace(value).subscribe((resp: any) => {
            this.onLocationSelected(location);
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  private checkUserSingIn(): void {
    this.userOwnAuthService.credentialDataSubject.subscribe((data) => {
      this.userId = data.userId;
    });
  }

  private getPlaceList(): void {
    this.placeService.getAllPlaces(this.page, this.size).subscribe((item: any) => {
      this.placesList = item.page;
      if (this.placesList) {
        this.drawer.toggle(true);
      } else {
        this.drawer.toggle(false);
      }
      this.totalPages = item.totalPages;
      this.page += 1;
    });
  }

  private bindLang(lang: string): void {
    this.translate.setDefaultLang(lang);
  }

  private subscribeToLangChange(): void {
    this.langChangeSub = this.localStorageService.languageSubject.subscribe(this.bindLang.bind(this));
  }

  private getPlaceInfoFromGoogleApi(place: Place) {
    const findByQueryRequest: google.maps.places.FindPlaceFromQueryRequest = {
      query: place.name,
      locationBias: {
        lat: place.location.lat,
        lng: place.location.lng
      },
      fields: ['ALL']
    };
    this.googlePlacesService.findPlaceFromQuery(findByQueryRequest, (places: google.maps.places.PlaceResult[]) => {
      console.log(places);
      const detailsRequest: google.maps.places.PlaceDetailsRequest = {
        placeId: places[0].place_id,
        fields: ['ALL']
      };
      this.googlePlacesService.getDetails(detailsRequest, (placeDetails: google.maps.places.PlaceResult) => {
        console.log(placeDetails);
        this.activePlaceDetails = placeDetails;
        this.drawer.toggle(true);
      });
    });
  }

  private setMoreOptionsValueToSessionStorage(formValue: MoreOptionsFormValue): void {
    sessionStorage.setItem(this.moreOptionsStorageKey, JSON.stringify(formValue));
  }

  private getMoreOptionsValueFromSessionStorage(): void {
    const formValue: MoreOptionsFormValue = JSON.parse(sessionStorage.getItem(this.moreOptionsStorageKey));
    this.moreOptionsFilters = formValue ?? initialMoreOptionsFormValue;
  }

  // private setUserLocation(): void {
  //   navigator.geolocation.getCurrentPosition(
  //     (position: any) => {
  //       this.map.setCenter({
  //         lat: position.coords.latitude,
  //         lng: position.coords.longitude
  //       });
  //     },
  //     () => {
  //       this.map.setCenter({
  //         lat: 49.84579567734425,
  //         lng: 24.025124653312258
  //       });
  //     }
  //   );

  private updateIsActivePlaceFavorite(): void {
    this.isActivePlaceFavorite = this.favoritePlaces.some(
      (favoritePlace: Place) => favoritePlace.location.id === this.activePlace?.location.id
    );
  }
}
