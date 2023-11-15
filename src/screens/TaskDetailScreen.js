import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles, { colors, sizes } from '../styles/styles';
import { formatDate, formatTime } from '../utils/dateFormatter';
import { updateTaskStatus } from '../utils/taskScreenHelpers';

const TaskDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { params: initialTask = {} } = route;
  const [task, setTask] = useState(initialTask);

  const handleAddTaskPress = async () => {
    try {
      const updatedTask = { status: 'в процессе' };
      await updateTaskStatus(task.id, updatedTask.status);
      // Обновление задачи на сервере успешно выполнено
      navigation.navigate('Tabs', { screen: 'TasksScreen' });
    } catch (error) {
      // Обработка ошибки при обновлении статуса задачи
      console.error('Ошибка при обновлении статуса задачи:', error);
    }
  };


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
          <Text style={[styles.bodyMedium,{ marginBottom: 300}]}>{task.description || 'Описание отсутствует.'}</Text>
        </Section>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddTaskPress}>
        <Text style={styles.addButtonText}>Добавить задачу</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TaskDetailScreen;
