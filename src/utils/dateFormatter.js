// utils/dateFormatter.js
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// Форматирует ISO строку в дату
export const formatDate = (isoString) => {
  try {
    return format(parseISO(isoString), 'dd.MM.yyyy', { locale: ru });
  } catch (error) {
    console.error('Ошибка при форматировании даты:', error);
    return '';
  }
};

export const formatTime = (timeString) => {
    try {
      // Предполагаем, что timeString в формате "HH:mm"
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return format(time, 'HH:mm');
    } catch (error) {
      console.error('Ошибка при форматировании времени:', error);
      return '';
    }
  };

// Форматирует ISO строку в дату и время
export const formatDateTime = (isoString) => {
  try {
    return format(parseISO(isoString), 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch (error) {
    console.error('Ошибка при форматировании даты и времени:', error);
    return '';
  }
};
