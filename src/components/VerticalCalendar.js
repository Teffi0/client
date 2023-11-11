import React, { useState, useRef, useEffect, memo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Dimensions, Animated, PanResponder } from 'react-native';
import { format, isSameDay, addMonths, startOfMonth, endOfMonth, getDaysInMonth, addDays, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import PropTypes from 'prop-types';

const screenHeight = Dimensions.get('window').height;

const isSameDate = (date1, date2) => isSameDay(date1, date2);

const RenderMonth = memo(({ date, handleDatePress }) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const monthName = format(date, 'MMMM', { locale: ru });
  const weeks = [];
  let currentWeek = [];

  let daysToAdd = 1 - monthStart.getDay();
  if (daysToAdd > 0) daysToAdd -= 7;

  for (let i = daysToAdd; i <= getDaysInMonth(date); i++) {
    const day = addDays(monthStart, i);
    if (isSameMonth(day, date)) {
      currentWeek.push(day);
    } else {
      currentWeek.push(null);
    }

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  const lastDayOfMonth = monthEnd.getDay();
  if (lastDayOfMonth < 7) {
    for (let i = 0; i < 7 - lastDayOfMonth; i++) {
      currentWeek.push(null);
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <View key={date.toString()} style={styles.monthContainer}>
      <Text style={styles.monthName}>{monthName}</Text>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekContainer}>
          {week.map((day, dayIndex) => (
            <View key={dayIndex} style={styles.dayContainer}>
              {day ? (
                <TouchableOpacity onPress={() => handleDatePress(day)}>
                  <Text style={[styles.dayText, isSameDate(day, new Date()) ? styles.today : null]}>
                    {format(day, 'd')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

RenderMonth.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  handleDatePress: PropTypes.func.isRequired,
};


const VerticalCalendar = ({ tasks }) => {
  const flatListRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState(Array.from({ length: 5 }, (_, i) => addMonths(startOfMonth(new Date()), i - 2)));
  const [page, setPage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const ModalHeight = screenHeight * 0.35;
  const modalHeight = useRef(new Animated.Value(ModalHeight));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (gestureState.dy > 0) {
          modalHeight.current.setValue(ModalHeight + Math.abs(gestureState.dy));
        } else {
          modalHeight.current.setValue(ModalHeight - Math.abs(gestureState.dy));
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy > 0) {
          if (Math.abs(gestureState.dy) > ModalHeight * 0.1) {
            closeModal();
          } else {
            openModal();
          }
        } else {
          openModal();
        }
      },
    })
  ).current;

  const openModal = () => {
    Animated.timing(modalHeight.current, {
      toValue: ModalHeight,
      duration: 500,
      useNativeDriver: false,
    }).start();
    setModalVisible(true);
  };

  const closeModal = () => {
    Animated.timing(modalHeight.current, {
      toValue: screenHeight,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      setModalVisible(false);
      modalHeight.current.setValue(ModalHeight);
    });
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: 2, animated: false });
    }
  }, [flatListRef.current]);

  useEffect(() => {
    setData(prevData => [...prevData, ...Array.from({ length: 5 }, (_, i) => addMonths(startOfMonth(new Date()), i + page * 5 - 2))]);
  }, [page]);

  const handleDatePress = (day) => {
    setSelectedDate(day);
    setModalVisible(true);
    Animated.timing(modalHeight.current, { toValue: ModalHeight, duration: 500, useNativeDriver: false }).start();
  };

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => <RenderMonth date={item} handleDatePress={handleDatePress} />}
        keyExtractor={(item, index) => item.toString() + index}
        getItemLayout={(data, index) => (
          { length: 400, offset: 400 * index, index }
        )}
        onEndReached={() => setPage(prevPage => prevPage + 1)}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={1}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => closeModal()}
      >
        <Animated.View style={{ top: modalHeight.current }} {...panResponder.panHandlers}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{format(selectedDate, 'd-MMMM', { locale: ru })}</Text>
            <TouchableOpacity style={[styles.buttonClose]} onPress={() => closeModal()}>
              <Text style={styles.textStyle}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

VerticalCalendar.propTypes = {
  tasks: PropTypes.array.isRequired,
};

export default VerticalCalendar;