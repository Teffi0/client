import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TaskDetailScreen from '../screens/TaskDetailScreen';

const Stack = createStackNavigator();

export default function TaskDetailNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TaskDetailScreen" 
        component={TaskDetailScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}