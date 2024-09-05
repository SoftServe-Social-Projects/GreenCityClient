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
  bonuses = 'return-payment.reqeust-return-bonuses',
  money = 'return-payment.reqeust-return-money'
}
