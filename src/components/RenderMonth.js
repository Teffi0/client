import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, VirtualizedList } from 'react-native';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import PropTypes from 'prop-types';

const Day = memo(({ day, handleDatePress, isSelectedDay, hasTask }) => {
    const onPress = useCallback(() => {
        if (day) {
            handleDatePress(day);
        }
    }, [day, handleDatePress]);

    const dayButtonStyle = day ? [styles.dayButton, { flex: 1 }] : null;
    const formattedDay = day ? format(day, 'd', { locale: ru }) : '';  // Оптимизированная проверка

    return (
        <View style={styles.dayContainer}>
            <TouchableOpacity
                style={dayButtonStyle}
                onPress={onPress}
                disabled={!day}
            >
                {day && (
                    <>
                        <Text style={[styles.dayText, isSelectedDay ? styles.today : null]}>
                            {formattedDay}
                        </Text>
                        <View style={[styles.taskDot, hasTask && styles.taskDotActive]} />
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
});

Day.propTypes = {
    day: PropTypes.instanceOf(Date),
    handleDatePress: PropTypes.func.isRequired,
    isSelectedDay: PropTypes.bool.isRequired,
    hasTask: PropTypes.bool.isRequired,
};

const RenderMonth = React.memo(({ date, handleDatePress, taskDates }) => {
    const memoizedHandleDatePress = useCallback(handleDatePress, []);

    const weeks = useMemo(() => {
        const weeksArray = [];
        let currentWeek = [];
        let currentDay = startOfWeek(startOfMonth(date));

        while (currentDay <= endOfWeek(endOfMonth(date))) {
            for (let i = 0; i < 7; i++) {
                currentWeek.push(isSameMonth(currentDay, date) ? currentDay : null);
                currentDay = addDays(currentDay, 1);
            }

            weeksArray.push(currentWeek);
            currentWeek = [];
        }

        return weeksArray;
    }, [date]);

    const renderItem = useCallback(({ item: week, index: weekIndex }) => (
        <View style={styles.weekContainer}>
            {week.map((day, dayIndex) => {
                if (!day) {
                    return (
                        <Day
                            key={`empty-${weekIndex}-${dayIndex}`}
                            day={null}
                            handleDatePress={handleDatePress}
                            isSelectedDay={false}
                            hasTask={false}
                        />
                    );
                }
                const isSelectedDay = isSameDay(day, new Date());
                const formattedDate = format(day, 'yyyy-MM-dd');
                const hasTask = taskDates[formattedDate] === 'в процессе' || taskDates[formattedDate] === 'новая';
    
                return (
                    <Day
                        key={formattedDate}
                        day={day}
                        handleDatePress={handleDatePress}
                        isSelectedDay={isSelectedDay}
                        hasTask={hasTask}
                    />
                );
            })}
        </View>
    ), [memoizedHandleDatePress, taskDates]);

    const getItemCount = () => weeks.length;
    const getItem = (data, index) => weeks[index];

    return (
        <View style={styles.monthContainer}>
            <Text style={styles.monthName}>{format(date, 'MMMM', { locale: ru })}</Text>
            <VirtualizedList
                data={weeks}
                renderItem={renderItem}
                keyExtractor={(item, index) => `week-${index}`}
                getItemCount={getItemCount}
                getItem={getItem}
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

