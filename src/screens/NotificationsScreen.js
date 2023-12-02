import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';
import { SafeAreaView } from 'react-native-safe-area-context';

function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headline}>Notifications</Text>
    </SafeAreaView>
  );
}

export default NotificationsScreen;