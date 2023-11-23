export  const initialState = {
    status: 'новая',
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
            return { ...state, ...action.payload };
        default:
            return state;
    }
};
  