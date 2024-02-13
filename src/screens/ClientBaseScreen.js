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
        const response = await axios.get(`http://31.129.101.174/clients/changes/all`);
        const formattedHistory = response.data.map(change => ({
          ...change,
          change_timestamp: new Date(change.change_timestamp).toLocaleString()
        }));
        setHistory(formattedHistory);
      } catch (error) {
        console.error('Ошибка при получении истории изменений:', error);
      }
    };

    if (isVisible) {
      fetchHistory();
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} onRequestClose={onClose} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.container}>
        <View>
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
            <View style={{marginHorizontal: 8}}>
              {history.map((change, index) => (
                <View key={index} style={[styles.historyItem, { backgroundColor: '#f9f9f9', margin: 8, padding: 16, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }]}>
                  <Text style={{ marginBottom: 4 }}>{change.change_timestamp}</Text>
                  <Text style={{ marginBottom: 4 }}>{change.change_description} ({change.client_full_name})</Text>
                  <Text>{change.user_full_name}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const ClientBaseScreen = () => {
  const navigation = useNavigation();
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [isEditing, setisEditing] = useState(false);
  const [editableClients, setEditableClients] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [currentPage]);

  useEffect(() => {
    if (selectedClients.length === 0 && isEditing) {
      confirmCancelEditing();
    }
  }, [selectedClients, isEditing]);

  const fetchClients = useCallback(async () => {
    try {
      const response = await axios.get('http://31.129.101.174/clientsbase', {
        params: { page: currentPage, limit }
      });
      setClients(response.data.clients);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Ошибка при загрузке клиентов:', error);
    }
  }, [currentPage]);

  const openHistoryModal = () => setIsHistoryModalVisible(true);

  const debouncedSearch = useCallback(debounce((query) => {
    if (!query) {
      fetchClients();
    } else {
      const lowercasedQuery = query.toLowerCase();
      setClients(clients.filter(client =>
        client.full_name.toLowerCase().includes(lowercasedQuery) ||
        client.phone_number.toLowerCase().includes(lowercasedQuery) ||
        client.address.toLowerCase().includes(lowercasedQuery)
      ));
    }
  }, 300), [clients]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (text) => setSearchQuery(text);

  const assembleFullAddress = useCallback((address) => {
    return `город ${address.city}, улица ${address.street}, дом ${address.building}, подъезд ${address.entrance}, этаж ${address.floor}`;
  }, []);

  const handleModalFormSubmit = useCallback(async (clientData) => {
    if (!clientData.full_name || !clientData.phone_number || Object.values(clientData.address).some(val => !val)) {
      Alert.alert('Ошибка', 'Заполните все поля.');
      return;
    }

    const fullAddress = assembleFullAddress(clientData.address);
    const dataToSend = {
      full_name: clientData.full_name,
      phone_number: clientData.phone_number,
      address: fullAddress
    };

    try {
      if (clientData.id && clientData.id !== 9999999) {
        await axios.put(`http://31.129.101.174/clients/${clientData.id}`, dataToSend);
      } else {
        const response = await axios.post('http://31.129.101.174/clients', dataToSend);
        if (response.data && response.data.id) {
          setClients(prevClients => [...prevClients, { ...dataToSend, id: response.data.id }]);
        }
      }
    } catch (error) {
      console.error('Ошибка при отправке данных клиента:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при отправке данных');
    }
  }, [assembleFullAddress]);

  const clearEditingState = () => {
    setisEditing(false);
    setEditableClients({});
    setSelectedClients([]);
  };

  const renderAddressFields = (clientId) => {
    const address = editableClients[clientId].address;

    return (
      <View>
        <TextInput
          style={styles.cell}
          placeholder="Город"
          value={address.city}
          onChangeText={(text) => handleClientDataChange(clientId, 'address', { ...address, city: text })}
        />
        <TextInput
          style={styles.cell}
          placeholder="Улица"
          value={address.street}
          onChangeText={(text) => handleClientDataChange(clientId, 'address', { ...address, street: text })}
        />
        <TextInput
          style={styles.cell}
          placeholder="Дом/Квартира"
          value={address.building}
          onChangeText={(text) => handleClientDataChange(clientId, 'address', { ...address, building: text })}
        />
        <TextInput
          style={styles.cell}
          placeholder="Подъезд"
          value={address.entrance}
          onChangeText={(text) => handleClientDataChange(clientId, 'address', { ...address, entrance: text })}
        />
        <TextInput
          style={styles.cell}
          placeholder="Этаж"
          value={address.floor}
          onChangeText={(text) => handleClientDataChange(clientId, 'address', { ...address, floor: text })}
        />
      </View>
    );
  };
  const parseAddress = (fullAddress) => {
    const defaultAddress = { city: '', street: '', building: '', entrance: '', floor: '' };
    if (!fullAddress) return defaultAddress;

    const addressRegex = /город\s([^,]*), улица\s([^,]*), дом\s([^,]*), подъезд\s([^,]*), этаж\s([^,]*)/;
    const match = fullAddress.match(addressRegex);

    if (!match || match.length < 6) {
      return defaultAddress;
    }

    return {
      city: match[1] || '',
      street: match[2] || '',
      building: match[3] || '',
      entrance: match[4] || '',
      floor: match[5] || ''
    };
  };

  const isClientEmpty = (client) => {
    return !client.full_name && !client.phone_number && Object.values(client.address).every(val => !val);
  };

  const handleButtonPress = React.useCallback(async () => {
    if (isEditing) {
      try {
        // Обрабатываем каждый выбранный для редактирования клиент
        await Promise.all(Object.values(editableClients).map(async (clientData) => {
          await handleModalFormSubmit(clientData);
        }));

        // Обновляем список клиентов после редактирования
        await fetchClients();

        // Очищаем состояние редактирования и сбрасываем выбранных клиентов
        clearEditingState();
      } catch (error) {
        console.error('Ошибка при обновлении данных клиентов:', error);
        Alert.alert('Ошибка', 'Произошла ошибка при обновлении данных клиентов');
      }
    } else {
      const newClientId = 9999999; // Используйте текущий временной штамп для уникального ID
      const newClientData = {
        id: newClientId,
        full_name: '',
        phone_number: '',
        address: { city: '', street: '', building: '', entrance: '', floor: '' }
      };

      // Добавляем нового клиента в список клиентов и в список редактируемых клиентов
      setClients(prevClients => [...prevClients, newClientData]);
      setEditableClients({ [newClientId]: newClientData });
      setisEditing(true);
      setSelectedClients([newClientId]); // Выбираем нового клиента для редактирования
    }
  }, [isEditing, editableClients]);

  const handleClientDataChange = (clientId, key, value) => {
    setEditableClients(prev => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        [key]: value
      }
    }));
  };

  const handleEditPress = () => {
    if (selectedClients.length > 0) {
      const editable = selectedClients.reduce((acc, clientId) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
          // Разбиваем адрес на компоненты
          const addressParts = parseAddress(client.address);
          acc[clientId] = {
            ...client,
            address: addressParts
          };
        }
        return acc;
      }, {});

      setEditableClients(editable);
      setisEditing(true);
    } else {
      Alert.alert('Выберите клиента', 'Для редактирования выберите клиента из списка.');
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await axios.delete(`http://31.129.101.174/clients/${clientId}`);
      fetchClients();
    } catch (error) {
      console.error('Ошибка при удалении клиента:', error);
    }
  };

  const handleSelectClient = (clientId) => {
    setSelectedClients(prevSelected => {
      const newSelectedClients = prevSelected.includes(clientId)
        ? prevSelected.filter(id => id !== clientId)
        : [...prevSelected, clientId];

      // Если после изменения выбора клиентов, список стал пустым
      if (newSelectedClients.length === 0) {
        // Вызываем функцию для отмены редактирования и сброса изменений
        confirmCancelEditing();
      }

      return newSelectedClients;
    });
  };

  const handleSelectAllClients = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]); // Снимаем выбор со всех, если все уже выбраны
    } else {
      setSelectedClients(clients.map(client => client.id)); // Выбираем всех, если не все выбраны
    }
  };

  const renderRow = useCallback(({ item }) => (
    <View style={styles.row}>
      <View style={styles.headercheckboxTableCell}>
        <TouchableOpacity
          style={styles.checkboxTable}
          onPress={() => handleSelectClient(item.id)}
        >
          {selectedClients.includes(item.id) && <View style={styles.checkboxTableSelected} />}
        </TouchableOpacity>
      </View>
      {editableClients[item.id] ? (
        <React.Fragment>
          <TextInput
            style={styles.cell}
            value={editableClients[item.id].full_name}
            onChangeText={(text) => handleClientDataChange(item.id, 'full_name', text)}
          />
          <TextInput
            style={styles.cell}
            value={editableClients[item.id].phone_number}
            onChangeText={(text) => handleClientDataChange(item.id, 'phone_number', text)}
          />
          {renderAddressFields(item.id)}
        </React.Fragment>
      ) : (
        // Текстовое представление данных клиента
        <React.Fragment>
          <Text style={styles.cell}>{item.full_name}</Text>
          <Text style={styles.cell}>{item.phone_number || 'Нет номера'}</Text>
          <Text style={styles.cell}>{item.address || 'Нет адреса'}</Text>
        </React.Fragment>
      )}
    </View>
  ), [editableClients, selectedClients]);

  const handleBackPress = () => {
    if (isEditing) {
      if (selectedClients.length === 0) {
        confirmCancelEditing(); // Автоматическая отмена редактирования, если нет выбранных клиентов
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
      navigation.goBack(); // Возврат к предыдущему экрану, если не в режиме редактирования
    }
  };

  const confirmCancelEditing = () => {
    setisEditing(false);
    setEditableClients({});
    setSelectedClients([]); // Сброс выбранных клиентов
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainerTask}>
        <View style={styles.taskHeader}>
          <TouchableOpacity onPress={handleBackPress}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={[styles.titleMedium, { flex: 1, textAlign: 'center' }]}>Клиентская база</Text>
          {selectedClients.length === 0 ? (
            <TouchableOpacity onPress={openHistoryModal}>
              <DocumentIcon />
            </TouchableOpacity>
          ) : isEditing ? (
            <TouchableOpacity onPress={() => handleDeleteClient(selectedClients[0])}>
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
          placeholder="Поиск по клиентам"
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
              data={clients}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderRow}
              ListHeaderComponent={
                <View style={styles.headerTable}>
                  <View style={styles.headercheckboxTableCell}>
                    <TouchableOpacity
                      style={styles.checkboxTable}
                      onPress={handleSelectAllClients}
                    >
                      {selectedClients.length === clients.length ? (
                        <View style={styles.checkboxTableSelected} />
                      ) : null}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.headerCell}>ФИО</Text>
                  <Text style={styles.headerCell}>Телефон</Text>
                  <Text style={styles.headerCell}>Адрес</Text>
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
            {isEditing ? "Применить изменения" : "Добавить клиента"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ClientBaseScreen;
