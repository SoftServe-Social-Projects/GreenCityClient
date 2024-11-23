import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function timeValidator(upperTimeLimit: string): ValidatorFn {
  return (form: FormGroup): ValidationErrors | null => {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const startTime = form.get('startTime')?.value;
    const endTime = form.get('endTime')?.value;

    const startTValid = regex.test(startTime);
    const endTValid = regex.test(endTime);

    if (startTValid && endTValid) {
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);
      const upperMinutes = timeToMinutes(upperTimeLimit);

      if (startMinutes >= endMinutes || startMinutes < upperMinutes || endMinutes <= upperMinutes) {
        form.get('startTime')?.setErrors({ invalidTime: true });
        form.get('endTime')?.setErrors({ invalidTime: true });
        return { invalidTime: true };
      }

      form.get('startTime')?.setErrors(null);
      form.get('endTime')?.setErrors(null);
      return null;
    }

    if (!startTValid) {
      form.get('startTime')?.setErrors({ invalidTimeFormat: true });
    }

    if (!endTValid) {
      form.get('endTime')?.setErrors({ invalidTimeFormat: true });
    }

    return { invalidTimeFormat: true };
  };
}

function timeToMinutes(timeString: string): number {
  const timeParts = timeString.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  return hours * 60 + minutes;
}
