import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/styles';
import { formatDate, formatTime } from '../utils/dateFormatter';
import { updateTaskStatus } from '../utils/taskScreenHelpers';
import DropdownItem from '../components/DropdownItem';
import { fetchTaskParticipants, fetchDraftData } from '../utils/tasks';
import { BackIcon, EditIcon, None } from '../icons';
import NewTaskScreen from './NewTaskScreen';
import * as ImagePicker from 'expo-image-picker';

const TaskDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { params: { serviceName, ...initialTask } = {} } = route.params;
  const [task, setTask] = useState(initialTask);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [taskInventory, setTaskInventory] = useState([]);
  const [isNewTaskScreenVisible, setNewTaskScreenVisible] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [fullScreenImageModalVisible, setFullScreenImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openFullScreenImage = (index) => {
    setCurrentImageIndex(index);
    setFullScreenImageModalVisible(true);
  };

  const showNextImage = () => {
    if (currentImageIndex < selectedImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const showPreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const FullScreenImageModal = ({ isVisible, onClose }) => {
    const imageUri = selectedImages[currentImageIndex]?.uri;

    return (
      <Modal
        visible={isVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
            />
          )}
          <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20 }} onPress={onClose}>
            <Text style={{ color: 'white', fontSize: 30 }}>×</Text>
          </TouchableOpacity>

          {currentImageIndex > 0 && (
            <TouchableOpacity
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: '50%', justifyContent: 'center' }}
              onPress={showPreviousImage}
            >
              <Text style={{ color: 'white', fontSize: 42, textAlign: 'left', marginLeft: 20 }}>‹</Text>
            </TouchableOpacity>
          )}

          {currentImageIndex < selectedImages.length - 1 && (
            <TouchableOpacity
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, left: '50%', justifyContent: 'center' }}
              onPress={showNextImage}
            >
              <Text style={{ color: 'white', fontSize: 42, textAlign: 'right', marginRight: 20 }}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    );
  };

  const handleChoosePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Уведомление', 'Необходим доступ к фотографиям для загрузки в отчет');
      return;
    }

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!pickerResult.canceled) {
        setSelectedImages(prevImages => [...prevImages, ...(pickerResult.assets || [])]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при выборе фотографий');
    }
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Уведомление', 'Пожалуйста, выберите фотографии для загрузки');
      return;
    }

    const formData = new FormData();
    selectedImages.forEach((image, index) => {
      formData.append('photos', {
        name: `photo_${index}.jpg`,
        type: 'image/jpeg', // Используем стандартный MIME-тип для JPEG
        uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
      });
    });

    try {
      // Предполагаем, что taskId доступен в текущем состоянии
      const taskId = task.id; // или получить его из другого источника в зависимости от структуры приложения

      const response = await fetch(`http://31.129.101.174/tasks/${taskId}/photos`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) throw new Error('Сетевая ошибка при загрузке изображений');

      setSelectedImages([]);
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при загрузке фотографий');
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(currentImages => currentImages.filter((_, i) => i !== index));
  };

  const handleAddTaskPress = async () => {
    if (task.status === 'в процессе') {
      setModalVisible(true);
    } else {
      try {
        const updatedTask = { ...task, status: 'в процессе' };
        await updateTaskStatus(task.id, updatedTask); // Отправляем полный объект задачи
        setTask(updatedTask); // Обновляем состояние задачи
        navigation.navigate('Tabs', { screen: 'TasksScreen' });
      } catch (error) {
        console.error('Ошибка при обновлении статуса задачи:', error);
      }
    }
  };

  const handleBackPress = () => {
    navigation.goBack(); // Это вызовет возврат к предыдущему экрану в стеке навигации
  };

  useEffect(() => {
  }, [task.id]);

  useEffect(() => {
    const fetchTaskInventory = async () => {
      if (task.status === 'выполнено') {
        try {
          // Предполагается, что у тебя есть эндпойнт для получения инвентаря конкретной задачи
          const response = await fetch(`http://31.129.101.174/tasks/${task.id}/inventory`);
          const data = await response.json();
          setTaskInventory(data);
        } catch (error) {
          console.error('Ошибка при получении расходников для задачи:', error);
        }
      }
    };

    fetchTaskInventory();
  }, [task.status, task.id]);

  const ImagePreview = ({ images, onRemovePress }) => (
    <ScrollView horizontal style={styles.imagePreviewContainer} showsHorizontalScrollIndicator={false}>
      {images.map((image, index) => (
        <View key={index} style={styles.imageContainer}>
          <TouchableOpacity onPress={() => openFullScreenImage(index)} style={styles.imagePreview}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity style={styles.removeIconContainer} onPress={() => onRemovePress(index)}>
              <Text style={styles.removeIcon}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={handleChoosePhoto} style={styles.image}>
        <View style={styles.photoPickerContainer}>
          <Text style={styles.photoPickerPlusIcon}>+</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  useEffect(() => {
    (async () => {
      const data = await fetchDraftData(task.id);
      setDraftData(data);
    })();
  }, [task.id, task.status]);

  const handleInventoryChange = (newSelectedInventory) => {
    setSelectedInventory(newSelectedInventory);
  };

  const handleEditPress = () => {
    if (draftData) {
      setNewTaskScreenVisible(true);
    } else {
      navigation.navigate('TaskDetail', {
        screen: 'TaskDetailScreen',
        params: { ...task, serviceName },
      });
    }
  };

  const getHeaderTitle = () => {
    switch (task.status) {
      case 'новая':
        return 'Новая задача';
      case 'в процессе':
        return 'Задача в процессе';
      case 'выполнено':
        return 'Завершенная задача';
      default:
        return 'Детали задачи'; // Для случая, если статус неизвестен
    }
  };

  const completeTask = async () => {
    // Проверяем, что выбран хотя бы один инвентарь
    if (selectedInventory.length === 0) {
      alert('Выберите инвентарь перед завершением задачи.');
      return;
    }

    try {
      // Обновляем статус задачи
      const updatedTask = { ...task, status: 'выполнено' };
      const statusResponse = await updateTaskStatus(task.id, updatedTask);

      // Фильтруем выбранный инвентарь, исключая элементы с количеством ноль
      const filteredInventory = selectedInventory.filter(item => item.quantity > 0);

      // Отправляем данные о выбранном инвентаре на сервер
      const inventoryResponse = await fetch(`http://31.129.101.174/tasks/${task.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventory: filteredInventory.map(item => ({
            inventory_id: item.id,
            quantity: item.quantity
          })),
        }),
      });

      if (!inventoryResponse.ok) {
        throw new Error('Ошибка при обновлении инвентаря');
      }

      // Получаем ответ от сервера
      const inventoryResult = await inventoryResponse.json();
      await uploadImages();

      // Закрыть модальное окно и перейти к списку задач
      setModalVisible(false);
      navigation.navigate('Tabs', { screen: 'TasksScreen' });
    } catch (error) {
      console.error('Ошибка при завершении задачи:', error);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('http://31.129.101.174/inventory');
      const data = await response.json();
      setInventoryItems(data);
    } catch (error) {
      console.error('Ошибка при получении инвентаря:', error);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    // Функция для обновления информации о задаче, включая участников
    const updateTaskDetails = async () => {
      const participants = await fetchTaskParticipants(task.id);
      setTask({ ...task, employees: participants });
    };

    updateTaskDetails();
  }, [task.id]);

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const Row = ({ title, value }) => {
    let displayValue = value;

    // Проверяем, является ли value массивом и содержит ли он объекты с полем full_name
    if (Array.isArray(value) && value.length > 0 && value[0].hasOwnProperty('full_name')) {
      displayValue = value.map(employee => employee.full_name).join(', ');
    }

    return (
      <View style={styles.rowStyle}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowValue}>{displayValue}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainerTask}>
        <FullScreenImageModal
          isVisible={fullScreenImageModalVisible}
          imageUri={currentImage}
          onClose={() => setFullScreenImageModalVisible(false)}
        />
        <View style={styles.taskHeader}>
          <TouchableOpacity onPress={handleBackPress}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={[styles.titleMedium, { flex: 1, textAlign: 'center' }]}>
            {getHeaderTitle()}
          </Text>
          <TouchableOpacity onPress={handleEditPress}>
            <EditIcon />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false} overScrollMode="never">
          <Text style={styles.headlineMedium}>{serviceName}</Text>

          <Section title="Клиент">
            <Row title="ФИО:" value={task.fullname_client} />
            <Row title="Телефон:" value={task.phone} />
            <Row title="Адрес:" value={task.address_client} />
          </Section>

          <Section title="Оплата">
            <Row title="Способ оплаты:" value={task.payment || 'Не указан'} />
            <Row title="Стоимость:" value={task.cost ? `${task.cost} руб.` : 'Не указана'} />
          </Section>

          <Section title="Работа">
            <Row title="Ответственный:" value={task.responsible || 'Не назначен'} />
            <Row title="Участники:" value={task.employees || 'Нет информации'} />
            <Row title="Дата и время начала:" value={task.start_date ? `${formatDate(task.start_date)} ${formatTime(task.start_time)}` : 'Не указаны'} />
            <Row title="Дата и время окончания:" value={task.end_date ? `${formatDate(task.end_date)} ${formatTime(task.end_time)}` : 'Не указаны'} />
          </Section>

          {task.status === 'выполнено' && (
            <Section title="Расходники">
              {taskInventory.length > 0 ? (
                taskInventory.map((item, index) => (
                  <Row key={index} title={item.name} value={`Количество: ${item.quantity}`} />
                ))
              ) : (
                <Text style={styles.bodyMedium}>Расходники не использовались.</Text>
              )}
            </Section>
          )}

          <Section title="Описание">
            <Text style={[styles.bodyMedium, { marginBottom: 300 }]}>{task.description || 'Описание отсутствует.'}</Text>
          </Section>
        </ScrollView>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.container}>
            <View style={styles.contentContainerTask}>
              <View style={styles.taskHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <BackIcon />
                </TouchableOpacity>
                <Text style={[styles.titleMedium, { flex: 1, textAlign: 'center' }]}> Отчёт </Text>
                <TouchableOpacity>
                  <None />
                </TouchableOpacity>
              </View>
              <View style={styles.contentContainer}>
                <DropdownItem
                  label="Расходники"
                  options={inventoryItems}
                  selectedValues={selectedInventory}
                  onValueChange={handleInventoryChange}
                />
                <ImagePreview
                  images={selectedImages}
                  onAddPress={handleChoosePhoto}
                  onRemovePress={handleRemoveImage}
                />
                <TouchableOpacity onPress={uploadImages}>
                  <Text>Загрузить фотографии</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={completeTask}>
                  <Text style={styles.addButtonText}>Завершить работу</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        {task.status !== 'выполнено' && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddTaskPress}>
            <Text style={styles.addButtonText}>
              {task.status === 'в процессе' ? 'Добавить расходники' : 'Начать выполнение'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal
        visible={isNewTaskScreenVisible}
        animationType="slide"
        onRequestClose={() => setNewTaskScreenVisible(false)}
      >
        <NewTaskScreen onClose={() => setNewTaskScreenVisible(false)} draftData={draftData} />
      </Modal>
    </SafeAreaView>
  );
};

export default TaskDetailScreen;