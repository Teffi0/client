// SaveDraftModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import styles from '../styles/styles';

const screenHeight = Dimensions.get('window').height;

const SaveDraftModal = ({ isVisible, onSaveDraft, onDelete, onClose }) => {
  
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
          <TouchableOpacity style={[styles.buttonClose,{marginBottom: 16}]} onPress={onSaveDraft}>
            <Text style={styles.textStyle}>Сохранить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonClose} onPress={onDelete}>
            <Text style={styles.textStyle}>Нет, спасибо</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SaveDraftModal;
