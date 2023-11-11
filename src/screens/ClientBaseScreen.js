import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';

function ClientBaseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headline}>Client Base</Text>
    </View>
  );
}

export default ClientBaseScreen;