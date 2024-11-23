import { MatDateFormats } from '@angular/material/core';

export const MAT_MOMENT_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'l'
  },
  display: {
    dateInput: 'l',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};
