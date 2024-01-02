import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, BackHandler, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/styles';
import DateInput from './DateInput';
import DropdownEmployee from './DropdownEmployee';
import DropdownService from './DropdownService';
import DropdownItem from './DropdownItem';
import DropdownClient from './DropdownClient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { BackIcon, DeleteIcon } from '../icons';
import { format } from 'date-fns';
import DropdownWithSearch from './DropdownWithSearch';
import axios from 'axios';
import { fetchServiceNamesByIds, fetchTaskParticipants } from '../utils/tasks';
import { handleSaveTask, updateDraft } from '../utils/taskScreenHelpers';
import * as ImagePicker from 'expo-image-picker';

function TaskForm({ formData, dispatchFormData, onClose, draftData }) {
    const [selectedService, setSelectedService] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState([]);
    const [service, setServices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [clients, setClients] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [selectedInventory, setSelectedInventory] = useState([]);
    const [preselectedInventory, setPreselectedInventory] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fullScreenImageModalVisible, setFullScreenImageModalVisible] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [isFormInitialized, setIsFormInitialized] = useState(false);
    const [isNewClientAdded, setIsNewClientAdded] = useState(false);
    const [isAddingNewClient, setIsAddingNewClient] = useState(false);
    const [isClientFromDraft, setIsClientFromDraft] = useState(false);
    const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
    const [address, setAddress] = useState({
        city: '',
        street: '',
        house: '',
        entrance: '',
        floor: ''
    });

    const resetForm = () => {
        setIsNewClientAdded(false);
        setSelectedClient(null);
        setAddress({
            city: '',
            street: '',
            house: '',
            entrance: '',
            floor: ''
        });
        setField('phoneClient', '');
    };

    const handleOpenAddClientForm = () => {
        setIsAddingNewClient(true);
        resetForm();
    };

    const renderClientButton = () => {
        if (isClientFromDraft || (selectedClient && !isAddingNewClient)) {
            return (
                <TouchableOpacity onPress={handleUpdateClient} style={styles.buttonClose}>
                    <Text style={styles.textStyle}>Обновить данные</Text>
                </TouchableOpacity>
            );
        } else if (isAddingNewClient) {
            return (
                <TouchableOpacity onPress={handleAddClient} style={styles.buttonClose}>
                    <Text style={styles.textStyle}>Добавить клиента</Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity onPress={handleOpenAddClientForm} style={styles.buttonClose}>
                    <Text style={styles.textStyle}>Добавить нового клиента</Text>
                </TouchableOpacity>
            );
        }
    };

    const fetchClients = useCallback(async () => {
        try {
            const response = await axios.get(`http://31.129.101.174/clients`);
            setClients(response.data);
        } catch (error) {
            console.error('Ошибка при получении списка клиентов:', error);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

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

    const handleInventoryChange = (newSelectedInventory) => {
        setSelectedInventory(newSelectedInventory);

        // Создаем массив объектов, содержащих id и количество каждого выбранного предмета
        const selectedInventoryData = newSelectedInventory.map(item => {
            return { id: item.id, quantity: item.quantity };
        });

        // Обновляем formData
        dispatchFormData({
            type: 'UPDATE_FORM',
            payload: { selectedInventory: selectedInventoryData }
        });
    };

    const fetchSelectedInventory = async (taskId) => {
        try {
            const response = await axios.get(`http://31.129.101.174/tasks/${taskId}/selected-inventory`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении выбранного инвентаря:', error);
            return [];
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (draftData && draftData.id) {
                const selectedInventoryData = await fetchSelectedInventory(draftData.id);
                setPreselectedInventory(selectedInventoryData);
            }
        };

        loadData();
    }, [draftData]);

    const fetchServices = useCallback(async () => {
        try {
            const response = await fetch('http://31.129.101.174/services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Ошибка при получении инвентаря:', error);
        }
    }, []);

    const fetchEmployees = useCallback(async (taskId) => {
        try {
            const participantData = await fetchTaskParticipants(taskId);
            if (Array.isArray(participantData)) {
                setEmployees(participantData);
                const participantIds = participantData.map(p => p.id);
                setSelectedEmployee(participantIds);
            } else {
                console.error('Полученные данные не являются массивом:', participantData);
            }
        } catch (error) {
            console.error('Ошибка при получении данных сотрудников:', error);
        }
    }, []);


    useEffect(() => {
        fetchServices();
        if (draftData && !isFormInitialized) {
            fetchEmployees(draftData.id);
        }
    }, [fetchServices, draftData, isFormInitialized, fetchEmployees]);

    useEffect(() => {
        dispatchFormData({
            type: 'UPDATE_FORM',
            payload: { selectedService }
        });
    }, [selectedService, dispatchFormData]);

    useEffect(() => {
        dispatchFormData({
            type: 'UPDATE_FORM',
            payload: { selectedEmployee }
        });
    }, [selectedEmployee, dispatchFormData]);

    useEffect(() => {
        if (draftData && !isFormInitialized) {
            (async () => {
                const serviceNames = await fetchServiceNamesByIds(draftData.service);
                if (!serviceNames.noServices) {
                    const serviceIds = Object.keys(serviceNames).map(Number);
                    setSelectedService(serviceIds);
                }

                const employeeData = await fetchTaskParticipants(draftData.id);
                if (employeeData && Array.isArray(employeeData)) {
                    const employeeIds = employeeData.map(employee => employee.id);
                    setSelectedEmployee(employeeIds);
                }

                const formatTimeString = (timeString) => {
                    return timeString ? new Date('1970-01-01T' + timeString + 'Z') : null;
                };

                const formattedDraftData = {
                    ...draftData,
                    cost: draftData.cost ? draftData.cost.toString() : '',
                    description: draftData.description || '',
                    startDate: draftData.start_date ? new Date(draftData.start_date) : null,
                    endDate: draftData.end_date ? new Date(draftData.end_date) : null,
                    startDateTime: formatTimeString(draftData.start_time),
                    endDateTime: formatTimeString(draftData.end_time),
                    paymentMethod: draftData.payment || '',
                    fullnameClient: draftData.fullname_client || '',
                    phone: draftData.phone || '',
                    selectedResponsible: draftData.responsible || '',
                    addressClient: draftData.address_client || '',
                };

                if (formattedDraftData.fullnameClient) {
                    const client = clients.find(c => c.full_name === formattedDraftData.fullnameClient);
                    if (client) {
                        setSelectedClient(client);
                        setIsClientFromDraft(true);
                    }
                }

                setIsFormInitialized(true);

                if (JSON.stringify(formData) !== JSON.stringify(formattedDraftData)) {
                    dispatchFormData({
                        type: 'SET_FORM',
                        payload: formattedDraftData
                    });
                }
            })();
        }
    }, [draftData, formData, dispatchFormData, isFormInitialized, fetchServiceNamesByIds, fetchTaskParticipants, clients]);

    useEffect(() => {
        if (selectedClient) {
            const addressRegex = /город\s([^,]+), улица\s([^,]+), дом\s([^,]+), подъезд\s([^,]+), этаж\s([^,]+)/;
            const addressMatch = selectedClient.address.match(addressRegex);

            if (addressMatch) {
                setAddress({
                    city: addressMatch[1] || '',
                    street: addressMatch[2] || '',
                    house: addressMatch[3] || '',
                    entrance: addressMatch[4] || '',
                    floor: addressMatch[5] || ''
                });
                setField('phoneClient', selectedClient.phone_number || '');
                setIsNewClientAdded(true);
            }
        } else {
            // обнуление данных при отсутствии выбранного клиента
            setAddress({
                city: '',
                street: '',
                house: '',
                entrance: '',
                floor: ''
            });
            setField('phoneClient', '');
            setIsNewClientAdded(false);
        }
    }, [selectedClient]);

    useEffect(() => {
        if (draftData) {
            Object.entries(draftData).forEach(([key, value]) => {
                dispatchFormData({ type: 'UPDATE_FORM', payload: { [key]: value } });
            });
        }
    }, [draftData, dispatchFormData]);

    useEffect(() => {
        let totalCost = 0;
        selectedService.forEach(serviceId => {
            const serviceItem = service.find(s => s.id === serviceId);
            if (serviceItem) {
                totalCost += parseInt(serviceItem.cost, 10);
            }
        });

        dispatchFormData({ type: 'UPDATE_FORM', payload: { cost: totalCost.toString() } });
    }, [selectedService, service, dispatchFormData]);

    const updateTotalCost = useCallback((selectedItems) => {
        let totalCost = 0;
        selectedItems.forEach(item => {
            const serviceItem = service.find(s => s.id === item.id);
            if (serviceItem) {
                totalCost += parseInt(serviceItem.cost, 10);
            }
        });

        dispatchFormData({ type: 'UPDATE_FORM', payload: { cost: totalCost.toString() } });
    }, [service, dispatchFormData]);

    const handleSave = useCallback(async () => {
        let updatedFormData = { ...formData };

        if (!updatedFormData.startDate) {
            const today = new Date();
            updatedFormData.startDate = format(today, 'yyyy-MM-dd');
        }

        updatedFormData.status = 'черновик';

        try {
            const isUpdating = draftData && draftData.id;
            if (isUpdating) {
                await updateDraft(draftData.id, updatedFormData);
            } else {
                await handleSaveTask(updatedFormData);
            }
        } catch (error) {
            console.error('Ошибка сохранения задачи', error);
        }
    }, [formData, draftData, handleSaveTask]);

    const handleAddClient = async () => {
        const clientData = {
            full_name: formData.fullnameClient,
            phone_number: formData.phoneClient,
            address: `город ${address.city}, улица ${address.street}, дом ${address.house}, подъезд ${address.entrance}, этаж ${address.floor}`
        };
        try {
            const response = await axios.post(`http://31.129.101.174/clients`, clientData);
            alert('Клиент успешно добавлен');
            setClients([...clients, clientData]);
            setSelectedClient(clientData);
            setIsAddingNewClient(false);
        } catch (error) {
            console.error('Ошибка при добавлении клиента:', error);
        }
    };

    useEffect(() => {
        if (selectedClient && !isNewClientAdded) {
            const updatedClientData = {
                ...selectedClient,
                address: `город ${address.city}, улица ${address.street}, дом ${address.house}, подъезд ${address.entrance}, этаж ${address.floor}`,
                phone_number: formData.phoneClient
            };

            setClients(prevClients => {
                return prevClients.map(client =>
                    client.id === selectedClient.id ? updatedClientData : client
                );
            });

            // Это установит флаг в true, чтобы предотвратить повторное обновление
            setIsNewClientAdded(true);
        }
    }, [selectedClient, address, formData.phoneClient]);


    const handleUpdateClient = async () => {
        const { city, street, house, entrance, floor } = address;
        const fullAddress = `город ${city}, улица ${street}, дом ${house}, подъезд ${entrance}, этаж ${floor}`;
        setField('addressClient', fullAddress);
        if (!selectedClient) {
            alert('Клиент не выбран.');
            return;
        }

        const updatedClientData = {
            full_name: formData.fullnameClient,
            phone_number: formData.phoneClient,
            address: `город ${address.city}, улица ${address.street}, дом ${address.house}, подъезд ${address.entrance}, этаж ${address.floor}`
        };

        try {
            await axios.put(`http://31.129.101.174/clients/${selectedClient.id}`, updatedClientData);
            alert('Данные клиента обновлены');

            const updatedClients = clients.map(client =>
                client.id === selectedClient.id ? { ...client, ...updatedClientData } : client
            );
            setClients(updatedClients);

        } catch (error) {
            console.error('Ошибка при обновлении данных клиента:', error);
        }
    };

    const handleAutoUpdateClient = async () => {
        const { city, street, house, entrance, floor } = address;
        const fullAddress = `город ${city}, улица ${street}, дом ${house}, подъезд ${entrance}, этаж ${floor}`;
        setField('addressClient', fullAddress);
        if (!selectedClient) {
            alert('Клиент не выбран.');
            return;
        }

        const updatedClientData = {
            full_name: formData.fullnameClient,
            phone_number: formData.phoneClient,
            address: `город ${address.city}, улица ${address.street}, дом ${address.house}, подъезд ${address.entrance}, этаж ${address.floor}`
        };

        try {
            const updatedClients = clients.map(client =>
                client.id === selectedClient.id ? { ...client, ...updatedClientData } : client
            );
            setClients(updatedClients);

        } catch (error) {
            console.error('Ошибка при выборе клиента:', error);
        }
    };
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

    const handleRemoveImage = (index) => {
        setSelectedImages(currentImages => {
            const updatedImages = currentImages.filter((_, i) => i !== index);
            dispatchFormData({
                type: 'UPDATE_FORM',
                payload: { selectedImages: updatedImages.map(img => img.uri) }
            });
            return updatedImages;
        });
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
                const newImages = pickerResult.assets || [];
                setSelectedImages(prevImages => [...prevImages, ...newImages]);

                // Обновляем formData
                dispatchFormData({
                    type: 'UPDATE_FORM',
                    payload: { selectedImages: [...formData.selectedImages, ...newImages.map(img => img.uri)] }
                });
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

    const processServerImages = (serverImages) => {
        return serverImages.map(img => ({
            uri: `http://31.129.101.174${img.photo_url}`, // Добавляем базовый URL сервера
            width: null, // Ширина и высота обычно неизвестны для серверных изображений, если только сервер их не предоставляет
            height: null,
            type: 'image', // Тип можно установить статически, если все файлы являются изображениями
        }));
    };

    // Функция для получения фотографий с сервера и их загрузки
    const fetchTaskImages = async (taskId) => {
        try {
            const response = await axios.get(`http://31.129.101.174/tasks/${taskId}/photos`);
            if (response.data && Array.isArray(response.data)) {
                // Преобразуем и загружаем изображения с сервера
                const serverImages = processServerImages(response.data);
                setSelectedImages(prevImages => [...prevImages, ...serverImages]);
            }
        } catch (error) {
            console.error('Ошибка при загрузке изображений задачи:', error);
        }
    };

    // Вызов функции загрузки при инициализации компонента
    useEffect(() => {
        if (draftData && draftData.id) {
            fetchTaskImages(draftData.id); // Загружаем изображения, если есть ID задачи
        }
    }, [draftData]);


    const handleAddressChange = useCallback((field, value) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleCostChange = useCallback(text => {
        const newText = text.replace(/^0+/, '');
        dispatchFormData({ type: 'UPDATE_FORM', payload: { cost: newText } });
    }, [dispatchFormData]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                Alert.alert(
                    "Сохранить как черновик?",
                    "Вы хотите сохранить эту задачу как черновик?",
                    [
                        {
                            text: "Нет",
                            onPress: onClose, // Это закроет модальное окно без сохранения
                            style: "cancel"
                        },
                        {
                            text: "Сохранить",
                            onPress: () => {
                                handleSave(); // Сохраняем данные
                                onClose; // Затем закрываем модальное окно
                            }
                        }
                    ],
                    { cancelable: false }
                );
                return true; // Предотвращает действие по умолчанию
            }
        );

        return () => backHandler.remove();
    }, [formData, onClose, handleSave]);


    const handleBackPress = () => {
        if (formData.status === 'отсутствует') {
            Alert.alert(
                "Сохранить как черновик?",
                "Вы хотите сохранить эту задачу как черновик?",
                [
                    {
                        text: "Нет",
                        onPress: onClose,
                        style: "cancel"
                    },
                    {
                        text: "Сохранить",
                        onPress: () => {
                            handleSave();
                            onClose();
                        }
                    }
                ],
                { cancelable: false }
            );
        } else {
            Alert.alert(
                "Отменить редактирование?",
                "Вы хотите отменить редактирование?",
                [
                    {
                        text: "Да",
                        onPress: onClose,
                        style: "cancel"
                    },
                    { text: "Нет" }
                ],
                { cancelable: false }
            );
        }
        return true;
    };

    const handleDelete = useCallback(async () => {
        dispatchFormData({ type: 'RESET_FORM' });
    }, [dispatchFormData]);

    const deleteTask = async () => {
        try {
            const response = await axios.delete(`http://31.129.101.174/tasks/${formData.id}`);
            if (response.status === 200) {
                dispatchFormData({ type: 'RESET_FORM' });
                onClose();
            }
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
        }
    };

    const handleDeletePress = () => {
        if (formData.status && formData.status !== "отсутствует") {
            setDeleteConfirmationVisible(true);
        } else {
            dispatchFormData({ type: 'RESET_FORM' });
            onClose();
        }
    };

    const showDeleteConfirmationAlert = () => {
        Alert.alert(
            "Подтвердите удаление",
            "Вы уверены, что хотите удалить эту задачу?",
            [
                {
                    text: "Нет",
                    onPress: () => setDeleteConfirmationVisible(false),
                    style: "cancel"
                },
                { text: "Да", onPress: deleteTask }
            ]
        );
    };

    useEffect(() => {
        if (isDeleteConfirmationVisible) {
            showDeleteConfirmationAlert();
        }
    }, [isDeleteConfirmationVisible]);

    const setField = useCallback((field, value) => {
        dispatchFormData({ type: 'UPDATE_FORM', payload: { [field]: value } });
    }, [dispatchFormData]);

    const handleChange = useCallback((field) => (value) => {
        setField(field, value);

        if (field === 'fullnameClient') {
            const client = clients.find(client => client.full_name === value);
            if (client) {
                setSelectedClient(client);
                setField('addressClient', client.address || '');
                setField('phoneClient', client.phone_number || '');
            }
        }
    }, [setField, clients]);

    const toggleStartPicker = useCallback(() => {
        setField('isStartPickerVisible', !formData.isStartPickerVisible);
    }, [formData.isStartPickerVisible, setField]);

    const toggleEndPicker = useCallback(() => {
        setField('isEndPickerVisible', !formData.isEndPickerVisible);
    }, [formData.isEndPickerVisible, setField]);

    const handleStartPicked = useCallback((date) => {
        dispatchFormData({ type: 'UPDATE_FORM', payload: { startDateTime: date } });
        toggleStartPicker();
    }, [toggleStartPicker, dispatchFormData]);

    const handleEndPicked = useCallback((date) => {
        dispatchFormData({ type: 'UPDATE_FORM', payload: { endDateTime: date } });
        toggleEndPicker();
    }, [toggleEndPicker, dispatchFormData]);

    const handleServiceChange = useCallback((newSelectedServiceIds) => {
        setSelectedService(newSelectedServiceIds);
        dispatchFormData({
            type: 'UPDATE_FORM',
            payload: { selectedService: newSelectedServiceIds }
        });
    }, [dispatchFormData]);

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
                    <Text style={[styles.titleMedium, { flex: 1, textAlign: 'center' }]}>Добавление задачи</Text>
                    <TouchableOpacity onPress={handleDeletePress}>
                        <DeleteIcon />
                    </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never">
                    <View style={[styles.contentContainer, { backgroundColor: "#f9f9f9", borderRadius: 24, marginBottom: 24 }]}>
                        {tryRender(() => (
                            <>
                                <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Данные задачи</Text>

                            </>
                        ))}

                        {tryRender(() => (
                            <View>
                                <View style={{ flex: 1, marginBottom: 24 }}>
                                    <Text style={styles.label}>Способ оплаты</Text>
                                    <DropdownService
                                        options={service}
                                        selectedValues={selectedService}
                                        onValueChange={handleServiceChange}
                                        updateTotalCost={updateTotalCost}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Способ оплаты</Text>
                                        <DropdownWithSearch
                                            options={formData.paymentMethodOptions}
                                            selectedValue={formData.paymentMethod}
                                            onValueChange={handleChange('paymentMethod')}
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={styles.label}>Стоимость</Text>
                                        <TextInput
                                            style={styles.costInput}
                                            placeholder="1000"
                                            value={formData.cost.toString()}
                                            onChangeText={handleCostChange}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                        {tryRender(() => (
                            <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Начальная дата</Text>
                                    <DateInput
                                        date={formData.startDate}
                                        placeholder="ГГГГ-ММ-ДД"
                                        onDateChange={(dateType, selectedDate) => dispatchFormData({ type: 'UPDATE_FORM', payload: { [dateType]: selectedDate } })}
                                        dateType="startDate"
                                        minDate={new Date()}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Конечная дата</Text>
                                    <DateInput
                                        date={formData.endDate}
                                        placeholder="ГГГГ-ММ-ДД"
                                        onDateChange={(dateType, selectedDate) => dispatchFormData({ type: 'UPDATE_FORM', payload: { [dateType]: selectedDate } })}
                                        dateType="endDate"
                                        minDate={new Date()}
                                    />
                                </View>
                            </View>
                        ))}
                        {tryRender(() => (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Начало работы</Text>
                                    <TouchableOpacity onPress={toggleStartPicker} style={styles.dateInputContainer}>
                                        <TextInput
                                            value={formData.startDateTime ? format(formData.startDateTime, 'HH:mm') : ''}
                                            placeholder="HH:mm"
                                            editable={false}
                                            style={styles.selectedItemText}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Конец работы</Text>
                                    <TouchableOpacity onPress={toggleEndPicker} style={styles.dateInputContainer}>
                                        <TextInput
                                            value={formData.endDateTime ? format(formData.endDateTime, 'HH:mm') : ''}
                                            placeholder="HH:mm"
                                            editable={false}
                                            style={styles.selectedItemText}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        <DateTimePickerModal
                            isVisible={formData.isStartPickerVisible}
                            mode="time"
                            onConfirm={handleStartPicked}
                            onCancel={toggleStartPicker}
                            is24Hour={true}
                            date={formData.startDateTime || new Date()}
                        />

                        <DateTimePickerModal
                            isVisible={formData.isEndPickerVisible}
                            mode="time"
                            onConfirm={handleEndPicked}
                            onCancel={toggleEndPicker}
                            is24Hour={true}
                            date={formData.endDateTime || new Date()}
                        />
                    </View>
                    <View style={[styles.contentContainer, { backgroundColor: "#f9f9f9", borderRadius: 24, marginBottom: 24 }]}>
                        {tryRender(() => (
                            <>
                                <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Команда</Text>
                                <View style={{ marginBottom: 24 }}>
                                    <Text style={styles.label}>Ответственный</Text>
                                    <DropdownWithSearch
                                        options={formData.responsibleOptions}
                                        selectedValue={formData.selectedResponsible}
                                        onValueChange={handleChange('selectedResponsible')}
                                    />

                                </View>
                                <View>
                                    <Text style={styles.label}>Участники</Text>
                                    <DropdownEmployee
                                        options={formData.employeesOptions}
                                        selectedValues={selectedEmployee}
                                        onValueChange={setSelectedEmployee}
                                    />
                                </View>
                            </>
                        ))}
                    </View>
                    <View style={[styles.contentContainer, { backgroundColor: "#f9f9f9", borderRadius: 24, marginBottom: 24 }]}>
                        {tryRender(() => (
                            <View>
                                <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Данные клиента</Text>
                                <View style={{ marginBottom: 24 }}>
                                    <Text style={styles.label}>ФИО клиента</Text>
                                    <DropdownClient
                                        options={formData.fullnameClientOptions}
                                        selectedValue={formData.fullnameClient}
                                        disabled={isAddingNewClient}
                                        onValueChange={(value) => {
                                            handleChange('fullnameClient')(value);
                                            setAddress(prevAddress => ({
                                                ...prevAddress,
                                                city: '',
                                                street: '',
                                                house: '',
                                                entrance: '',
                                                floor: ''
                                            }));
                                        }}
                                    />
                                </View>
                                {(isAddingNewClient || selectedClient) && (
                                    <View>
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text style={styles.label}>Город</Text>
                                            <TextInput
                                                placeholder="Город"
                                                value={address.city}
                                                onChangeText={(text) => handleAddressChange('city', text)}
                                                style={[styles.addressInput, { marginBottom: 24 }]}
                                            />
                                            <Text style={styles.label}>Улица</Text>
                                            <TextInput
                                                placeholder="Улица"
                                                value={address.street}
                                                onChangeText={(text) => handleAddressChange('street', text)}
                                                style={[styles.addressInput, { marginBottom: 24 }]}
                                            />
                                            <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}>
                                                <View style={{ flexDirection: "column" }}>
                                                    <Text style={styles.label}>Дом/Квартира</Text>
                                                    <TextInput
                                                        placeholder="Дом/Квартира"
                                                        value={address.house}
                                                        onChangeText={(text) => handleAddressChange('house', text)}
                                                        style={[styles.addressInput, { marginBottom: 24 }]}
                                                    />
                                                </View>
                                                <View style={{ flexDirection: "column" }}>
                                                    <Text style={styles.label}>Подъезд</Text>
                                                    <TextInput
                                                        placeholder="Подъезд"
                                                        value={address.entrance}
                                                        onChangeText={(text) => handleAddressChange('entrance', text)}
                                                        style={[styles.addressInput, { marginBottom: 24, marginRight: 8 }]}
                                                    />
                                                </View>
                                                <View style={{ flexDirection: "column" }}>
                                                    <Text style={styles.label}>Этаж</Text>
                                                    <TextInput
                                                        placeholder="Этаж"
                                                        value={address.floor}
                                                        onChangeText={(text) => handleAddressChange('floor', text)}
                                                        style={[styles.addressInput, { marginBottom: 24, marginRight: 8 }]}
                                                    />
                                                </View>
                                            </View>

                                            <Text style={styles.label}>Номер телефона клиента</Text>
                                            <TextInput
                                                placeholder="+79999999999"
                                                value={formData.phoneClient}
                                                onChangeText={(text) => setField('phoneClient', text)}
                                                keyboardType="phone-pad"
                                                style={[styles.addressInput, { marginBottom: 24 }]}
                                            />
                                        </View>

                                    </View>
                                )}
                                {renderClientButton()}
                            </View>
                        ))}
                    </View>
                    {formData.status === "выполнено" && (
                        <View style={{ marginBottom: 24 }}>
                            <View style={[styles.contentContainer, { backgroundColor: "#f9f9f9", borderRadius: 24 }]}>
                                {tryRender(() => (
                                    <View>
                                        <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Отчёт</Text>
                                        <View style={styles.commentContainer}>
                                            <DropdownItem
                                                label="Расходники"
                                                options={inventoryItems}
                                                selectedValues={selectedInventory}
                                                onValueChange={handleInventoryChange}
                                                preselectedItems={preselectedInventory}
                                            />
                                            <ImagePreview
                                                images={selectedImages}
                                                onAddPress={handleChoosePhoto}
                                                onRemovePress={handleRemoveImage}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}


                    <View style={{ marginBottom: 320 }}>
                        <View style={[styles.contentContainer, { backgroundColor: "#f9f9f9", borderRadius: 24 }]}>
                            {tryRender(() => (
                                <View>
                                    <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Дополнительно</Text>
                                    <View style={styles.commentContainer}>
                                        <Text style={styles.label}>Примечание</Text>
                                        <TextInput
                                            placeholder="Добавьте примечание"
                                            value={formData.description}
                                            onChangeText={(text) => setField('description', text)}
                                            multiline={true}
                                            numberOfLines={4}
                                            style={styles.commentInput}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
    function tryRender(renderFunc) {
        try {
            return renderFunc();
        } catch (error) {
            console.error("Ошибка при отрисовке элемента:", error);
            return <Text>Ошибка при отрисовке</Text>;
        }
    }
}

export default TaskForm;