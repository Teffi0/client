import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ChooseIcon } from '../icons';
import styles from '../styles/styles';

function DropdownWithSearch({ label, options, selectedValue, onValueChange }) {
  const [searchText, setSearchText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(selectedValue);

  const maxVisibleItems = 4;

  const filteredOptions = options
    .filter((option) => option.toLowerCase().includes(searchText.toLowerCase()))
    .slice(0, maxVisibleItems);

  useEffect(() => {
    setSelectedOption(selectedValue);
  }, [selectedValue]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.dropdownInput}
          placeholder="Search..."
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
          }}
          onFocus={() => setShowOptions(true)}
        />
        <ChooseIcon />
      </View>

      {showOptions && (
        <View style={styles.dropdownList}>
          <View style={styles.dropdownOptionsContainer}>
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedOption(item);
                    setSearchText(item);
                    setShowOptions(false);
                  }}
                >
                  <View style={styles.dropdownOption}>
                    <Text>{item}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default DropdownWithSearch;
