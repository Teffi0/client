import { format, isToday as fnsIsToday } from 'date-fns';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SERVER_URL = 'http://31.129.101.174';

// Упрощенная функция для проверки сегодняшней даты
export const isToday = (date) => fnsIsToday(date);

// Универсальная функция для запросов к API
async function makeApiRequest(method, url, data = null, params = null) {
  try {
    const response = await axios[method](`${SERVER_URL}${url}`, data, { params });
    return response.data;
  } catch (e) {
    console.error(`Ошибка при запросе к ${url}: `, e);
    throw e;
  }
}

export const fetchTaskDates = async (setTaskDates) => {
  const data = await makeApiRequest('get', '/task-dates');
  setTaskDates(data);
  await AsyncStorage.setItem('taskDates', JSON.stringify(data));
};

export const fetchTasksForSelectedDate = async (selectedDate, setTasks) => {
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const data = await makeApiRequest('get', '/user_tasks', null, { date: formattedDate });
  setTasks(data);
};

export const fetchTasksForDetail = async (setTasks) => {
  const data = await makeApiRequest('get', '/user_tasks');
  setTasks(data);
};

export const fetchServiceNamesByIds = async (serviceIds) => {
  if (typeof serviceIds !== 'string') {
    throw new Error('serviceIds должна быть строкой с идентификаторами, разделенными запятой');
  }
  if (serviceIds.trim().length === 0) {
    return { noServices: 'Услуга не выбрана' };
  }
  const idsArray = serviceIds.split(',').map(id => parseInt(id.trim(), 10));
  const services = await makeApiRequest('post', '/services/names', { ids: idsArray });
  return services.reduce((acc, service) => {
    acc[service.id] = service.service_name;
    return acc;
  }, {});
};

export const fetchDraftData = async (taskId) => {
  return await makeApiRequest('get', `/tasks/draft/${taskId}`);
};

export const fetchTaskParticipants = async (taskId) => {
  const data = await makeApiRequest('get', `/task-participants/${taskId}`);
  if (!Array.isArray(data)) {
    throw new Error("Некорректный формат данных");
  }
  return data;
};

export const fetchTaskDetails = async (taskId, setTask) => {
  const data = await makeApiRequest('get', `/tasks/${taskId}`);
  setTask(data);
};
