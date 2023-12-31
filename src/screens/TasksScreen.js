import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import { CalendarIcon, TodayIcon } from '../icons';
import AddButton from '../components/AddButton';
import CustomCalendar from '../components/CustomCalendar';
import VerticalCalendar from '../components/VerticalCalendar';
import NewTaskScreen from './NewTaskScreen';
import { isToday, fetchTaskDates, fetchTasksForSelectedDate } from '../utils/tasks';
import { taskEventEmitter } from '../Events'; 

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

  const renderCalendar = () => (
    viewMode === VIEW_MODES.TODAY
      ? <CustomCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} tasks={tasks} taskDates={taskDates} />
      : <VerticalCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} tasks={tasks} taskDates={taskDates}  renderAddButton={renderAddButton}/>
  );

  const renderAddButton = () => (
    <AddButton onPress={handleAddButtonPress} />
  );
  
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
            <TouchableOpacity onPress={handleViewModeToggle}>
              {viewMode === VIEW_MODES.TODAY ? <CalendarIcon /> : <TodayIcon />}
            </TouchableOpacity>
          </View>
        </View>
        {renderCalendar()}
        {viewMode === VIEW_MODES.TODAY && <AddButton onPress={() => setNewTaskScreenVisible(true)} />}
      </View>
      <Modal visible={isNewTaskScreenVisible} onRequestClose={() => setNewTaskScreenVisible(false)}>
        <NewTaskScreen onClose={() => setNewTaskScreenVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
};

export default TasksScreen;