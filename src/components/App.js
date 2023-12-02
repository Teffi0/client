import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from '../screens/SplashScreen';
import Navigation from '../Navigation';
import FontError from './FontError';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState(null);

  const handleFontsLoaded = error => {
    if (error instanceof Error) {
      setFontError(error);
    } else {
      setFontsLoaded(true);
    }
  };

  if (fontError) {
    return <FontError message={fontError.message} />;
  }

  return (
    <SafeAreaProvider>
      {fontsLoaded ? <Navigation /> : <SplashScreen onFontsLoaded={handleFontsLoaded} />}
    </SafeAreaProvider>
  );
}
