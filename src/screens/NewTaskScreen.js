import React, { useState, useReducer, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styles from '../styles/styles';
import TaskForm from '../components/TaskForm';
import { SuccessModal } from '../components/SuccessModal';
import { WarningModal } from '../components/WarningModal';
import { formReducer, initialState } from '../reducers/formReducer';
import { fetchOptions, handleSaveTask } from '../utils/taskScreenHelpers';

function NewTaskScreen({ onClose, draftData  }) {
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const addButtonTextStyles = styles.addButtonText;

  const [formData, dispatchFormData] = useReducer(formReducer, initialState);

  const handleSave = useCallback(async () => {
    const isValid = await handleSaveTask(formData, setIsSuccessModalVisible);
    if (isValid) {
      setIsSuccessModalVisible(true);
    }
  }, [formData]);

  const closeSuccessModal = () => {
    setIsSuccessModalVisible(false);
    onClose();
  };

  useEffect(() => {
    fetchOptions(dispatchFormData);
  }, []);

  const addButtonStyles = {
    ...styles.addButton,
    ...(isPressed && styles.addButtonPressed),
  };

  return (
    <View style={{ flex: 1 }}>
      <TaskForm
        formData={formData}
        dispatchFormData={dispatchFormData}
        onSave={handleSave}
        setIsWarningModalVisible={setIsWarningModalVisible}
        onClose={onClose}
        draftData={draftData}
      />
      <TouchableOpacity style={addButtonStyles} onPress={handleSave}>
        <Text style={addButtonTextStyles}>Добавить задачу</Text>
      </TouchableOpacity>
      <SuccessModal isVisible={isSuccessModalVisible} onClose={closeSuccessModal} />
      <WarningModal isVisible={isWarningModalVisible} onClose={() => setIsWarningModalVisible(false)} />
    </View>
  );
}

export default NewTaskScreen;