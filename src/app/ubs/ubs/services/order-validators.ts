import { ValidatorFn, ValidationErrors, FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { ICourierInfo } from 'src/app/ubs/ubs-admin/models/ubs-admin.interface';
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

export function courierLimitValidator(bags: Bag[], courierInfo: ICourierInfo, currentLang: string, isKyiv: boolean): ValidatorFn {
  return (group: FormGroup): ValidationErrors | null => {
    const filtredBags = bags.filter((el) => el.limitedIncluded);
    if (courierInfo.courierLimit === 'LIMIT_BY_AMOUNT_OF_BAG') {
      return validateAmountLimit(filtredBags, group, courierInfo, currentLang, isKyiv);
    } else if (courierInfo.courierLimit === 'LIMIT_BY_SUM_OF_ORDER') {
      return validateSumLimit(filtredBags, group, courierInfo);
    }

    return null;
  };
}

function validateAmountLimit(
  filtredBags: Bag[],
  group,
  courierInfo: ICourierInfo,
  currentLang: string,
  isKyiv: boolean
): ValidationErrors | null {
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
  if (lang === 'en') {
    return amount === 1 ? 'packege' : 'packeges';
  }
  if (amount % 10 === 1 && amount % 100 !== 11) {
    return 'пакет';
  } else if ([2, 3, 4].includes(amount % 10) && ![12, 13, 14].includes(amount % 100)) {
    return 'пакети';
  } else {
    return 'пакетів';
  }
}

function validateSumLimit(filtredBags: Bag[], group, courierInfo: ICourierInfo): ValidationErrors | null {
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
