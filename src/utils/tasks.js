import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
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
      const formattedDates = response.data.map(dateStr => dateStr.split('T')[0]);
      setTaskDates(formattedDates);
      await AsyncStorage.setItem('taskDates', JSON.stringify(formattedDates));
    } catch (e) {
      console.error('Ошибка при загрузке индекса дат задач: ', e);
      setTasks([]);
    }
  };

export const fetchTasksForSelectedDate = async (selectedDate, setTasks, setHeaderTitle) => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const response = await axios.get(`${SERVER_URL}/tasks`, { params: { date: formattedDate } });
      setTasks(response.data);
      setHeaderTitle(isToday(selectedDate) ? 'Сегодня' : format(selectedDate, 'd MMMM', { locale: ru }));
    } catch (e) {
      console.error('Не удалось загрузить задачи для выбранной даты: ', e);
      setTaskDates([]);
    }
  };