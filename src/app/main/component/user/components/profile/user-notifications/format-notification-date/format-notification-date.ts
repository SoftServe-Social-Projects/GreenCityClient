import { LocalizedDatePipe } from 'src/app/shared/localized-date-pipe/localized-date.pipe';
import { TranslateService } from '@ngx-translate/core';

export function formatNotificationDate(zonedDateTime: string, timeZone: string = 'Europe/Kyiv', translate: TranslateService): string {
  const localizedDatePipe = new LocalizedDatePipe();
  const formattedDate = localizedDatePipe.transform(zonedDateTime, { fromTimeZone: 'UTC', toTimeZone: timeZone });

  const localDate = new Date(formattedDate);
  const now = new Date(new Date().toLocaleString('en-US', { timeZone }));

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(localDate, now)) {
    return `${translate.instant('homepage.notifications.today')} ${formatTime(localDate)}`;
  }

  if (isSameDay(localDate, yesterday)) {
    return `${translate.instant('homepage.notifications.yesterday')} ${formatTime(localDate)}`;
  }

  return `${formatDate(localDate)}`;
}
