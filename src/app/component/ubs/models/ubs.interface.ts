export interface Bag {
  id: number;
  name?: string;
  capacity?: number;
  price?: number;
  quantity?: number;
}

export interface OrderBag {
  amount: number;
  id: number;
}

export interface OrderDetails {
  bags: Bag[];
  points: number;
  pointsToUse?: number;
  certificates?: any;
  additionalOrders?: any;
  orderComment?: string;
  certificatesSum?: number;
  pointsSum?: number;
  total?: number;
  finalSum?: number;
}

export interface FinalOrder {
  bags: Bag[];
  pointsToUse?: number;
  cerfiticates?: any;
  additionalOrders?: any;
  orderComment?: string;
  personalData?: PersonalData;
  points?: number;
}

export interface ICertificate {
  certificatePoints: number;
  certificateStatus: string;
  // certificateDate: any
}

export interface PersonalData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addressComment: string;
  city: string;
  district: string;
  street: string;
  houseCorpus: string;
  entranceNumber: string;
  houseNumber: string;
  longitude?: number;
  latitude?: number;
}

export interface Address {
  checked: boolean;
  id: number;
  city: string;
  district: string;
  street: string;
  houseCorpus: string;
  entranceNumber: string;
  houseNumber: string;
  longitude?: number;
  latitude?: number;
}
