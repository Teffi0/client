import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, subYears, getYear } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import { CalendarIcon, TodayIcon } from '../icons';
import AddButton from '../components/AddButton';
import CustomCalendar from '../components/CustomCalendar';
import VerticalCalendar from '../components/VerticalCalendar';
import NewTaskScreen from './NewTaskScreen';
import { isToday, fetchTaskDates, fetchTasksForSelectedDate } from '../utils/tasks';
import { taskEventEmitter } from '../Events';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIEW_MODES = {
  TODAY: 'today',
  CALENDAR: 'calendar',
};

const TasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [taskDates, setTaskDates] = useState([]);
  const [isNewTaskScreenVisible, setNewTaskScreenVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(VIEW_MODES.TODAY);
  const [headerTitle, setHeaderTitle] = useState(format(selectedDate, 'd MMMM', { locale: ru }));
  const [isUserResponsible, setIsUserResponsible] = useState(false);
  const [currentYear, setCurrentYear] = useState(getYear(new Date())); // Текущий год
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const checkIfUserIsResponsible = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      // Замените URL на ваш серверный API для проверки
      const response = await fetch(`http://31.129.101.174/responsibles/check/${userId}`);
      const data = await response.json();

      setIsUserResponsible(data.isResponsible);
    } catch (error) {
      console.error('Ошибка при проверке ответственности:', error);
    }
  };

  useEffect(() => {
    checkIfUserIsResponsible();
  }, []);

  const fetchData = async () => {
    try {
      await fetchTaskDates(setTaskDates);
      await fetchTasksForSelectedDate(selectedDate, setTasks);
      setHeaderTitle(isToday(selectedDate) ? 'Сегодня' : format(selectedDate, 'd MMMM', { locale: ru }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchData();
    taskEventEmitter.on('taskUpdated', fetchData);
    return () => taskEventEmitter.off('taskUpdated', fetchData);
  }, [selectedDate]);

  const handleViewModeToggle = useCallback(() => {
    setViewMode(prevMode => prevMode === VIEW_MODES.TODAY ? VIEW_MODES.CALENDAR : VIEW_MODES.TODAY);
  }, []);

  const handleYearChange = (year) => { // Добавляем функцию для обработки изменения года
    setSelectedYear(year);
  };

  const renderCalendar = () => (
    viewMode === VIEW_MODES.TODAY
      ? <CustomCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} tasks={tasks} taskDates={taskDates} />
      : <VerticalCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} tasks={tasks} taskDates={taskDates} renderAddButton={renderAddButton} selectedYear={selectedYear} onYearChange={handleYearChange} />
  );

  const renderAddButton = () => {
    return isUserResponsible ? <AddButton onPress={handleAddButtonPress} /> : null;
  };

  const handleAddButtonPress = useCallback(() => {
    setNewTaskScreenVisible(true);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.taskHeader}>
          <Text style={styles.titleMedium}>{viewMode === VIEW_MODES.TODAY ? headerTitle : 'Календарь'}</Text>
          <View style={styles.calendarBlock}>
            {viewMode === VIEW_MODES.TODAY && <Text style={styles.title}>{format(selectedDate, 'MMMM, yyyy', { locale: ru })}</Text>}
            {viewMode === VIEW_MODES.CALENDAR && (
              <Picker
                selectedValue={selectedYear}
                style={{ height: 50, width: 150 }}
                onValueChange={(itemValue) => handleYearChange(itemValue)}
              >
                <Picker.Item label={`${currentYear - 2}`} value={currentYear - 2} />
                <Picker.Item label={`${currentYear - 1}`} value={currentYear - 1} />
                <Picker.Item label={`${currentYear}`} value={currentYear} />
              </Picker>
            )}
            <TouchableOpacity onPress={handleViewModeToggle}>
              {viewMode === VIEW_MODES.TODAY ? <CalendarIcon /> : <TodayIcon />}
            </TouchableOpacity>
          </View>
        </View>
        {renderCalendar()}
        {viewMode === VIEW_MODES.TODAY && renderAddButton()}
      </View>
      <Modal visible={isNewTaskScreenVisible} onRequestClose={() => setNewTaskScreenVisible(false)}>
        <NewTaskScreen onClose={() => setNewTaskScreenVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
};

export default TasksScreen;