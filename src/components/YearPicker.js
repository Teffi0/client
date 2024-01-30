import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';

const YearPicker = ({ years, selectedYear, onYearChange }) => {
    // Мы убрали состояние modalVisible, потому что модальное окно не используется для отображения списка годов
  
    const renderItem = ({ item }) => (
      <TouchableOpacity style={styles.yearItem} onPress={() => onYearChange(item)}>
        <Text style={styles.yearItemText}>{item}</Text>
      </TouchableOpacity>
    );
  
    return (
      <View style={styles.yearList}>
        <FlatList
          data={years}
          renderItem={renderItem}
          keyExtractor={item => item.toString()}
        />
      </View>
    );
  };

const styles = StyleSheet.create({
    yearPickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 5,
      },
      // Стили для текста внутри кнопки выбора года
      buttonText: {
        fontSize: 16,
        color: '#000000',
      },
      // Стили для иконки стрелки вниз
      arrowIcon: {
        marginLeft: 5,
      },
      // Стили для модального окна с выбором года
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
      },
      modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      // Стили для списка годов внутри модального окна
      yearList: {
        marginTop: 20,
        borderTopWidth: 1,
        borderColor: '#E0E0E0',
      },
      // Стили для каждого элемента списка годов
      yearItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
      },
      // Стили для текста элемента списка годов
      yearItemText: {
        fontSize: 18,
        textAlign: 'center',
      },
});

export default YearPicker;
