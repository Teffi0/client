import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Modal, Animated, PanResponder, Dimensions, ScrollView } from 'react-native';
import { format, addMonths, startOfYear, parseISO, isSameYear } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import RenderMonth from './RenderMonth';
import TasksForSelectedDateComponent from './TasksForSelectedDateComponent';
import PropTypes from 'prop-types';

const screenHeight = Dimensions.get('window').height;

const VerticalCalendar = ({ tasks, taskDates, selectedYear }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const flatListRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedClients, setExpandedClients] = useState(new Set());

  const startYear = startOfYear(new Date());
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
      useNativeDriver: true, // Изменено здесь
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
            if (modalHeight.current.__getValue() < ModalFullHeight) {
              modalHeight.current.setValue(0);
            }
          },
        }
      ),
      onPanResponderRelease: (event, gestureState) => {
        modalHeight.current.flattenOffset();
        const currentHeight = modalHeight.current._value + gestureState.dy;
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
      useNativeDriver: true, // Изменено здесь
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

  let initialScrollIndex = currentMonth;
  if (selectedYear && !isSameYear(selectedYear, currentYear)) {
    initialScrollIndex = 0; // Если год выбранного месяца отличается от текущего, начнем с января
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
        <Animated.View style={[styles.modalOverlay, { transform: [{ translateY: modalHeight.current }] }]} {...panResponder.panHandlers}>
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