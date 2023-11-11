export  const initialState = {
    status: 'выполнено',
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
    addressClient: 'где-то там, где-то тут, где-то здесь, 25к1',
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
  