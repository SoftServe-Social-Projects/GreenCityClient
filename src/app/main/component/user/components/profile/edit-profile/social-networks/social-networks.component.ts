import { forwardRef, Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { ControlValueAccessor, NgModel, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { WarningPopUpComponent } from '@shared/components';
import { take } from 'rxjs/operators';
import { Patterns } from 'src/assets/patterns/patterns';
import { ProfileService } from 'src/app/main/component/user/components/profile/profile-service/profile.service';

@Component({
  selector: 'app-social-networks',
  templateUrl: './social-networks.component.html',
  styleUrls: ['./social-networks.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SocialNetworksComponent)
    }
  ]
})
export class SocialNetworksComponent implements ControlValueAccessor, OnInit {
  urlValidationRegex = Patterns.socialMediaPattern;
  showInput = false;
  inputTextValue;
  editedSocialLink: any = false;
  icons: Record<string, string> = {};

  @ViewChild('socialLink') socialLink: NgModel;
  @Input() socialNetworks = [];
  @Output() socialNetworksChange: EventEmitter<any> = new EventEmitter();

  constructor(
    private dialog: MatDialog,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.icons = this.profileService.icons;
  }

  onChange(value: any) {
    // TODO: add functionality to this method
  }

  writeValue(obj: any): void {
    // TODO: add functionality to this method
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    // TODO: add functionality to this method
  }

  setDisabledState?(isDisabled: boolean): void {
    // TODO: add functionality to this method
  }

  onEditLink(link): void {
    this.onChange(link);
    this.onToggleInput(true);
    this.inputTextValue = link.url;
    this.editedSocialLink = link.url;
    this.onFilterSocialLink(link);
  }

  onDeleteLink(link): void {
    this.onChange(link);
    const dialogRef = this.dialog.open(WarningPopUpComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'popup-dialog-container',
      data: {
        popupTitle: 'user.edit-profile.delete-popup.title',
        popupConfirm: 'user.edit-profile.btn.yes',
        popupCancel: 'user.edit-profile.btn.cancel'
      }
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirm) => {
        if (confirm) {
          this.onFilterSocialLink(link);
        }
      });
  }

  private onFilterSocialLink(link) {
    this.socialNetworks = this.socialNetworks.filter((el) => link.url !== el.url);
    this.onEmitSocialNetworksChange();
  }

  onToggleInput(state?: boolean): void {
    if (arguments.length > 0) {
      this.showInput = state;
    } else {
      this.showInput = !this.showInput;
    }
  }

  getSocialImage(socialNetwork: string): string {
    return this.profileService.getSocialImage(socialNetwork);
  }

  onCloseForm(): void {
    if (this.editedSocialLink) {
      this.onAddLink(this.editedSocialLink);
      this.editedSocialLink = false;
    }
    this.onToggleInput(false);
    this.inputTextValue = '';
  }

  getErrorMessage(linkErrors) {
    let result = 'user.edit-profile.input-validation-';
    Object.keys(linkErrors).forEach((error) => {
      result = result + error;
    });
    return result;
  }

  onAddLink(link?) {
    this.onChange(link);
    const value = (link || this.inputTextValue).trim();
    if (this.checkIsUrl(value) && !this.onCheckForExisting(value)) {
      this.socialNetworks.push({
        url: value
      });

      this.onEmitSocialNetworksChange();
      this.editedSocialLink = false;
      this.onCloseForm();
    } else {
      // set error to input if user have same link added
      return this.socialLink.control.setErrors({ 'non-unique': true });
    }
  }

  replaceHttp(str: string) {
    return str.replace(/(https|http):\/\//i, '');
  }

  private onEmitSocialNetworksChange(): void {
    this.socialNetworksChange.emit(this.createArrayWithUrl());
  }

  private checkIsUrl(url: string) {
    return this.urlValidationRegex.test(url);
  }

  private onCheckForExisting(url: string) {
    return this.socialNetworks.some((el) => url === el.url);
  }

  private createArrayWithUrl(arr = this.socialNetworks) {
    const result = [];
    Object.values(arr).forEach((el) => result.push(el.url));
    return result;
  }
}
