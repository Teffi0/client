import React, { useState, useReducer, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import styles from '../styles/styles';
import TaskForm from '../components/TaskForm';
import { SuccessModal } from '../components/SuccessModal';
import { formReducer, initialState } from '../reducers/formReducer';
import { fetchOptions, handleSaveTask, updateDraft, validateFormData } from '../utils/taskScreenHelpers';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';

function NewTaskScreen({ onClose, draftData, selectedDate }) {
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const addButtonTextStyles = styles.addButtonText;

  const [formData, dispatchFormData] = useReducer(formReducer, initialState);

  const handleSave = useCallback(async () => {
    if (formData.status === 'отсутствует') {
      formData.status="новая";
    }
    if (formData.status === 'черновик') {
      const updatedFormData = { ...formData, status: 'новая' };
      // Валидируем обновленные данные
      if (validateFormData(updatedFormData)) {
        await updateDraft(draftData.id, updatedFormData);
        setIsSuccessModalVisible(true); // Показываем модальное окно об успешном добавлении
      }
    } else {
      // В противном случае обновляем статус и вызываем handleSaveTask
      const isValid = await handleSaveTask(formData);
      Alert.alert("Успешно", "Задача успешно добавлена", [
        { text: "OK", onPress: () => onClose() } // Закрытие формы при нажатии OK
      ]);
    }
  }, [formData, draftData]);
  
  useEffect(() => {
    if (draftData) {
      // Инициализируем форму данными для редактирования
      dispatchFormData({ type: 'SET_FORM', payload: draftData });
    }
  }, [draftData, dispatchFormData]);

  const closeSuccessModal = () => {
    setIsSuccessModalVisible(false);
    onClose();
  };

  useEffect(() => {
    fetchOptions(dispatchFormData);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      // Заполняем начальную дату в formData
      dispatchFormData({ type: 'UPDATE_FORM', payload: { startDate: selectedDate } });
    } else {
      // Если selectedDate не определен, устанавливаем сегодняшнюю дату
      dispatchFormData({ type: 'UPDATE_FORM', payload: { startDate: new Date() } });
    }
  }, [selectedDate]);

  const addButtonStyles = {
    ...styles.addButton,
    ...(isPressed && styles.addButtonPressed),
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TaskForm
        formData={formData}
        dispatchFormData={dispatchFormData}
        onSave={handleSave}
        onClose={onClose}
        draftData={draftData}
      />
      <TouchableOpacity style={addButtonStyles} onPress={handleSave}>
        <Text style={addButtonTextStyles}>Добавить задачу</Text>
      </TouchableOpacity>
      <SuccessModal isVisible={isSuccessModalVisible} onClose={closeSuccessModal} />
    </SafeAreaView>
  );
}

NewTaskScreen.propTypes = {
  onClose: PropTypes.func.isRequired,
  draftData: PropTypes.object,
  selectedDate: PropTypes.instanceOf(Date) // Убираем isRequired
};

export default NewTaskScreen;