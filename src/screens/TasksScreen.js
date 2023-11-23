import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import { CalendarIcon, TodayIcon } from '../icons';
import AddButton from '../components/AddButton';
import CustomCalendar from '../components/CustomCalendar';
import VerticalCalendar from '../components/VerticalCalendar';
import NewTaskScreen from './NewTaskScreen';
import { isToday, fetchTaskDates, fetchTasksForSelectedDate } from '../utils/tasks';

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

  const updateHeaderTitle = useCallback((date) => {
    setHeaderTitle(isToday(date) ? 'Сегодня' : format(date, 'd MMMM', { locale: ru }));
  }, []);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchTaskDates(setTaskDates);
        await fetchTasksForSelectedDate(selectedDate, setTasks);
        updateHeaderTitle(selectedDate);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Произошла ошибка при загрузке задач.');
      }
    };

    fetchData();
  }, [selectedDate, updateHeaderTitle, tasks]);

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  const handleViewModeToggle = useCallback(() => {
    setViewMode(prevViewMode => (prevViewMode === VIEW_MODES.TODAY ? VIEW_MODES.CALENDAR : VIEW_MODES.TODAY));
  }, []);

  const handleAddButtonPress = useCallback(() => {
    setNewTaskScreenVisible(true);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.taskHeader}>
          <Text style={styles.titleMedium}>
            {viewMode === VIEW_MODES.TODAY ? headerTitle : 'Календарь'}
          </Text>
          <View style={styles.calendarBlock}>
            {viewMode === VIEW_MODES.TODAY ? <Text style={styles.title}>{format(selectedDate, 'MMMM, yyyy', { locale: ru })}</Text> : <Text></Text>}
            <TouchableOpacity onPress={handleViewModeToggle}>
              {viewMode === VIEW_MODES.TODAY ? <CalendarIcon /> : <TodayIcon />}
            </TouchableOpacity>
          </View>
        </View>
        {viewMode === VIEW_MODES.TODAY ? (
          <CustomCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            tasks={tasks}
            taskDates={taskDates}
          />
        ) : (
          <VerticalCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            tasks={tasks}
            taskDates={taskDates}
          />
        )}
        <AddButton onPress={handleAddButtonPress} />
        <Modal
          visible={isNewTaskScreenVisible}
          animationType="slide"
          onRequestClose={() => setNewTaskScreenVisible(false)}
        >
          <NewTaskScreen onClose={() => setNewTaskScreenVisible(false)} />
        </Modal>
      </View>
    </View>
  );
};

export default TasksScreen;
