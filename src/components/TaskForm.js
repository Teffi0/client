import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native';
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
    const [address, setAddress] = useState({
        city: '',
        street: '',
        house: '',
        entrance: '',
        floor: ''
    });

    const renderClientButton = () => {
        if (selectedClient) {
            return (
                <TouchableOpacity onPress={handleUpdateClient} style={styles.buttonClose}>
                    <Text style={styles.textStyle}>Сохранить</Text>
                </TouchableOpacity>
            );
        }
        
        return (
            <TouchableOpacity onPress={handleAddClient} style={styles.buttonClose}>
                <Text style={styles.textStyle}>Добавить Клиента</Text>
            </TouchableOpacity>
        );
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
                const serviceIds = Object.keys(serviceNames).map(Number);
                setSelectedService(serviceIds);

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

                setIsFormInitialized(true);

                if (JSON.stringify(formData) !== JSON.stringify(formattedDraftData)) {
                    dispatchFormData({
                        type: 'SET_FORM',
                        payload: formattedDraftData
                    });
                }
            })();
        }
    }, [draftData, formData, dispatchFormData, isFormInitialized, fetchServiceNamesByIds, fetchTaskParticipants]);

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
                }
            } else {
                // Сброс адреса и других полей для нового клиента
                setAddress({
                    city: '',
                    street: '',
                    house: '',
                    entrance: '',
                    floor: ''
                });
                setField('phoneClient', '');
            }
        }
    }, [formData.fullnameClient, clients]);


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
            full_name: formData.fullnameClient,
            phone_number: formData.phoneClient,
            address: `${address.city}, ${address.street}, дом ${address.house}, подъезд ${address.entrance}, этаж ${address.floor}`
        };

        try {
            const response = await axios.post(`http://31.129.101.174/clients`, clientData);
            alert('Клиент успешно добавлен');
            setClients([...clients, response.data]); // Обновляем список клиентов
            setSelectedClient(response.data); // Устанавливаем добавленного клиента как выбранного
        } catch (error) {
            console.error('Ошибка при добавлении клиента:', error);
        }
    };


    const updateAddressClient = () => {
        const { city, street, house, entrance, floor } = address; // Деструктуризация значений из объекта address
        const fullAddress = `город ${city}, улица ${street}, дом ${house}, подъезд ${entrance}, этаж ${floor}`;
        setField('addressClient', fullAddress);
    };

    const handleUpdateClient = async () => {
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
        <View style={styles.container}>
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
                    <Text style={[styles.titleMedium, { flex: 1, textAlign: 'center' }]}>Новая задача</Text>
                    <TouchableOpacity onPress={handleDelete}>
                        <DeleteIcon />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {tryRender(() => (
                        <>
                            <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Данные задачи</Text>
                            <DropdownService
                                label="Услуга"
                                options={service}
                                selectedValues={selectedService}
                                onValueChange={handleServiceChange}
                                updateTotalCost={updateTotalCost}
                            />
                        </>
                    ))}

                    {tryRender(() => (
                        <View style={{ flexDirection: 'row' }}>
                            <DropdownWithSearch
                                label="Способ оплаты"
                                options={formData.paymentMethodOptions}
                                selectedValue={formData.paymentMethod}
                                onValueChange={handleChange('paymentMethod')}
                            />
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
                    ))}
                    {tryRender(() => (
                        <View style={{ flexDirection: 'row' }}>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 80, marginTop: 36 }}>
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
                    {tryRender(() => (
                        <>
                            <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Команда</Text>
                            <DropdownWithSearch
                                label="Ответственный"
                                options={formData.responsibleOptions}
                                selectedValue={formData.selectedResponsible}
                                onValueChange={handleChange('selectedResponsible')}
                            />
                            <DropdownEmployee
                                label="Участники"
                                options={employees} // убедитесь, что переменная employees заполнена данными
                                selectedValues={selectedEmployee}
                                onValueChange={setSelectedEmployee}
                            />
                        </>
                    ))}

                    {tryRender(() => (
                        <View style={{ marginTop: 80 }}>
                            <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Данные клиента</Text>
                            <DropdownWithSearch
                                label="Связанный клиент"
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
                            {formData.fullnameClient && (
                                <View>
                                    <View style={{ flexDirection: 'column', marginTop: 24 }}>
                                        <TextInput
                                            placeholder="Город"
                                            value={address.city}
                                            onChangeText={(text) => handleAddressChange('city', text)}
                                            style={[styles.costInput, { marginBottom: 24 }]}
                                        />
                                        <TextInput
                                            placeholder="Улица"
                                            value={address.street}
                                            onChangeText={(text) => handleAddressChange('street', text)}
                                            style={[styles.costInput, { marginBottom: 24 }]}
                                        />
                                        <TextInput
                                            placeholder="Дом/Квартира"
                                            value={address.house}
                                            onChangeText={(text) => handleAddressChange('house', text)}
                                            style={styles.addressInput}
                                        />
                                        <TextInput
                                            placeholder="Подъезд"
                                            value={address.entrance}
                                            onChangeText={(text) => handleAddressChange('entrance', text)}
                                            style={styles.addressInput}
                                        />
                                        <TextInput
                                            placeholder="Этаж"
                                            value={address.floor}
                                            onChangeText={(text) => handleAddressChange('floor', text)}
                                            style={[styles.addressInput, { marginRight: 0, marginBottom: 24 }]}
                                        />
                                        <TextInput
                                            placeholder="Номер телефона клиента"
                                            value={formData.phoneClient}
                                            onChangeText={(text) => setField('phoneClient', text)}
                                            keyboardType="phone-pad"
                                            style={styles.costInput}
                                        />
                                    </View>
                                    {renderClientButton()}
                                </View>
                            )}
                        </View>
                    ))}
                    {tryRender(() => (
                        <View style={{ marginBottom: 300 }}>
                            <Text style={[styles.headlineMedium, { marginBottom: 24, marginTop: 80 }]}>Дополнительно</Text>
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
                </ScrollView>
            </View>
        </View>
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