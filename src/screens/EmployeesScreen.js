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
        const response = await axios.get(`http://31.129.101.174/employees/changes/all`);
        setHistory(response.data);
      } catch (error) {
        console.error('Ошибка при получении истории изменений:', error);
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

const EmployeesScreen = () => {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableEmployees, setEditableEmployees] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [passwordEdited, setPasswordEdited] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);

  useEffect(() => {
    if (selectedEmployees.length === 0 && isEditing) {
      clearEditingState();
    }
  }, [selectedEmployees, isEditing]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get('http://31.129.101.174/employeesBase', {
        params: { page: currentPage, limit }
      });
      setEmployees(response.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Ошибка при загрузке сотрудников:', error);
    }
  }, [currentPage]);

  const openHistoryModal = () => setIsHistoryModalVisible(true);

  const debouncedSearch = useCallback(debounce((query) => {
    if (!query) {
      fetchEmployees();
    } else {
      const lowercasedQuery = query.toLowerCase();
      setEmployees(employees.filter(employee =>
        employee.full_name.toLowerCase().includes(lowercasedQuery) ||
        employee.phone_number.toLowerCase().includes(lowercasedQuery) ||
        employee.email.toLowerCase().includes(lowercasedQuery)
      ));
    }
  }, 300), [employees]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (text) => setSearchQuery(text);

  const handleModalFormSubmit = useCallback(async (employeeData) => {
    // Изменил clientData на employeeData
    if (!employeeData.full_name || !employeeData.phone_number || Object.values(employeeData).some(val => !val && val !== undefined)) {
      Alert.alert('Ошибка', 'Заполните все поля.');
      return;
    }

    let dataToSend = {
      full_name: employeeData.full_name,
      phone_number: employeeData.phone_number,
      email: employeeData.email,
      position: employeeData.position,
      username: employeeData.username
    };

    // Отправляем новый пароль или оригинальный хеш в зависимости от изменений
    if (employeeData.password === employeeData.originalPasswordHash) {
      dataToSend.password = employeeData.originalPasswordHash;
    } else {
      dataToSend.password = employeeData.password;
    }

    try {
      if (employeeData.id && employeeData.id !== 9999999) {
        await axios.put(`http://31.129.101.174/employees/${employeeData.id}`, {
          ...dataToSend,
          isResponsible: employeeData.isResponsible,
        });
      } else {
        const response = await axios.post('http://31.129.101.174/employees', dataToSend);
        if (response.data && response.data.id) {
          setEmployees(prevEmployees => [...prevEmployees, { ...dataToSend, id: response.data.id }]);
        }
      }
    } catch (error) {
      console.error('Ошибка при отправке данных сотрудника:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при отправке данных');
    }
  }, []);

  const clearEditingState = () => {
    setIsEditing(false);
    setEditableEmployees({});
    setSelectedEmployees([]);
  };

  const handleButtonPress = React.useCallback(async () => {
    if (isEditing) {
      try {
        await Promise.all(Object.values(editableEmployees).map(async (employeeData) => {
          await handleModalFormSubmit(employeeData);
        }));

        await fetchEmployees();

        clearEditingState();
      } catch (error) {
        console.error('Ошибка при обновлении данных сотрудников:', error);
        Alert.alert('Ошибка', 'Произошла ошибка при обновлении данных сотрудников');
      }
    } else {
      const newEmployeeId = 9999999;
      const newEmployeeData = {
        id: newEmployeeId,
        full_name: '',
        phone_number: '',
        email: '',
        position: '',
        username: '', // Добавлено поле для логина
        password: '', // Добавлено поле для пароля
        isResponsible: 'Нет' // Добавлено поле для статуса ответственного
      };

      setEmployees(prevEmployees => [...prevEmployees, newEmployeeData]);
      setEditableEmployees({ [newEmployeeId]: newEmployeeData });
      setIsEditing(true);
      setSelectedEmployees([newEmployeeId]);
    }
  }, [isEditing, editableEmployees]);

  const handleEmployeeDataChange = (employeeId, key, value) => {
    setEditableEmployees(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [key]: value,
        isPasswordChanged: key === 'password' ? true : prev[employeeId].isPasswordChanged
      }
    }));

    if (key === 'password') {
      setPasswordEdited(prev => ({ ...prev, [employeeId]: true }));
    }
  };

  const handleEditPress = () => {
    if (selectedEmployees.length > 0) {
      const editable = selectedEmployees.reduce((acc, employeeId) => {
        const employee = employees.find(e => e.id === employeeId);
        if (employee) {
          acc[employeeId] = { ...employee };
        }
        return acc;
      }, {});

      setEditableEmployees(editable);
      setIsEditing(true);
    } else {
      Alert.alert('Выберите сотрудника', 'Для редактирования выберите сотрудника из списка.');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`http://31.129.101.174/employees/${employeeId}`);
      fetchEmployees();
    } catch (error) {
      console.error('Ошибка при удалении сотрудника:', error);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prevSelected => {
      const newSelectedEmployees = prevSelected.includes(employeeId)
        ? prevSelected.filter(id => id !== employeeId)
        : [...prevSelected, employeeId];
      return newSelectedEmployees;
    });
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(employee => employee.id));
    }
  };

  const renderRow = useCallback(({ item }) => (
    <View style={styles.row}>
      <View style={styles.headercheckboxTableCell}>
        <TouchableOpacity
          style={styles.checkboxTable}
          onPress={() => handleSelectEmployee(item.id)}
        >
          {selectedEmployees.includes(item.id) && <View style={styles.checkboxTableSelected} />}
        </TouchableOpacity>
      </View>
      {editableEmployees[item.id] ? (
        <React.Fragment>
          <TextInput
            style={styles.cell}
            value={editableEmployees[item.id].full_name}
            onChangeText={(text) => handleEmployeeDataChange(item.id, 'full_name', text)}
          />
          <TextInput
            style={styles.cell}
            value={editableEmployees[item.id].phone_number}
            onChangeText={(text) => handleEmployeeDataChange(item.id, 'phone_number', text)}
          />
          <TextInput
            style={styles.cell}
            value={editableEmployees[item.id].email}
            onChangeText={(text) => handleEmployeeDataChange(item.id, 'email', text)}
          />
          <TextInput
            style={styles.cell}
            value={editableEmployees[item.id].position}
            onChangeText={(text) => handleEmployeeDataChange(item.id, 'position', text)}
          />
          <TextInput
            style={styles.cell}
            value={editableEmployees[item.id].username}
            onChangeText={(text) => handleEmployeeDataChange(item.id, 'username', text)}
          />
          <TextInput
            style={styles.cell}
            value={passwordEdited[item.id] ? editableEmployees[item.id].password : "12345"}
            onChangeText={(text) => handleEmployeeDataChange(item.id, 'password', text)}
            placeholder="Пароль"
            secureTextEntry
          />
          <TextInput
            style={styles.cell}
            value={editableEmployees[item.id].isResponsible}
            onChangeText={(text) => handleEmployeeDataChange(item.id, 'isResponsible', text)}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Text style={styles.cell}>{item.full_name}</Text>
          <Text style={styles.cell}>{item.phone_number}</Text>
          <Text style={styles.cell}>{item.email}</Text>
          <Text style={styles.cell}>{item.position}</Text>
          <Text style={styles.cell}>{item.username || 'N/A'}</Text>
          <Text style={styles.cell}>{item.password ? "******" : 'N/A'}</Text>
          <Text style={styles.cell}>{item.isResponsible}</Text>
        </React.Fragment>
      )}
    </View>
  ), [editableEmployees, selectedEmployees]);

  const handleBackPress = () => {
    if (isEditing) {
      if (selectedEmployees.length === 0) {
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
    setEditableEmployees({});
    setSelectedEmployees([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainerTask}>
        <View style={styles.taskHeader}>
          <TouchableOpacity onPress={handleBackPress}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={[styles.titleMedium, { flex: 1, textAlign: 'center' }]}>База сотрудников</Text>
          {selectedEmployees.length === 0 ? (
            <TouchableOpacity onPress={openHistoryModal}>
              <DocumentIcon />
            </TouchableOpacity>
          ) : isEditing ? (
            <TouchableOpacity onPress={() => handleDeleteEmployee(selectedEmployees[0])}>
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
          placeholder="Поиск по сотрудникам"
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
              data={employees}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderRow}
              ListHeaderComponent={
                <View style={styles.headerTable}>
                  <View style={styles.headercheckboxTableCell}>
                    <TouchableOpacity
                      style={styles.checkboxTable}
                      onPress={handleSelectAllEmployees}
                    >
                      {selectedEmployees.length === employees.length ? (
                        <View style={styles.checkboxTableSelected} />
                      ) : null}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.headerCell}>ФИО</Text>
                  <Text style={styles.headerCell}>Телефон</Text>
                  <Text style={styles.headerCell}>Email</Text>
                  <Text style={styles.headerCell}>Должность</Text>
                  <Text style={styles.headerCell}>Логин</Text>
                  <Text style={styles.headerCell}>Пароль</Text>
                  <Text style={styles.headerCell}>Ответственный</Text>
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
            {isEditing ? "Применить изменения" : "Добавить сотрудника"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EmployeesScreen;