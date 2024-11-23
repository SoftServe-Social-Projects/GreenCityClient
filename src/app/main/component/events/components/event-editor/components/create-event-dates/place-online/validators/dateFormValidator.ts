import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateFormValidator(): ValidatorFn {
  return (form: FormGroup): ValidationErrors | null => {
    const place: string = form.get('place').value;

    const onlineLink: Date = form.get('onlineLink').value;
    if (place || onlineLink) {
      return null;
    }
    return { hasOneValuePresent: false };
  };
}
