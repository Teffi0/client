import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { ChooseIcon, CancelIcon } from '../icons';
import styles from '../styles/styles';

function DropdownEmployee({ label, options, selectedValues, onValueChange }) {
    const [showOptions, setShowOptions] = useState(false);
    // Теперь selectedOptions будет хранить id выбранных сотрудников
    const [selectedOptions, setSelectedOptions] = useState(selectedValues || []);
    const [searchText, setSearchText] = useState('');
    // Фильтрация теперь по full_name
    const filteredOptions = useMemo(() => 
        options.filter(option =>
            option.full_name && option.full_name.toLowerCase().includes(searchText.toLowerCase())
        ), [options, searchText]
    );


    const handleSelectOption = useCallback((option) => {
        setSelectedOptions(prevSelectedOptions => {
            const newSelectedOptions = prevSelectedOptions.includes(option.id)
                ? prevSelectedOptions.filter(id => id !== option.id)
                : [...prevSelectedOptions, option.id];
            onValueChange(newSelectedOptions);
            console.log('Выбранные сотрудники:', newSelectedOptions);
            return newSelectedOptions;
        });
    }, []);
    
    // Изменение renderItem для отображения full_name
    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleSelectOption(item)}
            style={styles.rowStyle}
        >
            <Text>{item.full_name}</Text>
            {selectedOptions.includes(item.id) ? <CancelIcon /> : <ChooseIcon />}
        </TouchableOpacity>
    );

    // Изменение renderSelectedItem для отображения full_name
    const renderSelectedItem = ({ item }) => {
        const selectedItem = options.find(option => option.id === item);
        return (
            <View style={styles.selectedItemContainer}>
                <Text style={styles.selectedItemText}>{selectedItem.full_name}</Text>
                <TouchableOpacity onPress={() => handleSelectOption(selectedItem)}>
                    <CancelIcon />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
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
                        keyExtractor={(item) => item.id.toString()} // где `item.id` — это уникальный идентификатор
                        renderItem={renderItem}
                        scrollEnabled={false}
                    />
                </View>
            )}
            <FlatList
                data={selectedOptions}
                keyExtractor={(item) => item.toString()} // `item` уже является идентификатором
                renderItem={renderSelectedItem}
                style={styles.selectedItemsList}
                horizontal={true}
                scrollEnabled={false}
            />

        </View>
    );
}

export default DropdownEmployee;
