import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { ChooseIcon } from '../icons';
import styles from '../styles/styles';

function DropdownWithSearch({ label, options, selectedValue, onValueChange }) {
  const [searchText, setSearchText] = useState(selectedValue || '');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(selectedValue);

  const maxVisibleItems = 4;
  const filteredOptions = options
    .filter((option) => typeof option === 'string' ? option.toLowerCase().includes(searchText.toLowerCase()) : option.label.toLowerCase().includes(searchText.toLowerCase()))
    .slice(0, maxVisibleItems);


  useEffect(() => {
    setSelectedOption(selectedValue);
  }, [selectedValue]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.rowStyle}
      onPress={() => {
        setSelectedOption(item);
        onValueChange(item);
        setSearchText(item);
        setShowOptions(false);
        Keyboard.dismiss();
      }}
    >
      <View style={styles.dropdownOption}>
        <Text>{item}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
      <View style={[styles.container, { marginBottom: 36 }]}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.dropdownInput}
            placeholder=""
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setShowOptions(true);
            }}
            onFocus={() => setShowOptions(true)}
          />
          <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
            <ChooseIcon />
          </TouchableOpacity>
        </View>
        {showOptions && (
          <View style={styles.dropdownList}>
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

export default DropdownWithSearch;
