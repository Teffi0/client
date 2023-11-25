import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Modal, Animated, PanResponder, Dimensions, ScrollView } from 'react-native';
import { format, addMonths, startOfMonth, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from '../styles/styles';
import RenderMonth from './RenderMonth';
import TasksForSelectedDateComponent from './TasksForSelectedDateComponent';
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

  const [expandedClients, setExpandedClients] = useState([]);
  const handleToggleClient = (client) => {
    setExpandedClients((current) =>
      current.includes(client)
        ? current.filter((c) => c !== client)
        : [...current, client]
    );
  };

  const tasksBySelectedDate = tasks.filter(task =>
    format(parseISO(task.start_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  ).reduce((acc, task) => {
    const client = task.fullname_client;
    if (!acc[client]) {
      acc[client] = [];
    }
    acc[client].push(task);
    return acc;
  }, {});

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
        {
          useNativeDriver: false,
          listener: (event, gestureState) => {
            const currentHeight = modalHeight.current.__getValue();
            if (currentHeight < ModalFullHeight) {
              modalHeight.current.setValue(ModalFullHeight);
            }
          },
        }
      ),

      onPanResponderRelease: (event, gestureState) => {
        modalHeight.current.flattenOffset();
        const currentHeight = modalHeight.current._value + gestureState.dy;
        const upwardThreshold = ModalHeight + (screenHeight - ModalHeight) / 2;

        if (gestureState.dy < 0) {
          if (currentHeight < upwardThreshold) {
            openFullModal();
          } else {
            openModal();
          }
        } else {
          if (currentHeight > ModalHeight) {
            closeModal();
          } else {
            openModal();
          }
        }
      },


    })
  ).current;

  useEffect(() => {
    flatListRef.current?.scrollToIndex({ index: 2, animated: false });
  }, []);

  useEffect(() => {
    setData(prevData => {
      const start = addMonths(startOfMonth(new Date()), page * 5 - 2);
      const newData = Array.from({ length: 5 }, (_, i) => addMonths(start, i));
      return [...new Set([...prevData, ...newData])];
    });
  }, [page]);

  const handleDatePress = useCallback((day) => {
    setSelectedDate(day);
    setModalVisible(true);
    openModal();
  }, []);

  const openFullModal = useCallback(() => {
    Animated.spring(modalHeight.current, {
      toValue: ModalFullHeight,
      useNativeDriver: false,
      bounciness: 0
    }).start(() => setIsFullSize(true));
  }, [ModalFullHeight]);

  const openModal = useCallback(() => {
    setModalVisible(true);
    Animated.spring(modalHeight.current, {
      toValue: ModalHeight,
      useNativeDriver: false,
      bounciness: 0
    }).start(() => setIsFullSize(false));
  }, [ModalHeight]);

  const closeModal = useCallback(() => {
    Animated.spring(modalHeight.current, {
      toValue: screenHeight,
      useNativeDriver: false,
      bounciness: 0
    }).start(() => {
      setModalVisible(false);
      setIsFullSize(false);
      modalHeight.current.setValue(ModalHeight - screenHeight);
    });
  }, [screenHeight, ModalHeight]);

  const renderItem = useCallback(({ item }) => (
    <RenderMonth date={item} handleDatePress={handleDatePress} taskDates={taskDates} />
  ), [handleDatePress, taskDates]);

  const getItemLayout = useCallback((data, index) => ({
    length: 400, offset: 400 * index, index
  }), []);

  const keyExtractor = useCallback((item, index) => `${format(item, 'yyyy-MM')}-${index}`, []);

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
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
          <View style={styles.container}>
            <View style={styles.contentContainer}>
              <View style={styles.taskHeader}>
                <Text style={styles.modalText}>{format(selectedDate, 'd-MMMM', { locale: ru })}</Text>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
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
};

export default VerticalCalendar;
