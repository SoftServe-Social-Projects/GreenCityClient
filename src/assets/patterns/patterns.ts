export const Patterns = {
  linkPattern: /^$|^https?:\/\//,

  NamePattern: /^(?!\.)(?!.*\.$)(?!.*?\.\.)[іІєЄїЇёЁa-zA-Zа-яА-Я0-9.\ '’-]{6,30}$/,

  regexpName: /^(?!\.)(?!.*\.$)(?!.*?\.\.)[A-Z0-9_.]{6,29}$/gi,
  regexpPass: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/,

  Base64Regex: /data:image\/([a-zA-Z]*);base64,([^"]*)/g,

  profileCityPattern: /^[іІєЄїЇёЁa-zA-Zа-яА-Я][іІєЄїЇёЁa-zA-Zа-яА-Я\-,’)( ]*$/,

  ubsCorpusPattern: /^[A-Za-zА-Яа-яїЇіІєЄёЁ0-9]{1,4}$/,
  ubsHousePattern: /^[A-Za-zА-Яа-яїЇіІєЄёЁ0-9\.\-\/\,\\]+$/,
  ubsEntrNumPattern: /^([1-9]\d*)?$/,

  serteficatePattern: /(?!0000)\d{4}-(?!0000)\d{4}/,
  ubsCommentPattern: /^[i\s]{0,255}(.){0,255}[i\s]{0,255}$/,
  ordersPattern: /^\d{10}$/,

  ubsMailPattern: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,

  paymantAmountPattern: '^[0-9]+$',
  sertificateMonthCount: '^[0-9]{1,2}$',
  sertificateInitialValue: '^[0-9]{2,4}$',

  ubsPrice: '[0-9]{1,3}',

  ubsCityPattern: /^([a-zа-яїєґі '-]){1,30}/iu,
  ubsWithDigitPattern: /^([a-zа-яїєґі0-9 '-])+$/iu,

  adminPhone: '^\\+?3?8?(0\\d{9})$'
};

export const Masks = {
  certificateMask: '0000-0000',
  ecoStoreMask: '0000000000',
  servicesMask: '000',
  phoneMask: '+{38\\0} (00) 000 00 00'
};
