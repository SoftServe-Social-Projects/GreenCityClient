import { TestBed } from '@angular/core/testing';
import { AddressService } from './address.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { mainUbsLink } from 'src/app/main/links';

describe('AddressService', () => {
  let service: AddressService;
  let httpMock: HttpTestingController;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
  );

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve Kyiv districts via GET', () => {
    const mockDistricts = [
      { id: 1, name: 'Shevchenkivskyi' },
      { id: 2, name: 'Pecherskyi' },
      { id: 3, name: 'Solomianskyi' }
    ];

    service.getKyivDistricts().subscribe((districts: any[]) => {
      expect(districts).toEqual(mockDistricts);
    });

    const req = httpMock.expectOne(`${mainUbsLink}/ubs/districts-for-kyiv`);
    expect(req.request.method).toBe('GET');

    req.flush(mockDistricts);
  });
});
