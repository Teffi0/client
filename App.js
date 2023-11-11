import React from 'react';
import { View, StyleSheet } from 'react-native';
import AddClientForm from './AddClientForm'; // Импортируйте новый компонент

const App = () => {
  return (
    <View style={styles.container}>
      {/* Добавьте компонент AddClientForm в вашу главную компоненту */}
      <AddClientForm />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
