import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsListComponent } from './events-list.component';

import { EventsService } from '../../services/events.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { UserOwnAuthService } from '@global-service/auth/user-own-auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';

describe('EventsListComponent', () => {
  let component: EventsListComponent;
  let fixture: ComponentFixture<EventsListComponent>;

  const MockReqest = {
    page: [],
    totalElements: 4
  };

  const MockData = {
    eventState: {},
    eventsList: [],
    visitedPages: [],
    totalPages: 0,
    pageNumber: 0,

    error: null
  };

  const EventsServiceMock = jasmine.createSpyObj('EventsService', ['getEvents']);
  EventsServiceMock.getEvents = () => of(MockReqest);

  const UserOwnAuthServiceMock = jasmine.createSpyObj('UserOwnAuthService', ['getDataFromLocalStorage', 'credentialDataSubject']);
  UserOwnAuthServiceMock.credentialDataSubject = of({ userId: 3 });

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);
  storeMock.select = () => of(MockData);

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue']);
  languageServiceMock.getLangValue = (valUa: string, valEn: string) => {
    of(valEn);
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EventsListComponent],
      imports: [TranslateModule.forRoot(), NgxPaginationModule, RouterTestingModule],
      providers: [
        { provide: EventsService, useValue: EventsServiceMock },
        { provide: UserOwnAuthService, useValue: UserOwnAuthServiceMock },
        { provide: Store, useValue: storeMock }
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

  it('ngOnInit', () => {
    UserOwnAuthServiceMock.getDataFromLocalStorage.calls.reset();
    const spy = spyOn(component as any, 'checkUserSingIn');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(UserOwnAuthServiceMock.getDataFromLocalStorage).toHaveBeenCalledTimes(1);
  });

  it('checkUserSingIn', () => {
    (component as any).checkUserSingIn();
    expect(component.isLoggedIn).toBe(3 as any);
  });

  it('setPage', () => {
    storeMock.dispatch.calls.reset();
    component.setPage(3);
    expect(storeMock.dispatch).toHaveBeenCalledTimes(1);
  });

  it('should check weather resetAll works correctly', () => {
    component.selectedFilters = ['one', 'two', 'three'];
    component.resetAll();
    expect(component.selectedFilters.length).toEqual(0);
  });

  it('should check weather deleteOneFilter works correctly', () => {
    component.selectedFilters = ['one', 'two', 'three'];
    const filterRemoved = ['one', 'three'];
    component.deleteOneFilter(1);
    expect(component.selectedFilters).toEqual(filterRemoved);
  });

  it('should check weather showFavourite works correctly', () => {
    component.bookmarkSelected = false;
    component.showFavourite();
    expect(component.bookmarkSelected).toEqual(true);
  });

  it('should check weather search works correctly', () => {
    component.searchToggle = false;
    component.search();
    expect(component.searchToggle).toEqual(true);
  });

  it('should check weather toggleAllSelection works correctly', () => {
    component.allSelected = false;
    component.toggleAllSelection();
    expect(component.selectedEventTime).toEqual(component.eventTimeList);
  });
});
