import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';

export default function TabIconLabel({ icon, label, focused }) {
  return (
    <View style={styles.tabItem}>
      {icon}
      <Text style={[styles.tabText, focused ? styles.tabTextActive : null]}>{label}</Text>
    </View>
  );
}
