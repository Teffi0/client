import React, { useState, useReducer, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import TaskForm from '../components/TaskForm';
import {SuccessModal} from '../components/SuccessModal';
import {WarningModal} from '../components/WarningModal';
import { formReducer, initialState } from '../reducers/formReducer';
import { fetchOptions, handleSaveTask } from '../utils/taskScreenHelpers';

function NewTaskScreen({ onClose }) {
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [formData, dispatchFormData] = useReducer(formReducer, initialState);

  const handleSave = useCallback(async () => {
    const isValid = await handleSaveTask(formData, setIsSuccessModalVisible);
  }, [formData]);

  const closeSuccessModal = () => {
    setIsSuccessModalVisible(false);
    onClose();
  };

  useEffect(() => {
    fetchOptions(dispatchFormData);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <TaskForm
        formData={formData}
        dispatchFormData={dispatchFormData}
        onSave={handleSave}
        setIsWarningModalVisible={setIsWarningModalVisible}
        onClose={onClose}
      />
      <SuccessModal isVisible={isSuccessModalVisible} onClose={closeSuccessModal} />
      <WarningModal isVisible={isWarningModalVisible} onClose={() => setIsWarningModalVisible(false)} />
    </View>
  );
}

export default NewTaskScreen;