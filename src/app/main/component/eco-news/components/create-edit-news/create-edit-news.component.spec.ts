import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormArray, FormControl, FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ImageCropperModule } from 'ngx-image-cropper';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { CreateEcoNewsService } from '@eco-news-service/create-eco-news.service';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { ConfirmRestorePasswordComponent } from '@global-auth/confirm-restore-password/confirm-restore-password.component';
import { DragAndDropComponent } from '@shared/components/drag-and-drop/drag-and-drop.component';
import { routes } from 'src/app/app-routing.module';
import { CreateEditNewsComponent } from './create-edit-news.component';
import { PostNewsLoaderComponent } from '..';
import { ACTION_CONFIG, ACTION_TOKEN } from './action.constants';
import { CreateEditNewsFormBuilder } from './create-edit-news-form-builder';
import { HomepageComponent, TipsListComponent } from 'src/app/main/component/home/components';
import { SearchAllResultsComponent } from 'src/app/main/component/layout/components';
import { MainComponent } from '../../../../main.component';
import { UbsBaseSidebarComponent } from '../../../../../shared/ubs-base-sidebar/ubs-base-sidebar.component';
import { environment } from '@environment/environment.js';
import { Store, ActionsSubject } from '@ngrx/store';
import { QuillModule } from 'ngx-quill';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

describe('CreateEditNewsComponent', () => {
  let component: CreateEditNewsComponent;
  let fixture: ComponentFixture<CreateEditNewsComponent>;
  let ecoNewsServiceMock: EcoNewsService;
  let createEcoNewsServiceMock: CreateEcoNewsService;
  let createEditNewsFormBuilderMock: CreateEditNewsFormBuilder;
  let router: Router;
  let location: Location;
  const url = environment.backendLink + `econews`;
  const item: EcoNewsModel = {
    author: { id: 1601, name: 'Hryshko' },
    creationDate: '2020-10-26T16:43:29.336931Z',
    id: 4705,
    imagePath: 'https://storage.cloud.google.com/staging.greencity-c5a3a.appspot.com/35fce8fe-7949-48b8-bf8c-0d9a768ecb42',
    tags: ['Events', 'Education'],
    content: 'hellohellohellohellohellohellohellohellohellohello',
    title: 'hello',
    likes: 0,
    countComments: 2,
    shortInfo: 'info',
    source: null
  };

  let http: HttpTestingController;
  const newsResponseMock: EcoNewsModel = {
    id: 4705,
    content: 'hellohellohellohellohellohellohellohellohellohello',
    title: 'hello',
    author: { id: 1601, name: 'Anton Hryshko' },
    creationDate: '2020-10-26T16:43:29.336931Z',
    imagePath: 'https://storage.cloud.google.com/staging.greencity-c5a3a.appspot.com/35fce8fe-7949-48b8-bf8c-0d9a768ecb42',
    tags: ['Events', 'Education'],
    countComments: 2,
    likes: 3,
    shortInfo: 'info',
    source: null
  };

  const validNews = {
    title: 'newstitle',
    content: 'contentcontentcontentcontentcontentcontentcontent',
    tags: ['News'],
    source: '',
    image: ''
  };
  const inValidNews = {
    title: '',
    content: 'Content',
    tags: [],
    source: '',
    image: ''
  };

  const emptyForm = () => {
    return new FormGroup({
      title: new FormControl(''),
      content: new FormControl(''),
      tags: new FormArray([]),
      image: new FormControl(''),
      source: new FormControl('')
    });
  };

  const tagsArray = [
    { id: 1, name: 'Events' },
    { id: 2, name: 'Education' }
  ];

  createEcoNewsServiceMock = jasmine.createSpyObj('CreateEcoNewsService', [
    'sendFormData',
    'editNews',
    'setForm',
    'getNewsId',
    'getFormData',
    'isBackToEditing',
    'sendImagesData'
  ]);
  createEcoNewsServiceMock.sendFormData = (form) => of(newsResponseMock);
  createEcoNewsServiceMock.getFormData = () => emptyForm();
  createEcoNewsServiceMock.editNews = (form) => of(newsResponseMock);
  createEcoNewsServiceMock.setForm = (form) => of();
  createEcoNewsServiceMock.getNewsId = () => '15';
  createEcoNewsServiceMock.isBackToEditing = false;
  createEcoNewsServiceMock.sendImagesData = () => of(['image']);

  ecoNewsServiceMock = jasmine.createSpyObj('EcoNewsService', ['getEcoNewsById', 'getAllPresentTags']);
  ecoNewsServiceMock.getEcoNewsById = (id) => {
    return of(item);
  };
  ecoNewsServiceMock.getAllPresentTags = () => of(tagsArray);

  createEditNewsFormBuilderMock = jasmine.createSpyObj('CreateEditNewsFormBuilder', ['getSetupForm', 'getEditForm']);
  createEditNewsFormBuilderMock.getSetupForm = () => {
    return new FormGroup({
      title: new FormControl('', [Validators.required, Validators.maxLength(170)]),
      content: new FormControl('', [Validators.required, Validators.minLength(20)]),
      tags: new FormArray([]),
      image: new FormControl(''),
      source: new FormControl('')
    });
  };

  createEditNewsFormBuilderMock.getEditForm = (data) => {
    return new FormGroup({
      title: new FormControl(data.title),
      content: new FormControl(data.content),
      tags: new FormArray(data.tags),
      image: new FormControl(data.imagePath),
      source: new FormControl(data.source)
    });
  };

  const actionSub: ActionsSubject = new ActionsSubject();

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);

  const localStorageServiceMock = jasmine.createSpyObj('localStorageService', [
    'getPreviousPage',
    'removeTagsOfNews',
    'languageBehaviourSubject',
    'getTagsOfNews',
    'setTagsOfNews'
  ]);
  localStorageServiceMock.getTagsOfNews = () => {
    return [{ name: 'Events', isActive: false }];
  };
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('en');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CreateEditNewsComponent,
        PostNewsLoaderComponent,
        DragAndDropComponent,
        MainComponent,
        UbsBaseSidebarComponent,
        HomepageComponent,
        TipsListComponent,
        SearchAllResultsComponent,
        ConfirmRestorePasswordComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes(routes),
        FormsModule,
        ReactiveFormsModule,
        ImageCropperModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        QuillModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: ACTION_TOKEN, useValue: ACTION_CONFIG },
        { provide: EcoNewsService, useValue: ecoNewsServiceMock },
        { provide: CreateEcoNewsService, useValue: createEcoNewsServiceMock },
        { provide: CreateEditNewsFormBuilder, useValue: createEditNewsFormBuilderMock },
        { provide: ActionsSubject, useValue: actionSub },
        { provide: Store, useValue: storeMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        MatSnackBarComponent,
        FormBuilder
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    location = TestBed.inject(Location);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('getAllTags called , filters should change', () => {
    ecoNewsServiceMock.getAllPresentTags = () => of([{ id: 1, name: 'Events' }]);
    (component as any).getAllTags();
    expect(component.filters).toEqual([{ name: 'Events', isActive: false }]);

    ecoNewsServiceMock.getAllPresentTags = () => of(tagsArray);
  });

  it('initPageForCreateOrEdit expect setDataForCreate should be call', () => {
    const spy = spyOn(component, 'setDataForCreate');
    createEcoNewsServiceMock.isBackToEditing = true;
    createEcoNewsServiceMock.getNewsId = () => '';

    component.initPageForCreateOrEdit();
    expect(spy).toHaveBeenCalledTimes(1);

    createEcoNewsServiceMock.isBackToEditing = false;
    createEcoNewsServiceMock.getNewsId = () => '15';
  });

  it('initPageForCreateOrEdit expect fetchNewsItemToEdit should be call', () => {
    const spy = spyOn(component, 'fetchNewsItemToEdit');
    component.newsId = '20';
    createEcoNewsServiceMock.getNewsId();

    component.initPageForCreateOrEdit();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('setDataForEdit  attributes.title should change ', () => {
    component.setDataForEdit();
    expect(component.attributes.title).toBe('create-news.edit-title');
  });

  it('createNews expect sendData should be called', () => {
    const spy = spyOn(component, 'sendData');
    component.editorHTML = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUA';

    component.createNews();
    expect(spy).toHaveBeenCalledWith('image');
  });

  it('addFilters expect filtersValidation should be called', () => {
    const spy = spyOn(component, 'filtersValidation');
    component.isArrayEmpty = true;
    component.addFilters({ name: 'string', isActive: false });
    expect(spy).toHaveBeenCalledWith({ name: 'string', isActive: false });
    expect(component.isArrayEmpty).toBeFalsy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit', () => {
    const spy1 = spyOn(component, 'getNewsIdFromQueryParams');
    component.ngOnInit();
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(localStorageServiceMock.removeTagsOfNews).toHaveBeenCalledWith('newsTags');
  });

  it('should get econews by id', () => {
    ecoNewsServiceMock.getEcoNewsById('4705').subscribe((data: EcoNewsModel) => {
      expect(data).toBeTruthy();
      expect(data).toEqual(item);
    });
  });

  it('should set empty form after init', () => {
    const testForm = {
      title: '',
      content: '',
      tags: [],
      image: '',
      source: ''
    };
    component.ngOnInit();
    expect(component.form.value).toEqual(testForm);
  });

  it('should addFilters', () => {
    spyOn(component, 'toggleIsActive');
    const filter = {
      name: 'News',
      isActive: false
    };

    component.toggleIsActive(filter, true);
    expect(component.toggleIsActive).toHaveBeenCalled();
  });

  it('should call toggleIsActive with filter object', () => {
    spyOn(component, 'toggleIsActive');
    const filter = {
      name: 'News',
      isActive: false
    };

    component.toggleIsActive(filter, true);
    expect(component.toggleIsActive).toHaveBeenCalledWith(filter, true);
  });

  it('should change isArrayEmpty to false property after adding tag', () => {
    component.isArrayEmpty = true;
    const filter = {
      name: 'News',
      isActive: false
    };

    component.addFilters(filter);
    expect(component.isArrayEmpty).toBe(false);
  });

  it('should change isArrayEmpty property to true after deleting tag', () => {
    const filter = {
      name: 'News',
      isActive: false
    };

    component.removeFilters(filter);
    expect(component.isArrayEmpty).toBe(true);
  });

  it('should add not more 3 filters ', fakeAsync(() => {
    const arr = [
      { name: 'News', isActive: false },
      { name: 'Events', isActive: false },
      { name: 'Education', isActive: false },
      { name: 'Initiatives', isActive: false },
      { name: 'Ads', isActive: false }
    ];

    component.ngOnInit();
    expect(component.isFilterValidation).toBe(false);
    component.addFilters(arr[0]);
    component.addFilters(arr[1]);
    component.addFilters(arr[2]);
    component.addFilters(arr[3]);
    tick(2000);
    expect(component.isFilterValidation).toBe(true);
    flush();
    expect(component.tags().length).toBe(3);
  }));

  function updateForm(news) {
    component.form.controls.title.setValue(news.title);
    component.form.controls.content.setValue(news.content);
    (component.form.controls.tags as FormArray).push(new FormControl(news.tags[0]));
    component.form.controls.image.setValue(news.image);
    component.form.controls.source.setValue(news.source);
  }

  it('isValid should be true when form is valid', fakeAsync(() => {
    updateForm(validNews);
    expect(component.form.valid).toBeTruthy();
  }));

  it('should set isArrayEmpty to false', () => {
    const expectedData: EcoNewsModel = {
      author: { id: 1601, name: 'Hryshko' },
      creationDate: '2020-10-26T16:43:29.336931Z',
      id: 4705,
      imagePath: 'https://storage.cloud.google.com/staging.greencity-c5a3a.appspot.com/35fce8fe-7949-48b8-bf8c-0d9a768ecb42',
      source: '',
      tags: ['Events', 'Education'],
      content: 'hellohellohellohellohellohellohellohellohellohello',
      title: 'hello',
      likes: 0,
      countComments: 2,
      shortInfo: 'info'
    };
    component.setActiveFilters(expectedData);
    expect(component.isArrayEmpty).toBeFalsy();
  });

  it('should add filters', () => {
    const activeFilter = { name: 'News', isActive: false };
    const notActiveFilter = { name: 'News', isActive: true };
    component.addFilters(activeFilter);
    expect(component.isArrayEmpty).toBeFalsy();
    expect(component.tags().length).toBe(1);

    component.removeFilters(notActiveFilter);
    expect(component.tags().length).toBe(0);
  });

  it('should create form with 5 controls', () => {
    expect(component.form.contains('title')).toBeTruthy();
    expect(component.form.contains('source')).toBeTruthy();
    expect(component.form.contains('content')).toBeTruthy();
    expect(component.form.contains('tags')).toBeTruthy();
    expect(component.form.contains('image')).toBeTruthy();
  });

  it('should update the value of the title, content, source fields', () => {
    const title = component.form.controls.title;
    const source = component.form.controls.source;
    const content = component.form.controls.content;

    title.setValue('Title');
    source.setValue('Source');
    content.setValue('content');
    expect(title.value).toBe('Title');
    expect(source.value).toBe('Source');
    expect(content.value).toBe('content');
  });

  it('should test form validating', () => {
    const form = component.form;
    const contentInput = form.controls.content;
    const titleInput = form.controls.title;
    const invalidString = `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab dicta doloremque illum libero
     nihil recusandae tempora veniam? Ad architecto aspernatur consectetur consequuntur culpa cupiditate dignissimos
     dolorem ea earum enim error eum inventore ipsam ipsum iure laborum laudantium maxime modi molestiae natus nobis
     numquam odit optio quae quaerat quas quidem rem repellat repellendus repudiandae, sequi sint sit ullam vel vero
     voluptate voluptatem! Ab, cum et harum quas repellendus saepe voluptatem. Distinctio dolorem molestiae mollitia
     quibusdam sunt vero? Aliquam amet aut consectetur consequuntur dignissimos, distinctio dolor dolorum et eveniet
     exercitationem illum iste iure labore laudantium maiores nam nulla officia perferendis quis reiciendis, rem sapiente
     similique soluta sunt tenetur, ullam velit vero. Amet animi architecto aspernatur cum eaque, eos est nobis quaerat
     qui quis? Ad adipisci aliquam, amet beatae culpa cum deleniti distinctio doloremque dolores ea eos eveniet ex excepturi
     explicabo fugiat id impedit in inventore laudantium maxime molestias nam nulla numquam, odio perspiciatis porro quae
     quis quod recusandae rerum sequi similique tenetur vel vitae voluptas voluptates voluptatibus? Amet eos facere in
     perferendis sit. Aliquid consequuntur eligendi esse eum exercitationem odio perferendis quod.`;
    contentInput.setValue('< 20 chars');
    titleInput.setValue(invalidString);
    expect(form.valid).toBeFalsy();
    expect(contentInput.valid).toBeFalsy();
    expect(contentInput.errors.minlength).toBeTruthy();
    expect(titleInput.valid).toBeFalsy();
    expect(titleInput.errors.maxlength).toBeTruthy();
  });

  it('should test input errors', () => {
    const contentInput = component.form.controls.content;
    const titleInput = component.form.controls.title;
    expect(contentInput.errors.required).toBeTruthy();
    expect(titleInput.errors.required).toBeTruthy();
    expect(component.form.valid).toBeFalsy();
  });

  it('should test form inputs on the validity', () => {
    const form = component.form;
    const title = form.controls.title;
    const content = form.controls.content;
    form.controls.title.setValue('Some title');
    form.controls.content.setValue('Some text that has more than 20 characters');
    expect(title.errors).toBeNull();
    expect(content.errors).toBeNull();
  });

  it('should minimum three buttons on the page', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length >= 3).toBeTruthy();
  });

  it('should be a Cancel button on the page', () => {
    const button = fixture.debugElement.query(By.css('.cancel'));
    expect(button.nativeElement.innerHTML.trim()).toBe('create-news.cancel-button');
  });

  it('should be a Events button on the page', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const nativeButton: HTMLButtonElement = buttons[0].nativeElement;
    expect(nativeButton.textContent.trim()).toBe('Events');
  });

  it('should be a Preview button on the page', () => {
    const button = fixture.debugElement.query(By.css('.preview'));
    expect(button.nativeElement.innerHTML.trim()).toBe('create-news.preview-button');
  });

  it('should be a Publish button on the page', () => {
    const button = fixture.debugElement.query(By.css('.submit'));
    expect(button.nativeElement.innerHTML.trim()).toBe('create-news.publish-button');
  });

  it('should minimum one drag and drop on the page', () => {
    const dragAndDrop = fixture.debugElement.queryAll(By.css('app-drag-and-drop'));
    expect(dragAndDrop.length >= 1).toBeTruthy();
  });
});
