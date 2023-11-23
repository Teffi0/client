import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/styles';
import DateInput from './DateInput';
import DropdownEmployee from './DropdownEmployee';
import DropdownService from './DropdownService';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { BackIcon, DeleteIcon } from '../icons';
import { format } from 'date-fns';
import SaveDraftModal from './SaveDraftModal';
import DropdownWithSearch from './DropdownWithSearch';
import { handleSaveTask } from '../utils/taskScreenHelpers';

function TaskForm({ formData, dispatchFormData, onClose }) {
    const [selectedService, setSelectedService] = useState([]);
    const [service, setServices] = useState([]);
    const [address, setAddress] = useState({
        city: '',
        street: '',
        house: '',
        entrance: '',
        floor: ''
    });

    const fetchServices = useCallback(async () => {
        try {
            const response = await fetch('http://31.129.101.174/services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Ошибка при получении инвентаря:', error);
        }
    }, []);

      useEffect(() => {
        fetchServices();
      }, []);

    const loadData = useCallback(async () => {
        try {
            const savedData = await AsyncStorage.getItem('taskFormData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                parsedData.isSaveDraftModalVisible = false;
                dispatchFormData({ type: 'SET_FORM', payload: parsedData });
            }
        } catch (error) {
            console.error('Ошибка загрузки данных', error);
        }
    }, [dispatchFormData]);

    useEffect(() => {
        fetchServices();
        loadData();
    }, [fetchServices, loadData]);

    const saveFormData = useCallback(async (data) => {
        try {
            await AsyncStorage.setItem('taskFormData', JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка сохранения данных', error);
        }
    }, []);

    const handleSave = useCallback(async () => {
        let updatedFormData = { ...formData };

        if (!updatedFormData.startDate) {
            const today = new Date();
            updatedFormData.startDate = format(today, 'yyyy-MM-dd');
        }

        updatedFormData.status = 'черновик';

        try {
            await handleSaveTask(updatedFormData);
        } catch (error) {
            console.error('Ошибка сохранения задачи', error);
        }
    }, [formData, handleSaveTask]);

    const handleAddressChange = useCallback((field, value) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleCostChange = useCallback(text => {
        const newText = text.replace(/^0+/, '');
        dispatchFormData({ type: 'UPDATE_FORM', payload: { cost: newText } });
    }, [dispatchFormData]);

    const handleBackPress = useCallback(() => {
        saveFormData(formData);
        dispatchFormData({ type: 'UPDATE_FORM', payload: { isSaveDraftModalVisible: true } });
    }, [formData, saveFormData, dispatchFormData]);

    const handleSaveAsDraft = useCallback(async () => {
        await AsyncStorage.setItem('taskFormData', JSON.stringify(formData));
        dispatchFormData({ type: 'UPDATE_FORM', payload: { isSaveDraftModalVisible: false } });
    }, [formData, dispatchFormData]);

    const handleDelete = useCallback(async () => {
        await AsyncStorage.removeItem('taskFormData');
        dispatchFormData({ type: 'RESET_FORM' });
    }, [dispatchFormData]);

    const setField = useCallback((field, value) => {
        dispatchFormData({ type: 'UPDATE_FORM', payload: { [field]: value } });
    }, [dispatchFormData]);

    const handleChange = useCallback((field) => (value) => {
        setField(field, value);
    }, [setField]);

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

    const handleServiceChange = (newSelectedService) => {
        setSelectedService(newSelectedService);
    };

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
                                selectedValue={selectedService}
                                onValueChange={handleServiceChange}
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
                                options={formData.employeesOptions}
                                selectedValue={formData.selectedEmployee}
                                onValueChange={handleChange('selectedEmployee')}
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
                                    setCity('');
                                    setStreet('');
                                    setHouse('');
                                    setEntrance('');
                                    setFloor('');
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
                                    </View>
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