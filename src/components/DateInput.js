import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from '../icons';
import styles from '../styles/styles';

const DateInput = ({ date, placeholder, onDateChange, dateType, minDate, maxDate }) => {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleDateConfirm = (selectedDate) => {
        hideDatePicker();
        onDateChange(dateType, selectedDate);
    };

    // Проверка и преобразование строки в объект Date
    const formattedDate = date ? format(parseISO(date), 'yyyy-MM-dd') : '';

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={showDatePicker} style={styles.dateInputContainer}>
                <TextInput
                    value={formattedDate}
                    placeholder={placeholder}
                    editable={false}
                    style={styles.dateInputText}
                />
                <CalendarIcon />
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
                minimumDate={minDate}
                maximumDate={maxDate}
                date={date ? parseISO(date) : new Date()}
            />
        </View>
    );
};

export default DateInput;
