import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Modal, Animated, PanResponder, Dimensions, ScrollView } from 'react-native';
import { format, addMonths, startOfYear, parseISO, isSameYear } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import RenderMonth from './RenderMonth';
import TasksForSelectedDateComponent from './TasksForSelectedDateComponent';
import PropTypes from 'prop-types';
import AddButton from './AddButton';

const screenHeight = Dimensions.get('window').height;

const VerticalCalendar = ({ tasks, taskDates, selectedYear, renderAddButton }) => {
  const displayYear = selectedYear ? new Date(selectedYear, 0, 1) : new Date();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let initialYear = selectedYear || currentYear;
  let initialMonth = currentYear === initialYear ? new Date().getMonth() : 0;

  const flatListRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date(initialYear, initialMonth, 1));
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedClients, setExpandedClients] = useState(new Set());

  const startYear = startOfYear(displayYear);
  const data = Array.from({ length: 12 }, (_, i) => addMonths(startYear, i));

  const tasksBySelectedDate = tasks.filter(task => format(parseISO(task.start_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    .reduce((acc, task) => ((acc[task.fullname_client] = acc[task.fullname_client] || []).push(task), acc), {});

  const handleDatePress = day => {
    setSelectedDate(day);
    setModalVisible(true);
    openModal();
  };

  const handleToggleClient = client => setExpandedClients(current => new Set(current.has(client) ? current.delete(client) : current.add(client)));

  const ModalFullHeight = screenHeight * 0.05;
  const ModalHeight = screenHeight * 0.35;
  const modalHeight = useRef(new Animated.Value(ModalHeight));
  const [isFullSize, setIsFullSize] = useState(false);

  useEffect(() => {
    Animated.timing(modalHeight.current, {
      toValue: isFullSize ? ModalFullHeight : ModalHeight,
      duration: 300,
      useNativeDriver: false, // Изменено здесь
    }).start();
  }, [isFullSize, ModalFullHeight, ModalHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        modalHeight.current.setOffset(modalHeight.current._value);
        modalHeight.current.setValue(0);
      },
      onPanResponderMove: Animated.event(
        [null, { dy: modalHeight.current }],
        {
          useNativeDriver: false,
          listener: (event, gestureState) => {
            const currentHeight = modalHeight.current.__getValue();
            if (currentHeight < ModalFullHeight) {
              modalHeight.current.setValue(0);
            }
          },
        }
      ),
      onPanResponderRelease: (event, gestureState) => {
        modalHeight.current.flattenOffset();
        let currentHeight = modalHeight.current._value + gestureState.dy;

        if (currentHeight < ModalFullHeight) {
          currentHeight = ModalFullHeight;
        }

        const upwardThreshold = ModalHeight + (screenHeight - ModalHeight) / 2;

        if (gestureState.dy < 0) {
          currentHeight < upwardThreshold ? openFullModal() : openModal();
        } else {
          currentHeight > ModalHeight ? closeModal() : openModal();
        }
      },
    })
  ).current;

  const animateModal = useCallback((value, fullSize) => {
    Animated.spring(modalHeight.current, {
      toValue: value,
      useNativeDriver: false, // Изменено здесь
      bounciness: 0
    }).start(() => setIsFullSize(fullSize));
  }, []);

  const openFullModal = useCallback(() => animateModal(ModalFullHeight, true), [ModalFullHeight, animateModal]);
  const openModal = useCallback(() => animateModal(ModalHeight, false), [ModalHeight, animateModal]);
  const closeModal = useCallback(() => {
    animateModal(screenHeight, false);
    modalHeight.current.setValue(ModalHeight);
    setModalVisible(false);
  }, [ModalHeight, screenHeight, animateModal]);

  let initialScrollIndex = 0; // Устанавливаем начальное значение 0

  // Условие для определения начального индекса прокрутки
  if (selectedYear && selectedYear === currentYear) {
    initialScrollIndex = currentMonth;
  } else if (selectedYear) {
    initialScrollIndex = 0; // Установка начального индекса на начало года, если выбран не текущий год
  }

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => <RenderMonth date={item} handleDatePress={handleDatePress} taskDates={taskDates} />}
        keyExtractor={(item, index) => `${format(item, 'yyyy-MM')}-${index}`}
        getItemLayout={(_, index) => ({ length: 400, offset: 400 * index, index })}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialScrollIndex={initialScrollIndex} // Установка начального индекса прокрутки
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => closeModal()}
      >
        <Animated.View style={[styles.modalOverlay, { top: modalHeight.current }]} {...panResponder.panHandlers}>
          <View style={styles.container}>
            <View style={styles.contentContainer}>
              <View style={styles.taskHeader}>
                <Text style={styles.modalText}>{format(selectedDate, 'd-MMMM', { locale: ru })}</Text>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView} overScrollMode="never">
                <TasksForSelectedDateComponent
                  tasksByClient={tasksBySelectedDate}
                  expandedClients={expandedClients}
                  toggleClient={handleToggleClient}
                />
              </ScrollView>
            </View>
          </View>
        </Animated.View>
        {modalVisible && renderAddButton()}
      </Modal>
    </>
  );
};

VerticalCalendar.propTypes = {
  tasks: PropTypes.array.isRequired,
  taskDates: PropTypes.object.isRequired,
  renderAddButton: PropTypes.func.isRequired,
  selectedYear: PropTypes.number,
};

export default VerticalCalendar;