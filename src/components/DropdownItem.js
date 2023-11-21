import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { ChooseIcon, CancelIcon, DeleteIcon } from '../icons';
import styles from '../styles/styles';

function DropdownItem({ label, options, onValueChange }) {
    const [showOptions, setShowOptions] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const handleSelectOption = (option, quantity) => {
        setSelectedItems(currentSelectedItems => {
            const index = currentSelectedItems.findIndex(item => item.id === option.id);
            let updatedSelectedItems = [...currentSelectedItems];
            if (index > -1) {
                updatedSelectedItems[index] = { ...option, quantity };
            } else {
                updatedSelectedItems = [...currentSelectedItems, { ...option, quantity }];
            }
            // Call onValueChange with the updated state
            onValueChange(updatedSelectedItems);
            return updatedSelectedItems;
        });
    };

    const handleRemoveItem = (id) => {
        setSelectedItems(currentSelectedItems => {
            const updatedSelectedItems = currentSelectedItems.filter(item => item.id !== id);
            // Call onValueChange with the updated state
            onValueChange(updatedSelectedItems);
            return updatedSelectedItems;
        });
    };


    const renderItem = ({ item }) => (
        <View style={styles.rowStyle}>
            <Text style={styles.itemName}>{`${item.name}, ${item.measure}`}</Text>
            <TextInput
                style={styles.quantityInput}
                placeholder="0"
                keyboardType="numeric"
                onChangeText={(quantity) => handleSelectOption(item, parseInt(quantity, 10) || 0)}
            />
            <Text style={styles.stockInfo}>{`Остаток в складе: ${item.stock} ${item.measure}`}</Text>
            {selectedItems.some(selectedItem => selectedItem.id === item.id) && (
                <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.deleteButton}>
                    <DeleteIcon />
                </TouchableOpacity>
            )}
        </View>
    );

    const renderSelectedItem = ({ item }) => (
        <View style={styles.selectedItemContainer}>
            <Text style={styles.selectedItemText}>{`${item.name} - ${item.quantity} ${item.measure}`}</Text>
            <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                <CancelIcon />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                onPress={() => setShowOptions(!showOptions)}
                style={styles.searchContainer}
            >
                <Text>Выбрать инвентарь</Text>
                <ChooseIcon />
            </TouchableOpacity>
            {showOptions && (
                <FlatList
                    data={options}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    style={styles.dropdownList}
                    scrollEnabled={true}
                />
            )}
            <FlatList
                data={selectedItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderSelectedItem}
                style={styles.selectedItemsList}
                horizontal={true}
                scrollEnabled={true}
            />
        </View>
    );
}

export default DropdownItem;
