    import React from 'react';
    import { View, Text, TouchableOpacity } from 'react-native';
    import { format, isSameDay } from 'date-fns';
    import { ru } from 'date-fns/locale';
    import styles from '../styles/styles';

    const DayDotsComponent = ({ days, onDateChange, selectedDate, taskDates }) => {
    return days.map((day) => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const hasTasks = taskDates.includes(formattedDate);
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);

        return (
        <TouchableOpacity
            key={formattedDate}
            onPress={() => onDateChange(day)}
            style={[
            styles.dayButton,
            isToday && styles.todayButton,
            isSelected && styles.selectedDayButton
            ]}
        >
            <Text style={[styles.dayName, isSelected && styles.selectedDayText]}>
            {format(day, 'EEEEEE', { locale: ru })}
            </Text>
            <Text style={[styles.dayNumber, isSelected && styles.selectedDayText]}>
            {format(day, 'd')}
            </Text>
            <View style={[styles.taskDot, hasTasks && styles.taskDotActive]} />
        </TouchableOpacity>
        );
    });
    };

    export default DayDotsComponent;
