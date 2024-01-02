export const initialState = {
    status: 'отсутствует',
    service: '',
    paymentMethod: '',
    cost: '',
    startDate: '',
    endDate: '',
    startDateTime: null,
    endDateTime: null,
    selectedResponsible: '',
    selectedEmployee: '',
    fullnameClient: '',
    addressClient: '',
    phoneClient: '+79999999999',
    description: '',
    serviceOptions: [],
    paymentMethodOptions: [],
    responsibleOptions: [],
    employeesOptions: [],
    fullnameClientOptions: [],
    selectedInventory: [],
    selectedImages: [],
    isStartPickerVisible: false,
    isEndPickerVisible: false,
    isSaveDraftModalVisible: false,
};


export const formReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_FORM':
            return { ...state, ...action.payload };
        case 'RESET_FORM':
            return { ...initialState };
        case 'SET_FORM':
            return {
                ...state,
                ...action.payload,
                selectedService: Array.isArray(action.payload.service) ? action.payload.service : action.payload.service.split(', ').map(Number),
            };
        case 'SET_FIELD_VALUE':
            const newValue = action.field === 'service' && !Array.isArray(action.value) ? [action.value] : action.value;
            return { ...state, [action.field]: newValue };
        default:
            return state;
    }
};
