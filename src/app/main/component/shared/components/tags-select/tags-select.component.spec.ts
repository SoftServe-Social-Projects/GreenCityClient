import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TagsSelectComponent } from './tags-select.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { FIRSTTAGITEM, TAGLIST } from '@global-user/components/habit/mocks/tags-list-mock';

describe('TagsSelectComponent', () => {
  let component: TagsSelectComponent;
  let fixture: ComponentFixture<TagsSelectComponent>;

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue']);
  languageServiceMock.getLangValue.and.returnValue('fakeTag');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TagsSelectComponent],
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: LanguageService, useValue: languageServiceMock }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check tag', () => {
    const tags = { id: 1, name: 'Reusable', nameUa: 'Багаторазове використання', isActive: true };
    component.selectedList = null;
    component.tagsList = [tags];
    component.checkTab(FIRSTTAGITEM);
    expect(tags.isActive).toBeTruthy();
    expect(component.selectedList).toEqual([tags]);
  });

  it('should check maxLength of tags', () => {
    component.selectedList = null;
    let check = component.checkMaxLength(true);
    expect(check).toBeFalsy();
    component.selectedList = TAGLIST;
    component.tagMaxLength = null;
    check = component.checkMaxLength(true);
    expect(check).toBeFalsy();
    component.selectedList = TAGLIST;
    component.tagMaxLength = 3;
    check = component.checkMaxLength(true);
    expect(check).toBeFalsy();
    component.tagMaxLength = 1;
    check = component.checkMaxLength(false);
    expect(check).toBeTruthy();
  });

  it('should get value by language', () => {
    const valueByLang = (component as any).getLangValue('fakeTag', 'fakeTagEn');
    expect(valueByLang).toBe('fakeTag');
  });
});
