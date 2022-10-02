import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UBSInputErrorComponent } from './ubs-input-error.component';

describe('ErrorComponent ', () => {
  let component: UBSInputErrorComponent;
  let fixture: ComponentFixture<UBSInputErrorComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule, HttpClientTestingModule],
      declarations: [UBSInputErrorComponent]
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UBSInputErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('checking function calling', () => {
    Object.assign(component, { formElement: { errors: ['required'] } });
    spyOn(component, 'ngOnChanges').and.callThrough();
    component.ngOnChanges();
    expect(component.ngOnChanges).toHaveBeenCalled();
  });

  it('errorMessage should have correct value if we have errors', () => {
    Object.assign(component, { formElement: { errors: { maxlength: { requiredLength: 2 } } } });
    fixture.detectChanges();
    // @ts-ignore
    component.getType();
    // @ts-ignore
    expect(component.errorMessage).toBe(component.validationErrors.maxlengthEntrance);
  });
});
