import React from 'react';
import { Text } from 'react-native';

export default function FontError({ message }) {
  return <Text style={{ color: 'red' }}>Error loading fonts: {message}. Please restart the app.</Text>;
}