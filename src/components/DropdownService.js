import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ChooseIcon, DeleteIcon } from '../icons';
import styles from '../styles/styles';

function DropdownService({ label, options, onValueChange, selectedValues = [], updateTotalCost }) {
    const [showOptions, setShowOptions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);

    // Обновление selectedItems при изменении selectedValues или options
    useEffect(() => {
        const updatedSelectedItems = selectedValues.map(sv =>
            options.find(option => option.id === sv)
        ).filter(item => item); // Удаляем undefined элементы
        setSelectedItems(updatedSelectedItems);
    }, [selectedValues, options]);

    const filteredOptions = useMemo(() => {
        return options.filter(option =>
            option.service_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !selectedItems.some(selected => selected.id === option.id)
        );
    }, [options, searchQuery, selectedItems]);

    const handleSelectOption = useCallback((option) => {
        const newSelectedItems = [...selectedItems, option];
        setSelectedItems(newSelectedItems);
        if (onValueChange) {
            onValueChange(newSelectedItems.map(item => item.id));
        }
        setShowOptions(false);
    }, [selectedItems, onValueChange]);

    const handleRemoveItem = useCallback((id) => {
        const newSelectedItems = selectedItems.filter(item => item.id !== id);
        setSelectedItems(newSelectedItems);
        if (onValueChange) {
            onValueChange(newSelectedItems.map(item => item.id));
        }
        // Обновление общей стоимости после удаления услуги
        updateTotalCost(newSelectedItems);
    }, [selectedItems, onValueChange, updateTotalCost]);

    return (
        <View>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder='Поиск...'
                    value={searchQuery}
                    style={styles.searchInput}
                    onChangeText={setSearchQuery}
                    onFocus={() => setShowOptions(true)}
                />
                <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
                    <ChooseIcon />
                </TouchableOpacity>
            </View>

            {showOptions && (
                <ScrollView style={styles.dropdownList}>
                    {filteredOptions.map((item) => (
                        <TouchableOpacity key={`option-${item.id}`} style={styles.rowStyle} onPress={() => handleSelectOption(item)}>
                            <Text style={styles.itemName}>{`${item.service_name} - ${item.cost}`}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <ScrollView style={styles.selectedItemsList}>
                {selectedItems.map((item) => (
                    <View key={`selected-${item.id}`} style={styles.selectedItemContainer}>
                        <View style={styles.selectedItemTextRow}>
                            <Text style={styles.selectedItemText}>{`${item.service_name}`}</Text>
                            <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                                <DeleteIcon />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.itemCostRow}>
                            <Text style={styles.bodyMedium}>{`Стоимость: ${item.cost} руб.`}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

export default DropdownService;
