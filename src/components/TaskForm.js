import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/styles';
import DateInput from './DateInput';
import DropdownEmployee from './DropdownEmployee';
import DropdownService from './DropdownService';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { BackIcon, DeleteIcon } from '../icons';
import { format } from 'date-fns';
import SaveDraftModal from './SaveDraftModal';
import DropdownWithSearch from './DropdownWithSearch';
import axios from 'axios';
import { fetchServiceNamesByIds, fetchTaskParticipants } from '../utils/tasks';
import { handleSaveTask, updateDraft } from '../utils/taskScreenHelpers';

function TaskForm({ formData, dispatchFormData, onClose, draftData }) {
    const [selectedService, setSelectedService] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState([]);
    const [service, setServices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
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
        resetForm(); // Сбрасываем форму при открытии
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
                    // Если услуги были выбраны, восстанавливаем их
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
                    // Добавьте другие поля, если они необходимы
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
        if (formData.fullnameClient) {
            const selectedClient = clients.find(client => client.full_name === formData.fullnameClient);

            if (selectedClient) {
                // Заполнение данных существующего клиента
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
                // Очистка полей для нового клиента
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
        }
    }, [formData.fullnameClient, clients]);

    useEffect(() => {
        if (draftData) {
          // Устанавливаем значения формы из draftData
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
                // Обновление существующего черновика
                await updateDraft(draftData.id, updatedFormData);
            } else {
                // Создание новой задачи
                await handleSaveTask(updatedFormData);
            }
        } catch (error) {
            console.error('Ошибка сохранения задачи', error);
        }
    }, [formData, draftData, handleSaveTask]);

    const handleAddClient = async () => {
        const clientData = {
            // Сбор данных из формы
            full_name: formData.fullnameClient,
            phone_number: formData.phoneClient,
            address: `город ${address.city}, улица ${address.street}, дом ${address.house}, подъезд ${address.entrance}, этаж ${address.floor}`
        };

        try {
            const response = await axios.post(`http://31.129.101.174/clients`, clientData);
            alert('Клиент успешно добавлен');
            setClients([...clients, response.data]); // Обновляем список клиентов
            setSelectedClient(response.data); // Устанавливаем добавленного клиента как выбранного
            setIsAddingNewClient(false); // Закрываем форму добавления
        } catch (error) {
            console.error('Ошибка при добавлении клиента:', error);
        }
    };

    const handleUpdateClient = async () => {
        const { city, street, house, entrance, floor } = address; // Деструктуризация значений из объекта address
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


    const handleAddressChange = useCallback((field, value) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleCostChange = useCallback(text => {
        const newText = text.replace(/^0+/, '');
        dispatchFormData({ type: 'UPDATE_FORM', payload: { cost: newText } });
    }, [dispatchFormData]);

    const handleBackPress = useCallback(() => {
        dispatchFormData({ type: 'UPDATE_FORM', payload: { isSaveDraftModalVisible: true } });
    }, [formData, dispatchFormData]);

    const handleSaveAsDraft = useCallback(async () => {
        await AsyncStorage.setItem('taskFormData', JSON.stringify(formData));
        dispatchFormData({ type: 'UPDATE_FORM', payload: { isSaveDraftModalVisible: false } });
    }, [formData, dispatchFormData]);

    const handleDelete = useCallback(async () => {
        dispatchFormData({ type: 'RESET_FORM' });
    }, [dispatchFormData]);

    const deleteTask = async () => {
        try {
            const response = await axios.delete(`http://31.129.101.174/tasks/${formData.id}`);
            if (response.status === 200) {
                // Если задача успешно удалена, очисти форму и закрой окно
                dispatchFormData({ type: 'RESET_FORM' });
                onClose(); // Закрытие модального окна
            }
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
        }
    };

    const handleDeletePress = () => {
        if (formData.status && formData.status !== "отсутствует") {
            // Если статус задачи существует и не равен "отсутствует", показываем подтверждение
            setDeleteConfirmationVisible(true);
        } else {
            // Если статус задачи "отсутствует" или его нет, просто очисти форму и закрой окно
            dispatchFormData({ type: 'RESET_FORM' });
            onClose(); // Закрытие модального окна
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
        if (field === 'fullnameClient') {
            const client = clients.find(client => client.full_name === value);
            setSelectedClient(client || null); // Устанавливаем selectedClient только если клиент найден
        }
        setField(field, value);
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
        setSelectedService(newSelectedServiceIds); // Обновление selectedService
        dispatchFormData({
            type: 'UPDATE_FORM',
            payload: { selectedService: newSelectedServiceIds }
        });
    }, [dispatchFormData]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainerTask}>
                <View style={styles.taskHeader}>
                    <TouchableOpacity onPress={handleBackPress}>
                        <BackIcon />
                    </TouchableOpacity>
                    <SaveDraftModal
                        isVisible={formData.isSaveDraftModalVisible}
                        onDelete={handleDelete}
                        onClose={() => {
                            dispatchFormData({ type: 'UPDATE_FORM', payload: { isSaveDraftModalVisible: false } });
                            onClose(); // Эта функция должна быть определена в NewTaskScreen для закрытия самого NewTaskScreen
                        }}
                        onSave={handleSave}
                        formData={formData}
                    />
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
                                            value={formData.cost}
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
                                    <DropdownWithSearch
                                        options={formData.fullnameClientOptions}
                                        selectedValue={formData.fullnameClient}
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