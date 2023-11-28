import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';

const DayDotsComponent = ({ days, onDateChange, selectedDate, taskDates }) => {
  return (
    <View style={{ flexDirection: 'row', flex: 1 }}>
      {days.map((day) => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const taskStatus = taskDates[formattedDate];
        const hasTasks = taskStatus === 'в процессе' || taskStatus === 'новая';
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);

        const dayButtonBase = {
          flex: 1, // Устанавливаем flex: 1 для каждой кнопки
          marginHorizontal: 4,
          paddingVertical: 8,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: '#f0f0f0', // Цвет границы
          backgroundColor: 'transparent', // Цвет фона
        };

        return (
          <TouchableOpacity
            key={formattedDate}
            onPress={() => onDateChange(day)}
            style={[styles.dayButton, dayButtonBase, isSelected ? styles.selectedDayText : {}]}
          >
            <Text style={[styles.dayName, isToday ? styles.todayButton : {}]}>
              {format(day, 'EEEEEE', { locale: ru })}
            </Text>
            <Text style={[styles.dayNumber, isToday ? styles.todayButton : {}]}>
              {format(day, 'd')}
            </Text>
            <View style={[styles.taskDot, hasTasks && styles.taskDotActive]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};



export default DayDotsComponent;
