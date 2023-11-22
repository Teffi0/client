import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { ChooseIcon, DeleteIcon } from '../icons';
import styles from '../styles/styles';

function DropdownItem({ label, options, onValueChange }) {
    const [showOptions, setShowOptions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);

    const filteredOptions = useMemo(() =>
        options.filter(option => option.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4),
        [options, searchQuery]
    );

    const handleSelectOption = (option) => {
        setShowOptions(false);
        setSearchQuery('');
        const existingItem = selectedItems.find(item => item.id === option.id);
        setSelectedItems(current =>
            existingItem
                ? current.map(item => item.id === option.id ? { ...item, quantity: item.quantity + 1 } : item)
                : [...current, { ...option, quantity: 1 }]
        );
    };

    const handleQuantityChange = (item, delta) => {
        setSelectedItems(current =>
            current.map(ci => ci.id === item.id ? { ...ci, quantity: Math.max(1, ci.quantity + delta) } : ci)
        );
    };

    const handleRemoveItem = (id) => {
        setSelectedItems(currentSelectedItems => {
            const updatedSelectedItems = currentSelectedItems.filter(item => item.id !== id);
            return updatedSelectedItems;
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.rowStyle} onPress={() => handleSelectOption(item)}>
            <Text style={styles.itemName}>{`${item.name} - ${item.measure}`}</Text>
        </TouchableOpacity>
    );

    const renderSelectedItem = ({ item }) => (
        <View style={styles.selectedItemContainer}>
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
                        onChangeText={(quantity) => handleQuantityChange(item, parseInt(quantity, 10) - item.quantity)}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={() => handleQuantityChange(item, 1)} style={styles.plusButton}>
                        <Text>+</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.bodyMedium}>{`Остаток в складе: ${item.stock}`}</Text>
            </View>

        </View>
    );

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
                    scrollEnabled={true}
                    ListEmptyComponent={<Text style={styles.noItemsText}>Нет результатов</Text>}
                />
            )}
            <FlatList
                data={selectedItems}
                keyExtractor={(item) => `selected-${item.id}`}
                renderItem={renderSelectedItem}
                style={styles.selectedItemsList}
                scrollEnabled={true}
                ListEmptyComponent={<Text style={styles.noItemsText}>Нет выбранных элементов</Text>}
            />
        </View>
    );
}

export default DropdownItem;
