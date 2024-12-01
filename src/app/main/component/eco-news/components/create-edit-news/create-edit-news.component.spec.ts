import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormControl, FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ImageCropperModule } from 'ngx-image-cropper';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { CreateEcoNewsService } from '@eco-news-service/create-eco-news.service';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { ConfirmRestorePasswordComponent } from '@global-auth/confirm-restore-password/confirm-restore-password.component';
import { DragAndDropComponent } from '@shared/components/drag-and-drop/drag-and-drop.component';
import { routes } from 'src/app/app-routing.module';
import { CreateEditNewsComponent } from './create-edit-news.component';
import { PostNewsLoaderComponent } from '..';
import { ACTION_CONFIG, ACTION_TOKEN } from './action.constants';
import { CreateEditNewsFormBuilder } from './create-edit-news-form-builder';
import { HomepageComponent } from 'src/app/main/component/home/components';
import { SearchAllResultsComponent } from 'src/app/main/component/layout/components';
import { MainComponent } from 'src/app/main/main.component';
import { UbsBaseSidebarComponent } from 'src/app/shared/ubs-base-sidebar/ubs-base-sidebar.component';
import { Store, ActionsSubject } from '@ngrx/store';
import { QuillModule } from 'ngx-quill';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Language } from 'src/app/main/i18n/Language';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterModel } from '@shared/components/tag-filter/tag-filter.model';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { FIRSTECONEWS } from '../../mocks/eco-news-mock';
import { NewsDTO } from '@eco-news-models/create-news-interface';
import { CreateEcoNewsAction } from 'src/app/store/actions/ecoNews.actions';

function getEmptyFormGroup() {
  return new FormGroup({
    title: new FormControl(''),
    content: new FormControl(''),
    tags: new FormArray([]),
    image: new FormControl(''),
    source: new FormControl('')
  });
}

describe('CreateEditNewsComponent', () => {
  let component: CreateEditNewsComponent;
  let fixture: ComponentFixture<CreateEditNewsComponent>;
  let router: Router;
  let http: HttpTestingController;

  const validNews: NewsDTO = {
    tags: [{ id: 1, name: 'News', nameUa: 'Новини' }],
    text: 'Detailed content about the news...',
    title: 'New Title',
    source: 'sourceURL',
    image: 'imageURL',
    countOfEcoNews: 5,
    content: 'Content for the news article'
  };

  const selectedTags: FilterModel[] = [
    { name: 'Events', nameUa: 'Події', isActive: true },
    { name: 'Education', nameUa: 'Освіта', isActive: true }
  ];

  const createEcoNewsServiceMock: CreateEcoNewsService = jasmine.createSpyObj('CreateEcoNewsService', [
    'sendFormData',
    'editNews',
    'setForm',
    'getNewsId',
    'getFormData',
    'isBackToEditing',
    'sendImagesData',
    'getTags',
    'setTags'
  ]);
  createEcoNewsServiceMock.sendFormData = (form) => of(FIRSTECONEWS);
  createEcoNewsServiceMock.getFormData = () => getEmptyFormGroup();
  createEcoNewsServiceMock.editNews = (form) => of(FIRSTECONEWS);
  createEcoNewsServiceMock.setForm = (form) => of();
  createEcoNewsServiceMock.getNewsId = () => 15;
  createEcoNewsServiceMock.isBackToEditing = false;
  createEcoNewsServiceMock.sendImagesData = () => of(['image']);
  createEcoNewsServiceMock.getTags = () => [];

  const ecoNewsServiceMock = jasmine.createSpyObj('EcoNewsService', ['getEcoNewsById', 'getAllPresentTags']);
  ecoNewsServiceMock.getEcoNewsById = () => of(FIRSTECONEWS);

  const createEditNewsFormBuilderMock: CreateEditNewsFormBuilder = jasmine.createSpyObj('CreateEditNewsFormBuilder', [
    'getSetupForm',
    'getEditForm'
  ]);

  createEditNewsFormBuilderMock.getSetupForm = () =>
    new FormGroup({
      title: new FormControl('', [Validators.required, Validators.maxLength(170)]),
      content: new FormControl('', [Validators.required, Validators.minLength(20)]),
      tags: new FormArray([]),
      image: new FormControl(''),
      source: new FormControl('')
    });

  createEditNewsFormBuilderMock.getEditForm = (data) =>
    new FormGroup({
      title: new FormControl(data.title, [Validators.required, Validators.maxLength(170)]),
      content: new FormControl(data.content, [Validators.required, Validators.minLength(20)]),
      tags: new FormArray([new FormControl(data.tags)]),
      image: new FormControl(data.imagePath),
      source: new FormControl(data.source)
    });

  const actionSub: ActionsSubject = new ActionsSubject();

  const storeMock = jasmine.createSpyObj('store', ['select', 'dispatch']);

  const localStorageServiceMock = jasmine.createSpyObj('localStorageService', [
    'getPreviousPage',
    'removeTagsOfNews',
    'languageBehaviourSubject',
    'getCurrentLanguage',
    'getUserId'
  ]);

  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('en');
  localStorageServiceMock.getCurrentLanguage = () => 'en' as Language;
  localStorageServiceMock.languageSubject = of('en');

  const languageServiceMock = jasmine.createSpyObj('languageService', ['getLangValue']);
  languageServiceMock.getLangValue = (valUa: string, valEn: string) => valUa;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CreateEditNewsComponent,
        PostNewsLoaderComponent,
        DragAndDropComponent,
        MainComponent,
        UbsBaseSidebarComponent,
        HomepageComponent,
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
        BrowserAnimationsModule,
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
        { provide: LanguageService, useVale: languageServiceMock },
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
    http = TestBed.inject(HttpTestingController);
    spyOn(router, 'navigate').and.stub();
    (component as any).createEcoNewsService = createEcoNewsServiceMock;
    (component as any).createEditNewsFormBuilder = createEditNewsFormBuilderMock;
    (component as any).store = storeMock;
    (component as any).snackBar = { openSnackBar: jasmine.createSpy('openSnackBar') };
  });

  afterEach(() => {
    http.verify();
    (router.navigate as jasmine.Spy).calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initPageForCreateOrEdit expect setDataForCreate should be call', () => {
    const spy = spyOn(component, 'setDataForCreate');
    createEcoNewsServiceMock.isBackToEditing = true;
    createEcoNewsServiceMock.getNewsId = () => null;
    component.initPageForCreateOrEdit();
    expect(spy).toHaveBeenCalledTimes(1);
    createEcoNewsServiceMock.isBackToEditing = false;
    createEcoNewsServiceMock.getNewsId = () => 15;
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

  it('ngOnInit', () => {
    const spy1 = spyOn(component, 'getNewsIdFromQueryParams');
    component.ngOnInit();
    expect(spy1).toHaveBeenCalledTimes(1);
  });

  it('isValid should be true when form is valid', fakeAsync(() => {
    component.form.controls.title.setValue(validNews.title);
    component.form.controls.content.setValue(validNews.content);
    (component.form.controls.tags as FormArray).push(new FormControl(validNews.tags[0]));
    component.form.controls.image.setValue(validNews.image);
    component.form.controls.source.setValue(validNews.source);
    expect(component.form.valid).toBeTruthy();
  }));

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
    contentInput.setValue('test');
    const titleInput = component.form.controls.title;
    expect(contentInput.errors).toBeTruthy();
    expect(titleInput.errors).toBeTruthy();
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
    const button = fixture.debugElement.query(By.css('.submit-buttons .tertiary-global-button'));
    expect(button.nativeElement.innerHTML.trim()).toBe('create-news.cancel-button');
  });

  it('should getTagsList from child component', () => {
    const selectedTagsList = ['Events', 'Education'];
    component.getTagsList(selectedTags);
    const newTags = component.form.controls.tags.value;
    expect(newTags).toEqual(selectedTagsList);
  });

  it('should minimum one drag and drop on the page', () => {
    const dragAndDrop = fixture.debugElement.queryAll(By.css('app-drag-and-drop'));
    expect(dragAndDrop.length >= 1).toBeTruthy();
  });

  it('should update isLinkOrEmpty based on source value', () => {
    component.form = new FormGroup({ source: new FormControl('') });
    component.onSourceChange();
    const sourceControl = component.form.get('source');
    sourceControl?.setValue('https://example.com');
    expect(component.isLinkOrEmpty).toBeTrue();
  });

  it('should navigate to previous path and reset posting state', () => {
    component.isPosting = true;
    (router.navigate as jasmine.Spy).and.returnValue(Promise.resolve(true));
    component.escapeFromCreatePage();
    expect(component.isPosting).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith([component.previousPath]);
  });

  it('should initialize the component for create or edit mode', () => {
    (component as any).createEcoNewsService.isBackToEditing = true;
    (component as any).createEcoNewsService.getNewsId = () => 15;
    (component as any).createEcoNewsService.getFormData = () => getEmptyFormGroup();
    spyOn(component, 'setInitialValues').and.callThrough();
    component.initPageForCreateOrEdit();
    expect(component.setInitialValues).toHaveBeenCalled();
    expect(component.form).toBeTruthy();
    expect(component.newsId).toBe(15);
  });

  it('should process images and call sendData', () => {
    component.editorHTML = 'data:image/png;base64,encodedImage';
    spyOn((component as any).createEcoNewsService, 'sendImagesData').and.returnValue(of(['imageLink']));
    spyOn(component, 'sendData');
    component.createNews();
    expect((component as any).createEcoNewsService.sendImagesData).toHaveBeenCalled();
    expect(component.sendData).toHaveBeenCalledWith('imageLink');
  });

  it('should process images and call editData', () => {
    component.editorHTML = 'data:image/png;base64,encodedImage';
    spyOn((component as any).createEcoNewsService, 'sendImagesData').and.returnValue(of(['imageLink']));
    spyOn(component, 'editData');
    component.editNews();
    expect(component.editData).toHaveBeenCalledWith('imageLink');
    expect((component as any).createEcoNewsService.sendImagesData).toHaveBeenCalled();
  });

  it('should call editData when no images are present', () => {
    spyOn(component, 'editData');
    component.editorHTML = 'Some content';
    component.editNews();
    expect(component.editData).toHaveBeenCalledWith('Some content');
  });

  it('should call editData with original HTML when no images are present', () => {
    component.editorHTML = '<p>No images here</p>';
    spyOn(createEcoNewsServiceMock, 'sendImagesData').and.stub();
    spyOn(component, 'editData').and.stub();
    component.editNews();
    expect(createEcoNewsServiceMock.sendImagesData).not.toHaveBeenCalled();
    expect(component.editData).toHaveBeenCalledWith('<p>No images here</p>');
  });

  it('initPageForCreateOrEdit expect fetchNewsItemToEdit should be call', () => {
    const spy = spyOn(component, 'fetchNewsItemToEdit');
    component.newsId = 20;
    createEcoNewsServiceMock.getNewsId();
    (component as any).createEcoNewsService.isBackToEditing = false;
    spyOn((component as any).createEcoNewsService, 'getNewsId').and.returnValue(component.newsId);
    component.initPageForCreateOrEdit();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call setDataForEdit if isBackToEditing is true and newsId is truthy', () => {
    (component as any).createEcoNewsService.isBackToEditing = true;
    component.newsId = 20;
    spyOn(component, 'setDataForEdit');
    component.initPageForCreateOrEdit();
    expect(component.setDataForEdit).toHaveBeenCalled();
  });

  it('should call getSetupForm if isBackToEditing is false and newsId is falsy', () => {
    (component as any).createEcoNewsService.isBackToEditing = false;
    component.newsId = null;
    spyOn(createEditNewsFormBuilderMock, 'getSetupForm').and.returnValue(getEmptyFormGroup());
    component.initPageForCreateOrEdit();
    expect(createEditNewsFormBuilderMock.getSetupForm).toHaveBeenCalled();
  });

  it('should initialize form and data for editing when isBackToEditing is true and newsId is falsy', () => {
    (component as any).createEcoNewsService.isBackToEditing = true;
    component.newsId = null;
    spyOn(createEditNewsFormBuilderMock, 'getEditForm').and.returnValue(getEmptyFormGroup());
    spyOn(component, 'setDataForEdit').and.stub();
    spyOn(component, 'setDataForCreate').and.stub();
    spyOn(component, 'setInitialValues').and.stub();
    component.initPageForCreateOrEdit();
    expect(createEditNewsFormBuilderMock.getEditForm).toHaveBeenCalled();
    expect(component.setDataForEdit).toHaveBeenCalled();
    expect(component.setDataForCreate).not.toHaveBeenCalled();
    expect(component.setInitialValues).toHaveBeenCalled();
  });

  it('should call fetchNewsItemToEdit if isBackToEditing is false and newsId is truthy', () => {
    (component as any).createEcoNewsService.isBackToEditing = false;
    component.newsId = 20;
    spyOn(component, 'fetchNewsItemToEdit');
    component.initPageForCreateOrEdit();
    expect(component.fetchNewsItemToEdit).toHaveBeenCalled();
  });

  it('should call editNews and handle errors correctly', () => {
    spyOn(component, 'editData');
    spyOn(createEcoNewsServiceMock, 'sendImagesData').and.returnValue(of(['imageLink']));
    spyOn((component as any).actionsSubj, 'pipe').and.returnValue(of(CreateEcoNewsAction));
    component.form = createEditNewsFormBuilderMock.getEditForm({
      title: 'New Title',
      content: 'Detailed content about the news...',
      tags: [],
      imagePath: '',
      source: 'sourceURL'
    });
    component.editNews();
    expect(component.editData).toHaveBeenCalledWith('Detailed content about the news...');
  });
});
