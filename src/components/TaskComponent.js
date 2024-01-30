import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { FollowIcon, ProfileIcon, LocationIcon } from '../icons';
import styles, { colors } from '../styles/styles';
import { useNavigation } from '@react-navigation/native';
import { formatTime, formatAddress } from '../utils/utils'; // Импорт функций из utils.js
import { fetchServiceNamesByIds, fetchDraftData } from '../utils/tasks';
import NewTaskScreen from '../screens/NewTaskScreen';

const getStatusColor = (status) => {
  switch (status) {
    case 'новая':
      return colors.newStatus;
    case 'в процессе':
      return colors.inProcessStatus;
    case 'выполнено':
      return colors.finishedStatus;
    case 'отменено':
      return colors.error; // Добавлен новый статус с цветом error
    case 'черновик':
      return colors.grey;
    default:
      return colors.grey; // Цвет по умолчанию
  }
};

const TaskComponent = React.memo((props) => {
  const [serviceName, setServiceName] = useState('Услуга не указана');
  const [isNewTaskScreenVisible, setNewTaskScreenVisible] = useState(false);
  const [draftData, setDraftData] = useState(null); // Состояние для хранения данных черновика

  useEffect(() => {
    (async () => {
      const services = await fetchServiceNamesByIds(props.service);
      setServiceName(Object.values(services).join(', '));
    })();
  }, [props.service]);

  useEffect(() => {
    if (props.status === 'черновик') {
      // Асинхронно загружаем данные черновика и сохраняем их в состоянии
      (async () => {
        const data = await fetchDraftData(props.id);
        setDraftData(data);
      })();
    }
  }, [props.id, props.status]);

  const statusColor = getStatusColor(props.status);
  const navigation = useNavigation();

  const handleTaskPress = () => {
    if (props.status === 'черновик' && draftData) {
      setNewTaskScreenVisible(true); 
    } else {
      navigation.navigate('TaskDetail', {
        screen: 'TaskDetailScreen',
        params: { ...props, serviceName },
      });
    }
  };

  const formattedStartTime = props.start_time ? formatTime(props.start_time) : 'Не указано';
  const formattedEndTime = props.end_time ? formatTime(props.end_time) : 'Не указано';
  const addressText = props.address_client ? formatAddress(props.address_client) : 'Адрес не указан';
  const employeesText = props.employees ? `${props.employees} участник${props.employees > 1 ? 'ов' : ''}` : 'Участники не указаны';

  return (
    <>
      <TouchableOpacity onPress={handleTaskPress} accessibilityLabel={`Task ${serviceName}`}>
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
            <Text style={styles.taskTitle}>{serviceName}</Text>
            <FollowIcon style={styles.taskStatusIcon} />
          </View>
          <View style={styles.taskFooter}>
            <View style={styles.taskFooterBlock}>
              <LocationIcon />
              <Text style={styles.taskFooterText}>{addressText}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <Modal
        visible={isNewTaskScreenVisible}
        animationType="slide"
        onRequestClose={() => setNewTaskScreenVisible(false)}
      >
        <NewTaskScreen onClose={() => setNewTaskScreenVisible(false)} draftData={draftData} />
      </Modal>
    </>
  );
});

export default TaskComponent;
