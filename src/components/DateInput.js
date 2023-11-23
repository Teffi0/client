import React, { useState, useCallback, memo } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { CalendarIcon } from '../icons';
import styles from '../styles/styles';

const DateInput = ({ date, placeholder, onDateChange, dateType, minDate, maxDate }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = useCallback(() => {
    setDatePickerVisibility(true);
  }, []);

  const hideDatePicker = useCallback(() => {
    setDatePickerVisibility(false);
  }, []);

  const handleDateConfirm = useCallback((selectedDate) => {
    hideDatePicker();
    onDateChange(dateType, selectedDate);
  }, [dateType, onDateChange, hideDatePicker]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={showDatePicker} style={styles.dateInputContainer}>
        <TextInput
          value={date ? format(date, 'yyyy-MM-dd') : ''}
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
        date={date || new Date()}
      />
    </View>
  );
};

export default DateInput;