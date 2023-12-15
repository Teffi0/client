module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // Другие плагины
    'react-native-reanimated/plugin', // Этот плагин должен быть последним в списке
  ],
};