import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { ChooseIcon, CancelIcon } from '../icons';
import styles from '../styles/styles';

function DropdownEmployee({ options, selectedValues, onValueChange }) {
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState(selectedValues || []);
    const [searchText, setSearchText] = useState('');

    const filteredOptions = useMemo(() =>
        options.filter(option =>
            option.full_name.toLowerCase().includes(searchText.toLowerCase())
        ), [options, searchText]
    );

    useEffect(() => {
        setSelectedOptions(selectedValues);
    }, [selectedValues]);

    const handleSelectOption = useCallback((option) => {
        setSelectedOptions(prevSelectedOptions => {
            const newSelectedOptions = prevSelectedOptions.includes(option.id)
                ? prevSelectedOptions.filter(id => id !== option.id)
                : [...prevSelectedOptions, option.id];
            onValueChange(newSelectedOptions);
            return newSelectedOptions;
        });
    }, [onValueChange]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleSelectOption(item)}
            style={styles.rowStyle}
        >
            <Text>{item.full_name}</Text>
            {selectedOptions.includes(item.id) ? <CancelIcon /> : <ChooseIcon />}
        </TouchableOpacity>
    );

    const renderSelectedItem = ({ item }) => {
        const selectedItem = options.find(option => option.id === item);
        return selectedItem ? (
            <View style={styles.selectedItemContainer}>
                <View style={styles.selectedItemTextRow}>
                    <Text style={styles.selectedItemText}>{selectedItem.full_name}</Text>
                    <TouchableOpacity onPress={() => handleSelectOption(selectedItem)}>
                        <CancelIcon />
                    </TouchableOpacity>
                </View>
            </View>
        ) : null;
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => setShowOptions(!showOptions)}
                style={styles.searchContainer}
            >
                <TextInput
                    style={styles.dropdownInput}
                    placeholder="Поиск..."
                    value={searchText}
                    onChangeText={(text) => {
                        setSearchText(text);
                        setShowOptions(true);
                    }}
                    onFocus={() => setShowOptions(true)}
                />
                <ChooseIcon />
            </TouchableOpacity>
            {showOptions && (
                <View style={styles.dropdownList}>
                    <FlatList
                        data={filteredOptions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        scrollEnabled={false}
                    />
                </View>
            )}
            <FlatList
                data={selectedOptions}
                keyExtractor={(item) => item.toString()}
                renderItem={renderSelectedItem}
                scrollEnabled={false}
            />
        </View>
    );
}

export default DropdownEmployee;
