import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventsListComponent } from './events-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { UserOwnAuthService } from '@global-service/auth/user-own-auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FilterItem } from '../../models/events.interface';
import { LangValueDirective } from 'src/app/shared/directives/lang-value/lang-value.directive';
import { MatSelect } from '@angular/material/select';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';
import { addressesMock, eventStateMock, testCases } from '@assets/mocks/events/mock-events';

describe('EventsListComponent', () => {
  let component: EventsListComponent;
  let fixture: ComponentFixture<EventsListComponent>;

  const createMockMatSelect = (options: { value: string }[]): MatSelect => {
    return {
      options: options.map((opt) => jasmine.createSpyObj('MatOption', ['deselect'], { value: opt.value }))
    } as unknown as MatSelect;
  };

  const UserOwnAuthServiceMock = jasmine.createSpyObj('UserOwnAuthService', ['getDataFromLocalStorage', 'credentialDataSubject']);
  UserOwnAuthServiceMock.credentialDataSubject = of({ userId: 3 });

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  storeMock.select = () => of(eventStateMock);

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue']);
  languageServiceMock.getLangValue = (valUa: string, valEn: string) => {
    of(valEn);
  };
  const matDialogService: jasmine.SpyObj<MatDialog> = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EventsListComponent, LangValueDirective],
      imports: [TranslateModule.forRoot(), NgxPaginationModule, HttpClientTestingModule, RouterTestingModule, MatDialogModule],
      providers: [
        { provide: UserOwnAuthService, useValue: UserOwnAuthServiceMock },
        { provide: Store, useValue: storeMock },
        { provide: MatDialog, useValue: matDialogService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close search toggle when it opened', () => {
    component.searchToggle = true;
    component.search();
    expect(component.searchToggle).toEqual(false);
  });

  it('should hide search input if it is empty', () => {
    component.searchToggle = true;
    component.searchEventControl.setValue('');
    component.cancelSearch();
    expect(component.searchToggle).toEqual(false);
  });

  it('should remove the value of search input if it contains text', () => {
    component.searchEventControl.setValue('Some test text');
    component.searchToggle = true;
    component.cancelSearch();
    expect(component.searchEventControl.value).toEqual('');
    expect(component.searchToggle).toEqual(true);
  });

  it('should show selected events', () => {
    component.bookmarkSelected = false;
    component.showSelectedEvents();
    expect(component.bookmarkSelected).toEqual(true);
  });

  it('should return unique locations', () => {
    const expectedLocations: FilterItem[] = [
      { type: 'location', nameEn: 'Online', nameUa: 'Онлайн' },
      { type: 'location', nameEn: 'Kyiv', nameUa: 'Київ' },
      { type: 'location', nameEn: 'Lviv', nameUa: 'Львів' },
      { type: 'location', nameEn: 'Ternopil', nameUa: 'Тернопіль' }
    ];
    expect(component.getUniqueLocations(addressesMock)).toEqual(expectedLocations);
  });

  it('should update selected filters list', () => {
    const clickedFiltersList: FilterItem[] = [
      { type: 'location', nameEn: 'Kyiv', nameUa: 'Київ' },
      { type: 'eventTimeStatus', nameEn: 'Upcoming', nameUa: 'Майбутній' },
      { type: 'eventTimeStatus', nameEn: 'Past', nameUa: 'Завершений' },
      { type: 'location', nameEn: 'Lviv', nameUa: 'Львів' }
    ];
    component.selectedFilters = [];
    clickedFiltersList.forEach((clickedFilter) => {
      component.updateListOfFilters(clickedFilter);
    });
    expect(component.selectedFilters).toEqual(clickedFiltersList);
  });

  it('should remove all selection in type', () => {
    component.selectedFilters = [
      { type: 'eventTimeStatus', nameEn: 'Past', nameUa: 'Завершений' },
      { type: 'location', nameEn: 'Lviv', nameUa: 'Львів' }
    ];
    const expectedSelectedFiltersList: FilterItem[] = [{ type: 'eventTimeStatus', nameEn: 'Past', nameUa: 'Завершений' }];
    component.selectedEventTimeStatusFiltersList = ['Past'];
    component.selectedLocationFiltersList = ['Lviv'];
    component.unselectAllFiltersInType('location');
    expect(component.selectedFilters).toEqual(expectedSelectedFiltersList);
  });

  it('should reset all filters', () => {
    component.selectedFilters = [
      { type: 'eventTimeStatus', nameEn: 'Past', nameUa: 'Завершений' },
      { type: 'location', nameEn: 'Lviv', nameUa: 'Львів' },
      { type: 'type', nameEn: 'Economic', nameUa: 'Економічний' },
      { type: 'status', nameEn: 'Closed', nameUa: 'Закритa' }
    ];
    component.resetAllFilters();
    expect(component.selectedFilters.length).toEqual(0);
  });

  it('should return unique locations including Online', () => {
    const result = component.getUniqueLocations(addressesMock);
    expect(result).toContain({ type: 'location', nameEn: 'Online', nameUa: 'Онлайн' });
    expect(result).toContain({ type: 'location', nameEn: 'Kyiv', nameUa: 'Київ' });
    expect(result).toContain({ type: 'location', nameEn: 'Lviv', nameUa: 'Львів' });
  });

  it('should open auth modal with correct page name', () => {
    component.openAuthModalWindow('sign-up');

    expect(matDialogService.open).toHaveBeenCalledWith(AuthModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {
        popUpName: 'sign-up'
      }
    });
  });

  it('should set isGalleryView to true for gallery view mode', () => {
    component.changeViewMode('gallery');
    expect(component.isGalleryView).toBeTrue();
  });

  it('should set isGalleryView to false for list view mode', () => {
    component.changeViewMode('list');
    expect(component.isGalleryView).toBeFalse();
  });

  it('should clear selected filters for eventTimeStatus', () => {
    component.unselectAllFiltersInType('eventTimeStatus');
    expect(component.selectedEventTimeStatusFiltersList).toEqual([]);
  });

  it('should clear selected filters for location', () => {
    component.unselectAllFiltersInType('location');
    expect(component.selectedLocationFiltersList).toEqual([]);
  });

  it('should clear selected filters for status', () => {
    component.unselectAllFiltersInType('status');
    expect(component.selectedStatusFiltersList).toEqual([]);
  });

  it('should clear selected filters for type', () => {
    component.unselectAllFiltersInType('type');
    expect(component.selectedTypeFiltersList).toEqual([]);
  });

  it('should reset all filter lists and unselect all checkboxes', () => {
    component.resetAllFilters();
    expect(component.selectedFilters).toEqual([]);
    expect(component.selectedEventTimeStatusFiltersList).toEqual([]);
    expect(component.selectedLocationFiltersList).toEqual([]);
    expect(component.selectedStatusFiltersList).toEqual([]);
    expect(component.selectedTypeFiltersList).toEqual([]);
  });
});
