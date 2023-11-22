import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Animated, PanResponder, Dimensions } from 'react-native';
import { format, addMonths, startOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import RenderMonth from './RenderMonth';
import PropTypes from 'prop-types';

const screenHeight = Dimensions.get('window').height;

const VerticalCalendar = ({ tasks, taskDates }) => {
  const flatListRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState(Array.from({ length: 5 }, (_, i) => addMonths(startOfMonth(new Date()), i - 2)));
  const [page, setPage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFullSize, setIsFullSize] = useState(false);

  const ModalFullHeight = screenHeight * 0.05;
  const ModalHeight = screenHeight * 0.35;
  const modalHeight = useRef(new Animated.Value(ModalHeight));

  const swipeThreshold = screenHeight * 0.1;

  useEffect(() => {
    if (isFullSize) {
      Animated.timing(modalHeight.current, {
        toValue: ModalFullHeight,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(modalHeight.current, {
        toValue: ModalHeight,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isFullSize]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        modalHeight.current.setOffset(modalHeight.current._value);
        modalHeight.current.setValue(0);
      },
      onPanResponderMove: Animated.event(
        [null, { dy: modalHeight.current }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (event, gestureState) => {
        // Убираем предыдущее смещение
        modalHeight.current.flattenOffset();

        // Расчет текущего смещения после отпускания пальца
        const currentHeight = modalHeight.current._value + gestureState.dy;

        // Порог для запуска анимации вверх или вниз
        const upwardThreshold = ModalHeight + (screenHeight - ModalHeight) / 2;
        const downwardThreshold = ModalHeight / 2;

        if (gestureState.dy < 0) { // Если движение вверх
          if (currentHeight < upwardThreshold) {
            openFullModal();
          } else {
            openModal();
          }
        } else { // Если движение вниз
          if (currentHeight > downwardThreshold) {
            closeModal();
          } else {
            openModal();
          }
        }
      },


    })
  ).current;


  const openFullModal = () => {
  Animated.spring(modalHeight.current, {
    toValue: ModalFullHeight, // Максимальная высота открытия
    useNativeDriver: false, // Используйте нативный драйвер для анимации
    bounciness: 0 // Уберите отскок для плавного перехода
  }).start(() => setIsFullSize(true));
};

const openModal = () => {
  setModalVisible(true);
  Animated.spring(modalHeight.current, {
    toValue: ModalHeight,
    useNativeDriver: false,
    bounciness: 0 // Установите это значение, чтобы уменьшить "подпрыгивание" при анимации
  }).start(() => setIsFullSize(false));
};

const closeModal = () => {
  Animated.spring(modalHeight.current, {
    toValue: screenHeight, // Полностью закрытое состояние
    useNativeDriver: false, // Используйте нативный драйвер для анимации
    bounciness: 0 // Уберите отскок для плавного перехода
  }).start(() => {
    setModalVisible(false);
    setIsFullSize(false);
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
    openModal();
  };

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => <RenderMonth date={item} handleDatePress={handleDatePress} taskDates={taskDates} />}
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
        <Animated.View style={[styles.modalOverlay, { top: modalHeight.current }]} {...panResponder.panHandlers}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{format(selectedDate, 'd-MMMM', { locale: ru })}</Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

VerticalCalendar.propTypes = {
  tasks: PropTypes.array.isRequired,
  taskDates: PropTypes.array.isRequired,
};

export default VerticalCalendar;