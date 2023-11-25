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
  
  // Ищем часть с улицей
  const streetPart = parts.find(part => /улица/i.test(part)) || parts.find(part => /ул\./i.test(part));

  // Ищем часть с номером дома, предполагается, что номер дома идет после названия улицы
  const houseIndex = streetPart ? parts.indexOf(streetPart) + 1 : -1;
  const housePart = houseIndex > -1 && houseIndex < parts.length ? parts[houseIndex] : null;
  
  if (!streetPart || !housePart) return 'Адрес не найден';

  // Очищаем названия улицы и номер дома от лишних слов
  const street = streetPart.replace(/улица/i, '').replace(/ул\./i, '').trim();
  const house = housePart.replace(/дом/i, '').replace(/д\./i, '').trim();

  return `ул.${street}, д.${house}`;
};

/**
 * Преобразует строку услуги в название услуги, используя объект services.
 * @param {string} service - Строка услуги.
 * @param {Object} services - Объект, содержащий соответствия между ID услуги и её названием.
 * @returns {string} - Название услуги.
 */
export const getServiceName = (service, services) => {
  // Предполагаем, что service - это строка с ID услуги, разделенными запятыми.
  const serviceIds = service.split(',').map(id => id.trim());
  const serviceNames = serviceIds.map(id => services[id]?.service_name || 'Неизвестная услуга');
  return serviceNames.join(', ');
};
