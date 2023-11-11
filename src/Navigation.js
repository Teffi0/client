import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './navigators/TabNavigator'; // Импорт из нового местоположения файла

export default function Navigation() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
