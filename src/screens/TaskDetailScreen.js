import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/styles';
import { formatDate, formatTime } from '../utils/dateFormatter';
import { updateTaskStatus } from '../utils/taskScreenHelpers';
import DropdownItem from '../components/DropdownItem';

const fetchTaskParticipants = async (taskId) => {
  try {
    const response = await fetch(`http://31.129.101.174/task-participants/${taskId}`);
    const participants = await response.json();
    return participants.join(', ');
  } catch (error) {
    console.error('Ошибка при получении участников:', error);
    return 'Ошибка при загрузке участников';
  }
};

const TaskDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { params: initialTask = {} } = route;
  const [task, setTask] = useState(initialTask);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  const handleAddTaskPress = async () => {
    if (task.status === 'в процессе') {
      setModalVisible(true);
    } else {
      try {
        const updatedTask = { status: 'в процессе' };
        await updateTaskStatus(task.id, updatedTask.status);
        // Обновление задачи на сервере успешно выполнено
        navigation.navigate('Tabs', { screen: 'TasksScreen' });
      } catch (error) {
        // Обработка ошибки при обновлении статуса задачи
        console.error('Ошибка при обновлении статуса задачи:', error);
      }
    }
  };

  const handleInventoryChange = (newSelectedInventory) => {
    setSelectedInventory(newSelectedInventory);
  };

  const completeTask = async () => {
    // Проверяем, что выбран хотя бы один инвентарь
    if (selectedInventory.length === 0) {
      alert('Выберите инвентарь перед завершением задачи.');
      return;
    }

    try {
      // Обновляем статус задачи
      const statusResponse = await updateTaskStatus(task.id, 'выполнено');
      if (!statusResponse.ok) {
        throw new Error('Ошибка при обновлении статуса задачи');
      }

      // Отправляем данные о выбранном инвентаре на сервер
      const inventoryResponse = await fetch(`http://31.129.101.174/tasks/${task.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventory: selectedInventory.map(item => ({
            inventory_id: item.id,
            quantity: item.quantity
          })),
        }),
      });

      if (!inventoryResponse.ok) {
        throw new Error('Ошибка при обновлении инвентаря');
      }

      // Получаем ответ от сервера
      const inventoryResult = await inventoryResponse.json();
      console.log('Инвентарь обновлен:', inventoryResult);

      // Закрыть модальное окно и перейти к списку задач
      setModalVisible(false);
      navigation.navigate('Tabs', { screen: 'TasksScreen' });
    } catch (error) {
      console.error('Ошибка при завершении задачи:', error);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('http://31.129.101.174/inventory');
      const data = await response.json();
      setInventoryItems(data);
    } catch (error) {
      console.error('Ошибка при получении инвентаря:', error);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    // Функция для обновления информации о задаче, включая участников
    const updateTaskDetails = async () => {
      const participants = await fetchTaskParticipants(task.id);
      setTask({ ...task, employees: participants });
    };

    updateTaskDetails();
  }, [task.id]);

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const Row = ({ title, value }) => (
    <View style={styles.rowStyle}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.headlineMedium}>{task.service}</Text>

        <Section title="Клиент">
          <Row title="ФИО:" value={task.fullname_client} />
          <Row title="Телефон:" value={task.phone} />
          <Row title="Адрес:" value={task.address_client} />
        </Section>

        <Section title="Оплата">
          <Row title="Способ оплаты:" value={task.payment || 'Не указан'} />
          <Row title="Стоимость:" value={task.cost ? `${task.cost} руб.` : 'Не указана'} />
        </Section>

        <Section title="Работа">
          <Row title="Ответственный:" value={task.responsible || 'Не назначен'} />
          <Row title="Участники:" value={task.employees || 'Нет информации'} />
          <Row title="Дата и время начала:" value={task.start_date ? `${formatDate(task.start_date)} ${formatTime(task.start_time)}` : 'Не указаны'} />
          <Row title="Дата и время окончания:" value={task.end_date ? `${formatDate(task.end_date)} ${formatTime(task.end_time)}` : 'Не указаны'} />
        </Section>

        <Section title="Описание">
          <Text style={[styles.bodyMedium, { marginBottom: 300 }]}>{task.description || 'Описание отсутствует.'}</Text>
        </Section>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.contentContainer}>
          <DropdownItem
            label="Расходники"
            options={inventoryItems}
            selectedValues={selectedInventory}
            onValueChange={handleInventoryChange}
          />
          <TouchableOpacity style={styles.addButton} onPress={completeTask}>
            <Text style={styles.addButtonText}>Задача выполнена</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity style={styles.addButton} onPress={handleAddTaskPress}>
        <Text style={styles.addButtonText}>Добавить задачу</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TaskDetailScreen;