import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from '../styles/styles';

function FeedScreen() {
  // Здесь вы можете загрузить новости или уведомления с сервера
  const notifications = [
    { id: 1, message: 'Новая новость 1' },
    { id: 2, message: 'Уведомление 2' },
    // Добавьте другие уведомления или новости
  ];

  return (
    <ScrollView>
      <Text style={styles.headlineLarge}>Лента</Text>
      {notifications.map((notification) => (
        <View key={notification.id}>
          <Text style={styles.titleMedium}>{notification.message}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export default FeedScreen;
