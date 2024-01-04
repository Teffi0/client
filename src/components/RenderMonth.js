import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, VirtualizedList } from 'react-native';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import PropTypes from 'prop-types';

const calculateWeeks = (date) => {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    let currentDay = start;
    const weeks = [];

    while (currentDay <= end) {
        weeks.push(Array.from({ length: 7 }, (_, i) => {
            const day = addDays(currentDay, i);
            return day.getMonth() === date.getMonth() ? day : null;
        }));
        currentDay = addDays(currentDay, 7);
    }
    return weeks;
};

const Day = memo(({ day, handleDatePress, isSelectedDay, hasTask }) => (
    <View style={styles.dayContainer}>
        {day ? (
            <TouchableOpacity
                style={[styles.dayButton, { flex: 1 }]}
                onPress={() => handleDatePress(day)}
            >
                <Text style={[styles.dayText, isSelectedDay && styles.today]}>
                    {format(day, 'd', { locale: ru })}
                </Text>
                {hasTask && <View style={styles.taskDotActive} />}
            </TouchableOpacity>
        ) : null}
    </View>
));

Day.propTypes = {
    day: PropTypes.instanceOf(Date),
    handleDatePress: PropTypes.func.isRequired,
    isSelectedDay: PropTypes.bool.isRequired,
    hasTask: PropTypes.bool
};

Day.defaultProps = {
    hasTask: false
};

const RenderMonth = memo(({ date, handleDatePress, taskDates }) => {
    const weeks = useMemo(() => calculateWeeks(date), [date]);
    const todayFormatted = format(new Date(), 'yyyy-MM-dd');

    return (
        <View style={styles.monthContainer}>
            <Text style={styles.monthName}>{format(date, 'MMMM', { locale: ru })}</Text>
            <VirtualizedList
                data={weeks}
                renderItem={({ item: week }) => (
                    <View style={styles.weekContainer}>
                        {week.map((day, index) => (
                            <Day
                                key={day ? format(day, 'yyyy-MM-dd') : `empty-${index}`}
                                day={day}
                                handleDatePress={handleDatePress}
                                isSelectedDay={!!day && format(day, 'yyyy-MM-dd') === todayFormatted}
                                hasTask={day ? ['в процессе', 'новая'].includes(taskDates[format(day, 'yyyy-MM-dd')]) : false}
                            />
                        ))}
                    </View>
                )}
                keyExtractor={(_, index) => `week-${index}`}
                getItemCount={() => weeks.length}
                getItem={(data, index) => weeks[index]}
            />
        </View>
    );
});

RenderMonth.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    handleDatePress: PropTypes.func.isRequired,
    taskDates: PropTypes.object.isRequired,
};

export default RenderMonth;
