import { TestBed } from '@angular/core/testing';

import { SocketService } from './socket.service';
import { ChatsService } from '../chats/chats.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { JwtService } from '@global-service/jwt/jwt.service';
import { Title } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('SocketService', () => {
  let service: SocketService;
  const LocalStorageServiceMock = jasmine.createSpyObj('LocalStorageService', ['getUserId']);
  LocalStorageServiceMock.getUserId = () => 1;
  const JwtServiceMock = jasmine.createSpyObj('JwtService', ['getUserRole']);
  JwtServiceMock.getUserRole = () => {
    'USER';
  };
  const mockTranslateService = {
    get: jasmine.createSpy('get').and.returnValue(of('mockTranslation')),
    instant: jasmine.createSpy('instant').and.returnValue('mockTranslation')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatsService,
        JwtService,
        Title,
        { provide: TranslateStore, useClass: TranslateStore },
        { provide: LocalStorageService, useValue: LocalStorageServiceMock },
        { provide: JwtService, useValue: JwtServiceMock },
        { provide: TranslateService, useValue: mockTranslateService }
      ],
      imports: [HttpClientModule, StoreModule.forRoot({})]
    });
    service = TestBed.inject(SocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
