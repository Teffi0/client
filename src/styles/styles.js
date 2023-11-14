import { StyleSheet, Dimensions } from 'react-native';

const fontFamilies = {
  regular: 'manrope-regular',
  semiBold: 'manrope-semibold',
  extrabold: 'manrope-extrabold',
  extralight: 'manrope-extralight',
  light: 'manrope-light',
  medium: 'manrope-medium',
  bold: 'manrope-bold',
};

const { width: screenWidth } = Dimensions.get('window');

const baseScreenWidth = 375;

const scale = (size, minSize = 8, maxSize = 30) => {
  const scaledSize = (screenWidth / baseScreenWidth) * size;
  return Math.max(minSize, Math.min(scaledSize, maxSize));
};

const sizes = {
  paddingExtraSmall: 4,
  paddingSmall: 8,
  paddingMedium: 16,
  paddingLarge: 24,
  paddingExtraLarge: 32,

  marginExtraSmall: 4,
  marginSmall: 8,
  marginMedium: 16,
  marginLarge: 24,
  marginExtraLarge: 32,

  borderRadiusSmall: 4,
  borderRadiusMedium: 8,
  borderRadiusLarge: 16,
  borderRadiusExtraLarge: 24,

  fontSizeExtraSmall: scale(9),
  fontSizeSmall: scale(10),
  fontSizeMedium: scale(12),
  fontSizeLarge: scale(14),
  fontSizeExtraLarge: scale(16),
  fontSizeXXLarge: scale(18),
  fontSizeXXXLarge: scale(20),
  fontSizeXXXXLarge: scale(22),
  fontSizeXXXXXLarge: scale(26),

  lineHeightSmall: 16,
  lineHeightMedium: 20,
  lineHeightLarge: 28,
  lineHeightExtraLarge: 36,
  lineHeightXXLarge: 40,

  letterSpacingSmall: 0.1,
  letterSpacingMedium: 0.16,
  letterSpacingLarge: 0.25,
  letterSpacingExtraLarge: 0.5,
};

export const colors = {
  primary: '#C00000',
  black: '#2D2D2D',
  white: '#FFFFFF',
  error: '#BA1A1A',
  newStatus: '#496800',
  inProcessStatus: '#FFE03C',
  finishedStatus: '#00629E',
  darkGrey: '#6F6F6F',
  lightGrey: '#F0F0F0',
  grey: '#CCCCCC',
  greyBackground: '#EEEEEE',
};

const baseTextStyles = {
  fontFamily: fontFamilies.regular,
  color: colors.black,
};

const boldTextStyles = {
  color: colors.black,
  fontFamily: fontFamilies.bold,
};

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  headlineLarge: {
    ...baseTextStyles,
    fontSize: sizes.fontSizeXXXXXLarge,
    lineHeight: sizes.lineHeightXXLarge,
  },
  headlineMedium: {
    ...baseTextStyles,
    fontSize: sizes.fontSizeXXXXLarge,
    lineHeight: sizes.lineHeightExtraLarge,
  },
  titleLarge: {
    ...baseTextStyles,
    fontSize: sizes.fontSizeXXLarge,
    lineHeight: sizes.lineHeightLarge,
  },
  titleMedium: {
    ...baseTextStyles,
    fontSize: sizes.fontSizeXXLarge,
    lineHeight: sizes.lineHeightLarge,
    letterSpacing: sizes.letterSpacingMedium,
    textAlign: 'center',
  },
  titleSmall: {
    ...baseTextStyles,
    fontSize: sizes.fontSizeMedium,
    lineHeight: sizes.lineHeightMedium,
    letterSpacing: sizes.letterSpacingSmall,
  },
  labelMedium: {
    ...baseTextStyles,
    fontSize: sizes.fontSizeSmall,
    letterSpacing: sizes.letterSpacingExtraLarge,
  },
  labelSmall: {
    ...baseTextStyles,
    fontSize: sizes.fontSizeExtraSmall,
    letterSpacing: sizes.letterSpacingExtraLarge,
  },
  bodyLarge: {
    ...baseTextStyles,
    fontSize: sizes.fontSizeLarge,
    letterSpacing: sizes.letterSpacingExtraLarge,
  },
  bodyMedium: {
    ...baseTextStyles,
    fontSize: sizes.fontSizeMedium,
    letterSpacing: sizes.letterSpacingLarge,
  },
  bodySmall: {
    ...baseTextStyles,
    fontSize: sizes.fontSizeSmall,
    letterSpacing: sizes.letterSpacingMedium,
  },
  primaryColor: {
    color: colors.primary,
  },
  blackColor: {
    color: colors.black,
  },
  errorColor: {
    color: colors.error,
  },
  whiteColor: {
    color: colors.white,
  },
  newStatusColor: {
    color: colors.newStatus,
  },
  inProcessStatusColor: {
    color: colors.inProcessStatus,
  },
  finishedStatusColor: {
    color: colors.finishedStatus,
  },
  darkGreyColor: {
    color: colors.darkGrey,
  },
  greyBackgroundColor: {
    backgroundColor: colors.greyBackground,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    flex: 1,
    padding: sizes.paddingMedium,
    marginTop: sizes.marginLarge,
  },
  contentContainerTask: {
    flex: 1,
    padding: sizes.paddingMedium,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.marginLarge,
  },
  title: {
    color: colors.darkGrey,
    fontSize: sizes.fontSizeSmall,
    ...boldTextStyles,
    lineHeight: sizes.lineHeightSmall,
    letterSpacing: sizes.letterSpacingExtraLarge,
    textAlign: 'center',
    marginTop: sizes.marginExtraSmall,
    marginRight: sizes.marginSmall,
  },
  calendarBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendar: {
    marginBottom: sizes.marginMedium,
    color: colors.black,
  },
  selectedDate: {
    backgroundColor: colors.white,
    borderRadius: sizes.borderRadiusExtraLarge,
    paddingHorizontal: sizes.paddingSmall,
    paddingVertical: sizes.paddingExtraSmall,
    margin: sizes.marginExtraSmall,
  },
  tabBar: {
    borderTopWidth: 12,
    backgroundColor: colors.black,
    borderTopColor: 'transparent',
    height: 70,
    elevation: 24,
  },
  tabText: {
    color: colors.darkGrey,
    fontSize: sizes.fontSizeExtraSmall,
    lineHeight: sizes.lineHeightSmall,
    letterSpacing: sizes.letterSpacingExtraLarge,
    textAlign: 'center',
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTextActive: {
    color: colors.white,
  },
  addButton: {
    position: 'absolute',
    bottom: sizes.paddingMedium,
    left: sizes.paddingMedium,
    right: sizes.paddingMedium,
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: sizes.borderRadiusLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: sizes.fontSizeLarge,
    ...boldTextStyles,
    color: colors.white,
  },
  addButtonPressed: {
    backgroundColor: colors.primary,
  },
  addButtonTextPressed: {
    // Стили для нажатой кнопки
  },
  task: {
    width: '100%',
    borderRadius: sizes.borderRadiusLarge,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.finishedStatus,
    paddingHorizontal: sizes.paddingSmall,
    paddingVertical: sizes.paddingSmall,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: sizes.marginSmall,
  },
  taskFIO: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sizes.marginLarge,
  },
  taskHeaderLeft: {
    paddingLeft: sizes.paddingExtraSmall,
    flexDirection: 'row',
  },
  taskHeaderRight: {},
  taskTime: {
    fontSize: sizes.fontSizeMedium,
    ...boldTextStyles,
    color: colors.darkGrey,
  },
  taskStatus: {
    backgroundColor: colors.finishedStatus,
    height: 28,
    borderRadius: sizes.borderRadiusExtraLarge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskStatusText: {
    fontSize: sizes.fontSizeSmall,
    ...boldTextStyles,
    color: colors.white,
    paddingHorizontal: sizes.paddingExtraSmall,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sizes.marginExtraSmall,
  },
  taskTitle: {
    flex: 1,
    ...baseTextStyles,
    fontSize: sizes.fontSizeXXXLarge,
    marginRight: sizes.marginSmall,
  },
  taskStatusIcon: {
    width: 24,
    height: 24,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sizes.marginLarge,
  },
  taskFooterBlock: {
    height: 28,
    borderRadius: sizes.borderRadiusSmall,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.darkGrey,
    borderWidth: 1,
    paddingLeft: sizes.paddingExtraSmall,
    paddingRight: sizes.paddingSmall,
    marginRight: sizes.marginSmall,
  },
  taskFooterText: {
    fontSize: sizes.fontSizeSmall,
    ...baseTextStyles,
    marginLeft: sizes.marginExtraSmall,
  },
  noTasksText: {
    fontSize: sizes.fontSizeLarge,
    color: colors.darkGrey,
    textAlign: 'center',
    marginTop: sizes.marginLarge,
  },
  monthContainer: {
    width: '100%',
    paddingVertical: sizes.paddingLarge,
  },
  monthName: {
    fontSize: sizes.fontSizeExtraLarge,
    color: colors.black,
    textAlign: 'left',
    marginBottom: sizes.marginSmall,
  },
  weekContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  dayContainer: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarContainer: {
    flex: 1,
    // Другие свойства для контейнера календаря
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Дополнительные стили для строки дней
  },
  todayButton: {
    borderColor: 'red',
    borderWidth: 1,
    // Дополнительные стили для кнопки текущего дня
  },
  selectedDayButton: {
    // Стили для выбранного дня
  },

  dayName: {
    fontSize: 14,
    color: 'black',
    // Дополнительные стили для имени дня
  },

  selectedDayText: {
    fontWeight: 'bold',
    color: 'red',
    // Стили для текста выбранного дня
  },

  dayNumber: {
    fontSize: 20,
    color: 'black',
    // Дополнительные стили для номера дня
  },

  taskDot: {
    backgroundColor: 'transparent',
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
    // Стили для индикатора задачи
  },

  taskDotActive: {
    backgroundColor: 'red',
    // Стили для активного индикатора задачи
  },

  tasksContainer: {
    marginTop: 16,
    marginBottom: 120,
    // Дополнительные стили для контейнера задач
  },

  taskFIO: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Стили для шапки задачи
  },

  clientName: {
    // Стили для названия клиента
  },

  noTasksText: {
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.black,
    fontSize: sizes.fontSizeXXLarge,
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    margin: 2,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    width: 52,
  },
  dayText: {
    fontSize: sizes.fontSizeLarge,
    color: colors.black,
  },
  emptyDayText: {
    fontSize: sizes.fontSizeLarge,
    color: 'transparent',
  },
  today: {
    color: colors.primary,
  },
  modalView: {
    height: '100%',
    marginTop: 'auto',
    backgroundColor: colors.white,
    borderTopLeftRadius: sizes.borderRadiusExtraLarge,
    borderTopRightRadius: sizes.borderRadiusExtraLarge,
    padding: sizes.paddingMedium,
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
  clientName: {
    fontSize: sizes.fontSizeXXXLarge,
    marginBottom: sizes.marginMedium,
  },
  header: {
    marginTop: sizes.marginExtraLarge,
    marginBottom: sizes.marginExtraLarge,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: sizes.marginSmall,
  },
  headerItemText: {
    color: colors.black,
    fontSize: sizes.fontSizeXXXLarge,
  },
  dateInput: {
    backgroundColor: colors.white,
    borderRadius: sizes.borderRadiusSmall,
    borderWidth: 1,
    borderColor: colors.grey,
    padding: sizes.paddingExtraSmall,
  },
  dateInputText: {
    flex: 1,
    fontSize: sizes.fontSizeLarge,
    ...baseTextStyles,
  },
  dateButton: {
    backgroundColor: colors.lightGrey,
    borderRadius: sizes.borderRadiusSmall,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  dateButtonText: {
    textAlign: 'center',
    color: colors.black,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: sizes.fontSizeLarge,
    color: colors.black,
    backgroundColor: colors.white,
    minHeight: 48,
    maxHeight: 48,
    borderRadius: sizes.borderRadiusSmall,
    borderWidth: 1,
    borderColor: colors.grey,
    paddingHorizontal: sizes.paddingMedium,
  },
  dropdownContainer: {
    fontSize: sizes.fontSizeLarge,
    color: colors.grey,
    backgroundColor: colors.white,
    minHeight: 48,
    maxHeight: 48,
    borderRadius: sizes.borderRadiusSmall,
    borderWidth: 1,
    borderColor: colors.grey,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownList: {
    fontSize: sizes.fontSizeLarge,
    color: colors.grey,
    backgroundColor: colors.white,
    padding: sizes.paddingMedium,
    borderRadius: sizes.borderRadiusSmall,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  dropdownInput: {
    flex: 1,
    fontSize: sizes.fontSizeLarge,
    color: colors.grey,
    ...baseTextStyles,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: sizes.fontSizeLarge,
    color: colors.black,
    backgroundColor: colors.white,
    minHeight: 48,
    maxHeight: 48,
    borderRadius: sizes.borderRadiusSmall,
    borderWidth: 1,
    borderColor: colors.grey,
    paddingHorizontal: sizes.paddingSmall,
  },
  commentContainer: {
    // Стили для контейнера комментариев
  },
  selectedItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  selectedItemTouchable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: sizes.paddingMedium,
    marginVertical: sizes.marginExtraSmall,
    flex: 1,
  },
  selectedItemText: {
    flex: 1,
    fontSize: sizes.fontSizeLarge,
    ...baseTextStyles,
  },
  selectedItemDelete: {
    fontSize: sizes.fontSizeLarge,
    color: colors.black,
    marginLeft: sizes.marginExtraSmall,
  },
  chooseIconContainer: {
    padding: sizes.paddingMedium,
  },
  label: {
    fontSize: sizes.fontSizeLarge,
    ...boldTextStyles,
    marginBottom: sizes.marginSmall,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sizes.marginLarge,
  },
  timeInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: sizes.borderRadiusSmall,
    borderWidth: 1,
    borderColor: colors.grey,
    paddingVertical: sizes.paddingMedium,
    paddingHorizontal: sizes.paddingMedium,
    fontSize: sizes.fontSizeLarge,
    ...baseTextStyles,
    textAlign: 'center',
  },
  commentInput: {
    fontSize: sizes.fontSizeLarge,
    color: colors.black,
    backgroundColor: colors.white,
    padding: sizes.paddingMedium,
    minHeight: 48,
    borderRadius: sizes.borderRadiusMedium,
    borderWidth: 1,
    borderColor: colors.grey,
    textAlignVertical: 'top',
  },
  
  costInput: {
    fontSize: sizes.fontSizeLarge,
    color: colors.black,
    backgroundColor: colors.white,
    padding: sizes.paddingSmall,
    minHeight: 48,
    maxHeight: 48,
    borderRadius: sizes.borderRadiusSmall,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: sizes.marginLarge,
  },
  modalText: {
    marginBottom: sizes.marginMedium,
    textAlign: "center",
    // Дополнительные стили для текста в модальном окне
  },
  buttonClose: {
    backgroundColor: colors.black,
    borderRadius: sizes.borderRadiusLarge,
    padding: sizes.paddingSmall,
    elevation: 2,
  },
  textStyle: {
    color: colors.white,
    fontWeight: "bold",
    textAlign: "center",
  },
  
  });
  
  export default styles;
  