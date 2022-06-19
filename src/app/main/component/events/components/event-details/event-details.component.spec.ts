import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { EventDetailsComponent } from './event-details.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { EventsService } from '../../services/events.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

describe('EventDetailsComponent', () => {
  let component: EventDetailsComponent;
  let fixture: ComponentFixture<EventDetailsComponent>;

  const MockReqest = {
    additionalImages: [],
    coordinates: {
      latitude: 0,
      longitude: 0
    },
    dates: [],
    description: 'description',
    id: 1,
    onlineLink: 'link',
    open: true,
    organizer: {
      id: 1111,
      name: 'John'
    },
    tags: [{ nameEn: 'Environmental', nameUa: 'Екологічний', id: 1 }],
    title: 'title',
    titleImage: ''
  };

  const EventsServiceMock = jasmine.createSpyObj('EventsService', ['getEventById ', 'deleteEvent']);
  EventsServiceMock.getEventById = () => of(MockReqest);
  EventsServiceMock.deleteEvent = () => of(true);

  const activatedRouteMock = {
    snapshot: {
      params: {
        id: 2
      }
    }
  };

  const LocalStorageServiceMock = jasmine.createSpyObj('LocalStorageService', ['userIdBehaviourSubject', 'setEditMode', 'setEventForEdit']);
  LocalStorageServiceMock.userIdBehaviourSubject = new BehaviorSubject(1111);
  class MatDialogMock {
    open() {
      return {
        afterClosed: () => of(true)
      };
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule, MatDialogModule],
      declarations: [EventDetailsComponent],
      providers: [
        { provide: EventsService, useValue: EventsServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: LocalStorageService, useValue: LocalStorageServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit tags.length shoud be 3', () => {
    component.tags = [];
    component.ngOnInit();
    expect(component.tags.length).toBe(3);
  });

  it('routeToEditEvent', () => {
    const spy = spyOn(component.router, 'navigate');
    component.routeToEditEvent();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('getUserId user ID should be 1111', () => {
    component.getUserId();
    expect(component.userId).toBe(1111);
  });

  it('checkUserId', () => {
    const res = component.checkUserId();
    expect(res).toBeTruthy();
  });

  it('filterTags tags[1] should be active', () => {
    (component as any).filterTags([{ nameEn: 'Social', nameUa: 'Соціальний', id: 1 }]);
    expect(component.tags[1].isActive).toBeTruthy();
  });

  it('setNewsId eventId should be 2', () => {
    (component as any).eventId = 0;
    (component as any).setNewsId();
    expect((component as any).eventId).toBe(2);
  });

  it('selectImage sliderIndex should be 1 ', () => {
    component.selectImage(1);
    expect(component.sliderIndex).toBe(1);
  });

  it('moveRight sliderIndex should be 1', () => {
    component.imagesSlider = ['1', '2'];
    component.sliderIndex = 0;
    component.moveRight();
    expect(component.sliderIndex).toBe(1);
  });

  it('moveRight sliderIndex should be 0', () => {
    component.imagesSlider = ['1', '2', '3'];
    component.sliderIndex = 2;
    component.moveRight();
    expect(component.sliderIndex).toBe(0);
  });

  it('moveLeft sliderIndex should be 1', () => {
    component.imagesSlider = ['1', '2'];
    component.sliderIndex = 0;
    component.moveLeft();
    expect(component.sliderIndex).toBe(1);
  });

  it('moveLeft sliderIndex should be 2 ', () => {
    component.imagesSlider = ['1', '2', '3', '4'];
    component.sliderIndex = 3;
    component.moveLeft();
    expect(component.sliderIndex).toBe(2);
  });

  it('deleteEvent', () => {
    const spy = spyOn(component.router, 'navigate');
    component.deleteEvent();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
