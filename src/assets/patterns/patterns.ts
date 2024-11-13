/* eslint-disable no-useless-escape */
export const Patterns = {
  linkPattern: /^$|^https?:\/\//,

  NamePattern: /^[ґҐіІєЄїЇА-Яа-яa-zA-Z](?!.*\.$)(?!.*?\.\.)(?!.*?--)(?!.*?'')[-'ʼ’ ґҐіІєЄїЇА-Яа-я\w.]{0,29}$/,
  ServiceNamePattern: /^[ґҐіІєЄїЇА-Яа-яa-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\s]{1,30}$/,
  TarifNamePattern: /^[ґҐіІєЄїЇА-Яа-яa-zA-Z](?!.*\.$)(?!.*?\.\.)(?!.*?)(?!.*?)[-'ʼ’ ґҐіІєЄїЇА-Яа-я+\w.]{0,255}$/,
  NameInfoPattern: /^(?![' -])(?!.*(?:--|''|\s{2,}))[ґҐіІєЄїЇА-Яа-яa-zA-Z '-]{0,30}$/,
  regexpPass: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/,

  Base64Regex: /data:image\/([a-zA-Z]*);base64,([^"]*)/g,

  socialMediaPattern: /^(?:https?:\/\/)?(?:www\.)?([^\s/?]+)\.com(?:[/?][^\s]*)?$/,

  numericAndAlphabetic: /^[A-Za-zА-Яа-яїЇіІєЄёЁ0-9\-\\\/]*$/,

  serteficatePattern: /(?!0000)\d{4}-(?!0000)\d{4}/,
  ubsCommentPattern: /[\S\s]{0,255}/,
  ordersPattern: /^\d{10}$/,
  orderEcoStorePattern: /^\d{1,8}$/,

  // prettier-ignore
  ubsMailPattern:
    /^[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  paymentAmountPattern: '^[0-9]+(.[0-9]{1,2})?$',
  certificateMonthCount: '^[0-9]{1,2}$',
  certificateInitialValue: '^[0-9]{1,4}$',

  ubsPrice: /^\d*[.]?\d{0,2}$/,
  ubsServicePrice: /^[0-9]{1,6}([.,][0-9]{0,2})?$/,
  ubsServiceBasicPrice: /^[0-9.,]{1,8}$/,

  ubsWithDigitPattern: /^[іІєЄїЇёЁa-zA-Zа-яА-Я0-9][іІєЄїЇёЁa-zA-Zа-яА-Я0-9\-,.ʼ'`ʹ)(! ]*$/iu,
  ubsHouseNumberPattern: /^([a-zа-яїєґі0-9]([-,/]?))+$/iu,
  adminPhone: '^\\+?3?8?(0\\d{9})$',

  isTherePlus: /^[+]/,

  isValidURL: /^(ftp|http|https):\/\/[^ "]+$/,

  countriesRestriction: 'Russia|Росія|Россия',

  urlLinkifyPattern: /(\bhttps?:\/\/[^<>\s]+\b)/gi,
  emailLinkifyPattern: /\b[^<>@\s]+@[^<>\s]+\b/gi,
  phoneLinkifyPattern: /\+\d{10,}/g,
  ubsServiceCapacity: /^[1-9]\d{0,2}$/
};

export const Masks = {
  certificateMask: '0000-0000',
  ecoStoreMask: '00000000',
  servicesMask: '000',
  phoneMask: '+{38\\0} (00) 000 00 00'
};
