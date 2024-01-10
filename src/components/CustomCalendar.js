import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, View, PanResponder, Animated, Dimensions } from 'react-native';
import { startOfWeek, endOfWeek, addDays, subWeeks, addWeeks, format, parseISO } from 'date-fns';
import styles from '../styles/styles';
import DayDotsComponent from './DayDotsComponent';
import TasksForSelectedDateComponent from './TasksForSelectedDateComponent';

const screenWidth = Dimensions.get('window').width;

const CustomCalendar = ({ selectedDate, onDateChange, tasks, taskDates }) => {
  const [expandedClients, setExpandedClients] = useState(new Set());
  const translateX = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    translateX.setValue(0);
  }, []);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, { dx }) => Math.abs(dx) > 10,
    onPanResponderGrant: () => {
      translateX.setOffset(translateX._value);
      translateX.setValue(0);
    },
    onPanResponderMove: (_, { dx }) => translateX.setValue(dx),
    onPanResponderRelease: (_, { dx }) => {
      translateX.flattenOffset();
      let newDate = dx > 50 ? subWeeks(selectedDate, 1) : (dx < -50 ? addWeeks(selectedDate, 1) : selectedDate);
      let toValue = dx > 50 ? screenWidth : (dx < -50 ? -screenWidth : 0);

      Animated.timing(translateX, {
        toValue: toValue,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        if (toValue !== 0) {
          onDateChange(newDate);
        }
        translateX.setValue(0);
      });
    },
  }), [selectedDate, translateX]);

  const handleDateChange = useCallback((day) => {
    onDateChange(day);
  }, [onDateChange]);

  const currentWeek = useMemo(() => {
    const start = startOfWeek(selectedDate);
    const end = endOfWeek(selectedDate);
    return Array.from({length: 7}, (_, index) => addDays(start, index));
  }, [selectedDate]);

  const tasksByClient = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const client = task.status === 'черновик' ? 'Черновик' : task.fullname_client || 'Неизвестный клиент';
      const formattedDate = format(parseISO(task.start_date), 'yyyy-MM-dd');
      if (formattedDate === format(selectedDate, 'yyyy-MM-dd')) {
        if (!acc[client]) acc[client] = [];
        acc[client].push(task);
      }
      return acc;
    }, {});
  }, [tasks, selectedDate]);

  const toggleClient = useCallback((client) => {
    setExpandedClients((current) => {
      const updated = new Set(current);
      if (updated.has(client)) {
        updated.delete(client);
      } else {
        updated.add(client);
      }
      return updated;
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        {...panResponder.panHandlers}
        style={{ flexDirection: 'row', transform: [{ translateX }], marginBottom: 24 }}
      >
        <DayDotsComponent
          days={currentWeek}
          onDateChange={handleDateChange}
          selectedDate={selectedDate}
          taskDates={taskDates}
        />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never">
        <TasksForSelectedDateComponent
          tasksByClient={tasksByClient}
          expandedClients={expandedClients}
          toggleClient={toggleClient}
        />

      </ScrollView>
    </View>
  );
};

export default CustomCalendar;
