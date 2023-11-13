import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/styles';
import TaskComponent from './TaskComponent';
import { ExpandIcon, CollapseIcon } from '../icons';

const TasksForSelectedDateComponent = ({ tasksByClient, expandedClients, toggleClient }) => {
  if (Object.keys(tasksByClient).length === 0) {
    return <Text style={styles.noTasksText}>Нет задач.</Text>;
  }

  return Object.entries(tasksByClient).map(([client, clientTasks]) => (
    <View key={client}>
      <View style={styles.taskFIO}>
        <Text style={styles.clientName}>{client}</Text>
        <TouchableOpacity onPress={() => toggleClient(client)}>
          {expandedClients.includes(client) ? <CollapseIcon /> : <ExpandIcon />}
        </TouchableOpacity>
      </View>
      {expandedClients.includes(client) && clientTasks.map((task) => (
        <TaskComponent key={task.id} {...task} />
      ))}
    </View>
  ));
};

export default TasksForSelectedDateComponent;
