import { ValidatorFn, ValidationErrors, FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { ICourierInfo, IValidationConfig } from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';
import { Bag } from 'src/app/ubs/ubs/models/ubs.interface';
export function uniqueArrayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    const values = control.value as any[];
    const uniqueValues = new Set(values);
    if (uniqueValues.size !== values.length) {
      return { containDuplicates: true };
    }

    return null;
  };
}

export function courierLimitValidator(bags: Bag[], validationConfig: IValidationConfig): ValidatorFn {
  return (group: FormGroup): ValidationErrors | null => {
    const { courierInfo } = validationConfig;
    const filtredBags = bags.filter((el) => el.limitedIncluded);
    if (courierInfo.courierLimit === 'LIMIT_BY_AMOUNT_OF_BAG') {
      return validateAmountLimit(filtredBags, group, validationConfig);
    } else if (courierInfo.courierLimit === 'LIMIT_BY_SUM_OF_ORDER') {
      return validateSumLimit(filtredBags, group, courierInfo);
    }

    return null;
  };
}

function validateAmountLimit(filtredBags: Bag[], group: FormGroup, validationConfig: IValidationConfig): ValidationErrors | null {
  const { courierInfo, isKyiv, currentLang } = validationConfig;
  const orderBagAmount = filtredBags.reduce((amount, bag) => {
    if (group.get(`quantity${bag.id}`)) {
      const quantity = +group.get(`quantity${bag.id}`)?.value;
      amount += quantity;
    }
    return amount;
  }, 0);

  const message = {
    min: `order-details.min-big-bags${isKyiv ? '-kyiv' : ''}`,
    max: `order-details.max-big-bags${isKyiv ? '-kyiv' : ''}`
  };

  return setErrors(filtredBags, courierInfo, orderBagAmount, message, currentLang);
}

function getPackageWord(amount: number, lang: string): string {
  const pluralForms = {
    en: {
      singular: 'package',
      plural: 'packages'
    },
    ua: {
      one: 'пакет',
      few: 'пакети',
      many: 'пакетів'
    }
  };
  if (lang === 'en') {
    return amount === 1 ? pluralForms.en.singular : pluralForms.en.plural;
  }

  const lastDigit = amount % 10;
  const lastTwoDigits = amount % 100;
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return pluralForms.ua.one;
  }
  if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return pluralForms.ua.few;
  }
  return pluralForms.ua.many;
}

function validateSumLimit(filtredBags: Bag[], group: FormGroup, courierInfo: ICourierInfo): ValidationErrors | null {
  const orderSum = filtredBags.reduce((sum, bag) => {
    if (group.get(`quantity${bag.id}`) && bag.price) {
      const quantity = +group.get(`quantity${bag.id}`)?.value;
      sum += quantity * bag.price;
    }
    return sum;
  }, 0);
  const message = { min: 'order-details.min-sum', max: 'order-details.max-sum' };

  return setErrors(filtredBags, courierInfo, orderSum, message);
}

function setErrors(
  filtredBags: Bag[],
  courierInfo: ICourierInfo,
  limitValue: number,
  message,
  currentLang?: string
): ValidationErrors | null {
  const bagsList = filtredBags.map((el) => el.capacity).join(', ');

  if (courierInfo.min && limitValue < courierInfo.min) {
    const bagsWord = currentLang ? getPackageWord(courierInfo.min, currentLang) : undefined;
    return {
      courierLimitError: true,
      message: message.min,
      value: { totalLimit: courierInfo.min, bags: bagsList, ...(bagsWord && { bagsWord }) }
    };
  } else if (courierInfo.max && limitValue > courierInfo.max) {
    const bagsWord = currentLang ? getPackageWord(courierInfo.max, currentLang) : undefined;
    return {
      courierLimitError: true,
      message: message.max,
      value: { totalLimit: courierInfo.max, bags: bagsList, ...(bagsWord && { bagsWord }) }
    };
  }
  return null;
}
