import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import TaskComponent from '../components/TaskComponent';
import styles from '../styles/styles';
import { FilterIcon } from '../icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const FeedScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://31.129.101.174/tasks');
        setTasks(response.data);
        setFilteredTasks(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      }
    };

    fetchTasks();
  }, []);

  const applyFilter = (newFilter) => {
    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    const filtered = tasks.filter((task) => updatedFilters.every(filter => filter(task)));
    setFilteredTasks(filtered);
  };

  const removeFilter = (filterIndex) => {
    const updatedFilters = filters.filter((_, index) => index !== filterIndex);
    setFilters(updatedFilters);
    const filtered = tasks.filter((task) => updatedFilters.every(filter => filter(task)));
    setFilteredTasks(filtered.length ? filtered : tasks);
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
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilter={applyFilter}
      />
      <View style={styles.contentContainer}>
        <View style={styles.taskHeader}>
          <Text style={styles.titleMedium}>Лента</Text>
          <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
            <FilterIcon />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContentContainer}
          overScrollMode="never"
        >
          {filters.map((filter, index) => (
            <View key={index} style={styles.filterChip}>
              <Text style={styles.filterChipText}>Фильтр {index + 1}</Text>
              <TouchableOpacity onPress={() => removeFilter(index)}>
                <Text style={styles.filterChipIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <ScrollView style={styles.tasksScrollView}  overScrollMode="never">
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

const FilterModal = ({ visible, onClose, onApplyFilter }) => {
  const [statusFilter, setStatusFilter] = useState('');

  const applyFilter = () => {
    const filter = (task) => !statusFilter || task.status === statusFilter;
    onApplyFilter(filter);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Фильтр и сортировка</Text>
          <Text style={styles.label}>Статус</Text>
          <TouchableOpacity onPress={() => setStatusFilter('новая')}>
            <Text style={[styles.filterOption, statusFilter === 'новая' && styles.selectedFilterOption]}>новая</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStatusFilter('в процессе')}>
            <Text style={[styles.filterOption, statusFilter === 'в работе' && styles.selectedFilterOption]}>в процессе</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStatusFilter('выполнено')}>
            <Text style={[styles.filterOption, statusFilter === 'выполнена' && styles.selectedFilterOption]}>выполнена</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonClose} onPress={applyFilter}>
            <Text style={styles.textStyle}>Применить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonClose} onPress={onClose}>
            <Text style={styles.textStyle}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FeedScreen;
