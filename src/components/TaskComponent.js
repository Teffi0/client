// Этот файл содержит компонент TaskComponent, который используется для отображения информации о задаче.

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FollowIcon, ProfileIcon, LocationIcon } from '../icons';
import styles, { colors } from '../styles/styles';
import { useNavigation } from '@react-navigation/native';
import { formatTime, truncateService, formatAddress } from '../utils/utils'; // Импорт функций из utils.js

/**
 * Компонент для отображения задачи в списке.
 * @param {Object} props - Пропсы компонента.
 * @param {string} props.status - Статус задачи.
 * @param {string} props.start_time - Время начала задачи.
 * @param {string} props.end_time - Время начала задачи.
 * @param {string} props.service - Название услуги.
 * @param {string} props.address_client - Адрес клиента.
 * @param {number} props.employees - Количество сотрудников.
 * @param {number} props.taskId - ID задачи.
 */

const getStatusColor = (status) => {
  switch (status) {
    case 'новая':
      return colors.newStatus;
    case 'в процессе':
      return colors.inProcessStatus;
    case 'выполнено':
      return colors.finishedStatus;
    default:
      return colors.grey; // Цвет по умолчанию
  }
};

const TaskComponent = React.memo(({ status, start_time, end_time, service, address_client, employees, taskId }) => {

  const statusColor = getStatusColor(status);
  const navigation = useNavigation();

  // Обработчик нажатия на задачу.
  const handleTaskPress = React.useCallback(() => {
    navigation.navigate('TaskDetail', { taskId });
  }, [taskId, navigation]);

  // Форматирование данных для отображения.
  const formattedStartTime = formatTime(start_time);
  const formattedEndTime = formatTime(end_time);
  const truncatedServiceName = truncateService(service);
  const addressText = formatAddress(address_client);

  // JSX разметка компонента.
  return (
    <TouchableOpacity onPress={handleTaskPress} accessibilityLabel={`Task ${truncatedServiceName}`}>
      <View style={[styles.task, { borderColor: statusColor }]}>
        <View style={styles.taskHeader}>
          <View style={styles.taskHeaderLeft}>
            <Text style={styles.taskTime}>{formattedStartTime}</Text>
            <Text style={styles.taskTime}> - {formattedEndTime}</Text>
          </View>
          <View style={styles.taskHeaderRight}>
            <View style={[styles.taskStatus, { backgroundColor: statusColor }]}>
              <Text style={styles.taskStatusText}>{status}</Text>
            </View>
          </View>
        </View>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>{truncatedServiceName}</Text>
          <FollowIcon style={styles.taskStatusIcon} />
        </View>
        <View style={styles.taskFooter}>
          <View style={styles.taskFooterBlock}>
            <ProfileIcon />
            <Text style={styles.taskFooterText}>{`${employees} участник${employees > 1 ? 'ов' : ''}`}</Text>
          </View>
          <View style={styles.taskFooterBlock}>
            <LocationIcon />
            <Text style={styles.taskFooterText}>{addressText}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default TaskComponent;
