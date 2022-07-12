import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Patterns } from 'src/assets/patterns/patterns';

@Injectable({
  providedIn: 'root'
})
export class CreateEditTariffsServicesFormBuilder {
  namePattern = Patterns.NamePattern;

  constructor(private fb: FormBuilder) {}

  createTariffService() {
    return this.fb.group({
      name: new FormControl('', [Validators.required, Validators.pattern(this.namePattern)]),
      englishName: new FormControl('', [Validators.required, Validators.pattern(this.namePattern)]),
      capacity: new FormControl('', [Validators.required, Validators.pattern(Patterns.ubsPrice)]),
      price: new FormControl('', [Validators.required, Validators.pattern(Patterns.ubsPrice)]),
      commission: new FormControl('', [Validators.required, Validators.pattern(Patterns.ubsPrice)]),
      description: new FormControl('', [Validators.required]),
      englishDescription: new FormControl('', [Validators.required, Validators.pattern(this.namePattern)])
    });
  }
}
