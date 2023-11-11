import React from 'react';
import { View, Text } from 'react-native';

const TaskDetailScreen = ({ route }) => {
  // Здесь вы можете получить данные о задаче из параметров маршрута (route.params)

  return (
    <View>
      <Text>Детальная информация о задаче</Text>
    </View>
  );
}

export default TaskDetailScreen;
