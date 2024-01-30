import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, PanResponder, Animated, Dimensions, ScrollView } from 'react-native';
import { startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, format, parseISO } from 'date-fns';
import styles from '../styles/styles';
import DayDotsComponent from './DayDotsComponent';
import TasksForSelectedDateComponent from './TasksForSelectedDateComponent';

const screenWidth = Dimensions.get('window').width;

const CustomCalendar = ({ selectedDate, onDateChange, tasks, taskDates }) => {
  const [expandedClients, setExpandedClients] = useState(new Set());
  const translateX = useMemo(() => new Animated.Value(0), []);
  const [currentWeekDate, setCurrentWeekDate] = useState(selectedDate);

  useEffect(() => {
    setCurrentWeekDate(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  }, [selectedDate]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
    onPanResponderGrant: () => {
      translateX.stopAnimation(); // Остановка текущей анимации
      translateX.setOffset(0);    // Сброс смещения
      translateX.setValue(0);     // Сброс значения
    },    
    onPanResponderMove: (_, { dx }) => {
      Animated.timing(translateX, {
        toValue: dx,
        duration: 0, // Мгновенное обновление положения
        useNativeDriver: true
      }).start();
    },    
    onPanResponderRelease: (_, { dx }) => {
      translateX.flattenOffset();
      let newWeekDate;
      let toValue;
    
      if (dx > 50) { // Свайп вправо
        newWeekDate = subWeeks(currentWeekDate, 1);
        toValue = screenWidth;
      } else if (dx < -50) { // Свайп влево
        newWeekDate = addWeeks(currentWeekDate, 1);
        toValue = -screenWidth;
      } else {
        newWeekDate = currentWeekDate;
        toValue = 0;
      }
    
      Animated.timing(translateX, {
        toValue: toValue,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        if (toValue !== 0) {
          setCurrentWeekDate(newWeekDate); // Обновление даты текущей недели после завершения анимации
        }
        translateX.setValue(0); // Обнуление translateX независимо от значения toValue
      });
    },     
  }), [currentWeekDate, translateX, screenWidth]);

  const handleDateChange = useCallback((day) => {
    onDateChange(day);
  }, [onDateChange]);

  const weeks = useMemo(() => {
    const previousWeekStart = startOfWeek(subWeeks(currentWeekDate, 1), { weekStartsOn: 1 });
    const nextWeekStart = startOfWeek(addWeeks(currentWeekDate, 1), { weekStartsOn: 1 });

    return {
      previous: Array.from({ length: 7 }, (_, index) => addDays(previousWeekStart, index)),
      current: Array.from({ length: 7 }, (_, index) => addDays(currentWeekDate, index)),
      next: Array.from({ length: 7 }, (_, index) => addDays(nextWeekStart, index)),
    };
  }, [currentWeekDate]);

  console.log(selectedDate);

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
        style={{ 
          flexDirection: 'row', 
          width: screenWidth * 3, // Увеличиваем ширину, чтобы вместить 3 недели
          transform: [{ translateX: translateX.interpolate({
            inputRange: [0, screenWidth],
            outputRange: [-screenWidth, 0] // Сдвигаем влево на ширину экрана
          }) }] 
        }}
      >
        <DayDotsComponent
          days={weeks.previous}
          onDateChange={onDateChange}
          selectedDate={selectedDate}
          taskDates={taskDates}
        />
        <DayDotsComponent
          days={weeks.current}
          onDateChange={onDateChange}
          selectedDate={selectedDate}
          taskDates={taskDates}
        />
        <DayDotsComponent
          days={weeks.next}
          onDateChange={onDateChange}
          selectedDate={selectedDate}
          taskDates={taskDates}
        />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never" style={{paddingHorizontal: 16, paddingTop: 20}}>
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
