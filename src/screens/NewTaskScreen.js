import React, { useState, useReducer, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import styles from '../styles/styles';
import TaskForm from '../components/TaskForm';
import { formReducer, initialState } from '../reducers/formReducer';
import { fetchOptions, handleSaveTask, updateDraft, validateFormData } from '../utils/taskScreenHelpers';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

function NewTaskScreen({ onClose, draftData, selectedDate }) {
  const [userId, setUserId] = useState(null);
  const [isPressed, setIsPressed] = useState(false);
  const addButtonTextStyles = styles.addButtonText;
  const [formData, dispatchFormData] = useReducer(formReducer, initialState);
  const addButtonTitle = formData.status !== 'отсутствует' ? "Применить изменения" : "Добавить задачу";

  const getUserId = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setUserId(userId);
  };

  useEffect(() => {
    getUserId();
  }, []);

  const handleSave = useCallback(async () => {
    if (formData.status === 'отсутствует') {
      formData.status = "новая";
    }
    if (formData.status === 'черновик') {
      const updatedFormData = { ...formData, status: 'новая' };
      // Валидируем обновленные данные
      if (validateFormData(updatedFormData)) {
        await updateDraft(draftData.id, updatedFormData);
      }
    } else {
      const success = await handleSaveTask(formData);
      if (success) {
        Alert.alert("Успех", "Задача успешно добавлена", [
          { text: "OK", onPress: () => onClose() }
        ]);
      }
    }
  }, [formData, draftData, userId]);

  useEffect(() => {
    if (draftData) {
      // Инициализируем форму данными для редактирования
      dispatchFormData({ type: 'SET_FORM', payload: draftData });
    }
  }, [draftData, dispatchFormData]);

  useEffect(() => {
    if (userId) {
      fetchOptions(userId, dispatchFormData);
    }
  }, [userId]);

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
        <Text style={addButtonTextStyles}>{addButtonTitle}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

NewTaskScreen.propTypes = {
  onClose: PropTypes.func.isRequired,
  draftData: PropTypes.object,
  selectedDate: PropTypes.instanceOf(Date) // Убираем isRequired
};

export default NewTaskScreen;