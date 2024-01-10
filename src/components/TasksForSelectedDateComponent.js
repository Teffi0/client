import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/styles';
import TaskComponent from './TaskComponent';
import { ExpandIcon, CollapseIcon } from '../icons';

const TasksForSelectedDateComponent = ({ tasksByClient, expandedClients, toggleClient }) => {
  const TaskList = ({ tasks }) => (
    <View style={styles.clientTasks}>
      {tasks.map(task => <TaskComponent key={task.id} {...task} />)}
    </View>
  );

  return (
    <View style={Object.keys(tasksByClient).length ? styles.tasksContainer : { flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {Object.keys(tasksByClient).length ? 
        Object.entries(tasksByClient).map(([client, tasks]) => (
          <View key={client} style={styles.clientTaskContainer}>
            <TouchableOpacity style={styles.clientHeader} onPress={() => toggleClient(client)}>
              <Text style={styles.clientName}>{client}</Text>
              {expandedClients.has(client) ? <CollapseIcon /> : <ExpandIcon />}
            </TouchableOpacity>
            {expandedClients.has(client) && <TaskList tasks={tasks} />}
          </View>
        )) :
        <Text style={styles.noTasksText}>Задачи отсутствуют</Text>
      }
    </View>
  );
};

export default TasksForSelectedDateComponent;
