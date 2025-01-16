import { FormGroup, ValidationErrors } from '@angular/forms';
import { Language } from 'src/app/main/i18n/Language';
import { Address } from 'src/app/ubs/ubs/models/ubs.interface';

export function addressAlreadyExistsValidator(
  addresses: Address[],
  currentLanguage: Language
): (group: FormGroup) => ValidationErrors | null {
  return (group: FormGroup): ValidationErrors | null => {
    const isAlreadyExist = addresses.some(
      (address: Address) =>
        getLangValue(address.region, address.regionEn, currentLanguage) === group.controls?.region.value &&
        getLangValue(address.city, address.cityEn, currentLanguage) === group.controls?.city.value &&
        getLangValue(address.street, address.streetEn, currentLanguage) === group.controls?.street.value &&
        address.houseNumber === group.controls?.houseNumber.value &&
        compareIfExist(group.controls?.houseCorpus.value, address.houseCorpus) &&
        compareIfExist(group.controls?.entranceNumber.value, address.entranceNumber) &&
        compareIfExist(group.controls?.addressComment.value, address.addressComment) &&
        (address.district === group.controls?.district.value?.nameUa ||
          address.districtEn === group.controls?.district.value?.nameEn ||
          address.district === group.controls?.district.value ||
          address.districtEn === group.controls?.district.value)
    );

    return isAlreadyExist ? { addressAlreadyExists: true } : null;
  };
}

function getLangValue(valUA: any, valEN: any, currentLanguage: Language): any {
  return currentLanguage === Language.EN ? valEN : valUA;
}

function compareIfExist(value: any, compareTo: any): boolean {
  if (!value) {
    return true;
  }

  return value === compareTo;
}
