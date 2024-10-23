import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mainUbsLink } from 'src/app/main/links';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  constructor(private http: HttpClient) {}

  getKyivDistricts(): Observable<[]> {
    return this.http.get<[]>(`${mainUbsLink}/ubs/districts-for-kyiv`);
  }
}
