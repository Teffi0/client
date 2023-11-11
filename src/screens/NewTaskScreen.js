import React, { useState, useReducer } from 'react';
import { View } from 'react-native';
import TaskForm from '../components/TaskForm';
import { formReducer, initialState } from '../reducers/formReducer';
import { fetchOptions, SuccessModal, WarningModal } from '../utils/taskScreenHelpers';

function NewTaskScreen({ onClose }) {
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [formData, dispatchFormData] = useReducer(formReducer, initialState);

  const handleSave = () => {
    setIsSuccessModalVisible(true);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalVisible(false);
    onClose();
  };

  useState(() => {
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