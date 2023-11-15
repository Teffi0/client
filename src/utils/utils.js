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
 * @param {string} fullAddress - Полный адрес.
 * @returns {string} - Форматированный адрес.
 */
export const formatAddress = (fullAddress) => {
  const parts = fullAddress.split(',').map(part => part.trim());
  const streetPart = parts.find(part => part.startsWith('улица'));
  const housePart = parts.find(part => part.match(/^\d+/));

  if (!streetPart || !housePart) return '';

  const street = streetPart.replace('улица', '').trim();
  const house = housePart.trim();

  return `ул.${street}, ${house}`;
};

