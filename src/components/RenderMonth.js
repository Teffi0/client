import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, VirtualizedList } from 'react-native';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import PropTypes from 'prop-types';

const areEqual = (prevProps, nextProps) => {
    return prevProps.day === nextProps.day &&
        JSON.stringify(prevProps.taskDates) === JSON.stringify(nextProps.taskDates);
};

const Day = memo(({ day, handleDatePress, taskDates }) => {
    const isSelectedDay = day && isSameDay(day, new Date());
    const dayButtonStyle = day ? styles.dayButton : null;
    const formattedDate = day ? format(day, 'yyyy-MM-dd') : null;
    const hasTask = taskDates[formattedDate] === 'в процессе' || taskDates[formattedDate] === 'новая';

    const onPress = useCallback(() => {
        if (day) {
            handleDatePress(day);
        }
    }, [day, handleDatePress]);

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
                            {format(day, 'd', { locale: ru })}
                        </Text>
                        <View style={[styles.taskDot, hasTask && styles.taskDotActive]} />
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}, areEqual);

Day.propTypes = {
    day: PropTypes.instanceOf(Date),
    handleDatePress: PropTypes.func.isRequired,
    taskDates: PropTypes.object.isRequired, // Обновляем тип с array на object
};


const RenderMonth = ({ date, handleDatePress, taskDates }) => {
    const memoizedHandleDatePress = useCallback(handleDatePress, []);
    const memoizedTaskDates = useMemo(() => taskDates, [taskDates]);

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

    const renderItem = useCallback(({ item: week }) => (
        <View style={styles.weekContainer}>
            {week.map((day) => (
                <Day
                    key={day ? format(day, 'yyyy-MM-dd') : Math.random().toString()}
                    day={day}
                    handleDatePress={handleDatePress}
                    taskDates={taskDates} // Передаем taskDates как объект
                />
            ))}
        </View>
    ), [memoizedHandleDatePress, memoizedTaskDates]);

    const getItemCount = () => weeks.length;
    const getItem = (data, index) => weeks[index];

    return (
        <View style={styles.monthContainer}>
            <Text style={styles.monthName}>{format(date, 'MMMM', { locale: ru })}</Text>
            <VirtualizedList
                data={weeks}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                getItemCount={getItemCount}
                getItem={getItem}
            />
        </View>
    );
};

RenderMonth.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    handleDatePress: PropTypes.func.isRequired,
    taskDates: PropTypes.object.isRequired, 
};

export default RenderMonth;
