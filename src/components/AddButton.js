import React, { useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import PropTypes from 'prop-types'; // Добавлено для типизации пропсов
import styles from '../styles/styles';

const AddButton = ({ onPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    onPress();
    setIsPressed(false);
  };

  const addButtonStyles = useMemo(() => ({
    ...styles.addButton,
    ...(isPressed && styles.addButtonPressed),
  }), [isPressed]);

  const addButtonTextStyles = styles.addButtonText;

  return (
    <View style={addButtonStyles}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <Text style={addButtonTextStyles}>Добавить задачу</Text>
      </TouchableOpacity>
    </View>
  );
};

// Типизация пропсов с использованием PropTypes
AddButton.propTypes = {
  onPress: PropTypes.func.isRequired,
};

export default AddButton;
