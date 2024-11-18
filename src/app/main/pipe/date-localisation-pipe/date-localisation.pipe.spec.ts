import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Language } from 'src/app/main/i18n/Language';

class MockDateLocalisationPipe {
  locale: string;
  constructor(private localStorageService: LocalStorageService) {}

  transform(date: string | Date): string {
    this.locale = this.localStorageService.getCurrentLanguage();
    return new Date(date || Date.now()).toDateString();
  }
}

describe('DateLocalisationPipe', () => {
  let pipe: MockDateLocalisationPipe;
  let localStorageService: jasmine.SpyObj<LocalStorageService>;
  const mockLocale = 'en-US' as Language;

  beforeEach(() => {
    localStorageService = jasmine.createSpyObj('LocalStorageService', ['getCurrentLanguage']);
    localStorageService.getCurrentLanguage.and.returnValue(mockLocale);
    pipe = new MockDateLocalisationPipe(localStorageService);
  });

  it('should create an instance of the pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform date correctly when date is provided', () => {
    const mockDate = new Date('2024-05-25');

    localStorageService.getCurrentLanguage.and.returnValue(mockLocale);
    const transformedDate = pipe.transform(mockDate);

    expect(transformedDate).toBe('Sat May 25 2024');
  });

  it('should transform date correctly when date is not provided with CurrentLanguage', () => {
    localStorageService.getCurrentLanguage.and.returnValue(mockLocale);
    const transformedDate = pipe.transform('');

    expect(transformedDate).toBe(new Date().toDateString());
    expect(localStorageService.getCurrentLanguage).toHaveBeenCalled();
  });
});
