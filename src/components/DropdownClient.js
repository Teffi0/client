import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ChooseIcon } from '../icons';
import styles from '../styles/styles';

function DropdownClient({ label, options, selectedValue, onValueChange }) {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(selectedValue);

  useEffect(() => {
    if (selectedValue !== selectedOption) {
      setSelectedOption(selectedValue);
    }
  }, [selectedValue]);

  const handleSelectOption = (item) => {
    setSelectedOption(item);
    setSearchText(item);
    setModalVisible(false);
    onValueChange(item);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => setModalVisible(true)}
      >
        <TextInput
          style={styles.dropdownInput}
          placeholder="Найти клиента"
          value={selectedOption}
          editable={false} // Теперь это поле только для чтения
          onChangeText={(text) => setSearchText(text)}
        />
        <ChooseIcon />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TextInput
            style={styles.modalTextInput}
            placeholder="Search..."
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            autoFocus={true}
          />
          <FlatList
            data={options.filter((option) =>
              option.toLowerCase().includes(searchText.toLowerCase())
            )}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectOption(item)}>
                <Text style={styles.modalTextItem}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

export default DropdownClient;
