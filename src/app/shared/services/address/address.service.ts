import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DistrictsDtos } from '@ubs/ubs/models/ubs.interface';
import { Observable } from 'rxjs';
import { mainUbsLink } from 'src/app/main/links';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  constructor(private readonly http: HttpClient) {}

  getKyivDistricts(): Observable<DistrictsDtos[]> {
    return this.http.get<DistrictsDtos[]>(`${mainUbsLink}/ubs/districts-for-kyiv`);
  }
}
