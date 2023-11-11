import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { CalendarIcon } from '../icons';
import styles from '../styles/styles';
import { fetchOptions, handleDateChange, handleSaveTask, SuccessModal, WarningModal } from '../utils/taskScreenHelpers';

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