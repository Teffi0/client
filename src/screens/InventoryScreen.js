import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, ScrollView, Button, Alert, TextInput, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BackIcon, EditIcon, DeleteIcon, None, DocumentIcon } from '../icons';
import styles from '../styles/styles';
import { debounce } from 'lodash';

const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  const pages = React.useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      {pages.map(page => (
        <TouchableOpacity key={page} onPress={() => onPageChange(page)}>
          <Text style={{ marginHorizontal: 8, color: currentPage === page ? 'blue' : 'black' }}>
            {page}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const ChangeHistoryModal = ({ isVisible, onClose }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://31.129.101.174/inventory/changes/all`);
        setHistory(response.data);
      } catch (error) {
        console.error('Ошибка при получении истории изменений инвентаря:', error);
      }
    };

    if (isVisible) {
      fetchHistory();
    }
  }, [isVisible]);

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.contentContainerTask}>
            <View style={styles.taskHeader}>
              <TouchableOpacity onPress={onClose}>
                <BackIcon />
              </TouchableOpacity>
              <Text style={[styles.titleMedium, { flex: 1, textAlign: 'center' }]}>Журнал изменений</Text>
              <TouchableOpacity>
                <None />
              </TouchableOpacity>
            </View>
          </View>
          {history.map((change, index) => (
            <View key={index} style={styles.historyItem}>
              <Text>Дата: {change.change_timestamp}</Text>
              <Text>Описание: {change.change_description}</Text>
              <Text>Пользователь: {change.user_id}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const InventoryScreen = () => {
  const navigation = useNavigation();
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableItems, setEditableItems] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [currentPage]);

  useEffect(() => {
    if (selectedItems.length === 0 && isEditing) {
      clearEditingState();
    }
  }, [selectedItems, isEditing]);

  const fetchInventory = useCallback(async () => {
    try {
      const response = await axios.get('http://31.129.101.174/inventory', {
        params: { page: currentPage, limit }
      });
      setInventory(response.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Ошибка при загрузке инвентаря:', error);
    }
  }, [currentPage]);

  const openHistoryModal = () => setIsHistoryModalVisible(true);

  const debouncedSearch = useCallback(debounce((query) => {
    if (!query) {
      fetchInventory();
    } else {
      const lowercasedQuery = query.toLowerCase();
      setInventory(inventory.filter(item =>
        item.name.toLowerCase().includes(lowercasedQuery)
      ));
    }
  }, 300), [inventory]);


  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (text) => setSearchQuery(text);

  const handleModalFormSubmit = useCallback(async (itemData) => {
    // Проверка данных элемента инвентаря перед отправкой
    if (!itemData.name || !itemData.measure) {
      Alert.alert('Ошибка', 'Все поля должны быть заполнены.');
      return;
    }

    // Формирование данных для отправки на сервер
    const dataToSend = {
      name: itemData.name,
      measure: itemData.measure,
      quantity: itemData.quantity,
    };

    try {
      if (itemData.id && itemData.id !== 'new') {
        await axios.put(`http://31.129.101.174/inventory/${itemData.id}`, dataToSend);
      } else {
        await axios.post('http://31.129.101.174/inventory', dataToSend);
      }
      fetchInventory();
      clearEditingState();
    } catch (error) {
      console.error('Ошибка при обработке данных инвентаря:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при обработке данных инвентаря.');
    }
  }, [fetchInventory, clearEditingState]);

  const clearEditingState = () => {
    setIsEditing(false);
    setEditableItems({});
    setSelectedItems([]);
  };

  const handleButtonPress = React.useCallback(async () => {
    if (isEditing) {
      try {
        await Promise.all(Object.values(editableItems).map(async (itemData) => {
          await handleModalFormSubmit(itemData);
        }));

        await fetchInventory();

        clearEditingState();
      } catch (error) {
        console.error('Ошибка при обновлении данных инвентаря:', error);
        Alert.alert('Ошибка', 'Произошла ошибка при обновлении данных инвентаря');
      }
    } else {
      const newItemId = 9999999;
      const newItemData = {
        id: 'newItemId', // Используйте временный ID для нового элемента
        name: '',
        measure: '',
        quantity: 0
      };

      setInventory(prevItems => [...prevItems, newItemData]);
      setEditableItems({ [newItemId]: newItemData });
      setIsEditing(true);
      setSelectedItems([newItemId]);
    }
  }, [isEditing, editableItems]);

  const handleItemDataChange = (itemId, key, value) => {
    setEditableItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [key]: value
      }
    }));
  };

  const handleEditPress = () => {
    if (selectedItems.length > 0) {
      const editable = selectedItems.reduce((acc, itemId) => {
        const item = inventory.find(i => i.id === itemId);
        if (item) {
          acc[itemId] = { ...item };
        }
        return acc;
      }, {});

      setEditableItems(editable);
      setIsEditing(true);
    } else {
      Alert.alert('Выберите элемент', 'Для редактирования выберите элемент из списка.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`http://31.129.101.174/inventory/${itemId}`);
      fetchInventory();
    } catch (error) {
      console.error('Ошибка при удалении элемента инвентаря:', error);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prevSelected => {
      const newSelectedItems = prevSelected.includes(itemId)
        ? prevSelected.filter(id => id !== itemId)
        : [...prevSelected, itemId];
      return newSelectedItems;
    });
  };

  const handleSelectAllItems = () => {
    if (selectedItems.length === inventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventory.map(item => item.id));
    }
  };

  const renderRow = useCallback(({ item }) => (
    <View style={styles.row}>
      <View style={styles.headercheckboxTableCell}>
        <TouchableOpacity
          style={styles.checkboxTable}
          onPress={() => handleSelectItem(item.id)}
        >
          {selectedItems.includes(item.id) && <View style={styles.checkboxTableSelected} />}
        </TouchableOpacity>
      </View>
      {editableItems[item.id] ? (
        <React.Fragment>
          <TextInput
            style={styles.cell}
            value={editableItems[item.id].name}
            onChangeText={(text) => handleItemDataChange(item.id, 'name', text)}
          />
          <TextInput
            style={styles.cell}
            value={editableItems[item.id].measure}
            onChangeText={(text) => handleItemDataChange(item.id, 'measure', text)}
          />
          <TextInput
            style={styles.cell}
            value={String(editableItems[item.id].quantity)}
            onChangeText={(text) => handleItemDataChange(item.id, 'quantity', text)}
            keyboardType='numeric'
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Text style={styles.cell}>{item.name}</Text>
          <Text style={styles.cell}>{item.measure}</Text>
          <Text style={styles.cell}>{item.quantity}</Text>
        </React.Fragment>
      )}
    </View>
  ), [editableItems, selectedItems]);

  const handleBackPress = () => {
    if (isEditing) {
      if (selectedItems.length === 0) {
        confirmCancelEditing();
      } else {
        Alert.alert(
          "Предупреждение",
          "Данные могут не сохраниться. Отменить редактирование?",
          [
            { text: "Нет" },
            { text: "Да", onPress: confirmCancelEditing }
          ],
          { cancelable: false }
        );
      }
    } else {
      navigation.goBack();
    }
  };

  const confirmCancelEditing = () => {
    setIsEditing(false);
    setEditableItems({});
    setSelectedItems([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainerTask}>
        <View style={styles.taskHeader}>
          <TouchableOpacity onPress={handleBackPress}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={[styles.titleMedium, { flex: 1, textAlign: 'center' }]}>Склад</Text>
          {selectedItems.length === 0 ? (
            <TouchableOpacity onPress={openHistoryModal}>
              <DocumentIcon />
            </TouchableOpacity>
          ) : isEditing ? (
            <TouchableOpacity onPress={() => handleDeleteItem(selectedItems[0])}>
              <DeleteIcon />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleEditPress}>
              <EditIcon />
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по складу"
          onChangeText={handleSearchChange}
          value={searchQuery}
        />
        {isHistoryModalVisible && (
          <ChangeHistoryModal
            isVisible={isHistoryModalVisible}
            onClose={() => setIsHistoryModalVisible(false)}
          />
        )}
        <ScrollView horizontal overScrollMode="never">
          <SafeAreaView>
            <FlatList
              data={inventory}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderRow}
              ListHeaderComponent={
                <View style={styles.headerTable}>
                  <View style={styles.headercheckboxTableCell}>
                    <TouchableOpacity
                      style={styles.checkboxTable}
                      onPress={handleSelectAllItems}
                    >
                      {selectedItems.length === inventory.length ? (
                        <View style={styles.checkboxTableSelected} />
                      ) : null}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.headerCell}>Название</Text>
                  <Text style={styles.headerCell}>Единица измерения</Text>
                  <Text style={styles.headerCell}>Количество</Text>
                </View>
              }
              ListFooterComponent={
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              }
            />
          </SafeAreaView>
        </ScrollView>
        <TouchableOpacity style={styles.addButton} onPress={handleButtonPress}>
          <Text style={styles.addButtonText}>
            {isEditing ? "Применить изменения" : "Добавить предмет"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InventoryScreen;