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
    isSaveDraftModalVisible: false
  };

  
  export const formReducer = (state, action) => {
    if (action.type === 'UPDATE_FORM') {
      return { ...state, ...action.payload };
    }
    return state;
  };
  