import React, { useState, useMemo, useCallback, useRef } from 'react';
import { ScrollView, View, PanResponder, Animated, Dimensions } from 'react-native';
import { startOfWeek, endOfWeek, addDays, subWeeks, addWeeks, format, parseISO } from 'date-fns';
import styles from '../styles/styles';
import DayDotsComponent from './DayDotsComponent';
import TasksForSelectedDateComponent from './TasksForSelectedDateComponent';

const screenWidth = Dimensions.get('window').width;

const CustomCalendar = ({ selectedDate, onDateChange, tasks, taskDates }) => {
  const [expandedClients, setExpandedClients] = useState([]);
  const translateX = useRef(new Animated.Value(0)).current;
  const currentWeekRef = useRef();

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx } = gestureState;
      return Math.abs(dx) > 10;
    },
    onPanResponderGrant: () => {
      translateX.setOffset(translateX._value);
      translateX.setValue(0);
    },
    onPanResponderMove: (evt, gestureState) => {
      translateX.setValue(gestureState.dx);
    },
    onPanResponderRelease: (evt, gestureState) => {
      translateX.flattenOffset();
      let newDate = selectedDate;
      let toValue = 0;

      if (gestureState.dx > 50) {
        newDate = subWeeks(selectedDate, 1);
        toValue = screenWidth;
      } else if (gestureState.dx < -50) {
        newDate = addWeeks(selectedDate, 1);
        toValue = -screenWidth;
      }

      Animated.timing(translateX, {
        toValue: toValue,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        translateX.setValue(0);
        if (toValue !== 0) {
          onDateChange(newDate);
        }
      });
    },
  });

  const handleDateChange = useCallback((day) => {
    if (currentWeekRef.current.includes(day)) {
      onDateChange(day);
    } else {
      const isPreviousWeek = currentWeekRef.current[0] > day;
      const newWeek = isPreviousWeek ? subWeeks(day, 1) : addWeeks(day, 1);
      onDateChange(newWeek);
    }
  }, [currentWeekRef.current, onDateChange]);

  const currentWeek = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const daysArray = [];
    for (let day = start; day <= end; day = addDays(day, 1)) {
      daysArray.push(day);
    }
    currentWeekRef.current = daysArray;
    return daysArray;
  }, [selectedDate]);

  const tasksByClient = useMemo(() => {
    const selectedTasks = tasks.filter(task =>
      format(parseISO(task.start_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );

    return selectedTasks.reduce((acc, task) => {
      const client = task.status === 'черновик' ? 'Черновик' : task.fullname_client || 'Неизвестный клиент';
      if (!acc[client]) {
        acc[client] = [];
      }
      acc[client].push(task);
      return acc;
    }, {});
  }, [tasks, selectedDate]);

  const toggleClient = useCallback((client) => {
    setExpandedClients((current) =>
      current.includes(client)
        ? current.filter((c) => c !== client)
        : [...current, client]
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          flexDirection: 'row',
          transform: [{ translateX }],
          marginBottom: 24,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <DayDotsComponent
            days={currentWeek}
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
            taskDates={taskDates}
          />
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}   overScrollMode="never">
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
