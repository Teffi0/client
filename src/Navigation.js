import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ProfileScreen from './screens/ProfileScreen';
import ClientBaseScreen from './screens/ClientBaseScreen';
import EmployeesScreen from './screens/EmployeesScreen';
import InventoryScreen from './screens/InventoryScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import TasksScreen from './screens/TasksScreen';
import FeedScreen from './screens/FeedScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import LoginScreen from './screens/LoginScreen';

import TabIconLabel from './components/TabIconLabel';
import styles from './styles/styles';
import { TasksIcon, FeedIcon, ProfileIcon } from './icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabScreens = [
  { name: 'Tasks', component: TasksScreen, IconComponent: TasksIcon, label: 'Задачи' },
  { name: 'Feed', component: FeedScreen, IconComponent: FeedIcon, label: 'Лента' },
  { name: 'Profile', component: ProfileScreen, IconComponent: ProfileIcon, label: 'Профиль', nestedScreens: [ClientBaseScreen, EmployeesScreen, InventoryScreen, NotificationsScreen] }
];

function ProfileStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      {TabScreens.find(screen => screen.name === 'Profile').nestedScreens.map((ScreenComponent, index) => (
        <Stack.Screen
          key={index}
          name={`Profile${ScreenComponent.name.replace('Screen', '')}`}
          component={ScreenComponent}
          options={{ headerShown: false }}
        />
      ))}
    </Stack.Navigator>
  );
}


function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Tasks"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: styles.whiteColor.color,
        tabBarInactiveTintColor: styles.darkGreyColor.color,
        tabBarLabelStyle: styles.tabText,
        tabBarStyle: styles.tabBar,
        headerShown: false
      })}
    >
      {TabScreens.map(({ name, component, IconComponent, label, nestedScreens }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={nestedScreens && name === 'Profile' ? ProfileStackScreen : component}
          options={{
            tabBarLabel: '',
            tabBarIcon: ({ focused }) => <TabIconLabel icon={<IconComponent active={focused} />} label={label} focused={focused} />
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const [initialRouteName, setInitialRouteName] = useState('Login');
  const [isTokenChecked, setIsTokenChecked] = useState(false); // Новое состояние для отслеживания загрузки токена

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const apiUrl = 'http://31.129.101.174/login';
      fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId
        },
        body: JSON.stringify({
            // тело запроса
        })
    })
      if (token) {
        setInitialRouteName('Tabs');
      }
      setIsTokenChecked(true); // Обновление состояния после проверки токена
    };

    checkToken();
  }, []);

  // Рендерим NavigationContainer только после загрузки токена
  if (!isTokenChecked) {
    return null; // Или индикатор загрузки
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen}  options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

