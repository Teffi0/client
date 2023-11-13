import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TasksScreen from '../screens/TasksScreen';
import FeedScreen from '../screens/FeedScreen';
import FinanceScreen from '../screens/FinanceScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import TabIconLabel from '../components/TabIconLabel';
import styles from '../styles/styles';
import { TasksIcon, FeedIcon, FinanceIcon, ProfileIcon } from '../icons';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
          initialRouteName="Tasks"
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: styles.whiteColor.color,
            tabBarInactiveTintColor: styles.darkGreyColor.color,
            tabBarLabelStyle: styles.tabText,
            tabBarStyle: [styles.tabBar],
          })}
        >
          <Tab.Screen
            name="Tasks"
            component={TasksScreen}
            options={{
              tabBarLabel: '',
              tabBarIcon: ({ focused }) => (
                <TabIconLabel icon={<TasksIcon active={focused} />} label="Задачи" focused={focused} />
              ),
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Feed"
            component={FeedScreen}
            options={{
              tabBarLabel: '',
              tabBarIcon: ({ focused }) => (
                <TabIconLabel icon={<FeedIcon active={focused} />} label="Лента" focused={focused} />
              ),
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Finance"
            component={FinanceScreen}
            options={{
              tabBarLabel: '',
              tabBarIcon: ({ focused }) => (
                <TabIconLabel icon={<FinanceIcon active={focused}/>} label="Доходы" focused={focused} />
              ),
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileStackNavigator}
            options={{
              tabBarLabel: '',
              tabBarIcon: ({ focused }) => (
                <TabIconLabel icon={<ProfileIcon active={focused} />} label="Профиль" focused={focused} />
              ),
              headerShown: false,
            }}
          />
        </Tab.Navigator>
      );
}
