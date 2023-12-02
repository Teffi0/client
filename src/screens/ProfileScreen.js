import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/styles';
import { SafeAreaView } from 'react-native-safe-area-context';

function ProfileScreen() {
  const navigation = useNavigation();

  // Make sure these strings match your route names
  const handleHeaderItemClick = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.headlineLarge}>Профиль</Text>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerItem}
            onPress={() => handleHeaderItemClick('ClientBase')} // Changed to the route name
          >
            <Text style={styles.headerItemText}>Клиентская база</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerItem}
            onPress={() => handleHeaderItemClick('Inventory')} // Changed to the route name
          >
            <Text style={styles.headerItemText}>Складской учёт</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerItem}
            onPress={() => handleHeaderItemClick('Employees')} // Changed to the route name
          >
            <Text style={styles.headerItemText}>Сотрудники</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerItem}
            onPress={() => handleHeaderItemClick('Notifications')} // Changed to the route name
          >
            <Text style={styles.headerItemText}>Уведомления</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ProfileScreen;
