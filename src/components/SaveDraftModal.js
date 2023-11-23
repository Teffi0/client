import React, {useCallback} from 'react';
import { Modal, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import styles from '../styles/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SaveDraftModal = ({ isVisible, onClose, onSave, formData }) => {
  const navigation = useNavigation(); // Получаем функцию навигации

  const handleSaveAsDraftAndCloseScreen = useCallback(async () => {
    await AsyncStorage.setItem('taskFormData', JSON.stringify(formData));
    onClose();
  }, [onClose, formData]);
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalViewModal}>
          <Text style={styles.modalText}>Сохранить как черновик?</Text>
          <TouchableOpacity style={[styles.buttonClose, { marginBottom: 16 }]} onPress={onSave}>
            <Text style={styles.textStyle}>Сохранить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonClose} onPress={onClose}>
            <Text style={styles.textStyle}>Нет, спасибо</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SaveDraftModal;