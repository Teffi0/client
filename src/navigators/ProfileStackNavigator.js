import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import ClientBaseScreen from '../screens/ClientBaseScreen';
import EmployeesScreen from '../screens/EmployeesScreen';
import InventoryScreen from '../screens/InventoryScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientBase" component={ClientBaseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Employees" component={EmployeesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Inventory" component={InventoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
