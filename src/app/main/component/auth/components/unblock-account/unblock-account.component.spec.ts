import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { UnblockAccountComponent } from './unblock-account.component';
import { authImages } from 'src/app/main/image-pathes/auth-images';
import { SignInIcons } from 'src/app/main/image-pathes/sign-in-icons';
import { unblockAccountLink } from 'src/app/main/links';
import { TranslateModule } from '@ngx-translate/core';

describe('UnblockAccountComponent', () => {
  let component: UnblockAccountComponent;
  let fixture: ComponentFixture<UnblockAccountComponent>;
  let httpTestingController: HttpTestingController;
  let snackBarSpy: jasmine.SpyObj<MatSnackBarComponent>;
  let router: Router;

  class Fake {}

  beforeEach(async () => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          {
            path: 'welcome',
            component: Fake
          }
        ]),
        TranslateModule.forRoot()
      ],
      declarations: [UnblockAccountComponent],
      providers: [
        { provide: MatSnackBarComponent, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ token: 'testToken' }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnblockAccountComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the correct images and token', () => {
    component.ngOnInit();
    expect(component.icons).toEqual(SignInIcons);
    expect(component.token).toBe('testToken');
    expect(component.images).toBe(authImages);
  });

  it('should unblock account and navigate on success', () => {
    component.token = 'testToken';
    component.isUbs = false;

    component.onButtonClick();
    const req = httpTestingController.expectOne(`${unblockAccountLink}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'testToken' });

    req.flush(null);

    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('successUnblockAccount');
  });

  it('should show error message on unblock account failure', () => {
    component.token = 'testToken';

    component.onButtonClick();
    const req = httpTestingController.expectOne(`${unblockAccountLink}`);
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('sendNewUnblockLetter');
  });

  it('should close modal and show notification', () => {
    component.isUbs = true;

    component.closeModal();
    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('exitConfirmUnblockAccount');
  });
});
