import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';

const DayDotsComponent = ({ days, onDateChange, selectedDate, taskDates }) => {
  const isTaskInProgress = (date) => ['в процессе', 'новая'].includes(taskDates[format(date, 'yyyy-MM-dd')]);
  
  const renderDayButton = (day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    const isToday = isSameDay(day, new Date());
    const isSelected = isSameDay(day, selectedDate);

    return (
      <TouchableOpacity
        key={formattedDay}
        onPress={() => onDateChange(day)}
        style={[
          styles.dayButton, 
          isSelected && styles.selectedDayText
        ]}
      >
        <Text style={[styles.dayName, isToday && styles.todayButton]}>
          {format(day, 'EEEEEE', { locale: ru })}
        </Text>
        <Text style={[styles.dayNumber, isToday && styles.todayButton]}>
          {format(day, 'd')}
        </Text>
        <View style={[styles.taskDot, isTaskInProgress(day) && styles.taskDotActive]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flexDirection: 'row', flex: 1 }}>
      {days.map(renderDayButton)}
    </View>
  );
};

export default DayDotsComponent;
