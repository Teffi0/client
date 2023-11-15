import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

const SuccessModalContent = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={false}
      animationType="slide"
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Задача успешно добавлена!</Text>
        <TouchableOpacity
          onPress={onClose}
          style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white' }}>Отлично</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export const SuccessModal = React.memo(SuccessModalContent);