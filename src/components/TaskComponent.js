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
 * @param {number} props.id - ID задачи.
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

const TaskComponent = React.memo((props) => {
  const statusColor = getStatusColor(props.status);
  const navigation = useNavigation();

  const handleTaskPress = React.useCallback(() => {
    navigation.navigate('TaskDetail', { 
      screen: 'TaskDetailScreen',
      params: { ...props }
    });
  }, [props, navigation]);
  


  const formattedStartTime = formatTime(props.start_time);
  const formattedEndTime = formatTime(props.end_time);
  const truncatedServiceName = truncateService(props.service);
  const addressText = formatAddress(props.address_client);

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
              <Text style={styles.taskStatusText}>{props.status}</Text>
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
            <Text style={styles.taskFooterText}>{`${props.employees} участник${props.employees > 1 ? 'ов' : ''}`}</Text>
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
