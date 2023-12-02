import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';
import { SafeAreaView } from 'react-native-safe-area-context';

function FinanceScreen() {
  // Здесь вы можете загрузить информацию о доходах и расходах
  const income = 1000;
  const expenses = 500;

  return (
    <SafeAreaView>
      <Text style={styles.headlineLarge}>Доходы</Text>
      <Text style={styles.titleMedium}>Доход: {income} руб.</Text>
      <Text style={styles.titleMedium}>Расход: {expenses} руб.</Text>
      <Text style={styles.titleMedium}>Баланс: {income - expenses} руб.</Text>
    </SafeAreaView>
  );
}

export default FinanceScreen;
