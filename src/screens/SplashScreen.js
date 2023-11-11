import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { hideAsync as hideSplashScreen } from 'expo-splash-screen';
import * as Font from 'expo-font';
import LoadingIndicator from '../components/LoadingIndicator';
import FontError from '../components/FontError';

export default function SplashScreen({ onFontsLoaded }) {
  const [fontError, setFontError] = useState(null);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'manrope-extrabold': require('../../assets/fonts/Manrope-ExtraBold.ttf'),
          'manrope-extralight': require('../../assets/fonts/Manrope-ExtraLight.ttf'),
          'manrope-light': require('../../assets/fonts/Manrope-Light.ttf'),
          'manrope-medium': require('../../assets/fonts/Manrope-Medium.ttf'),
          'manrope-regular': require('../../assets/fonts/Manrope-Regular.ttf'),
          'manrope-bold': require('../../assets/fonts/Manrope-Bold.ttf'),
          'manrope-semibold': require('../../assets/fonts/Manrope-SemiBold.ttf'),
        });
        await hideSplashScreen();
        onFontsLoaded();
      } catch (e) {
        setFontError(e);
        onFontsLoaded(e);
      }
    }

    loadFonts();
  }, [onFontsLoaded]);

  return (
    <View style={styles.screen}>
      {fontError ? (
        <FontError message={fontError.message} />
      ) : (
        <LoadingIndicator />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  }
});
