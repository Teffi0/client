import axios from 'axios';
import { formatISO, format } from 'date-fns';
import { SERVER_URL } from '../utils/tasks';
import { taskEventEmitter } from '../Events';

export async function updateTaskStatus(taskId, taskData) {
    try {
        console.log(taskData);
        const response = await axios.put(`${SERVER_URL}/tasks/${taskId}`, taskData);
        taskEventEmitter.emit('taskUpdated');
        return response;
    } catch (error) {
        console.error('Ошибка при обновлении задачи:', error);
        throw error;
    }
}


export const validateFormData = (formData) => {
    const requiredFields = ['selectedService', 'paymentMethod', 'cost', 'startDate', 'endDate', 'startDateTime', 'endDateTime', 'selectedEmployee', 'selectedResponsible', 'fullnameClient'];
    if (requiredFields.some(field => !formData[field])) {
        alert('Пожалуйста, заполните все обязательные поля.');
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

export const fetchOptions = async (userId, dispatchFormData) => {
    try {
      const url = `http://31.129.101.174/responsibles?userId=${userId}`;
      const [servicesResponse, paymentMethodsResponse, employeesResponse, responsiblesResponse, clientsResponse] = await Promise.all([
        axios.get('http://31.129.101.174/services'),
        axios.get('http://31.129.101.174/paymentmethods'),
        axios.get('http://31.129.101.174/employees'),
        axios.get(url),
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
    if (formData.status !== 'черновик' && !validateFormData(formData)) return;

    const serviceString = formData.selectedService.join(', ');
    const employees = formData.employeesOptions.map(employee => employee.id);

    const formattedData = {
        ...formatTaskData({ ...formData, service: serviceString }),
        employees: formData.selectedEmployee || employees
    };

    const taskId = formData.id || (await axios.post(`${SERVER_URL}/tasks`, formattedData)).data.task_id;

    if (formData.selectedService?.length > 0) {
        await axios.post(`${SERVER_URL}/tasks/${taskId}/services`, { services: formData.selectedService });
        console.log('Услуги успешно добавлены к задаче');
    }

    if (formData.status === 'выполнено') {
        const filteredInventory = formData.selectedInventory.filter(item => item.quantity > 0);
        const inventoryData = filteredInventory.map(({ id, quantity }) => ({ inventory_id: id, quantity }));

        await axios.put(`${SERVER_URL}/tasks/${taskId}/inventory`, { inventory: inventoryData });

        if (formData.selectedImages?.length > 0) {
            const imagesFormData = new FormData();
            formData.selectedImages.forEach((imageUri, index) => {
                imagesFormData.append('photos', {
                    name: `photo_${index}.jpg`,
                    type: 'image/jpeg',
                    uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
                });
            });
            await axios.post(`${SERVER_URL}/tasks/${taskId}/photos`, imagesFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Изображения успешно загружены на сервер');
        }
    }

    taskEventEmitter.emit('taskUpdated');
};

export const updateDraft = async (draftId, formData) => {

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
        employees: formData.selectedEmployee.join(','),
        services: formData.selectedService,
    };
    console.log('dataToSend данные:', dataToSend);
    try {
        const response = await axios.put(`${SERVER_URL}/tasks/${draftId}`, dataToSend);
        console.log('Черновик успешно обновлен. Данные ответа:', response.data);
    } catch (error) {
        console.error('Ошибка при обновлении черновика:', error);
    }
};