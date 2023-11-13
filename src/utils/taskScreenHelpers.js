import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { formatISO, parseISO, isBefore, format } from 'date-fns';
import styles from '../styles/styles';

const validateFormData = (formData) => {
    const requiredFields = ['service', 'paymentMethod', 'cost', 'startDate', 'endDate', 'startDateTime', 'endDateTime', 'selectedEmployee', 'selectedResponsible', 'fullnameClient', 'description'];
    for (let field of requiredFields) {
        if (!formData[field]) {
            alert(`Пожалуйста, заполните поле ${field}.`); 
            return false;
        }
    }

    // Проверка дат на корректность (дата окончания после даты начала)
    if (isBefore(parseISO(formData.endDate), parseISO(formData.startDate))) {
        alert('Дата окончания должна быть позже даты начала.');
        return false;
    }

    return true;
};

const formatTaskData = (formData) => {
    const taskData = {
        status: formData.status,
        service: formData.service,
        payment: formData.paymentMethod,
        cost: formData.cost,
        start_date: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : null,
        end_date: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : null,
        start_time: formData.startDateTime ? format(formData.startDateTime, 'HH:mm') : null,
        end_time: formData.endDateTime ? format(formData.endDateTime, 'HH:mm') : null,
        responsible: formData.selectedResponsible,
        employees: formData.selectedEmployee,
        fullname_client: formData.fullnameClient,
        address_client: formData.addressClient,
        phone: formData.phoneClient,
        description: formData.description
    };

    Object.keys(taskData).forEach(key => taskData[key] === null && delete taskData[key]);

    return taskData;
};

export const fetchOptions = async (dispatchFormData) => {
    try {
        const [servicesResponse, paymentMethodsResponse, employeesResponse, clientsResponse] = await Promise.all([
            axios.get('http://31.129.101.174/services'),
            axios.get('http://31.129.101.174/paymentmethods'),
            axios.get('http://31.129.101.174/employees'),
            axios.get('http://31.129.101.174/clients')
        ]);
        dispatchFormData({
            type: 'UPDATE_FORM',
            payload: {
                serviceOptions: servicesResponse.data,
                paymentMethodOptions: paymentMethodsResponse.data,
                responsibleOptions: employeesResponse.data,
                employeesOptions: employeesResponse.data,
                fullnameClientOptions: clientsResponse.data.map(client => client.full_name)
            }
        });
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
    }
};

export const handleSaveTask = async (formData, setIsSuccessModalVisible) => {
    if (validateFormData(formData)) {
        try {
            const response = await axios.post('http://31.129.101.174/tasks', formatTaskData(formData));
            console.log('Задача успешно добавлена. Данные ответа:', response.data);
            setIsSuccessModalVisible(true);
        } catch (error) {
            console.error('Ошибка при добавлении задачи:', error);
        }
    }
};

export const SuccessModal = React.memo(({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <Modal
            visible={isVisible}
            transparent={false}
            animationType="slide"
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginBottom: 20 }}>Задача успешно добавлена!</Text>
                <TouchableOpacity
                    onPress={onClose}
                    style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}
                >
                    <Text style={{ color: 'white' }}>Отлично</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
});

export const WarningModal = React.memo(({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Пока нельзя создать черновик</Text>
                    <TouchableOpacity
                        style={styles.buttonClose}
                        onPress={onClose}
                    >
                        <Text style={styles.textStyle}>Хорошо</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
});
