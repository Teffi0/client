import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ChooseIcon } from '../icons';
import styles from '../styles/styles';

function DropdownEmployee({ label, options, selectedValues, onValueChange }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState(selectedValues || []);

    const handleSelectOption = (option) => {
        let newSelectedOptions = [...selectedOptions];
        if (newSelectedOptions.includes(option)) {
            newSelectedOptions = newSelectedOptions.filter((currentOption) => currentOption !== option);
        } else {
            newSelectedOptions.push(option);
        }
        setSelectedOptions(newSelectedOptions);

        if (typeof onValueChange === 'function') {
            onValueChange(newSelectedOptions);
        }
    };

    const renderSelectedItem = (item, index) => (
        <TouchableOpacity
            key={index}
            style={styles.selectedItemTouchable}
            onPress={() => handleSelectOption(item)}
        >
            <Text style={styles.selectedItemText}>{item}</Text>
            <Text style={styles.selectedItemDelete}>×</Text>
        </TouchableOpacity>
    );
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.searchContainer}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.dropdownInput}>
                    {selectedOptions.length > 0 ? 'Выбранные участники' : 'Выбрать участников'}
                </Text>
                <ChooseIcon />
            </TouchableOpacity>

            <View style={styles.selectedItemsContainer}>
                {selectedOptions.map(renderSelectedItem)}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
            
                <View style={styles.modalView}>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSelectOption(item)}>
                                <View style={styles.modalTextItemContainer}>
                                    <Text style={styles.modalTextItem}>{item}</Text>
                                    <Text style={selectedOptions.includes(item) ? styles.modalTextItemSelected : styles.modalTextItemSelect}>
                                        {selectedOptions.includes(item) ? '✓' : '+'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
}

export default DropdownEmployee;
