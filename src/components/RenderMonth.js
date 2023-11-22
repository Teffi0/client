import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format, isSameDay, startOfMonth, endOfMonth, getDaysInMonth, addDays, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import PropTypes from 'prop-types';

const isSameDate = (date1, date2) => isSameDay(date1, date2);

const RenderMonth = memo(({ date, handleDatePress, taskDates }) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthName = format(date, 'MMMM', { locale: ru });
    const weeks = [];
    let currentWeek = [];

    let daysToAdd = 1 - monthStart.getDay();
    if (daysToAdd > 0) daysToAdd -= 7;

    for (let i = daysToAdd; i <= getDaysInMonth(date); i++) {
        const day = addDays(monthStart, i);
        if (isSameMonth(day, date)) {
            currentWeek.push(day);
        } else {
            currentWeek.push(null);
        }

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    if (monthEnd.getDay() < 6) {
        for (let i = 0; i < 6 - monthEnd.getDay(); i++) {
            currentWeek.push(null);
        }
    }
    
    
    if (currentWeek.some(day => day !== null)) {
        weeks.push(currentWeek);
    }

    return (
        <View key={date.toString()} style={styles.monthContainer}>
            <Text style={styles.monthName}>{monthName}</Text>
            {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekContainer}>
                    {week.map((day, dayIndex) => (
                        <View key={dayIndex} style={styles.dayContainer}>
                            {day ? (
                                <>
                                    <TouchableOpacity onPress={() => handleDatePress(day)}>
                                        <Text style={[styles.dayText, isSameDate(day, new Date()) ? styles.today : null]}>
                                            {format(day, 'd', { locale: ru })}
                                        </Text>
                                    </TouchableOpacity>
                                    {taskDates.includes(format(day, 'yyyy-MM-dd')) && (
                                        <View style={styles.taskDotActive} />
                                    )}
                                </>
                            ) : null}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
});

RenderMonth.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    handleDatePress: PropTypes.func.isRequired,
    taskDates: PropTypes.array.isRequired,
};

export default RenderMonth;
