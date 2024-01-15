function isEmpty(value) {
    return !value || value.trim() === '';
  }
  
  function isLength(password, options) {
    return password.length >= options.min && password.length <= options.max;
  }
  
  export function validateRegistrationInput(data) {
    let errors = {};
  
    // Проверка имени пользователя
    if (isEmpty(data.username)) {
      errors.username = "Необходимо указать имя пользователя";
    }
  
    // Проверка пароля
    if (isEmpty(data.password)) {
      errors.password = "Необходимо указать пароль";
    } else if (!isLength(data.password, { min: 6, max: 30 })) {
      errors.password = "Пароль должен содержать от 6 до 30 символов";
    }
  
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }
  
  export function validateLoginInput(data) {
    let errors = {};
  
    // Проверка имени пользователя
    if (isEmpty(data.username)) {
      errors.username = "Необходимо указать имя пользователя";
    }
  
    // Проверка пароля
    if (isEmpty(data.password)) {
      errors.password = "Необходимо указать пароль";
    }
  
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }
  