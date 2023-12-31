import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ChooseIcon } from '../icons';
import styles from '../styles/styles';

function DropdownClient({ options, selectedValue, onValueChange, disabled }) {
  const [searchText, setSearchText] = useState(selectedValue || '');
  const [showOptions, setShowOptions] = useState(false);

  const maxVisibleItems = 4;
  const filteredOptions = useMemo(() => {
    return options
      .filter((option) => 
        typeof option === 'string' 
        ? option.toLowerCase().includes(searchText.toLowerCase()) 
        : option.label.toLowerCase().includes(searchText.toLowerCase()))
      .slice(0, maxVisibleItems);
  }, [options, searchText]);

  useEffect(() => {
    setSearchText(selectedValue);
  }, [selectedValue]);


  const handleSelectOption = useCallback((item) => {
    const client = options.find(option => option === item);
    onValueChange(client);
    setSearchText(item);
    setShowOptions(false);
    Keyboard.dismiss();
  }, [onValueChange, options]);
  

  const renderItem = useCallback(({ item }) => (
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
    onValueChange(text); // Обновляет selectedValue при каждом изменении текста
    if (!showOptions && !disabled) {
      setShowOptions(true);
    }
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
            onFocus={() => !disabled && setShowOptions(true)}
          />
          {!disabled && (
            <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
              <ChooseIcon />
            </TouchableOpacity>
          )}
        </View>
        {showOptions && !disabled && (
          <View style={styles.dropdownList}>
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `key-${index}-${item}`}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}


export default DropdownClient;
