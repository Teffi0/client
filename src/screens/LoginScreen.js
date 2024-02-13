import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateRegistrationInput, validateLoginInput } from '../components/validation';

const fetchUserData = async (userId) => {
    const apiUrl = `http://31.129.101.174/user/${userId}/data`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET', // Явно указываем метод GET
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (response.ok) {
            console.log('Полученные данные пользователя:', data);
            return data;
        } else {
            console.error('Ошибка при получении данных пользователя:', data.error);
            Alert.alert('Ошибка', data.error || 'Ошибка при получении данных пользователя');
        }
    } catch (error) {
        console.error('Ошибка соединения с сервером:', error);
        Alert.alert('Ошибка', 'Проблема соединения с сервером');
    }
};

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [position, setPosition] = useState('Монтажник');
    const [isResponsible, setIsResponsible] = useState(false);
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null); 
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (userId) {
            // Вызов функции fetchUserData при изменении userId
            const fetchData = async () => {
                const data = await fetchUserData(userId);
                if (data) {
                    setUserData(data); // Сохранение полученных данных пользователя
                }
            };
            fetchData();
        }
    }, [userId]);

    const handleLogin = () => {
        const { errors, isValid } = validateLoginInput({ username, password });
    
        if (!isValid) {
            setUsernameError(errors.username || '');
            setPasswordError(errors.password || '');
            Alert.alert('Ошибка валидации', Object.values(errors).join('\n'));
        } else {
            const apiUrl = 'http://31.129.101.174/login';
    
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            .then(response => response.json())
            .then(async data => {
                console.log(data);
                if (data.token) {
                    try {
                        await AsyncStorage.setItem('userToken', data.token);
                        await AsyncStorage.setItem('username', username);
                        await AsyncStorage.setItem('password', password);
    
                        setUserId(data.userId.toString());
                        await AsyncStorage.setItem('userId', data.userId.toString());

                        // Получаем и сохраняем данные пользователя
                        const userData = await fetchUserData(data.userId);
                        if (userData && userData.employee) {
                            await AsyncStorage.setItem('position', userData.employee.position);
                        }
    
                        navigation.navigate('Tabs', {
                            screen: 'TasksScreen',
                        });
                    } catch (e) {
                        console.error('Ошибка при сохранении данных:', e);
                        Alert.alert('Ошибка', 'Проблема при сохранении данных');
                    }
                } else {
                    Alert.alert('Ошибка', 'Неверный логин или пароль');
                }
            })
            .catch(error => {
                console.error('Ошибка авторизации:', error);
                Alert.alert('Ошибка', 'Проблема соединения с сервером');
            });
        }
    };    

    const handleRegister = () => {
        const { errors, isValid } = validateRegistrationInput({ username, password });

        if (!isValid) {
            setUsernameError(errors.username || '');
            setPasswordError(errors.password || '');
            Alert.alert('Ошибка валидации', Object.values(errors).join('\n'));
        } else {
            const apiUrl = 'http://31.129.101.174/register';

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    full_name: fullName,
                    phone_number: phoneNumber,
                    email,
                    position,
                    role: isResponsible ? true : false // Определяем роль на основе состояния isResponsible
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        Alert.alert('Успех', 'Регистрация прошла успешно');
                        setIsRegistering(false); // Возвращаемся к экрану входа
                    } else {
                        Alert.alert('Ошибка', data.error || 'Произошла ошибка при регистрации');
                    }
                })
                .catch(error => {
                    console.error('Ошибка регистрации:', error);
                    Alert.alert('Ошибка', 'Проблема соединения с сервером');
                });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isRegistering ? 'Регистрация' : 'Авторизация'}</Text>
            <TextInput
                style={inputStyle(usernameError)}
                placeholder="Логин"
                value={username}
                onChangeText={(text) => {
                    setUsername(text);
                    setUsernameError(''); // Сброс ошибки при редактировании
                }}
            />
            <TextInput
                style={inputStyle(passwordError)}
                placeholder="Пароль"
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError(''); // Сброс ошибки при редактировании
                }}
                secureTextEntry
            />
            {isRegistering ? (
                <>
                    <TextInput
                        style={inputStyle()}
                        placeholder="ФИО"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <TextInput
                        style={inputStyle()}
                        placeholder="Номер телефона"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />
                    <TextInput
                        style={inputStyle()}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <Picker
                        selectedValue={position}
                        onValueChange={(itemValue, itemIndex) => setPosition(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Монтажник" value="Монтажник" />
                        <Picker.Item label="Менеджер" value="Менеджер" />
                        <Picker.Item label="Руководитель" value="Руководитель" />
                    </Picker>
                    {position !== 'Менеджер' && (
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={styles.radio}
                                onPress={() => setIsResponsible(!isResponsible)}
                            >
                                <Text style={styles.radioText}>Может ли этот человек принимать роль ответственного за монтаж?</Text>
                                <View style={[styles.radioButton, isResponsible && styles.radioButtonSelected]} />
                            </TouchableOpacity>
                        </View>
                    )}

                </>
            ) : (
                <>
                    <Button title="Войти" onPress={handleLogin} />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 10,
        borderWidth: 1,
        padding: 10,
    },
    radioGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    radio: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioText: {
        marginRight: 10,
    },
    radioButton: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: 'blue',
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 10,
    },
});

const inputStyle = (error) => ({
    marginBottom: 10,
    borderWidth: 1,
    borderColor: error ? 'red' : 'grey',
    padding: 10,
});

export default LoginScreen;