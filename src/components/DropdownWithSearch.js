import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ChooseIcon } from '../icons';
import styles from '../styles/styles';

function DropdownWithSearch({ options, selectedValue, onValueChange }) {
  const [searchText, setSearchText] = useState(selectedValue || '');
  const [showOptions, setShowOptions] = useState(false);

  const maxVisibleItems = 4;
  const filteredOptions = useMemo(() => {
    return options
      .filter((option) => typeof option === 'string' ? option.toLowerCase().includes(searchText.toLowerCase()) : option.label.toLowerCase().includes(searchText.toLowerCase()))
      .slice(0, maxVisibleItems);
  }, [options, searchText]);

  useEffect(() => {
    setSearchText(selectedValue);
  }, [selectedValue]);

  const handleSelectOption = useCallback((item) => {
    onValueChange(item);
    setSearchText(item);
    setShowOptions(false);
    Keyboard.dismiss();
  }, [onValueChange]);

  const renderItem = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={styles.rowStyle}
      onPress={() => handleSelectOption(item)}
    >
      <View style={styles.dropdownOption}>
        <Text>{item}</Text>
      </View>
    </TouchableOpacity>
  ), [handleSelectOption]);


  const handleTextChange = (text) => {
    setSearchText(text);
    if (!showOptions) setShowOptions(true);
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
      <View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.dropdownInput}
            placeholder=""
            value={searchText}
            onChangeText={handleTextChange}
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
              keyExtractor={(item, index) => `key-${index}-${item}`} // Использование индекса и значения элемента
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
