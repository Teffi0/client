import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from '../styles/styles';
import DateInput from './DateInput';
import Dropdown from './Dropdown';
import DropdownClient from './DropdownClient';
import DropdownEmployee from './DropdownEmployee';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { BackIcon, DeleteIcon } from '../icons';
import { format } from 'date-fns';
import SaveDraftModal from './SaveDraftModal';

function TaskForm({ formData, dispatchFormData, onSave, setIsWarningModalVisible, onClose }) {

    const [isPressed, setIsPressed] = useState(false);

    const addButtonStyles = useMemo(() => ({
        ...styles.addButton,
        ...(isPressed && styles.addButtonPressed),
    }), [isPressed]);

    const addButtonTextStyles = styles.addButtonText;

    const handleCostChange = text => {
        const newText = text.replace(/^0+/, '');
        dispatchFormData({ type: 'UPDATE_FORM', payload: { cost: newText } });
    };

    const handleBackPress = () => {
        dispatchFormData({ type: 'UPDATE_FORM', payload: { isSaveDraftModalVisible: true } });
    };

    const handleSaveDraft = () => {
        setIsWarningModalVisible(true);
    };

    const handleDelete = () => {
        onClose();
    };

    const setField = (field, value) => {
        dispatchFormData({ type: 'UPDATE_FORM', payload: { [field]: value } });
    };

    const handleChange = (field) => (value) => {
        setField(field, value);
    };

    const toggleStartPicker = () => {
        setField('isStartPickerVisible', !formData.isStartPickerVisible);
    };

    const toggleEndPicker = () => {
        setField('isEndPickerVisible', !formData.isEndPickerVisible);
    };

    const handleStartPicked = (date) => {
        dispatchFormData({ type: 'UPDATE_FORM', payload: { startDateTime: date } });
        toggleStartPicker();
    };

    const handleEndPicked = (date) => {
        dispatchFormData({ type: 'UPDATE_FORM', payload: { endDateTime: date } });
        toggleEndPicker();
    };

    return (
        <ScrollView style={styles.contentContainerTask}>
            <View style={styles.taskHeader}>
                <TouchableOpacity onPress={handleBackPress}>
                    <BackIcon />
                </TouchableOpacity>
                <SaveDraftModal
                    isVisible={formData.isSaveDraftModalVisible}
                    onSaveDraft={handleSaveDraft}
                    onDelete={handleDelete}
                    onClose={() => setField('isSaveDraftModalVisible', false)}
                />
                <Text style={[styles.titleMedium, { flex: 1, textAlign: 'center' }]}>Новая задача</Text>
                <TouchableOpacity onPress={handleDelete}>
                    <DeleteIcon />
                </TouchableOpacity>
            </View>

            <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Данные задачи</Text>
            <Dropdown
                label="Услуга"
                options={formData.serviceOptions}
                selectedValue={formData.service}
                onValueChange={handleChange('service')}
            />

            <View style={{ flexDirection: 'row' }}>
                <Dropdown
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

            <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Команда</Text>
            <Dropdown
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

            <View style={{ marginTop: 80 }}>
                <Text style={[styles.headlineMedium, { marginBottom: 24 }]}>Данные клиента</Text>
                <DropdownClient
                    label="Связанный клиент"
                    options={formData.fullnameClientOptions}
                    selectedValue={formData.fullnameClient}
                    onValueChange={handleChange('fullnameClient')}
                />
            </View>

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

            <TouchableOpacity style={addButtonStyles} onPress={onSave}>
                <Text style={addButtonTextStyles}>Добавить задачу</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

export default TaskForm;