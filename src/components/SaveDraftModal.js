// SaveDraftModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

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
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Сохранить как черновик?</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onSaveDraft}>
            <Text style={styles.modalButtonText}>Сохранить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={onDelete}>
            <Text style={styles.modalButtonText}>Нет, спасибо</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalView: {
    height: screenHeight * 0.4,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  modalButton: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default SaveDraftModal;
