import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/styles';
import { SafeAreaView } from 'react-native-safe-area-context';

function ProfileScreen() {
  const navigation = useNavigation();

  // Make sure these strings match your route names
  const handleHeaderItemClick = (screenName) => {
    navigation.navigate(screenName);
  };

  const [userInfo, setUserInfo] = useState({ username: '', password: '' });

  useEffect(() => {
    // Загрузка данных пользователя при монтировании компонента
    const loadUserInfo = async () => {
      const username = await AsyncStorage.getItem('username');
      const password = await AsyncStorage.getItem('password');
      const position = await AsyncStorage.getItem('position');
      setUserInfo({ username, password, position });
    };

    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken'); // Удаление токена пользователя
    navigation.navigate('Login'); // Перенаправление на экран входа
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.headlineLarge}>Профиль</Text>
        <Text style={styles.headerItemText}>Логин: {userInfo.username}</Text>
        <Text style={styles.headerItemText}>Пароль: {userInfo.password}</Text>

        <View style={styles.header}>
          {userInfo.position === 'Руководитель' && (
            <>
              <TouchableOpacity
                style={styles.headerItem}
                onPress={() => handleHeaderItemClick('ProfileClientBase')}
              >
                <Text style={styles.headerItemText}>Клиентская база</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerItem}
                onPress={() => handleHeaderItemClick('ProfileInventory')}
              >
                <Text style={styles.headerItemText}>Складской учёт</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerItem}
                onPress={() => handleHeaderItemClick('ProfileEmployees')}
              >
                <Text style={styles.headerItemText}>Сотрудники</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.headerItem}
            onPress={() => handleHeaderItemClick('ProfileNotifications')} // Changed to the route name
          >
            <Text style={styles.headerItemText}>Уведомления</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerItem}
            onPress={handleLogout}
          >
            <Text style={styles.headerItemText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ProfileScreen;
