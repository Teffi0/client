/**
 * Обрезает время до формата HH:MM.
 * @param {string} time - Время в любом формате.
 * @returns {string} - Время в формате HH:MM.
 */
export const formatTime = (time) => {
    if (!time || typeof time !== 'string' || time.length < 5) {
      return 'Некорректное время';
    }
    return time.slice(0, 5);
  };
  

/**
 * Обрезает строку услуги до указанной длины.
 * @param {string} service - Название услуги.
 * @param {number} maxLength - Максимальная длина строки.
 * @returns {string} - Обрезанная строка услуги.
 */
export const truncateService = (service, maxLength = 36) => {
    if (typeof service !== 'string') return '';
    return service.length > maxLength ? `${service.slice(0, maxLength - 1)}...` : service;
  };
  
/**
 * Форматирует адрес, оставляя только важные части.
 * @param {string} address - Полный адрес.
 * @returns {string} - Форматированный адрес.
 */
export const formatAddress = (address) => {
  const indexOfUl = address.indexOf('ул.');
  return (indexOfUl !== -1 ? address.substring(indexOfUl + 3) : address).split(',').slice(0, 2).join(',');
};
