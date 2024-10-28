import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Address, CourierLocations, DistrictsDtos } from 'src/app/ubs/ubs/models/ubs.interface';
import { Store } from '@ngrx/store';
import { CreateAddress, DeleteAddress, UpdateAddress } from 'src/app/store/actions/order.actions';
import { CAddressData } from 'src/app/ubs/ubs/models/ubs.model';

@Component({
  selector: 'app-ubs-add-address-pop-up',
  templateUrl: './ubs-add-address-pop-up.component.html',
  styleUrls: ['./ubs-add-address-pop-up.component.scss']
})
export class UBSAddAddressPopUpComponent implements OnInit {
  addAddressForm: FormGroup;
  currentLanguage: string;
  locations: CourierLocations;
  districtList: DistrictsDtos[];
  addressData: CAddressData;

  autocompleteRegionRequest = {
    input: '',
    types: ['administrative_area_level_1'],
    componentRestrictions: { country: 'ua' }
  };

  autocompleteCityRequest = {
    input: '',
    types: ['(cities)'],
    componentRestrictions: { country: 'ua' }
  };

  autocompleteStreetRequest = {
    input: '',
    types: ['address'],
    componentRestrictions: { country: 'ua' }
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UBSAddAddressPopUpComponent>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      edit: boolean;
      address: Address;
      addFromProfile?: boolean;
    }
  ) {}

  get address() {
    return this.addAddressForm.get('address');
  }

  ngOnInit(): void {
    this.addAddressForm = this.fb.group({
      address: ['', Validators.required]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteAddress(): void {
    this.store.dispatch(DeleteAddress({ address: this.data.address }));
    this.dialogRef.close('Deleted');
  }

  addAddress(): void {
    this.data.edit
      ? this.store.dispatch(UpdateAddress({ address: { ...this.data.address, ...this.address.value } }))
      : this.store.dispatch(CreateAddress({ address: this.address.value }));
    this.dialogRef.close('Added');
  }
}
