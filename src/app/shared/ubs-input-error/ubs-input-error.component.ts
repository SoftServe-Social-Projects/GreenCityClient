import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Patterns } from 'src/assets/patterns/patterns';
import { inputsName } from '@global-user/models/error-type.model';

enum errorType {
  email = 'email',
  pattern = 'pattern',
  wrongNumber = 'wrongNumber',
  minlength = 'minlength',
  maxlength = 'maxlength',
  required = 'required',
  newPasswordMatchesOld = 'newPasswordMatchesOld',
  confirmPasswordMistmatch = 'confirmPasswordMistmatch',
  requiredFromDropdown = 'requiredFromDropdown',
  emailExist = 'emailExist'
}

@Component({
  selector: 'app-ubs-input-error',
  templateUrl: './ubs-input-error.component.html',
  styleUrls: ['./ubs-input-error.component.scss']
})
export class UBSInputErrorComponent implements OnInit {
  @Input() public formElement: FormControl;
  @Input() public inputName: string;
  @Input() public fromEmployee: boolean;

  public errorMessage: string | undefined;
  private validationErrors = {
    email: 'input-error.email-wrong',
    emailEmployee: 'input-error.email-required-employee',
    phoneEmployee: 'input-error.phone-required-employee',
    houseNumber: 'input-error.house-number',
    minlength: 'input-error.minlength-short',
    maxlength: 'input-error.max-length',
    maxlengthEntrance: 'input-error.max-length-entrance',
    maxlengthHouse: 'input-error.max-length-house',
    maxlengthHouseCorpus: 'input-error.max-length-house-corpus',
    maxlengthStreet: 'input-error.max-length-street',
    maxlengthComment: 'input-error.max-length-comment',
    maxlengthPassword: 'input-error.max-length-password',
    pattern: 'input-error.pattern',
    required: 'input-error.required',
    wrongName: 'input-error.name-wrong',
    wrongNumber: 'input-error.number-wrong',
    wrongCity: 'input-error.city-wrong',
    wrongHouse: 'input-error.house-wrong',
    wrongCorpus: 'input-error.corpus-wrong',
    wrongEntrance: 'input-error.entrance-wrong',
    numberLength: 'input-error.number-length',
    passwordRequirements: 'input-error.password-requirements',
    newPasswordMatchesOld: 'input-error.newPassword-MatchesOld',
    confirmPasswordMistmatch: 'ubs-client-profile.password-error-confirm',
    requiredFromDropdown: 'personal-info.required-from-dropdown',
    emailExist: 'input-error.email-exist',
    invalidBinotelLink: 'input-error.binotel-link'
  };

  ngOnInit() {
    this.getType();
    this.formElement.valueChanges.pipe().subscribe(() => {
      this.getType();
    });
  }

  getType() {
    Object.values(errorType).forEach((err) => {
      if (this.formElement.errors?.[err]) {
        switch (err) {
          case errorType.required:
            this.errorMessage = this.getRequiredErrorMessage(this.formElement.errors.required, this.inputName);
            break;
          case errorType.pattern:
            this.errorMessage = this.getPatternErrorMessage(this.formElement.errors.pattern.requiredPattern);
            break;
          case errorType.maxlength:
            this.errorMessage = this.getMaxlengthErrorMessage(this.formElement.errors.maxlength.requiredLength);
            break;
          case errorType.wrongNumber:
            this.errorMessage = this.validationErrors.wrongNumber;
            break;
          case errorType.newPasswordMatchesOld:
            this.errorMessage = this.validationErrors.newPasswordMatchesOld;
            break;
          case errorType.confirmPasswordMistmatch:
            this.errorMessage = this.validationErrors.confirmPasswordMistmatch;
            break;
          case errorType.requiredFromDropdown:
            this.errorMessage = this.validationErrors.requiredFromDropdown;
            break;
          case errorType.emailExist:
            this.errorMessage = this.validationErrors.emailExist;
            break;
          default:
            this.errorMessage = this.validationErrors[err];
        }
      }
    });
  }

  getRequiredErrorMessage(required: boolean, inputName: string): string {
    switch (required) {
      case inputName === inputsName.requiredEmailEmployee:
        return this.validationErrors.emailEmployee;
      case inputName === inputsName.requiredPhoneEmployee:
        return this.validationErrors.phoneEmployee;
      case inputName === inputsName.requiredHouseNumber:
        return this.validationErrors.houseNumber;
      default:
        return this.validationErrors.required;
    }
  }

  getPatternErrorMessage(pattern: string): string {
    switch (pattern) {
      case Patterns.ubsWithDigitPattern.toString():
        return this.validationErrors.wrongCity;
      case Patterns.ubsHousePattern.toString():
        return this.validationErrors.wrongHouse;
      case Patterns.ubsCorpusPattern.toString():
        return this.validationErrors.wrongCorpus;
      case Patterns.ubsEntrNumPattern.toString():
        return this.validationErrors.wrongEntrance;
      case Patterns.NamePattern.toString():
        return this.validationErrors.wrongName;
      case Patterns.ubsMailPattern.toString():
        return this.validationErrors.email;
      case Patterns.adminPhone.toString():
        return this.validationErrors.wrongNumber;
      case Patterns.regexpPass.toString():
        return this.validationErrors.passwordRequirements;
      case Patterns.binotelLinkPattern.toString():
        return this.validationErrors.invalidBinotelLink;
      default:
        return this.validationErrors.pattern;
    }
  }

  getMaxlengthErrorMessage(maxlength: number): string {
    switch (maxlength) {
      case 2:
        return this.validationErrors.maxlengthEntrance;
      case 4:
        return this.validationErrors.maxlengthHouseCorpus;
      case 10:
        return this.validationErrors.maxlengthHouse;
      case 20:
        return this.validationErrors.maxlengthPassword;
      case 120:
        return this.validationErrors.maxlengthStreet;
      case 255:
        return this.validationErrors.maxlengthComment;
      default:
        return this.validationErrors.maxlength;
    }
  }
}
