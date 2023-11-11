import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, PanResponder, ScrollView } from 'react-native';
import { startOfWeek, endOfWeek, addDays, format, isSameDay, parseISO, subWeeks, addWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import TaskComponent from './TaskComponent';
import { ExpandIcon, CollapseIcon } from '../icons';

const CustomCalendar = ({ selectedDate, onDateChange, tasks, taskDates }) => {
  const days = [];
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const end = endOfWeek(selectedDate, { weekStartsOn: 1 });

  for (let day = start; day <= end; day = addDays(day, 1)) {
    days.push(day);
  }

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx } = gestureState;
      return Math.abs(dx) > 10;
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 10) {
        onDateChange(subWeeks(selectedDate, 1));
      } else if (gestureState.dx < -10) {
        onDateChange(addWeeks(selectedDate, 1));
      }
    },
  });
  const isSameDate = (date1, date2) => isSameDay(date1, date2);

  const formatDate = (date) => format(date, 'yyyy-MM-dd');

  const hasTasksForDay = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return taskDates.includes(formattedDate); // Используйте индекс дат для проверки
  };

  const getTwoLetterDayName = (date) => {
    const day = format(date, 'eeee', { locale: ru });
    switch (day) {
      case 'понедельник': return 'Пн';
      case 'вторник': return 'Вт';
      case 'среда': return 'Ср';
      case 'четверг': return 'Чт';
      case 'пятница': return 'Пт';
      case 'суббота': return 'Сб';
      case 'воскресенье': return 'Вс';
      default: return '';
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const renderDayDots = () => {
    return days.map((day) => {
      const hasTasks = hasTasksForDay(day);

      return (
        <TouchableOpacity
          key={format(day, 'yyyy-MM-dd')}
          onPress={() => onDateChange(day)}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 5,
            paddingHorizontal: 5,
            margin: 2,
            borderWidth: 1,
            borderColor: 'white', // или другой цвет по вашему выбору
            borderRadius: 10, // скругление углов
            backgroundColor: '#f9f9f9', // фоновый цвет
            width: 52,
            borderColor: isToday(day) ? 'red' : 'white', // Голубая граница для сегодняшнего дня
            borderWidth: isToday(day) ? 1 : 1, // Утолщенная граница для сегодняшнего дня
          }}
        >
          <Text style={{ fontSize: isSameDate(day, selectedDate) ? 16 : 14, color: isSameDate(day, selectedDate) ? 'red' : 'black' }}>
            {getTwoLetterDayName(day)}
          </Text>
          <Text
            style={
              isSameDate(day, selectedDate)
                ? { fontWeight: 'bold', fontSize: 22, color: 'red' }
                : { fontSize: 20, color: 'black' }
            }
          >
            {format(day, 'd', { locale: ru })}
          </Text>
          <View style={{ backgroundColor: hasTasks ? 'red' : 'transparent', width: 4, height: 4, borderRadius: 2, marginBottom: 2 }} />
        </TouchableOpacity>
      );
    });
  };



  const [expandedClients, setExpandedClients] = useState([]);

  const toggleClient = (client) => {
    if (expandedClients.includes(client)) {
      setExpandedClients(expandedClients.filter((c) => c !== client));
    } else {
      setExpandedClients([...expandedClients, client]);
    }
  };

  const isClientExpanded = (client) => expandedClients.includes(client);

  const renderTasksForSelectedDate = () => {
    const selectedTasks = tasks.filter(task =>
      formatDate(parseISO(task.start_date)) === formatDate(selectedDate)
    );

    if (selectedTasks.length > 0) {
      const tasksByClient = {};

      selectedTasks.forEach((task) => {
        const client = task.fullname_client;
        if (!tasksByClient[client]) {
          tasksByClient[client] = [];
        }
        tasksByClient[client].push(task);
      });

      return Object.keys(tasksByClient).map((client) => (
        <View key={client}>
          <View style={styles.taskFIO}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{client}</Text>
            </View>
            <View style={styles.taskHeaderRight}>
              <TouchableOpacity onPress={() => toggleClient(client)}>
                {isClientExpanded(client) ? (
                  <CollapseIcon />
                ) : (
                  <ExpandIcon />
                )}
              </TouchableOpacity>
            </View>
          </View>
          {isClientExpanded(client) && (
            tasksByClient[client].map((task) => (
              <TaskComponent
                key={task.id}
                status={task.status}
                start_time={task.start_time}
                service={task.service}
                address_client={task.address_client}
                employees={task.employees}
                taskId={task.id}
              />
            ))
          )}
        </View>
      ));
    } else {
      return <Text style={styles.noTasksText}>Нет задач.</Text>;
    }
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View {...panResponder.panHandlers}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{renderDayDots()}</View>
      </View>
      <View style={{ marginTop: 16, marginBottom: 120 }}>{renderTasksForSelectedDate()}</View>
    </ScrollView>
  );
};

export default CustomCalendar;