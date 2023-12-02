import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';
import { SafeAreaView } from 'react-native-safe-area-context';

function FinanceBaseScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headline}>Finance</Text>
    </SafeAreaView>
  );
}

export default FinanceBaseScreen;