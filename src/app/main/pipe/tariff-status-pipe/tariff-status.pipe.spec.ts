import { Language } from 'src/app/main/i18n/Language';
import { TariffStatusPipe } from './tariff-status.pipe';

describe('TariffStatusPipe', () => {
  const pipe = new TariffStatusPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform NEW to ua status', () => {
    expect(pipe.transform('NEW', 'ua')).toBe('Незаповнена');
  });

  it('should transform NEW to en status', () => {
    expect(pipe.transform('NEW', 'en')).toBe('Blank');
  });

  it('should transform ACTIVE to ua status', () => {
    expect(pipe.transform('ACTIVE', 'ua')).toBe('Активно');
  });

  it('should transform ACTIVE to en status', () => {
    expect(pipe.transform('ACTIVE', 'en')).toBe('Active');
  });

  it('should transform NOACTIVE to ua status', () => {
    expect(pipe.transform('NOTACTIVE', 'ua')).toBe('Неактивно');
  });

  it('should transform NOACTIVE to en status', () => {
    expect(pipe.transform('NOTACTIVE', 'en')).toBe('Inactive');
  });
});
