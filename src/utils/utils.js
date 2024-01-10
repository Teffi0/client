
export const formatTime = time => time && typeof time === 'string' && time.length >= 5 ? time.slice(0, 5) : 'Некорректное время';

export const truncateService = (service, maxLength = 36) => typeof service === 'string' ? service.length > maxLength ? `${service.slice(0, maxLength - 1)}...` : service : '';

export const formatAddress = fullAddress => {
  const parts = fullAddress.split(',').map(part => part.trim());
  const streetPart = parts.find(part => /улица|ул\./i.test(part));
  const housePart = streetPart ? parts[parts.indexOf(streetPart) + 1] : null;

  return streetPart && housePart ? `ул.${streetPart.replace(/улица|ул\./i, '').trim()}, д.${housePart.replace(/дом|д\./i, '').trim()}` : 'Адрес не найден';
};

export const getServiceName = (service, services) => service.split(',').map(id => services[id.trim()]?.service_name || 'Неизвестная услуга').join(', ');

