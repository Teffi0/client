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

const scale = (size) => (screenWidth / baseScreenWidth) * size;

const baseSizes = {
  xs: scale(9),
  s: scale(10),
  m: scale(12),
  l: scale(14),
  xl: scale(16),
  xxl: scale(18),
  xxxl: scale(20),
  xxxxl: scale(22),
  xxxxxl: scale(26),
};

const colors = {
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
    fontSize: baseSizes.xxxxxl,
    lineHeight: 40,
  },
  headlineMedium: {
    ...baseTextStyles,
    fontSize: baseSizes.xxxxl,
    lineHeight: 36,
  },
  titleLarge: {
    ...baseTextStyles,
    fontSize: baseSizes.xxl,
    lineHeight: 28,
  },
  titleMedium: {
    ...baseTextStyles,
    fontSize: baseSizes.xxl,
    lineHeight: 28,
    letterSpacing: 0.15,
    textAlign: 'center',
  },
  titleSmall: {
    ...baseTextStyles,
    fontSize: baseSizes.m,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    ...baseTextStyles,
    fontSize: baseSizes.s,
    letterSpacing: 0.5,
  },
  labelSmall: {
    ...baseTextStyles,
    fontSize: baseSizes.xs,
    letterSpacing: 0.5,
  },
  bodyLarge: {
    ...baseTextStyles,
    fontSize: baseSizes.l,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    ...baseTextStyles,
    fontSize: baseSizes.m,
    letterSpacing: 0.25,
  },
  bodySmall: {
    ...baseTextStyles,
    fontSize: baseSizes.s,
    letterSpacing: 0.16,
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
    padding: 16,
    marginTop: 56,
  },
  contentContainerTask: {
    flex: 1,
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: colors.darkGrey,
    fontSize: baseSizes.s,
    ...boldTextStyles,
    lineHeight: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 4,
    marginRight: 8,
  },
  calendarBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendar: {
    marginBottom: 12,
    color: colors.black,
  },
  selectedDate: {
    backgroundColor: colors.white,
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 4,
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
    fontSize: baseSizes.xs,
    lineHeight: 16,
    letterSpacing: 0.5,
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
    bottom: 16,
    left: 16,
    right: 16,
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: baseSizes.l,
    ...boldTextStyles,
    color: colors.white,
  },
  addButtonPressed: {
    backgroundColor: colors.primary,
  },
  addButtonTextPressed: {
  },
  task: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.finishedStatus,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  taskFIO: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  taskHeaderLeft: {
    paddingLeft: 4,
  },
  taskHeaderRight: {},
  taskTime: {
    fontSize: baseSizes.m,
    ...boldTextStyles,
    color: colors.darkGrey,
  },
  taskStatus: {
    backgroundColor: colors.finishedStatus,
    height: 28,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskStatusText: {
    fontSize: baseSizes.s,
    ...boldTextStyles,
    color: colors.white,
    paddingHorizontal: 8,
  },

  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskTitle: {
    ...baseTextStyles,
    fontSize: baseSizes.xxxl,
  },
  taskStatusIcon: {
    width: 24,
    height: 24,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  taskFooterBlock: {
    height: 28,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.darkGrey,
    borderWidth: 1,
    paddingLeft: 4,
    paddingRight: 8,
    marginRight: 8,
  },

  taskFooterText: {
    fontSize: baseSizes.s,
    ...baseTextStyles,
    marginLeft: 4,
  },
  noTasksText: {
    fontSize: baseSizes.l,
    color: colors.darkGrey,
    textAlign: 'center',
    marginTop: 20,
  },
  monthContainer: {
    width: '100%',
    paddingVertical: 16,
  },
  monthName: {
    fontSize: baseSizes.xl,
    color: colors.black,
    textAlign: 'left',
    marginBottom: 8,
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
  dayText: {
    fontSize: baseSizes.l,
    color: colors.black,
  },
  emptyDayText: {
    fontSize: baseSizes.l,
    color: 'transparent',
  },
  today: {
    color: colors.primary,
  },
  modalView: {
    height: '100%',
    marginTop: 'auto',
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
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
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  clientName: {
    fontSize: baseSizes.xxxl,
    marginBottom: 12,
  },
  header: {
    marginTop: 28,
    marginBottom: 28,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  headerItemText: {
    color: colors.black,
    fontSize: baseSizes.xxxl,
  },
  dateInput: {
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.grey,
    padding: 4,
  },

  dateInputText: {
    flex: 1,
    fontSize: baseSizes.l,
    padding: 8,
    ...baseTextStyles,
  },

  dateButton: {
    backgroundColor: colors.lightGrey,
    borderRadius: 4,
    borderWidth: 0.5,
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
    fontSize: baseSizes.l,
    color: colors.black,
    backgroundColor: colors.white,
    minHeight: 48,
    maxHeight: 48,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.grey,
    paddingHorizontal: 12,
  },

  dropdownContainer: {
    fontSize: baseSizes.l,
    color: colors.black,
    backgroundColor: colors.white,
    minHeight: 48,
    maxHeight: 48,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.grey,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dropdownList: {
    fontSize: baseSizes.l,
    color: colors.black,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.grey,
  },

  dropdownInput: {
    flex: 1,
    fontSize: baseSizes.l,
    padding: 8,
    ...baseTextStyles,
  },


  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: baseSizes.l,
    color: colors.black,
    backgroundColor: colors.white,
    minHeight: 48,
    maxHeight: 48,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.grey,
    paddingHorizontal: 8,
  },

  commentContainer: {
  },
  selectedItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
    marginVertical: 5,
  },
  selectedItemTouchable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    flex: 1,
  },
  selectedItemText: {
    flex: 1,
    fontSize: baseSizes.l,
    ...baseTextStyles,
  },
  selectedItemDelete: {
    fontSize: baseSizes.l,
    color: colors.black,
    marginLeft: 10,
  },

  chooseIconContainer: {
    padding: 10,
  },
  label: {
    fontSize: baseSizes.l,
    ...boldTextStyles,
    marginBottom: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.grey,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: baseSizes.l,
    ...baseTextStyles,
    textAlign: 'center',
  },
  commentInput: {
    fontSize: baseSizes.l,
    color: colors.black,
    backgroundColor: colors.white,
    padding: 12,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.grey,
    textAlignVertical: 'top',
  },

  costInput: {
    fontSize: baseSizes.l,
    color: colors.black,
    backgroundColor: colors.white,
    padding: 8,
    minHeight: 48,
    maxHeight: 48,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.grey,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    // Дополнительные стили для текста
  },
  buttonClose: {
    backgroundColor: "#2196F3", // Или другой цвет по вашему выбору
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },

});

export default styles;
