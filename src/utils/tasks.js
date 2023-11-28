import { format } from 'date-fns';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SERVER_URL = 'http://31.129.101.174';

export const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export const fetchTaskDates = async (setTaskDates) => {
  try {
    const response = await axios.get(`${SERVER_URL}/task-dates`);
    setTaskDates(response.data); // Прямо сохраняем данные из ответа сервера
    await AsyncStorage.setItem('taskDates', JSON.stringify(response.data));
  } catch (e) {
    console.error('Ошибка при загрузке индекса дат задач: ', e);
    setTaskDates({});
  }
};



export const fetchTasksForSelectedDate = async (selectedDate, setTasks) => {
  try {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const response = await axios.get(`${SERVER_URL}/tasks`, { params: { date: formattedDate } });
    setTasks(response.data);
  } catch (e) {
    console.error('Не удалось загрузить задачи для выбранной даты: ', e);
    setTasks([]);
  }
};

export const fetchTasksForDetail = async (setTasks) => {
  try {
    const response = await axios.get(`${SERVER_URL}/tasks`);
    setTasks(response.data);
  } catch (e) {
    console.error('Не удалось загрузить задачи для выбранной даты: ', e);
    setTasks([]);
  }
};

export const fetchServiceNamesByIds = async (serviceIds) => {
  try {
    if (typeof serviceIds !== 'string') {
      throw new Error('serviceIds должна быть строкой с идентификаторами, разделенными запятой');
    }

    // Проверка, есть ли выбранные услуги
    if (serviceIds.trim().length === 0) {
      return { noServices: 'Услуга не выбрана' };
    }

    // Преобразуем строку в массив чисел
    const idsArray = serviceIds.split(',').map(id => parseInt(id.trim(), 10));
    const response = await axios.post(`${SERVER_URL}/services/names`, { ids: idsArray });

    // Возвращаем объект с названиями услуг, индексированный по ID услуг
    return response.data.reduce((acc, service) => {
      acc[service.id] = service.service_name;
      return acc;
    }, {});
  } catch (e) {
    console.error('Ошибка при загрузке названий услуг: ', e);
    return {};
  }
};

export const fetchDraftData = async (taskId) => {
  try {
    const response = await axios.get(`${SERVER_URL}/tasks/draft/${taskId}`);
    return response.data;
  } catch (error) {
    // Здесь можно более тонко обработать ошибку, возможно, даже возвращать разные ошибки в зависимости от статуса ответа сервера
    console.error('Ошибка при получении данных черновика:', error);
    throw error;
  }
};

export const fetchTaskParticipants = async (taskId) => {
  try {
    const response = await axios.get(`http://31.129.101.174/task-participants/${taskId}`);
    if (response.data && Array.isArray(response.data)) {
      console.log(response.data);
      return response.data; // Убедитесь, что это массив
    } else {
      throw new Error("Некорректный формат данных");
    }
  } catch (error) {
    console.error('Ошибка при получении участников:', error);
    throw error; // Перебрасываем ошибку дальше
  }
};

export const fetchTaskDetails = async (taskId) => {
  try {
    // Загрузка данных о задаче
    const response = await axios.get(`${SERVER_URL}/tasks/${taskId}`);
    setTask(response.data);
  } catch (error) {
    console.error('Ошибка при загрузке деталей задачи:', error);
  }
};