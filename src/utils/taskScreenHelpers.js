import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { formatISO, parseISO, isBefore, format } from 'date-fns';
import styles from '../styles/styles';
import { SERVER_URL } from '../utils/tasks';
import { taskEventEmitter } from '../Events';

export async function updateTaskStatus(taskId, taskData) {
    try {
        const response = await fetch(`http://31.129.101.174/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData), // Отправляем полный объект задачи
        });
        taskEventEmitter.emit('taskUpdated');
        return response; // Возвращает объект ответа fetch
    } catch (error) {
        console.error('Ошибка при обновлении задачи:', error);
        throw error; // В случае ошибки пробрасываем исключение
    }
}



export const validateFormData = (formData) => {
    const requiredFields = ['selectedService', 'paymentMethod', 'cost', 'startDate', 'endDate', 'startDateTime', 'endDateTime', 'selectedEmployee', 'selectedResponsible', 'fullnameClient'];
    for (let field of requiredFields) {
        if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
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
        start_date: formData.startDate ? format(new Date(formData.startDate), 'yyyy-MM-dd') : null,
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
        const [servicesResponse, paymentMethodsResponse, employeesResponse, responsiblesResponse, clientsResponse] = await Promise.all([
            axios.get('http://31.129.101.174/services'),
            axios.get('http://31.129.101.174/paymentmethods'),
            axios.get('http://31.129.101.174/employees'),
            axios.get('http://31.129.101.174/responsibles'),
            axios.get('http://31.129.101.174/clients')
        ]);
        dispatchFormData({
            type: 'UPDATE_FORM',
            payload: {
                serviceOptions: servicesResponse.data,
                paymentMethodOptions: paymentMethodsResponse.data,
                responsibleOptions: responsiblesResponse.data,
                employeesOptions: employeesResponse.data,
                fullnameClientOptions: clientsResponse.data.map(client => client.full_name)
            }
        });
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
    }
};

export const handleSaveTask = async (formData) => {
    // Если статус не "черновик", проводим валидацию
    if (formData.status !== 'черновик' && !validateFormData(formData)) {
        return; // Если валидация не пройдена, прекращаем выполнение функции
    }

    const serviceString = formData.selectedService.join(', ');

    const formattedData = formatTaskData({ ...formData, service: serviceString });

    // Преобразуем данные сотрудников в массив ID
    const employees = formData.employeesOptions.map(employee => employee.id);
    formattedData.employees = employees;

    // После изменения
    formattedData.employees = formData.selectedEmployee;
    try {
        const response = await axios.post(`${SERVER_URL}/tasks`, formattedData);
        const taskId = response.data.task_id;
        console.log('Задача успешно добавлена. Данные ответа:', response.data);
        // Добавление услуг к задаче, если они есть
        if (formData.selectedService && formData.selectedService.length > 0) {
            await axios.post(`${SERVER_URL}/tasks/${taskId}/services`, {
                services: formData.selectedService
            });
            console.log('Услуги успешно добавлены к задаче');
        }
        
        taskEventEmitter.emit('taskUpdated');
    } catch (error) {
        console.error('Ошибка при добавлении задачи:', error);
    }
};

// Функция для обновления черновика
export const updateDraft = async (draftId, formData) => {
    console.log('Отправляемые данные:', formData);

    // Преобразование данных в формат, ожидаемый сервером
    const dataToSend = {
        status: formData.status,
        service: formData.selectedService.join(', '),
        payment: formData.paymentMethod,
        cost: formData.cost,
        start_date: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : null,
        start_time: formData.startDateTime ? format(formData.startDateTime, 'HH:mm') : null,
        end_date: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : null,
        end_time: formData.endDateTime ? format(formData.endDateTime, 'HH:mm') : null,
        responsible: formData.selectedResponsible,
        fullname_client: formData.fullnameClient,
        address_client: formData.addressClient,
        phone: formData.phone,
        description: formData.description,
        employees: formData.selectedEmployee.join(','), // Предполагается, что это массив ID сотрудников
        services: formData.selectedService, // Предполагается, что это массив ID услуг
        // Добавьте другие поля, если они необходимы
    };
    console.log('dataToSend данные:', dataToSend);
    try {
        const response = await axios.put(`${SERVER_URL}/tasks/${draftId}`, dataToSend);
        console.log('Черновик успешно обновлен. Данные ответа:', response.data);
    } catch (error) {
        console.error('Ошибка при обновлении черновика:', error);
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

