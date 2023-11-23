import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { ChooseIcon, DeleteIcon } from '../icons';
import styles from '../styles/styles';

function DropdownService({ label, options, onValueChange, selectedValues }) {
    const [showOptions, setShowOptions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        if (Array.isArray(selectedValues)) {
            setSelectedItems(selectedValues);
        }
    }, [selectedValues]);

    const filteredOptions = useMemo(() =>
        options.filter(option => option.service_name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4),
        [options, searchQuery]
    );
    
    const updateSelectedItems = useCallback((newItems) => {
        setSelectedItems(newItems);
        if (onValueChange) {
            onValueChange(newItems);
        }
    }, [onValueChange]);

    const handleSelectOption = useCallback((option) => {
        setShowOptions(false);
        setSearchQuery('');
        setSelectedItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === option.id);
            return existingItem
                ? prevItems.map(item => item.id === option.id ? { ...item, quantity: item.quantity + 1 } : item)
                : [...prevItems, { ...option, quantity: 1 }];
        });
    }, []);

    const handleQuantityChange = useCallback((item, delta) => {
        updateSelectedItems(
            selectedItems.map(ci => ci.id === item.id ? { ...ci, quantity: Math.max(1, ci.quantity + delta) } : ci)
        );
    }, [selectedItems, updateSelectedItems]);

    const handleRemoveItem = (id) => {
        setSelectedItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const renderItem = useMemo(() => ({ item }) => (
        <TouchableOpacity style={styles.rowStyle} onPress={() => handleSelectOption(item)}>
            <Text style={styles.itemName}>{`${item.service_name} - ${item.cost}`}</Text>
        </TouchableOpacity>
    ), [handleSelectOption, styles]);


    const renderSelectedItem = useMemo(() => ({ item }) => (
        <View style={styles.selectedItemContainer}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
            }}>
                <Text style={styles.selectedItemText}>{`${item.service_name}`}</Text>
                <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <DeleteIcon />
                </TouchableOpacity>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>

                <Text style={styles.bodyMedium}>{`Стоимость: ${item.cost} руб.`}</Text>
            </View>

        </View>
    ), [handleRemoveItem, styles]);


   return (
        <View>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder='Поиск...'
                    value={searchQuery}
                    style={styles.searchInput}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        setShowOptions(true);
                    }}
                    onFocus={() => setShowOptions(true)}
                />
                <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
                    <ChooseIcon />
                </TouchableOpacity>
            </View>
            {showOptions && (
                <FlatList
                    data={filteredOptions}
                    keyExtractor={(item) => `option-${item.id}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.rowStyle} onPress={() => handleSelectOption(item)}>
                            <Text style={styles.itemName}>{`${item.service_name} - ${item.cost}`}</Text>
                        </TouchableOpacity>
                    )}
                    style={styles.dropdownList}
                    scrollEnabled={true}
                    ListEmptyComponent={<Text style={styles.noItemsText}>Нет результатов</Text>}
                />
            )}
            <FlatList
                data={selectedItems}
                keyExtractor={(item) => `selected-${item.id}`}
                renderItem={({ item }) => (
                    <View style={styles.selectedItemContainer}>
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
                )}
                style={styles.selectedItemsList}
                scrollEnabled={true}
                ListEmptyComponent={<Text style={styles.noItemsText}>Нет выбранных элементов</Text>}
            />
        </View>
    );
}

export default DropdownService;