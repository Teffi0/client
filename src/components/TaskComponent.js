import React from 'react';
import { View, Text } from 'react-native';
import { FollowIcon, ProfileIcon, LocationIcon } from '../icons';
import styles from '../styles/styles'; // Импортируем стили
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TaskComponent = ({ status, start_time, service, address_client, employees, taskId }) => {

  const formattedTime = start_time.slice(0, 5);
  const truncatedAssignedId = service.length > 36 ? service.slice(0, 35) + '...' : service;

  const indexOfUl = address_client.indexOf('ул.');
  const addressText = (indexOfUl !== -1 ? address_client.substring(indexOfUl + 3) : address_client).split(',').slice(0, 2).join(',');
  
    const navigation = useNavigation();
    const handleTaskPress = () => {
        navigation.navigate('TaskDetail', { taskId });
    };

  return (
    <TouchableOpacity onPress={handleTaskPress}>
      <View style={styles.task}>
        <View style={styles.taskHeader}>
          <View style={styles.taskHeaderLeft}>
            <Text style={styles.taskTime}>{formattedTime}</Text>
          </View>
          <View style={styles.taskHeaderRight}>
            <View style={styles.taskStatus}>
              <Text style={styles.taskStatusText}>{status}</Text>
            </View>
          </View>
        </View>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>{truncatedAssignedId}</Text>
          <Text style={styles.taskStatusIcon}>
            <FollowIcon />
          </Text>
        </View>
        <View style={styles.taskFooter}>
          <View style={styles.taskFooterBlock}>
            <ProfileIcon />
            <Text style={styles.taskFooterText}>{employees} участник</Text>
          </View>
          <View style={styles.taskFooterBlock}>
            <LocationIcon />
            <Text style={styles.taskFooterText}>{addressText}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default TaskComponent;
