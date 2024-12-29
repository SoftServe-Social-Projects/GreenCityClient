import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { UbsAdminCustomersComponent } from './ubs-admin-customers.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Language } from 'src/app/main/i18n/Language';
import { CommentPopUpComponent } from '../shared/components/comment-pop-up/comment-pop-up.component';

describe('UbsAdminCustomersComponent', () => {
  let component: UbsAdminCustomersComponent;
  let fixture: ComponentFixture<UbsAdminCustomersComponent>;
  let dialogMock: any = {};
  const localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', ['getCurrentLanguage']);
  localStorageServiceMock.getCurrentLanguage = () => 'en' as Language;
  const adminCustomerServiceMock = jasmine.createSpyObj('AdminCustomerService', ['addChatLink']);

  adminCustomerServiceMock.addChatLink.and.returnValue(of(null));

  dialogMock = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of('Updated data')),
      componentInstance: {
        header: '',
        comment: '',
        isLink: true
      }
    })
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatTableModule,
        SharedModule,
        TranslateModule.forRoot(),
        InfiniteScrollModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule
      ],
      declarations: [UbsAdminCustomersComponent],
      providers: [{ provide: MatDialog, useValue: dialogMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    spyOn(window, 'open');
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    dialogMock = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(null)),
        componentInstance: {
          header: '',
          comment: '',
          isLink: true
        }
      })
    };
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('detects changes', () => {
    const changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
    const detectChangesSpy = spyOn(changeDetectorRef.constructor.prototype, 'detectChanges');

    component.ngAfterViewChecked();

    expect(detectChangesSpy).toHaveBeenCalled();
  });

  it('method togglePopUp should toggle display', () => {
    component.display = 'block';
    component.togglePopUp();
    expect(component.display).toBe('none');
  });

  it('method onDeleteFilter should reset data in filterForm', () => {
    component.onDeleteFilter('bonusesFrom', 'bonusesTo');
    expect(component.filterForm.value.bonusesFrom).toBe('');
    expect(component.filterForm.value.bonusesTo).toBe('');
  });

  it('should open the dialog with the correct configuration', () => {
    const column = { title: { ua: 'Заголовок', en: 'Title', key: 'titleKey' }, width: 60 };
    const data = 'initial data';
    const userId = 'user1';

    component.openPopUp(column, data, userId);

    const modalRef = dialogMock.open.calls.mostRecent().returnValue;
    const componentInstance = modalRef.componentInstance as CommentPopUpComponent;

    expect(componentInstance.header).toBe('Title');
    expect(componentInstance.comment).toBe(data);
    expect(componentInstance.isLink).toBe(true);
  });

  it('should not call the service or update table data when updatedData is null', () => {
    const column = { title: { ua: 'Українська', en: 'English', key: 'key' }, width: 60 };
    const data = 'Initial data';
    const userId = '123';

    component.tableData = [{ userId: '123', key: 'Initial data' }];

    dialogMock.open.and.returnValue({
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(null)),
      componentInstance: {
        header: '',
        comment: '',
        isLink: true
      }
    });

    component.openPopUp(column, data, userId);

    expect(adminCustomerServiceMock.addChatLink).not.toHaveBeenCalled();

    const updatedRow = component.tableData.find((row) => row.userId === userId);
    expect(updatedRow?.[column.title.key]).toBe('Initial data');
  });

  it('should open a new tab with the provided chat URL', () => {
    const chatUrl = 'https://my.binotel.ua';
    component.openChat(chatUrl);
    expect(window.open).toHaveBeenCalledWith(chatUrl, '_blank');
  });

  it('should not call window.open if the URL is an empty string', () => {
    const chatUrl = '';
    component.openChat(chatUrl);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should not call window.open if the URL is undefined', () => {
    const chatUrl = undefined as unknown as string;
    component.openChat(chatUrl);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should not call window.open if the URL is null', () => {
    const chatUrl = null as unknown as string;
    component.openChat(chatUrl);
    expect(window.open).not.toHaveBeenCalled();
  });
});
