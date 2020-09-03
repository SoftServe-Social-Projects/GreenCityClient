import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CancelPopUpComponent } from '@shared/components/cancel-pop-up/cancel-pop-up.component';
import { EditProfileFormBuilder } from '@global-user/components/profile/edit-profile/edit-profile-form-builder';
import { EditProfileService } from '@global-user/services/edit-profile.service';
import { ProfileService } from '@global-user/components/profile/profile-service/profile.service';
import { EditProfileDto } from '@user-models/edit-profile.model';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  public editProfileForm = null;
  public userInfo = {
    id: 0,
    avatarUrl: './assets/img/profileAvatarBig.png',
    name: {
      first: 'Brandier',
      last: 'Webb',
    },
    location: 'Lviv',
    status: 'online',
    rate: 658,
    userCredo:
      'My Credo is to make small steps that leads to huge impact. Let’s change the world together.',
  };

  constructor(private dialog: MatDialog,
              public builder: EditProfileFormBuilder,
              private editProfileService: EditProfileService,
              private profileService: ProfileService,
              private router: Router) {}

  ngOnInit() {
    this.setupInitialValue();
    this.getInitialValue();
  }

  private setupInitialValue() {
    this.editProfileForm = this.builder.getProfileForm();
  }

  private getInitialValue(): void {
    this.profileService.getUserInfo().pipe(
      take(1)
    )
      .subscribe(data => {
        if (data) {
          this.setupExistingData(data);
        }
      });
  }

  private setupExistingData(data) {
    this.editProfileForm = this.builder.getEditProfileForm(data);
  }

  public onSubmit(): void {
   this.sendFormData(this.editProfileForm);
  }

  public sendFormData(form): void {
    // const body: EditProfileDto = {
    //   city: form.value.city,
    //   firstName: form.value.name,
    //   userCredo: form.value.title,
    //   showLocation: form.value.showLocation,
    //   showEcoPlace: form.value.showEcoPlace,
    //   showShoppingList: form.value.showShoppingList
    // };
    // const formData = new FormData();
    // formData.append('userProfileDtoRequest ', JSON.stringify(body));

    this.editProfileService.postDataUserProfile(form).subscribe(
      () => {
        this.router.navigate(['profile', this.profileService.userId]);
      }, (er) => {
        console.log(er.message)
      }
    );
  }

  public openCancelPopup(): void {
    this.dialog.open(CancelPopUpComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: {
        currentPage: 'edit profile'
      }
    });
  }
}
