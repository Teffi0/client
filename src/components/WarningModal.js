import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import styles from '../styles/styles';

const WarningModalContent = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalViewModal}>
          <Text style={styles.modalText}>Пока нельзя создать черновик</Text>
          <TouchableOpacity
            style={styles.buttonClose}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>Хорошо</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const WarningModal = React.memo(WarningModalContent);