import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles/styles';

function Dropdown({ label, options, selectedValue, onValueChange }) {
  const hasOptions = Array.isArray(options) && options.length > 0;

  const handleChange = (value) => {
    if (typeof onValueChange === 'function') {
      onValueChange(value);
    }
  };

  return (
    <View style={[styles.container, { marginBottom: 36 }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={handleChange}
          style={styles.dropdownInput}
          enabled={hasOptions}
        >
          {hasOptions && options.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

export default Dropdown;
