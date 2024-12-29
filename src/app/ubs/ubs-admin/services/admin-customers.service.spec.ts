import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminCustomersService } from './admin-customers.service';
import { ICustomersTable } from '../models/customers-table.model';
import { environment } from '@environment/environment';

describe('AdminCustomersService', () => {
  let httpMock: HttpTestingController;
  let service: AdminCustomersService;
  let fakeResponse: ICustomersTable;
  const urlMock = environment.ubsAdmin.backendUbsAdminLink + '/management';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AdminCustomersService);
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(window, 'open');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return customers table', () => {
    fakeResponse = {
      currentPage: 0,
      page: ['fake'],
      totalElements: 10,
      totalPages: 3
    };
    service.getCustomers('code', 0, '', '', 10, 'ASC').subscribe((data) => {
      expect(data).toBeDefined();
      expect(data).toEqual(fakeResponse);
    });
    const req = httpMock.expectOne(`${urlMock}/usersAll?pageNumber=0&pageSize=10&columnName=code&&search=&sortingOrder=ASC`);
    expect(req.request.method).toBe('GET');
    req.flush(fakeResponse);
  });

  it('should call http.patch with the correct URL and payload', () => {
    const userId = '123';
    const link = 'https://my.binotel.ua';

    service.addChatLink(userId, link).subscribe();

    const req = httpMock.expectOne(`${urlMock}/addChatLink`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ userId, link });

    req.flush(null);
  });

  it('should return an observable that emits void on success', (done) => {
    const userId = '123';
    const link = 'https://my.binotel.ua';

    service.addChatLink(userId, link).subscribe({
      next: (response) => {
        expect(response).toBeNull();
        done();
      },
      error: () => {
        fail('The observable should not have errored.');
      }
    });

    const req = httpMock.expectOne(`${urlMock}/addChatLink`);
    req.flush(null);
  });

  it('should handle errors and pass them to the caller', (done) => {
    const userId = '123';
    const link = 'https://my.binotel.ua';
    const errorMessage = 'Failed to add chat link';

    service.addChatLink(userId, link).subscribe({
      next: () => {
        fail('The observable should have errored out.');
      },
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.error).toBe(errorMessage);
        done();
      }
    });

    const req = httpMock.expectOne(`${urlMock}/addChatLink`);
    req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should open a new tab with the provided chat URL', () => {
    const chatUrl = 'https://my.binotel.ua';
    service.openChat(chatUrl);
    expect(window.open).toHaveBeenCalledWith(chatUrl, '_blank');
  });

  it('should not call window.open if the URL is an empty string', () => {
    const chatUrl = '';
    service.openChat(chatUrl);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should not call window.open if the URL is undefined', () => {
    const chatUrl = undefined as unknown as string;
    service.openChat(chatUrl);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should not call window.open if the URL is null', () => {
    const chatUrl = null as unknown as string;
    service.openChat(chatUrl);
    expect(window.open).not.toHaveBeenCalled();
  });
});
