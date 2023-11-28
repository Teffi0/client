import React from 'react';
import { Text } from 'react-native';
import styles from '../styles/styles';

export default function FontError({ message }) {
  return <Text style={styles.errorText}>Error loading fonts: {message}. Please restart the app.</Text>;
}