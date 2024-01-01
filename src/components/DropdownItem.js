import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { ChooseIcon, DeleteIcon } from '../icons';
import styles from '../styles/styles';

function DropdownItem({ label, options, onValueChange, selectedValues, preselectedItems }) {
    const [showOptions, setShowOptions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);

    const filteredOptions = useMemo(() =>
        options.filter(option => option.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4),
        [options, searchQuery]
    );

    useEffect(() => {
        if (preselectedItems) {
            const initialSelectedItems = preselectedItems.map(item => {
                const foundItem = options.find(option => option.id === item.inventory_id);
                if (foundItem) {
                    // Учитываем остаток на складе
                    return { ...foundItem, quantity: Math.min(item.quantity, foundItem.quantity) };
                }
                return null;
            }).filter(item => item !== null);

            setSelectedItems(initialSelectedItems);
        }
    }, [preselectedItems, options]);

    useEffect(() => {
        setSelectedItems(selectedValues);
    }, [selectedValues]);

    // Обновляемый обработчик для selectedItems
    const updateSelectedItems = (newItems) => {
        setSelectedItems(newItems);
        if (onValueChange) {
            onValueChange(newItems);
        }
    };

    const handleSelectOption = (option) => {
        setShowOptions(false);
        setSearchQuery('');
        const existingItem = selectedItems.find(item => item.id === option.id);
        if (existingItem) {
            // Увеличиваем количество только если оно меньше остатка на складе
            if (existingItem.quantity < option.quantity) {
                updateSelectedItems(
                    selectedItems.map(item => item.id === option.id ? { ...item, quantity: item.quantity + 1 } : item)
                );
            }
        } else {
            // Добавляем новый предмет с количеством 1
            updateSelectedItems([...selectedItems, { ...option, quantity: 1 }]);
        }
    };

    const handleQuantityChange = (item, delta) => {
        const stockItem = options.find(option => option.id === item.id);
        if (stockItem) {
            const newQuantity = Math.max(0, Math.min(stockItem.quantity, item.quantity + delta));
            updateSelectedItems(
                selectedItems.map(ci => ci.id === item.id ? { ...ci, quantity: newQuantity } : ci)
            );
        }
    };

    const handleRemoveItem = (id) => {
        updateSelectedItems(selectedItems.filter(item => item.id !== id));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.rowStyle} onPress={() => handleSelectOption(item)}>
            <Text style={styles.itemName}>{`${item.name} - ${item.quantity} ${item.measure}`}</Text>
        </TouchableOpacity>
    );

    const renderSelectedItems = () => {
        return selectedItems.map((item, index) => {
            const stockQuantity = options.find(option => option.id === item.id)?.quantity || 0;
            return (
                <View key={`selected-${item.id}-${index}`} style={styles.selectedItemContainer}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 20,
                    }}>
                        <Text style={styles.selectedItemText}>{`${item.name}`}</Text>
                        <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                            <DeleteIcon />
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <View style={[styles.quantityControl, { marginRight: 4 }]}>
                            <TouchableOpacity onPress={() => handleQuantityChange(item, -1)} style={styles.minusButton}>
                                <Text>-</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={styles.quantityInput}
                                value={item.quantity.toString()}
                                onChangeText={(quantity) => {
                                    const newQuantity = quantity === '' ? 0 : parseInt(quantity, 10);
                                    handleQuantityChange(item, newQuantity - item.quantity);
                                }}
                                keyboardType="numeric"
                                editable={stockQuantity > 0}
                            />
                            <TouchableOpacity onPress={() => handleQuantityChange(item, 1)} style={styles.plusButton}>
                                <Text>+</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.bodyMedium}>{`Остаток в складе: ${stockQuantity}`}</Text>
                    </View>
                </View>
            );
        });
    };
      
    return (
        <View>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder='Поиск...'
                    value={searchQuery}
                    style={styles.searchInput}
                    onChangeText={(text) => {
                        {
                            setSearchQuery(text);
                            setShowOptions(true);
                        }
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
                    renderItem={renderItem}
                    style={styles.dropdownList}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={styles.noItemsText}>Нет результатов</Text>}
                />
            )}
            {renderSelectedItems()}
        </View>
    );
}

export default DropdownItem;
