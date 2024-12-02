export enum OrderStatus {
  FORMED = 'FORMED',
  CANCELED = 'CANCELED',
  ON_THE_ROUTE = 'ON_THE_ROUTE',
  CONFIRMED = 'CONFIRMED',
  NOT_TAKEN_OUT = 'NOT_TAKEN_OUT',
  BROUGHT_IT_HIMSELF = 'BROUGHT_IT_HIMSELF',
  DONE = 'DONE',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum OrderStatusNamesEn {
  CANCELED = 'Canceled',
  FORMED = 'Formed',
  CONFIRMED = 'Confirmed',
  BROUGHT_IT_HIMSELF = 'Brought it himself',
  ADJUSTMENT = 'Adjustment',
  ON_THE_ROUTE = 'On the route',
  NOT_TAKEN_OUT = 'Not taken out',
  DONE = 'Done'
}

export enum OrderStatusNamesUa {
  CANCELED = 'Скасовано',
  FORMED = 'Сформовано',
  CONFIRMED = 'Підтверджено',
  BROUGHT_IT_HIMSELF = 'Привезе сам',
  ADJUSTMENT = 'Узгодження',
  ON_THE_ROUTE = 'На маршруті',
  NOT_TAKEN_OUT = 'Не вивезли',
  DONE = 'Виконано'
}

export enum PaymnetStatus {
  PAID = 'PAID',
  HALF_PAID = 'HALF_PAID',
  UNPAID = 'UNPAID',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED'
}

export enum CancellationReason {
  DELIVERED_HIMSELF = 'DELIVERED_HIMSELF',
  MOVING_OUT = 'MOVING_OUT',
  OUT_OF_CITY = 'OUT_OF_CITY',
  DISLIKED_SERVICE = 'DISLIKED_SERVICE',
  OTHER = 'OTHER'
}

export enum PaymentEnrollment {
  receiptLink = 'Enrollment to the bonus account'
}
