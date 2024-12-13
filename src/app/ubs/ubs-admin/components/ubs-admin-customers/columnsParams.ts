export interface ColumnParam {
  title: ColumnParamTitle;
  width: number;
}

export interface ColumnParamTitle {
  key: string;
  ua: string;
  en: string;
}

export const columnsParams: ColumnParam[] = [
  {
    title: {
      key: 'clientName',
      ua: "Ім'я клієнта",
      en: 'Client name'
    },
    width: 100
  },
  {
    title: {
      key: 'recipientPhone',
      ua: 'Телефон',
      en: 'Phone'
    },
    width: 60
  },
  {
    title: {
      key: 'recipientEmail',
      ua: 'E-mail',
      en: 'E-mail'
    },
    width: 100
  },
  {
    title: {
      key: 'dateOfRegistration',
      ua: 'Дата реєстрації в системі',
      en: 'Registration Date'
    },
    width: 60
  },
  {
    title: {
      key: 'orderDate',
      ua: 'Останнє замовлення',
      en: 'Last order'
    },
    width: 60
  },
  {
    title: {
      key: 'number_of_orders',
      ua: 'К-сть замовлень',
      en: 'Orders'
    },
    width: 50
  },
  {
    title: {
      key: 'violations',
      ua: 'Порушення',
      en: 'Violations'
    },
    width: 50
  },
  {
    title: {
      key: 'currentPoints',
      ua: 'Баланс бонусного рахунку',
      en: 'Bonuses'
    },
    width: 50
  }
];

export const columnsParamsOrders: ColumnParam[] = [
  { title: { key: 'orderDate', ua: 'Дата замовлення', en: 'Order Date' }, width: 100 },
  { title: { key: 'id', ua: '№ замовлення	', en: '№ order	' }, width: 60 },
  { title: { key: 'orderStatus', ua: 'Статус замовлення', en: 'Order status' }, width: 100 },
  { title: { key: 'orderPaymentStatus', ua: 'Статус оплати', en: 'Payment status' }, width: 60 },
  { title: { key: 'amount', ua: 'Сума замовлення', en: 'Order amount' }, width: 60 },
  { title: { key: 'select', ua: 'Вибір', en: 'Select' }, width: 100 },
  { title: { key: 'paymentDate', ua: 'Дата оплати', en: 'Payment date' }, width: 100 },
  { title: { key: 'commentsForOrder', ua: 'Коментар адміністратора', en: 'Admin comment' }, width: 100 },
  { title: { key: 'clientName', ua: "Ім'я клієнта", en: 'Client name' }, width: 100 },
  { title: { key: 'clientPhone', ua: 'Телефон клієнта', en: 'Phone number' }, width: 100 },
  { title: { key: 'clientEmail', ua: 'Email клієнта', en: 'Client email' }, width: 100 },
  { title: { key: 'senderName', ua: "Ім'я відправника", en: 'Sender name' }, width: 100 },
  { title: { key: 'senderPhone', ua: 'Телефон відправника', en: 'Sender phone' }, width: 100 },
  { title: { key: 'senderEmail', ua: 'Email відправника', en: 'Sender email' }, width: 100 },
  { title: { key: 'violationsAmount', ua: 'Кількість порушень клієнта', en: 'Violations' }, width: 100 },
  { title: { key: 'region', ua: 'Область', en: 'Region' }, width: 100 },
  { title: { key: 'city', ua: 'Місто', en: 'City' }, width: 100 },
  { title: { key: 'district', ua: 'Район', en: 'District' }, width: 100 },
  { title: { key: 'address', ua: 'Адреса', en: 'Address' }, width: 100 },
  {
    title: { key: 'commentToAddressForClient', ua: 'Коментар до адреси від клієнта', en: 'Comment to address from the client' },
    width: 100
  },
  { title: { key: 'mixedWaste120L', ua: 'Мікс 120л', en: 'Mix 120l' }, width: 100 },
  { title: { key: 'textileWaste60L', ua: 'Текстиль 60л', en: 'Textile 60l' }, width: 100 },
  { title: { key: 'textileWaste20L', ua: 'Текстиль 20л', en: 'Textile 20l' }, width: 100 },
  { title: { key: 'totalOrderSum', ua: 'Сума замовлення', en: 'Total order sum' }, width: 100 },
  { title: { key: 'orderCertificateCode', ua: 'Номер сертифікату', en: 'Order certificate code' }, width: 100 },
  { title: { key: 'generalDiscount', ua: 'Загальна знижка', en: 'General discount' }, width: 100 },
  { title: { key: 'amountDue', ua: 'Сума до оплати', en: 'Amount due' }, width: 100 },
  {
    title: { key: 'commentForOrderByClient', ua: 'Коментар до замовлення від клієнта', en: 'Comment to the order from the client' },
    width: 100
  },
  { title: { key: 'totalPayment', ua: 'Оплата', en: 'Total payment' }, width: 100 },
  { title: { key: 'dateOfExport', ua: 'Дата вивезення', en: 'Date of export' }, width: 100 },
  { title: { key: 'timeOfExport', ua: 'Час вивезення', en: 'Time of export' }, width: 100 },
  { title: { key: 'idOrderFromShop', ua: 'Номер замовлення з магазину', en: 'Id order from shop' }, width: 100 },
  { title: { key: 'receivingStation', ua: 'Станція приймання', en: 'Receiving station' }, width: 100 },
  { title: { key: 'responsibleCaller', ua: 'Менеджер', en: 'Manager' }, width: 100 },
  { title: { key: 'responsibleLogicMan', ua: 'Логіст', en: 'Logistician' }, width: 100 },
  { title: { key: 'responsibleDriver', ua: 'Водій', en: 'Driver' }, width: 100 },
  { title: { key: 'responsibleNavigator', ua: 'Штурман', en: 'Navigator' }, width: 100 },
  { title: { key: 'blockedBy', ua: 'Ким заблоковано', en: 'Blocked by' }, width: 100 }
];

export const columnsParamsViolations: ColumnParam[] = [
  {
    title: {
      key: 'violationDate',
      ua: 'Дата порушення',
      en: 'Violation date'
    },
    width: 100
  },
  {
    title: {
      key: 'orderId',
      ua: '№ замовлення',
      en: '№ order'
    },
    width: 60
  },
  {
    title: {
      key: 'violationLevel',
      ua: 'Ступінь порушення',
      en: 'Violation level'
    },
    width: 100
  }
];

export const columnsParamsCertificates: ColumnParam[] = [
  {
    title: {
      key: 'select',
      ua: 'Вибір',
      en: 'Select'
    },
    width: 45
  },
  {
    title: {
      key: 'code',
      ua: 'Код',
      en: 'Code'
    },
    width: 164
  },
  {
    title: {
      key: 'certificateStatus',
      ua: 'Статус сертифіката',
      en: 'Sertificate status'
    },
    width: 164
  },
  {
    title: {
      key: 'orderId',
      ua: 'Id замовлення',
      en: 'Order Id'
    },
    width: 164
  },
  {
    title: {
      key: 'initialPointsValue',
      ua: 'Значення',
      en: 'Points'
    },
    width: 164
  },
  {
    title: {
      key: 'expirationDate',
      ua: 'Термін придатності',
      en: 'Expiration date'
    },
    width: 164
  },
  {
    title: {
      key: 'creationDate',
      ua: 'Дата створення',
      en: 'Creation date'
    },
    width: 164
  },
  {
    title: {
      key: 'dateOfUse',
      ua: 'Дата використання',
      en: 'Date ot use'
    },
    width: 164
  }
];
