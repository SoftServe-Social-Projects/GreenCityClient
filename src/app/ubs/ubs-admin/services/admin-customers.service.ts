import { ICustomerViolationTable } from '../models/customer-violations-table.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICustomersTable } from '../models/customers-table.model';
import { ICustomerOrdersTable } from '../models/customer-orders-table.model';
import { environment } from '@environment/environment.js';

@Injectable({
  providedIn: 'root'
})
export class AdminCustomersService {
  url = environment.ubsAdmin.backendUbsAdminLink + '/management';

  constructor(private readonly http: HttpClient) {}

  getCustomers(clmn: string, page?: number, fltr?: string, search?: string, size?: number, sortType?: string): Observable<ICustomersTable> {
    return this.http.get<ICustomersTable>(
      `${this.url}/usersAll?pageNumber=${page}&pageSize=${size}&columnName=${clmn}&${fltr}&search=${search}&sortingOrder=${sortType}`
    );
  }

  getCustomerOrders(id: string, page: number, column: string, sortingType: string): Observable<ICustomerOrdersTable> {
    if (column === 'amount') {
      column = 'payment.amount';
    }

    return this.http.get<ICustomerOrdersTable>(`${this.url}/${id}/ordersAll?page=${page}&column=${column}&sortingType=${sortingType}`);
  }

  getCustomerViolations(id: string, page: number, column: string, sortingType: string): Observable<ICustomerViolationTable> {
    const query = `?page=${page}&size=10&columnName=${column}&sortingOrder=${sortingType}`;
    return this.http.get<ICustomerViolationTable>(`${this.url}/${id}/violationsAll${query}`);
  }

  addChatLink(userId: string, link: string): Observable<void> {
    return this.http.patch<void>(`${this.url}/addChatLink`, { userId, link });
  }

  openChat(chatUrl: string) {
    chatUrl && window.open(chatUrl, '_blank');
  }
}
