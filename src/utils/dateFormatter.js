import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const safeFormat = (date, formatString) => {
  try {
    return format(date, formatString, { locale: ru });
  } catch (error) {
    console.error('Ошибка при форматировании:', error);
    return '';
  }
};

export const formatDate = (isoString) => safeFormat(parseISO(isoString), 'dd.MM.yyyy');

export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const time = new Date();
  time.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
  return safeFormat(time, 'HH:mm');
};

export const formatDateTime = (isoString) => safeFormat(parseISO(isoString), 'dd.MM.yyyy HH:mm');
