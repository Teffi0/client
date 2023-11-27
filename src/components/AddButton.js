import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const AddButton = ({ onPress, selectedDate }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    onPress(selectedDate); // передаем selectedDate в функцию onPress
  };

  return (
    <TouchableOpacity
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={handlePress} // Используем handlePress здесь
      style={[styles.addButton, isPressed && styles.addButtonPressed]}
    >
      <Text style={styles.addButtonText}>Новая задача</Text>
    </TouchableOpacity>
  );
};

AddButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date) // Добавляем propTypes для selectedDate
};

export default AddButton;
