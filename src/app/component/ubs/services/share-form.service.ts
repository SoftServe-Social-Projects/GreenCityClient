import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IUserOrder } from '../components/order-details-form/shared/userOrder.interface';
import { FinalOrder } from '../models/finalOrder.interface';

@Injectable({
  providedIn: 'root'
})
export class ShareFormService {

  public objectSource = new Subject<IUserOrder>();
  public finalObject = new Subject<FinalOrder>();
  public billObjectSource = new Subject<{}>();

  constructor() { }

  changeObject(order: IUserOrder) {
    this.objectSource.next(order);
  }

  thirdStepObject(order: FinalOrder) {
    this.finalObject.next(order);
  }

  finalBillObject(order) {
    this.billObjectSource.next(order);
  }

}
