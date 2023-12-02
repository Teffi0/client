import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';
import { SafeAreaView } from 'react-native-safe-area-context';

function EmployeesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headline}>Employees</Text>
    </SafeAreaView>
  );
}

export default EmployeesScreen;