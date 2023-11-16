import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, Button, Alert, TextInput } from 'react-native';
import axios from 'axios';

const ClientBaseScreen = () => {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ full_name: '', phone_number: '', address: '' });
  const [editingClientId, setEditingClientId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://31.129.101.174/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке клиентов:', error);
    }
  };

  const handleSaveClient = async (client) => {
    if (!client.full_name || !client.phone_number) {
      Alert.alert('Ошибка', 'ФИО и телефон необходимы.');
      return;
    }
    try {
      if (editingClientId) {
        await axios.put(`http://31.129.101.174/clients/${editingClientId}`, client);
      } else {
        await axios.post('http://31.129.101.174/clients', client);
      }
      setNewClient({ full_name: '', phone_number: '', address: '' });
      setEditingClientId(null);
      fetchClients();
    } catch (error) {
      console.error('Ошибка при сохранении клиента:', error);
    }
  };

  const handleEditClient = (client) => {
    setNewClient({ full_name: client.full_name, phone_number: client.phone_number, address: client.address });
    setEditingClientId(client.id);
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await axios.delete(`http://31.129.101.174/clients/${clientId}`);
      fetchClients();
    } catch (error) {
      console.error('Ошибка при удалении клиента:', error);
    }
  };

  const renderRow = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.full_name}</Text>
      <Text style={styles.cell}>{item.phone_number || 'Нет номера'}</Text>
      <Text style={styles.cell}>{item.address || 'Нет адреса'}</Text>
      <Button title="Редактировать" onPress={() => handleEditClient(item)} />
      <Button title="Удалить" onPress={() => handleDeleteClient(item.id)} />
    </View>
  );

  return (
    <ScrollView horizontal>
      <View>
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.headerCell}>ФИО</Text>
            <Text style={styles.headerCell}>Телефон</Text>
            <Text style={styles.headerCell}>Адрес</Text>
            <Text style={styles.headerCell}>Действия</Text>
          </View>
          <FlatList
            data={clients}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderRow}
            scrollEnabled={false} // Отключаем внутреннюю прокрутку
          />
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="ФИО" 
            value={newClient.full_name} 
            onChangeText={(text) => setNewClient({ ...newClient, full_name: text })}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Телефон" 
            value={newClient.phone_number} 
            onChangeText={(text) => setNewClient({ ...newClient, phone_number: text })}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Адрес" 
            value={newClient.address} 
            onChangeText={(text) => setNewClient({ ...newClient, address: text })}
          />
          <Button 
            title={editingClientId ? "Сохранить изменения" : "Добавить клиента"} 
            onPress={() => handleSaveClient(newClient)} 
          />
          {editingClientId && (
            <Button 
              title="Отменить редактирование" 
              onPress={() => {
                setNewClient({ full_name: '', phone_number: '', address: '' });
                setEditingClientId(null);
              }} 
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
  },
  headerCell: {
    width: 200, // Фиксированная ширина для заголовков ячеек
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  cell: {
    width: 200, // Фиксированная ширина для ячеек
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputContainer: {
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
});

export default ClientBaseScreen;
