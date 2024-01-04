import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/styles';
import TaskComponent from './TaskComponent';
import { ExpandIcon, CollapseIcon } from '../icons';

const TasksForSelectedDateComponent = ({ tasksByClient, expandedClients, toggleClient }) => {
  if (Object.keys(tasksByClient).length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.noTasksText}>Задачи отсутствуют</Text>
      </View>
    );
  }
  return (
    <View style={styles.tasksContainer}>
      {Object.entries(tasksByClient).map(([client, clientTasks]) => (
        <View key={client} style={styles.clientTaskContainer}>
          <TouchableOpacity style={styles.clientHeader} onPress={() => toggleClient(client)}>
            <Text style={styles.clientName}>{client}</Text>
            {expandedClients.has(client) ? <CollapseIcon /> : <ExpandIcon />}
          </TouchableOpacity>
          {expandedClients.has(client) && (
            <View style={styles.clientTasks}>
              {clientTasks.map((task) => (
                <TaskComponent key={task.id} {...task} />
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default TasksForSelectedDateComponent;
