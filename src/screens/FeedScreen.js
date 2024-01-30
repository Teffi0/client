import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, ScrollView, View, Text, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import DateInput from '../components/DateInput';
import axios from 'axios';
import TaskComponent from '../components/TaskComponent';
import styles from '../styles/styles';
import { FilterIcon } from '../icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, None, FollowIcon, CancelIcon } from '../icons';
import { format, parseISO } from 'date-fns';

const screenHeight = Dimensions.get('window').height;

const FeedScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState([]); // Объявляем переменную фильтров
  const [modalVisible, setModalVisible] = useState(false);
  const [responsibles, setResponsibles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [paymentmethods, setPaymentMethods] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [selectedClients, setSelectedClients] = useState('');
  const [selectedResponsibles, setSelectedResponsibles] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');

  const updateFilters = (newFilters) => {
    // Убедитесь, что newFilters является объектом с нужными свойствами
    if (typeof newFilters === 'object' && newFilters !== null) {
      setFilters(Array.isArray(newFilters.filters) ? newFilters.filters : []);
      setSelectedParticipants(newFilters.selectedParticipants || []);
      filterTasks(newFilters);
    } else {
      console.error('newFilters должен быть объектом');
    }
  };

  const loadAndUpdateTasks = async () => {
    try {
      const tasksResponse = await axios.get('http://31.129.101.174/tasks');
      const validTasks = tasksResponse.data.filter(task => task.status !== 'черновик');
      setTasks(validTasks);
      setFilteredTasks(validTasks); // Обновляем отфильтрованные задачи
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
    }
  };

  useEffect(() => {
    loadAndUpdateTasks(); // Первоначальная загрузка задач
  }, [tasks]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const responsiblesResponse = await axios.get('http://31.129.101.174/responsibles');
        const clientsResponse = await axios.get('http://31.129.101.174/clients');
        const employeesResponse = await axios.get('http://31.129.101.174/employees');
        const paymentsResponse = await axios.get('http://31.129.101.174/paymentmethods');

        setResponsibles(responsiblesResponse.data);
        setClients(clientsResponse.data);
        setEmployees(employeesResponse.data);
        setPaymentMethods(paymentsResponse.data);
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      }
    };

    fetchTasks();
  }, []);

  const applyFilter = (filterType, filterValue) => {
    console.log(filterValue);
    if (filterType === 'status') {
      setSelectedStatus(filterValue);
    } else if (filterType === 'client') {
      setSelectedClients(filterValue);
    } else if (filterType === 'dateRange') {
      setFilters(prevFilters => {
        const newFilters = prevFilters.filter(filter => filter.type !== 'dateRange');
        if (filterValue) {
          newFilters.push({ type: 'dateRange', label: filterValue });
        }
        return newFilters;
      });
    } else if (filterType === 'responsible') {
      setSelectedResponsibles(filterValue);
    } else if (filterType === 'participant') {
      let newSelectedParticipants;
      if (!selectedParticipants.includes(filterValue)) {
        newSelectedParticipants = [...selectedParticipants, filterValue];
      } else {
        newSelectedParticipants = selectedParticipants.filter(id => id !== filterValue);
      }
      setSelectedParticipants(newSelectedParticipants);
    } else if (filterType === 'paymentMethod') {
      setSelectedPaymentMethod(filterValue);
    }

    let updatedFilters = Array.isArray(filters) ? [...filters] : [];
    updatedFilters = updatedFilters.filter(filter => filter.type !== filterType);
    updatedFilters.push({ type: filterType, value: filterValue, label: filterValue });

    setFilters(updatedFilters);
    filterTasks(updatedFilters);
  };

  const filterTasks = async (updatedFilters) => {
    let filtered = [...tasks];
    for (const filter of updatedFilters) {
      switch (filter.type) {
        case 'status':
          console.log(filter.value);
          filtered = filtered.filter(task => task.status === filter.value);
          break;
        case 'responsible':
          filtered = filtered.filter(task => task.responsible === filter.value);
          break;
        case 'client':
          filtered = filtered.filter(task => task.fullname_client === filter.value);
          break;
        case 'participant':
          if (Array.isArray(filter.value)) {
            filtered = await filterByParticipants(filtered, filter.value);
          }
          break;
        case 'paymentMethod':
          filtered = filtered.filter(task => task.payment === filter.value);
          break;
        case 'dateRange':
          const { start, end } = filter.value;
          const startDate = start ? new Date(start) : null;
          const endDate = end ? new Date(end) : null;

          filtered = filtered.filter(task => {
            const taskDate = new Date(task.start_date);
            if (startDate && endDate) {
              return taskDate >= startDate && taskDate <= endDate;
            } else if (startDate) {
              return taskDate >= startDate;
            } else if (endDate) {
              return taskDate <= endDate;
            }
            return true;
          });
          break;
      }
    }

    setFilteredTasks(filtered);
  };

  const filterByParticipants = async (tasks, selectedEmployeeIds) => {
    if (selectedEmployeeIds.length > 0) {
      try {
        // Получаем задачи для каждого участника
        const participantTasksPromises = selectedEmployeeIds.map(employeeId =>
          axios.get(`http://31.129.101.174/task_employees/${employeeId}`)
        );
        const responses = await Promise.all(participantTasksPromises);

        // Преобразовываем ответы в массивы идентификаторов задач
        const participantTasks = responses.map(response =>
          response.data.map(taskEmployee => taskEmployee)
        );

        // Находим общие задачи для всех участников
        const commonTasks = participantTasks.reduce((acc, tasks) =>
          acc.filter(taskId => tasks.includes(taskId))
        );

        // Фильтруем исходные задачи, оставляя только общие
        return tasks.filter(task => commonTasks.includes(task.id));
      } catch (error) {
        console.error('Ошибка при фильтрации задач по участникам:', error);
        return tasks;
      }
    }
    return tasks;
  };

  const removeFilter = (filterType, filterIndex) => {
    if (!Array.isArray(filters)) {
      console.error('filters должен быть массивом');
      return;
    }

    const newFilters = filters.filter((filter, index) => index !== filterIndex);
    setFilters(newFilters);

    if (filterType === 'client') {
      setSelectedClients('');
    } else if (filterType === 'responsible') {
      setSelectedResponsibles('');
    } else if (filterType === 'participant') {
      const filterToRemove = filters[filterIndex];
      if (filterToRemove && Array.isArray(filterToRemove.value)) {
        setSelectedParticipants(selectedParticipants.filter(id => !filterToRemove.value.includes(id)));
      }
    } else if (filterType === 'paymentMethod') {
      setSelectedPaymentMethod('');
    } else if (filterType === 'status') {
      setSelectedStatus('');
    } else if (filterType === 'dateRange') {
      setSelectedStartDate('');
      setSelectedEndDate('');
    }
    filterTasks(newFilters);
  };

  const resetFilters = () => {
    setFilters([]);
    setFilteredTasks(tasks);
  };

  const groupTasksByDate = (tasks) => {
    return tasks.reduce((acc, task) => {
      const date = task.start_date.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});
  };

  const groupedTasks = groupTasksByDate(filteredTasks);

  return (
    <SafeAreaView style={styles.container}>
      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        currentFilters={filters}
        setFilters={setFilters}
        applyFilter={applyFilter}
        onResetFilters={resetFilters}
        onUpdateFilters={updateFilters}
        responsibles={responsibles}
        clients={clients}
        employees={employees}
        payments={paymentmethods}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedClients={selectedClients}
        selectedResponsibles={selectedResponsibles}
        setSelectedClients={setSelectedClients}
        setSelectedResponsibles={setSelectedResponsibles}
        selectedParticipants={selectedParticipants}
        setSelectedParticipants={setSelectedParticipants}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        selectedStartDate={selectedStartDate}
        setSelectedStartDate={setSelectedStartDate}
        selectedEndDate={selectedEndDate}
        setSelectedEndDate={setSelectedEndDate}
        removeFilter={removeFilter}
        filterTasks={filterTasks}
      />
      <View style={styles.contentContainer}>
        <View style={styles.taskHeader}>
          <Text style={styles.titleMedium}>Лента</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <FilterIcon />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} overScrollMode="never" style={filters.length > 0 ? { maxHeight: 40, marginBottom: 12 } : { maxHeight: 0 }}>
          {filters.map((filter, index) => (
            <View key={index} style={styles.filterChip}>
              <Text style={styles.filterChipText}>
                {filter.type === 'participant' && selectedParticipants.length > 0
                  ? `Участники (${selectedParticipants.length})`
                  : filter.label}
              </Text>
              <TouchableOpacity onPress={() => removeFilter(filter.type, index)}>
                <CancelIcon />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          style={{ flex: 1 }}
        >
          {Object.entries(groupedTasks).sort(([a], [b]) => new Date(b) - new Date(a)).map(([date, tasksForDate]) => (
            <View key={date} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </Text>
              {tasksForDate.map((task) => (
                <TaskComponent key={task.id} {...task} />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const FilterModal = ({ visible, onClose, currentFilters, filterTasks, setFilters, applyFilter, removeFilter, onResetFilters, responsibles, clients, employees, onUpdateFilters, payments, selectedStatus, setSelectedStatus, selectedClients, selectedResponsibles, setSelectedClients, setSelectedResponsibles, selectedParticipants, setSelectedParticipants, selectedPaymentMethod, setSelectedPaymentMethod, selectedStartDate, setSelectedStartDate, selectedEndDate, setSelectedEndDate }) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [participantFilter, setParticipantFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [currentPage, setCurrentPage] = useState('main');

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
        { useNativeDriver: false } // Изменил здесь на false
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
    onClose();
  }, [ModalHeight, screenHeight, animateModal]);

  const handleSelectStatus = (status) => {
    if (selectedStatus === status) {
      removeFilter('status');
      setSelectedStatus('');
    } else {
      setSelectedStatus(status);
      const newFilters = currentFilters.filter(f => f.type !== 'status');
      newFilters.push({ type: 'status', value: status, label: `Статус: ${status}` });
      setFilters(newFilters);
      applyFilter('status', status);
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(dateString, 'dd.MM.yyyy');
  };

  const handleClientChange = (client) => {
    if (selectedClients === client) {
      removeFilter('client');
      setSelectedClients('');
    } else {
      setSelectedClients(client);
      const newFilters = currentFilters.filter(f => f.type !== 'client');
      newFilters.push({ type: 'client', value: client, label: `Клиент: ${client}` });
      setFilters(newFilters);
      applyFilter('client', client);
    }
  };

  const handleResponsibleChange = (responsible) => {
    if (selectedResponsibles === responsible) {
      removeFilter('responsible');
      setSelectedResponsibles('');
    } else {
      setSelectedResponsibles(responsible);
      const newFilters = currentFilters.filter(f => f.type !== 'responsible');
      newFilters.push({ type: 'responsible', value: responsible, label: `Ответственный: ${responsible}` });
      setFilters(newFilters);
      applyFilter('responsible', responsible);
    }
  };

  const handlePaymentMethodChange = (method) => {
    if (selectedPaymentMethod === method) {
      removeFilter('paymentMethod');
      setSelectedPaymentMethod('');
    } else {
      setSelectedPaymentMethod(method);
      const newFilters = currentFilters.filter(f => f.type !== 'paymentMethod');
      newFilters.push({ type: 'paymentMethod', value: method, label: `Способ оплаты: ${method}` });
      setFilters(newFilters);
      applyFilter('paymentMethod', method);
    }
  };

  const toggleParticipantSelection = (employeeId) => {

    let newSelectedParticipants = selectedParticipants.includes(employeeId)
      ? selectedParticipants.filter(id => id !== employeeId)
      : [...selectedParticipants, employeeId];

    setSelectedParticipants(newSelectedParticipants);

    // Формирование обновленных фильтров
    let updatedFilters = currentFilters.filter(filter => filter.type !== 'participant');

    // Если есть выбранные участники, добавляем их в фильтры
    if (newSelectedParticipants.length > 0) {
      updatedFilters.push({ type: 'participant', value: newSelectedParticipants, label: `Участники: ${newSelectedParticipants.length}` });
    }
    setFilters(updatedFilters); // Обновляем фильтры в состоянии

    // Вызываем filterTasks с обновленными фильтрами
    filterTasks(updatedFilters);
  };

  const onDateChange = (dateType, selectedDate) => {
    let newStartDate = selectedStartDate;
    let newEndDate = selectedEndDate;

    if (dateType === 'startDate') {
      newStartDate = selectedDate;
      setSelectedStartDate(selectedDate);
    } else if (dateType === 'endDate') {
      newEndDate = selectedDate;
      setSelectedEndDate(selectedDate);
    }

    // Формирование метки и значения для фильтра
    let label = '';
    let value = {};
    if (newStartDate && newEndDate) {
      label = `С: ${formatDate(newStartDate)} До: ${formatDate(newEndDate)}`;
      value = { start: newStartDate, end: newEndDate };
    } else if (newStartDate) {
      label = `С: ${formatDate(newStartDate)}`;
      value = { start: newStartDate };
    } else if (newEndDate) {
      label = `До: ${formatDate(newEndDate)}`;
      value = { end: newEndDate };
    }

    setFilters(prevFilters => {
      const newFilters = prevFilters.filter(filter => filter.type !== 'dateRange');
      if (label) {
        newFilters.push({ type: 'dateRange', value, label });
        filterTasks(newFilters);
      }
      return newFilters;
    });
  };

  const renderFilterOption = (title, filterValue, setPage) => {
    const isFilterSet = filterValue !== '';
    return (
      <TouchableOpacity style={styles.optionButton} onPress={setPage}>
        <Text style={[styles.title, { fontSize: 15 }]}>{title}</Text>
        <View style={styles.filterOptionRightSide}>
          <Text style={{ fontSize: 12, color: 'grey' }}>{!isFilterSet ? 'Все' : ''}</Text>
          <FollowIcon />
        </View>
      </TouchableOpacity>
    );
  };

  const renderMainPage = () => (
    <View>
      {renderFilterOption('Статус', statusFilter, () => setCurrentPage('status'))}
      {renderFilterOption('Дата', dateFilter, () => setCurrentPage('dateRange'))}
      {renderFilterOption('Клиент', clientFilter, () => setCurrentPage('client'))}
      {renderFilterOption('Ответственный', responsibleFilter, () => setCurrentPage('responsible'))}
      {renderFilterOption('Участники', participantFilter, () => setCurrentPage('participant'))}
      {renderFilterOption('Способ оплаты', paymentMethodFilter, () => setCurrentPage('paymentMethod'))}
    </View>
  );

  const renderStatusPage = () => {
    const statuses = ['новая', 'в процессе', 'выполнено'];
    return statuses.map(status => (
      <TouchableOpacity
        key={status}
        style={styles.optionButton}
        onPress={() => handleSelectStatus(status)}
      >
        <Text style={styles.title}>
          {status}
        </Text>
        <View style={styles.radioButton}>
          {selectedStatus === status && <View style={styles.radioButtonSelected} />}
        </View>
      </TouchableOpacity>
    ));
  };

  const renderDatePage = () => (
    <View style={{ flex: 1 }}>
      <DateInput
        date={selectedStartDate}
        placeholder="От (гггг-мм-дд)"
        onDateChange={onDateChange}
        dateType="startDate"
      />
      <DateInput
        date={selectedEndDate}
        placeholder="До (гггг-мм-дд)"
        onDateChange={onDateChange}
        dateType="endDate"
      />
    </View>
  );

  const renderClientPage = () => (
    <View>
      {clients.map((client, index) => (
        <TouchableOpacity key={index} style={styles.optionButton} onPress={() => handleClientChange(client.full_name)}>
          <Text style={styles.title}>{client.full_name}</Text>
          <View style={styles.radioButton}>
            {selectedClients === client.full_name && <View style={styles.radioButtonSelected} />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );


  const renderResponsiblePage = () => (
    <View>
      {responsibles.map((responsible, index) => (
        <TouchableOpacity key={index} style={styles.optionButton} onPress={() => handleResponsibleChange(responsible)}>
          <Text style={styles.title}>{responsible}</Text>
          <View style={styles.radioButton}>
            {selectedResponsibles === responsible && <View style={styles.radioButtonSelected} />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderParticipantPage = () => (
    <View>
      {employees.map(employee => (
        <TouchableOpacity key={employee.id} onPress={() => toggleParticipantSelection(employee.id)}>
          <View style={styles.checkboxContainer}>
            <Text style={styles.title}>{employee.full_name}</Text>
            <View style={styles.checkbox}>
              {selectedParticipants.includes(employee.id) && <View style={styles.checkboxSelected} />}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPaymentMethodPage = () => {
    return payments.map((method, index) => (
      <TouchableOpacity
        key={index}
        style={styles.optionButton}
        onPress={() => handlePaymentMethodChange(method)}
      >
        <Text style={styles.title}>{method}</Text>
        <View style={styles.radioButton}>
          {selectedPaymentMethod === method && <View style={styles.radioButtonSelected} />}
        </View>
      </TouchableOpacity>
    ));
  };

  //  <TouchableOpacity style={styles.backgroundStyle} onPress={onClose} activeOpacity={1} />
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { transform: [{ translateY: modalHeight.current }] }]} {...panResponder.panHandlers}>
        <View style={styles.container}>
          <View style={styles.contentContainer}>
            <View style={styles.taskHeader}>
              {currentPage === 'main' ? (
                <TouchableOpacity>
                  <None />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setCurrentPage('main')}>
                  <BackIcon />
                </TouchableOpacity>
              )}
              <Text style={[styles.titleMedium, { flex: 1, textAlign: 'center' }]}>Фильтры</Text>
              <TouchableOpacity>
                <None />
              </TouchableOpacity>
            </View>


            {currentPage === 'main' ? renderMainPage() :
              currentPage === 'status' ? renderStatusPage() :
                currentPage === 'dateRange' ? renderDatePage() :
                  currentPage === 'client' ? renderClientPage() :
                    currentPage === 'responsible' ? renderResponsiblePage() :
                      currentPage === 'participant' ? renderParticipantPage() :
                        currentPage === 'paymentMethod' ? renderPaymentMethodPage() :
                          null
            }
          </View>
        </View>
      </Animated.View>
    </Modal>

  );
};


export default FeedScreen;
